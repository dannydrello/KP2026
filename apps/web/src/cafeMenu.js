// Keeps the standalone cafe-menu.html in sync with the admin's prices and availability.
// The prices typed into that HTML are only a fallback for when this request fails.
// Plain fetch rather than supabase-js, so the page stays light on phones.

const formatPrice = (price) => {
  const digits = Number.isInteger(Number(price)) ? 0 : 2; // 4,200 but 787.50
  return `₦${Number(price).toLocaleString('en-NG', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
};

const syncMenu = async () => {
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products?select=id,price,active`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const products = new Map((await response.json()).map((product) => [String(product.id), product]));

  document.querySelectorAll('[data-product-id]').forEach((row) => {
    const product = products.get(row.dataset.productId);
    row.hidden = !product; // no longer in the catalog
    if (!product) return;

    row.classList.toggle('is-out', !product.active);
    row.querySelector('.item-price').textContent = product.active ? formatPrice(product.price) : 'Out of order';
  });
};

syncMenu().catch((error) => console.error('Failed to load live prices', error));
