const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') || '';
const SENDER_EMAIL = Deno.env.get('BREVO_SENDER_EMAIL') || '';
const SENDER_NAME = Deno.env.get('BREVO_SENDER_NAME') || 'Kitchen Pastries';
const OWNER_NOTIFICATION_EMAIL = Deno.env.get('OWNER_NOTIFICATION_EMAIL') || '';

interface OrderItem {
  name: string;
  selectedFlavor?: string | null;
  cakeComment?: string;
  quantity: number;
  price: number;
}

interface OrderData {
  orderId: string;
  amount: number;
  currency?: string;
  items?: OrderItem[];
  needsReview?: boolean;
}

interface CustomerData {
  customerName?: string;
  customerEmail?: string;
  phone?: string;
  street?: string;
  city?: string;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendEmail(to: { email: string; name?: string }, subject: string, htmlContent: string) {
  if (!BREVO_API_KEY || !SENDER_EMAIL) {
    console.warn('Brevo not configured, skipping email', { to: to.email, subject });
    return { success: false, reason: 'Email not configured' };
  }

  // Brevo rejects a "to" name of "" with a 400 (must be a non-empty string or omitted
  // entirely) - callers can legitimately end up with an empty name (e.g. an order recovered
  // from Paystack directly, which never captured one), so normalize here rather than at
  // every call site.
  const recipient = to.name ? to : { email: to.email };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { email: SENDER_EMAIL, name: SENDER_NAME },
        to: [recipient],
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Brevo API error', response.status, to.email, errorText);
      return { success: false, reason: `Brevo API error: ${response.status}`, details: errorText };
    }

    const data = await response.json();
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error('Email send error', (error as Error).message);
    return { success: false, reason: (error as Error).message };
  }
}

