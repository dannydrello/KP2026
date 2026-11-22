-- The unused customers/orders/order_items/transactions tables from the original migration were
-- never written to (the app has always used transactions_legacy) - drop them and promote
-- transactions_legacy to the name that was actually intended.

-- Guarded because production was set up without migration history, so `db push` replays this
-- file. Unguarded, a replay drops the live orders table and every order in it.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'gateway_reference'
  ) THEN
    RAISE NOTICE 'orders is already promoted, skipping';
    RETURN;
  END IF;

  DROP TABLE IF EXISTS transactions;
  DROP TABLE IF EXISTS order_items;
  DROP TABLE IF EXISTS orders;
  DROP TABLE IF EXISTS customers;

  ALTER TABLE transactions_legacy RENAME TO orders;
END $$;
