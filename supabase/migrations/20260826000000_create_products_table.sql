-- The admin is matched by md5 of their login email, because this repository is public.
-- Menu/product catalog, editable from the admin portal.
CREATE TABLE IF NOT EXISTS products (
  id integer PRIMARY KEY,
  section varchar(50) NOT NULL,
  section_title text NOT NULL,
  name text NOT NULL,
  category varchar(50) NOT NULL,
  price numeric(12,2) NOT NULL DEFAULT 0,
  description text DEFAULT '',
  image text,
  flavors text[],
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_section ON products(section);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anyone (the storefront, using the anon key) can read active products.
CREATE POLICY "Public can read active products" ON products
  FOR SELECT
  USING (active = true);

-- The admin can read every product, including inactive ones, from the admin portal.
CREATE POLICY "Admin can read all products" ON products
  FOR SELECT
  USING (md5(auth.jwt() ->> 'email') = 'e0660d44fe4477f758f2edb820abea48');

-- Only the admin account can create, edit, or remove products.
CREATE POLICY "Admin can insert products" ON products
  FOR INSERT
  WITH CHECK (md5(auth.jwt() ->> 'email') = 'e0660d44fe4477f758f2edb820abea48');

CREATE POLICY "Admin can update products" ON products
  FOR UPDATE
  USING (md5(auth.jwt() ->> 'email') = 'e0660d44fe4477f758f2edb820abea48')
  WITH CHECK (md5(auth.jwt() ->> 'email') = 'e0660d44fe4477f758f2edb820abea48');

CREATE POLICY "Admin can delete products" ON products
  FOR DELETE
  USING (md5(auth.jwt() ->> 'email') = 'e0660d44fe4477f758f2edb820abea48');

-- Keep updated_at current on every edit.
CREATE OR REPLACE FUNCTION set_products_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_products_updated_at();
