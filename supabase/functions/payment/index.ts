import { corsHeaders } from '../_shared/cors.ts';
import { insertTransaction, getTransaction, getProducts, markFailed, markPaidOnce } from '../_shared/db.ts';
import { parseJson, priceOrder, productIds, readItems, text } from '../_shared/order.ts';
import { verifyPaymentWithPaystack, verifyWebhookSignature } from '../_shared/paystack.ts';
import { sendCustomerReceipt, sendKitchenNotification } from '../_shared/whatsapp.ts';
import { sendCustomerReceiptEmail, sendOwnerOrderNotificationEmail } from '../_shared/email.ts';

const PAYSTACK_PUBLIC_KEY = Deno.env.get('PAYSTACK_PUBLIC_KEY') || '';
const REFERENCE_PATTERN = /^[A-Za-z0-9_.=-]{1,100}$/;
const PAID_STATUSES = ['completed', 'review'];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// GET /payment/config
async function handleConfig() {
  if (!PAYSTACK_PUBLIC_KEY) {
    console.error('Missing Paystack public key configuration');
    return json({ error: 'Payment gateway configuration error' }, 500);
  }

  return json({
    clientId: PAYSTACK_PUBLIC_KEY,
    environment: PAYSTACK_PUBLIC_KEY.startsWith('pk_live_') ? 'live' : 'sandbox',
  });
}

// POST /payment/initiate
async function handleInitiate(req: Request) {
  try {
    const body = await req.json();
    const { orderId, customerEmail, customerName, customerPhone, street, city, country, orderItems } = body;

    if (!orderId || !customerEmail || !customerName || !orderItems) {
      return json({ error: 'Missing required fields' }, 400);
    }
    if (!REFERENCE_PATTERN.test(orderId)) return json({ error: 'Invalid order ID' }, 400);

    const requested = readItems(orderItems);
    const order = priceOrder(requested, await getProducts(productIds(requested)));
    if ('error' in order) return json({ error: order.error }, 409);

    // Try hard to save the order up front - retry a few times against a transient hiccup.
    // But never let this block the customer from paying: the checkout page also embeds the
    // full order (items, flavors, cake messages, address) in the Paystack transaction's
    // metadata, so /verify can reconstruct everything from Paystack directly if every retry
    // here fails. A slow database is not a reason to lose a sale.
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await insertTransaction({
          orderId,
          status: 'pending',
          amount: order.amount,
          currency: 'NGN',
          // Trim to the column sizes: one over-long value fails the whole insert.
          customerEmail: text(customerEmail, 255),
          customerName: text(customerName, 200),
          customerPhone: text(customerPhone, 50),
          street: text(street, 500),
          city: text(city, 200),
          country: /^[A-Za-z]{2}$/.test(country) ? country : 'NG',
          orderItems: order.items,
          gatewayReference: orderId,
        });
        lastError = null;
        break;
      } catch (dbError) {
        lastError = dbError as Error;
        if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
      }
    }

    if (lastError) {
      console.error('Failed to store order in database after retries - relying on Paystack metadata for recovery', orderId, lastError.message);
    }

    return json({
      success: true,
      orderId,
      reference: orderId,
      amount: order.amount,
      currency: 'NGN',
      items: order.items,
    });
  } catch (error) {
    console.error('Payment initiation error', (error as Error).message);
    return json({ error: 'Failed to initiate payment' }, 500);
  }
}

// Orders placed before the metadata format below was introduced only have the name/phone
// tucked into Paystack's generic `custom_fields` display array, not top-level keys. Falls back
// to that older shape so a stale-format order can still recover a name and phone, even without
// items (those genuinely aren't recoverable from the older format).
function extractLegacyCustomFields(meta: Record<string, unknown>): { customerName?: string; customerPhone?: string } {
  const fields = Array.isArray(meta.custom_fields) ? (meta.custom_fields as Array<Record<string, unknown>>) : [];
  const byVar = (name: string) => fields.find((f) => f.variable_name === name)?.value as string | undefined;
  return {
    customerName: byVar('customer_name'),
    customerPhone: byVar('phone_number'),
  };
}

