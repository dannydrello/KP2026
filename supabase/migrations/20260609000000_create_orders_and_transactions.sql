-- Supabase/Postgres migration: create orders, order_items, transactions, customers
-- Run this SQL in your Supabase SQL editor or with psql connected to the project.

-- Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) UNIQUE,
  name text,
  phone varchar(50),
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  status varchar(50) NOT NULL DEFAULT 'pending',
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  currency varchar(10) NOT NULL DEFAULT 'NGN',
  shipping_address jsonb,
  billing_address jsonb,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id text,
  name text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  total_price numeric(12,2) NOT NULL DEFAULT 0,
  metadata jsonb
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  provider varchar(100),
  provider_reference varchar(255),
  amount numeric(12,2) NOT NULL DEFAULT 0,
  currency varchar(10) NOT NULL DEFAULT 'NGN',
  status varchar(50),
  raw_response jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);

-- Legacy-compatible transactions table (keeps existing app column names)
CREATE TABLE IF NOT EXISTS transactions_legacy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orderId varchar(100) UNIQUE,
  status varchar(50) NOT NULL DEFAULT 'pending',
  amount numeric(12,2) NOT NULL DEFAULT 0,
  currency varchar(10) NOT NULL DEFAULT 'NGN',
  customerEmail varchar(255),
  customerName text,
  customerPhone varchar(50),
  street text,
  city text,
  country varchar(2) DEFAULT 'NG',
  orderItems jsonb,
  gateway_reference varchar(255),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_legacy_orderId ON transactions_legacy(orderId);



