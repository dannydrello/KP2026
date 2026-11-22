import { createClient } from 'npm:@supabase/supabase-js@2';

// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are auto-provided to every Edge Function.
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export interface TransactionInput {
  orderId: string;
  status?: string;
  amount?: number;
  currency?: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  street?: string;
  city?: string;
  country?: string;
  orderItems: unknown;
  gatewayReference?: string;
}

export async function insertTransaction(tx: TransactionInput) {
  // Postgres folds unquoted CREATE TABLE column names to lowercase, so the insert
  // payload must use lowercase keys (orderid, customeremail, ...) to match them.
  const payload = {
    orderid: tx.orderId,
    status: tx.status || 'pending',
    amount: tx.amount || 0,
    currency: tx.currency || 'NGN',
    customeremail: tx.customerEmail || '',
    customername: tx.customerName || '',
    customerphone: tx.customerPhone || '',
    street: tx.street || '',
    city: tx.city || '',
    country: tx.country || 'NG',
    orderitems: tx.orderItems ? (typeof tx.orderItems === 'string' ? tx.orderItems : JSON.stringify(tx.orderItems)) : '[]',
    gateway_reference: tx.gatewayReference || tx.orderId,
  };

  const { data, error } = await supabase.from('orders').insert(payload).select();
  if (error) throw error;
  return data && data[0];
}

// Look up with .eq(), never by building an .or() string: references come from the URL, and a
// comma inside one would add filters to a query that runs with the service role.
// (orderid and gateway_reference always hold the same value.)
export async function getTransaction(orderId: string) {
  const { data, error } = await supabase.from('orders').select('*').eq('orderid', orderId).limit(1);
  if (error) throw error;

  return normalizeLegacyRow((data && data[0]) || null);
}

export async function getProducts(ids: number[]) {
  const { data, error } = await supabase.from('products').select('id,name,price,active').in('id', ids);
  if (error) throw error;
  return data || [];
}

// A late "failed" must never overwrite a payment that has already gone through.
export async function markFailed(orderId: string) {
  const { error } = await supabase
    .from('orders')
    .update({ status: 'failed', updated_at: new Date().toISOString() })
    .eq('orderid', orderId)
    .eq('status', 'pending');

  if (error) throw error;
}

// Atomically moves an unpaid order to 'completed' (or 'review', when the money doesn't match
// the items). Postgres row locking makes this safe when the webhook and the browser's verify
// call race: only one gets true back, and only that one sends notifications.
export async function markPaidOnce(orderId: string, status: 'completed' | 'review', amount: number): Promise<boolean> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, amount, updated_at: new Date().toISOString() })
    .eq('orderid', orderId)
    .in('status', ['pending', 'failed'])
    .select();

  if (error) throw error;
  return Boolean(data && (data as unknown[]).length > 0);
}

function normalizeLegacyRow(row: Record<string, unknown> | null) {
  if (!row) return row;
  const out: Record<string, unknown> = { ...row };

  if (row.orderid !== undefined) out.orderId = row.orderid;
  if (row.customeremail !== undefined) out.customerEmail = row.customeremail;
  if (row.customername !== undefined) out.customerName = row.customername;
  if (row.customerphone !== undefined) out.customerPhone = row.customerphone;
  if (row.orderitems !== undefined) out.orderItems = row.orderitems;
  if (row.gateway_reference !== undefined) out.gatewayReference = row.gateway_reference;

  return out;
}
