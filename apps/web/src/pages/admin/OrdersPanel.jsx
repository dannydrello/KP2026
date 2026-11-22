import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';

const PAGE_SIZE = 50;
const REFRESH_MS = 60_000;

const STATUS = {
  completed: { label: 'Paid', className: 'bg-green-100 text-green-800' },
  review: { label: 'Check payment before preparing', className: 'bg-red-100 text-red-800' },
  pending: { label: 'Not paid', className: 'bg-yellow-100 text-yellow-800' },
  failed: { label: 'Payment failed', className: 'bg-gray-200 text-gray-700' },
};

const formatNaira = (value) =>
  `₦${Number(value || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value) =>
  new Date(value).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' });

// orderitems is a jsonb column holding a JSON string, so it arrives as text.
const parseItems = (value) => {
  try {
    const items = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(items) ? items.filter(Boolean) : [];
  } catch {
    return [];
  }
};

const OrderCard = ({ order }) => {
  const items = parseItems(order.orderitems);
  const status = STATUS[order.status] || { label: order.status, className: 'bg-gray-200 text-gray-700' };
  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return (
    <article className="bg-background rounded-xl shadow-soft p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-3">
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{formatDate(order.created_at)}</p>
          <p className="text-xs text-muted-foreground break-all">{order.orderid}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${status.className}`}>{status.label}</span>
          <span className="font-bold text-foreground">{formatNaira(order.amount)}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 pt-3">
        <div className="md:col-span-2 min-w-0">
          <p className="text-xs uppercase text-muted-foreground mb-2">
            Ordered ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})
          </p>
          {items.length === 0 ? (
            <p className="text-sm text-destructive">Items were not recorded. Contact the customer to confirm.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((item, index) => (
                <li key={index} className="flex gap-3 text-foreground">
                  <span className="font-bold shrink-0 w-10">{item.quantity} ×</span>
                  <div className="min-w-0 break-words">
                    <p className="font-medium">{item.name}</p>
                    {item.selectedFlavor && <p className="text-sm">Flavor: {item.selectedFlavor}</p>}
                    {item.cakeComment && <p className="text-sm italic">Cake message: &quot;{item.cakeComment}&quot;</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="min-w-0 text-sm text-foreground break-words">
          <p className="text-xs uppercase text-muted-foreground mb-2">Customer</p>
          <p className="font-medium">{order.customername || 'Name not recorded'}</p>
          {order.customerphone && <a className="block underline" href={`tel:${order.customerphone}`}>{order.customerphone}</a>}
          <p>{order.customeremail}</p>
          <p>{[order.street, order.city].filter(Boolean).join(', ')}</p>
        </div>
      </div>
    </article>
  );
};

const OrdersPanel = () => {
  const [orders, setOrders] = useState([]);
  const [showUnpaid, setShowUnpaid] = useState(false);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(limit);
    if (!showUnpaid) query = query.in('status', ['completed', 'review']);

    const { data, error: loadError } = await query;
    setError(loadError?.message || '');
    if (!loadError) setOrders(data || []);
    setIsLoading(false);
  }, [limit, showUnpaid]);

  useEffect(() => {
    loadOrders();
    const timer = setInterval(loadOrders, REFRESH_MS);
    return () => clearInterval(timer);
  }, [loadOrders]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={showUnpaid} onChange={(e) => setShowUnpaid(e.target.checked)} />
          Include unpaid checkouts
        </label>
        <Button variant="outline" size="sm" onClick={loadOrders} disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Refresh
        </Button>
      </div>

      {error && <p role="alert" className="text-sm text-destructive">Could not load orders: {error}</p>}
      {!error && !isLoading && orders.length === 0 && <p className="text-muted-foreground">No orders yet.</p>}

      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}

      {orders.length === limit && (
        <Button variant="outline" onClick={() => setLimit((n) => n + PAGE_SIZE)}>Show older orders</Button>
      )}
    </section>
  );
};

export default OrdersPanel;
