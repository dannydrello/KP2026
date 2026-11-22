-- The admin is matched by md5 of their login email, because this repository is public.
-- orders holds customer details: only the admin may read it through the API, and only the
-- payment Edge Function (service role) may write it.
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Revoke as well: TRUNCATE is not covered by row level security.
REVOKE ALL ON orders FROM anon, authenticated;
GRANT SELECT ON orders TO authenticated;

DROP POLICY IF EXISTS "Admin can read all orders" ON orders;
CREATE POLICY "Admin can read all orders" ON orders
  FOR SELECT TO authenticated
  USING (md5(auth.jwt() ->> 'email') = 'e0660d44fe4477f758f2edb820abea48');

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON products FROM anon;
REVOKE TRUNCATE ON products FROM authenticated;
