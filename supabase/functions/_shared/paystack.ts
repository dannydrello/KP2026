const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY') || '';
const BASE_URL = 'https://api.paystack.co';

export interface PaystackVerification {
  status: 'completed' | 'failed' | 'pending';
  gatewayStatus: string;
  amount?: number;
  currency?: string;
  reference: string;
  customerEmail?: string;
  // Whatever was passed as `metadata` when the Paystack popup was opened. The checkout page
  // embeds the full order (items, address, phone) here, so it survives even if our own
  // database write never happened - this is what /verify's recovery path reads from.
  metadata?: unknown;
}

export async function verifyPaymentWithPaystack(transactionReference: string): Promise<PaystackVerification | null> {
  try {
    const url = `${BASE_URL}/transaction/verify/${encodeURIComponent(transactionReference)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      console.warn('Paystack verify returned non-ok', response.status, transactionReference);
      return null;
    }

    const data = await response.json();

    if (data.status === true && data.data) {
      const statusRaw = (data.data.status || '').toString();
      const status = statusRaw.toLowerCase();

      let mappedStatus: PaystackVerification['status'] = 'pending';
      // 'abandoned' is deliberately left as pending: Paystack reports it until the customer pays.
      if (status === 'success') {
        mappedStatus = 'completed';
      } else if (['failed', 'declined', 'reversed'].includes(status)) {
        mappedStatus = 'failed';
      }

      const amountNaira = typeof data.data.amount === 'number' ? data.data.amount / 100 : undefined;

      return {
        status: mappedStatus,
        gatewayStatus: statusRaw,
        amount: amountNaira,
        currency: data.data.currency,
        reference: data.data.reference || transactionReference,
        customerEmail: data.data.customer?.email || undefined,
        metadata: data.data.metadata,
      };
    }

    return null;
  } catch (error) {
    console.error('Paystack verification error', (error as Error).message);
    return null;
  }
}

async function hmacSha512Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Paystack signs the raw request body with HMAC-SHA512 using the secret key,
// and sends the hex digest in the x-paystack-signature header.
export async function verifyWebhookSignature(rawBody: string, providedHash: string | null): Promise<boolean> {
  if (!rawBody || !providedHash || !PAYSTACK_SECRET_KEY) return false;

  try {
    const computed = await hmacSha512Hex(PAYSTACK_SECRET_KEY, rawBody);
    if (computed.length !== providedHash.length) return false;

    // Constant-time comparison
    let diff = 0;
    for (let i = 0; i < computed.length; i++) {
      diff |= computed.charCodeAt(i) ^ providedHash.charCodeAt(i);
    }
    return diff === 0;
  } catch (error) {
    console.error('verifyWebhookSignature error', (error as Error).message);
    return false;
  }
}
