// The browser is never trusted for prices: totals are always worked out from the products table.

const VAT_RATE = 0.03; // keep in sync with CartContext.jsx
const MAX_LINES = 100;
const MAX_QUANTITY = 999;

export interface OrderLine {
  id?: number;
  name: string;
  price: number;
  quantity: number;
  selectedFlavor: string | null;
  cakeComment: string;
}

export interface CatalogProduct {
  id: number;
  name: string;
  price: number;
  active: boolean;
}

export function text(value: unknown, maxLength: number): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim().slice(0, maxLength) : '';
}

export function parseJson(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

// Accepts an array or a JSON string (how orders.orderitems is stored). Paystack metadata
// can hand numbers back as strings, hence the Number() calls.
export function readItems(value: unknown): OrderLine[] {
  const parsed = parseJson(value);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter((item) => item && typeof item === 'object')
    .slice(0, MAX_LINES + 1)
    .map((item) => ({
      id: Number(item.id),
      name: text(item.name, 200),
      price: Number(item.price) || 0,
      quantity: Number(item.quantity),
      selectedFlavor: text(item.selectedFlavor, 100) || null,
      cakeComment: text(item.cakeComment, 200),
    }));
}

export function productIds(items: OrderLine[]): number[] {
  return [...new Set(items.map((item) => item.id).filter((id): id is number => Number.isInteger(id)))];
}

export function priceOrder(
  items: OrderLine[],
  products: CatalogProduct[],
): { items: OrderLine[]; amount: number } | { error: string } {
  if (items.length === 0 || items.length > MAX_LINES) return { error: 'Your cart is empty or too large.' };

  const priced: OrderLine[] = [];
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY) {
      return { error: `Invalid quantity for ${item.name || 'an item'}.` };
    }

    const product = products.find((p) => p.id === item.id);
    if (!product?.active) {
      return { error: `${product?.name || item.name || 'An item'} is no longer available. Please remove it from your cart.` };
    }

    priced.push({ ...item, name: product.name, price: Number(product.price) });
  }

  const subtotal = priced.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { items: priced, amount: Number((subtotal + subtotal * VAT_RATE).toFixed(2)) };
}