function formatNaira(value: number) {
  return `&#8358;${Number(value || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function itemsToHtmlRows(items: OrderItem[] = []) {
  return items
    .map((item) => {
      const lineTotal = (item.price || 0) * (item.quantity || 1);
      const flavorBadge = item.selectedFlavor
        ? `<span style="display:inline-block;background:#fbe9d9;color:#b5451b;font-size:12px;font-weight:600;padding:2px 8px;border-radius:999px;margin-left:6px;">${escapeHtml(item.selectedFlavor)}</span>`
        : '';
      const commentLine = item.cakeComment
        ? `<div style="font-size:13px;color:#8a6d55;font-style:italic;margin-top:4px;">"${escapeHtml(item.cakeComment)}"</div>`
        : '';

      return `<tr>
        <td style="padding:14px 0;border-bottom:1px solid #f0e4d5;vertical-align:top;">
          <div style="font-size:15px;font-weight:700;color:#3d2410;">${escapeHtml(item.name)}${flavorBadge}</div>
          <div style="font-size:13px;color:#8a6d55;margin-top:2px;">Qty ${escapeHtml(item.quantity)} &times; ${formatNaira(item.price)}</div>
          ${commentLine}
        </td>
        <td style="padding:14px 0;border-bottom:1px solid #f0e4d5;text-align:right;vertical-align:top;font-weight:700;color:#3d2410;white-space:nowrap;">
          ${formatNaira(lineTotal)}
        </td>
      </tr>`;
    })
    .join('');
}

function emailShell(bodyHtml: string, headline: string) {
  return `
  <div style="background:#f7efe0;padding:32px 16px;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(61,36,16,0.08);">
      <div style="background:linear-gradient(135deg,#b5451b,#8a3113);padding:32px 32px 28px;text-align:center;">
        <div style="font-size:12px;letter-spacing:0.3em;text-transform:uppercase;color:#f5c99a;font-weight:700;margin-bottom:8px;">Kitchen Pastries</div>
        <div style="font-size:24px;font-weight:700;color:#ffffff;">${escapeHtml(headline)}</div>
      </div>
      <div style="padding:32px;">
        ${bodyHtml}
      </div>
      <div style="background:#fbf3e6;padding:24px 32px;text-align:center;border-top:1px solid #f0e4d5;">
        <div style="font-size:13px;color:#8a6d55;line-height:1.8;">
          8 Onitsha Crescent, Independence Layout, Enugu · 3 Aguleri Street, Independence Layout, Enugu<br/>
          08069747505 &middot; 07061174772 &middot; 07076027785<br/>
          <em>Always Passionate About Your Experience — Awesome God</em>
        </div>
      </div>
    </div>
  </div>`;
}

export async function sendCustomerReceiptEmail(orderData: OrderData, customerData: CustomerData) {
  if (!customerData.customerEmail) {
    return { success: false, reason: 'No customer email provided' };
  }

  const { orderId, amount, currency = 'NGN', items = [] } = orderData;
  // Destructuring defaults only catch `undefined`, not '', and a recovered order (one
  // reconstructed from Paystack with no local record) can legitimately have an empty name.
  const customerName = customerData.customerName || 'Customer';
  const { phone = '', street = '', city = '' } = customerData;

  const body = `
    <p style="font-size:16px;color:#3d2410;margin:0 0 8px;">Hi ${escapeHtml(customerName)},</p>
    <p style="font-size:15px;color:#5c4530;line-height:1.6;margin:0 0 24px;">
      Thank you for your order! Your payment was successful and your order is confirmed.
    </p>

    <div style="background:#fbf3e6;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <table style="width:100%;font-size:14px;color:#5c4530;">
        <tr><td style="padding:2px 0;">Order Number</td><td style="text-align:right;font-weight:700;color:#3d2410;">${escapeHtml(orderId)}</td></tr>
        <tr><td style="padding:2px 0;">Date</td><td style="text-align:right;">${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}</td></tr>
      </table>
    </div>

    <h3 style="font-size:14px;letter-spacing:0.08em;text-transform:uppercase;color:#b5451b;border-bottom:2px solid #f0e4d5;padding-bottom:8px;margin:0 0 4px;">Your Order</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
      ${itemsToHtmlRows(items)}
      <tr>
        <td style="padding:16px 0 0;font-weight:700;font-size:16px;color:#3d2410;">Total</td>
        <td style="padding:16px 0 0;font-weight:700;font-size:18px;color:#b5451b;text-align:right;">${formatNaira(amount)} ${currency !== 'NGN' ? currency : ''}</td>
      </tr>
    </table>

    ${street || city || phone ? `
    <h3 style="font-size:14px;letter-spacing:0.08em;text-transform:uppercase;color:#b5451b;border-bottom:2px solid #f0e4d5;padding-bottom:8px;margin:24px 0 12px;">Delivery Details</h3>
    <p style="font-size:14px;color:#5c4530;line-height:1.7;margin:0;">
      ${escapeHtml(customerName)}${phone ? ` &middot; ${escapeHtml(phone)}` : ''}<br/>
      ${street || city ? `${escapeHtml(street)}, ${escapeHtml(city)}` : ''}
    </p>
    ` : ''}

    <p style="font-size:14px;color:#5c4530;line-height:1.6;margin-top:28px;">
      We'll prepare and deliver your order as soon as possible. If you have any questions, just reply to this email.
    </p>
  `;

  return await sendEmail(
    { email: customerData.customerEmail, name: customerName },
    `Your Kitchen Pastries Order Receipt - ${orderId}`,
    emailShell(body, 'Order Confirmed')
  );
}

export async function sendOwnerOrderNotificationEmail(orderData: OrderData, customerData: CustomerData) {
  if (!OWNER_NOTIFICATION_EMAIL) {
    console.warn('Owner notification email not configured');
    return { success: false, reason: 'Owner notification email not configured' };
  }

  const { orderId, amount, items = [], needsReview = false } = orderData;
  const { customerName = 'Unknown', customerEmail = 'Not provided', phone = 'Not provided', street = 'Unknown', city = 'Unknown' } = customerData;

  const body = `
    <div style="background:#fbf3e6;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <table style="width:100%;font-size:14px;color:#5c4530;">
        <tr><td style="padding:2px 0;">Order Number</td><td style="text-align:right;font-weight:700;color:#3d2410;">${escapeHtml(orderId)}</td></tr>
        <tr><td style="padding:2px 0;">Time</td><td style="text-align:right;">${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}</td></tr>
      </table>
    </div>

    <h3 style="font-size:14px;letter-spacing:0.08em;text-transform:uppercase;color:#b5451b;border-bottom:2px solid #f0e4d5;padding-bottom:8px;margin:0 0 12px;">Customer</h3>
    <p style="font-size:14px;color:#5c4530;line-height:1.7;margin:0 0 24px;">
      ${escapeHtml(customerName)}<br/>
      ${escapeHtml(phone)}<br/>
      ${escapeHtml(customerEmail)}<br/>
      ${escapeHtml(street)}, ${escapeHtml(city)}
    </p>

    <h3 style="font-size:14px;letter-spacing:0.08em;text-transform:uppercase;color:#b5451b;border-bottom:2px solid #f0e4d5;padding-bottom:8px;margin:0 0 4px;">Items to Prepare</h3>
    ${items.length === 0 ? `
    <p style="font-size:14px;color:#b5451b;font-weight:600;background:#fdecec;border-radius:8px;padding:12px 16px;margin:0 0 8px;">
      Item details weren't recorded for this order (a rare sync issue). Please contact the customer directly to confirm what they ordered.
    </p>
    ` : ''}
    <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
      ${itemsToHtmlRows(items)}
      <tr>
        <td style="padding:16px 0 0;font-weight:700;font-size:16px;color:#3d2410;">Total</td>
        <td style="padding:16px 0 0;font-weight:700;font-size:18px;color:#b5451b;text-align:right;">${formatNaira(amount)}</td>
      </tr>
    </table>

    ${needsReview
      ? '<p style="font-size:14px;color:#b5451b;font-weight:700;margin-top:24px;">DO NOT PREPARE YET: the amount paid could not be matched to these items. Check the payment in Paystack and contact the customer.</p>'
      : '<p style="font-size:14px;color:#2f7d32;font-weight:600;margin-top:24px;">Payment confirmed — ready to prepare.</p>'}
  `;

  return await sendEmail(
    { email: OWNER_NOTIFICATION_EMAIL, name: 'Kitchen Pastries' },
    `${needsReview ? 'CHECK PAYMENT' : 'New Order'} - ${orderId} - ₦${Number(amount || 0).toLocaleString('en-NG')}`,
    emailShell(body, 'New Order Received')
  );
}
