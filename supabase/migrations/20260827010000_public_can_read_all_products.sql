-- Previously the public policy only exposed active=true rows, so an out-of-order item
-- would simply vanish from the menu instead of showing as unavailable. Let the storefront
-- read every product and decide how to display availability itself.
DROP POLICY IF EXISTS "Public can read active products" ON products;

CREATE POLICY "Public can read all products" ON products
  FOR SELECT
  USING (true);