function transactionDetails(transaction: Record<string, unknown>, overrides: Record<string, unknown> = {}) {
  return {
    orderId: transaction.orderId,
    status: transaction.status,
    amount: transaction.amount,
    currency: transaction.currency,
    gatewayReference: transaction.gatewayReference,
    customerName: transaction.customerName,
    customerEmail: transaction.customerEmail,
    street: transaction.street,
    city: transaction.city,
    items: readItems(transaction.orderItems),
    ...overrides,
  };
}

interface SuccessfulPayment {
  reference: string;
  amount: number;
  currency: string;
  email?: string;
  metadata?: unknown;
}

// The one place a payment becomes a paid order. Used by /verify, /check-status and the webhook.
async function settlePayment(payment: SuccessfulPayment) {
  const { reference, amount, currency } = payment;
  let transaction = await getTransaction(reference);

  if (!transaction) {
    // /initiate never saved this order, so rebuild it from the metadata sent with the payment.
    // That comes from the browser, so it has to be re-priced before it can be trusted.
    console.error('Recovering order with no local record', reference);
    const meta = (parseJson(payment.metadata) || {}) as Record<string, unknown>;
    const legacy = extractLegacyCustomFields(meta);
    const requested = readItems(meta.orderItems);
    const order = priceOrder(requested, requested.length ? await getProducts(productIds(requested)) : []);
    const priced = !('error' in order);

    try {
      await insertTransaction({
        orderId: reference,
        status: 'pending',
        // 0 means "expected total unknown", which always ends up in review.
        amount: priced ? order.amount : 0,
        currency: 'NGN',
        customerEmail: text(payment.email, 255),
        customerName: text(meta.customerName || legacy.customerName, 200),
        customerPhone: text(meta.customerPhone || legacy.customerPhone, 50),
        street: text(meta.street, 500),
        city: text(meta.city, 200),
        orderItems: priced ? order.items : requested,
      });
    } catch (insertError) {
      // 23505 = the webhook and /verify raced and the other one inserted it first.
      if ((insertError as { code?: string }).code !== '23505') throw insertError;
    }

    transaction = await getTransaction(reference);
    if (!transaction) throw new Error('Order could not be saved');
  }

  if (PAID_STATUSES.includes(transaction.status as string)) return transaction;

  const items = readItems(transaction.orderItems);
  const expected = Number(transaction.amount);
  // Half a naira of slack for rounding. Paying more is fine (gateway fees can be added on top).
  const matches = items.length > 0 && expected > 0 && currency === 'NGN' && amount + 0.5 >= expected;
  const status = matches ? 'completed' : 'review';

  if (!(await markPaidOnce(reference, status, amount))) return (await getTransaction(reference)) || transaction;

  const orderData = { orderId: reference, amount, currency, items, needsReview: !matches };
  const customerData = {
    customerName: transaction.customerName as string,
    customerEmail: (transaction.customerEmail as string) || payment.email,
    phone: (transaction.customerPhone as string) || '',
    street: (transaction.street as string) || '',
    city: (transaction.city as string) || '',
  };

  const channels = [
    { name: 'kitchen WhatsApp', send: sendKitchenNotification },
    { name: 'owner email', send: sendOwnerOrderNotificationEmail },
    // An order under review hasn't been confirmed, so the customer gets no receipt yet.
    ...(matches
      ? [
        { name: 'customer WhatsApp', send: sendCustomerReceipt },
        { name: 'customer email', send: sendCustomerReceiptEmail },
      ]
      : []),
  ];

  // Awaited because Edge Functions can be frozen once the response is sent. The senders report
  // most failures by returning { success: false } rather than throwing, so check for both.
  const results = await Promise.allSettled(channels.map(({ send }) => send(orderData, customerData)));
  results.forEach((result, i) => {
    const failure = result.status === 'rejected' ? String(result.reason) : !result.value.success && result.value.reason;
    if (failure) console.error(`NOTIFICATION FAILED (${channels[i].name}) for ${reference}: ${failure}`);
  });

  return { ...transaction, status, amount } as Record<string, unknown>;
}

// GET /payment/verify/:orderId
// The webhook depends on Paystack dashboard config, so this settles the payment as well.
async function handleVerify(orderId: string) {
  try {
    let transaction = await getTransaction(orderId);
    if (transaction && PAID_STATUSES.includes(transaction.status as string)) return json(transactionDetails(transaction));

    const verification = await verifyPaymentWithPaystack(orderId);

    if (verification?.status === 'completed') {
      transaction = await settlePayment({
        reference: orderId,
        amount: verification.amount || 0,
        currency: verification.currency || '',
        email: verification.customerEmail,
        metadata: verification.metadata,
      });
      return json(transactionDetails(transaction));
    }

    if (!transaction) return json({ error: 'Order not found' }, 404);

    if (verification?.status === 'failed') {
      await markFailed(orderId);
      return json(transactionDetails(transaction, { status: 'failed' }));
    }

    return json(transactionDetails(transaction));
  } catch (error) {
    console.error('Payment verification error', orderId, (error as Error).message);
    return json({ error: 'Failed to verify payment' }, 500);
  }
}

// POST /payment/check-status/:orderId
async function handleCheckStatus(orderId: string) {
  try {
    const transaction = await getTransaction(orderId);
    if (!transaction) return json({ error: 'Order not found' }, 404);

    if (PAID_STATUSES.includes(transaction.status as string)) {
      return json({ orderId, status: transaction.status, message: 'Payment already recorded' });
    }

    const verification = await verifyPaymentWithPaystack(orderId);
    if (!verification) return json({ error: 'Failed to verify payment with Paystack' }, 500);

    let status: unknown = verification.status;
    if (verification.status === 'completed') {
      const settled = await settlePayment({
        reference: orderId,
        amount: verification.amount || 0,
        currency: verification.currency || '',
        email: verification.customerEmail,
        metadata: verification.metadata,
      });
      status = settled.status;
    } else if (verification.status === 'failed') {
      await markFailed(orderId);
    }

    return json({
      orderId,
      status,
      gatewayStatus: verification.gatewayStatus,
      amount: verification.amount,
      reference: verification.reference,
    });
  } catch (error) {
    console.error('Payment status check error', orderId, (error as Error).message);
    return json({ error: 'Failed to check payment status' }, 500);
  }
}

// POST /payment/webhook
async function handleWebhook(req: Request) {
  try {
    const rawBody = await req.text();

    if (!(await verifyWebhookSignature(rawBody, req.headers.get('x-paystack-signature')))) {
      console.warn('Invalid Paystack webhook signature');
      return json({ error: 'Invalid webhook signature' }, 401);
    }

    const payload = parseJson(rawBody) as { event?: string; data?: Record<string, unknown> } | null;
    if (!payload) return json({ error: 'Invalid payload' }, 400);

    // Only charge.success is a customer payment. transfer.success (a payout) also has
    // status "success" and must not turn into an order.
    const data = payload.data;
    if (payload.event !== 'charge.success' || !data?.reference) return json({ received: true });

    await settlePayment({
      reference: data.reference as string,
      amount: typeof data.amount === 'number' ? data.amount / 100 : 0,
      currency: (data.currency as string) || '',
      email: (data.customer as { email?: string } | undefined)?.email,
      metadata: data.metadata,
    });

    return json({ received: true });
  } catch (error) {
    // Must not be a 200: Paystack only retries the webhook when it gets an error status.
    console.error('Webhook processing error', (error as Error).message);
    return json({ error: 'Failed to process webhook' }, 500);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const fnIndex = segments.lastIndexOf('payment');
  const subPath = fnIndex >= 0 ? segments.slice(fnIndex + 1) : segments;

  const [route, param] = subPath;
  if (param && !REFERENCE_PATTERN.test(param)) return json({ error: 'Invalid order ID' }, 400);

  if (req.method === 'GET' && route === 'config') return await handleConfig();
  if (req.method === 'POST' && route === 'initiate') return await handleInitiate(req);
  if (req.method === 'GET' && route === 'verify' && param) return await handleVerify(param);
  if (req.method === 'POST' && route === 'check-status' && param) return await handleCheckStatus(param);
  if (req.method === 'POST' && route === 'webhook') return await handleWebhook(req);

  return json({ error: 'Route not found' }, 404);
});
