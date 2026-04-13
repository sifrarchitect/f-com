-- =============================================
-- F-Manager Database Schema
-- Migration: 001_schema.sql
-- =============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- =====================
-- AGENCIES
-- =====================
CREATE TABLE agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  custom_domain text UNIQUE,
  logo_url text,
  primary_color text DEFAULT '#FFFFFF',
  owner_email text NOT NULL,
  owner_name text,
  owner_id uuid REFERENCES auth.users(id),
  is_active boolean DEFAULT true,
  plan_limit integer DEFAULT 100,
  show_powered_by boolean DEFAULT true,
  notes text
);

-- =====================
-- AGENCY PLANS
-- =====================
CREATE TABLE agency_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name text NOT NULL,
  price integer NOT NULL,
  features text[] DEFAULT '{}',
  is_active boolean DEFAULT true
);

-- =====================
-- SHOPS
-- =====================
CREATE TABLE shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES auth.users(id),
  owner_email text,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  banner_url text,
  banner_text_title text,
  banner_text_subtitle text,
  banner_visible boolean DEFAULT true,
  primary_color text DEFAULT '#FFFFFF',
  plan_id uuid REFERENCES agency_plans(id),
  is_active boolean DEFAULT true,
  payment_secret_key text UNIQUE DEFAULT gen_random_uuid()::text,
  ruxspeed_enabled boolean DEFAULT false,
  bkash_merchant_number text,
  nagad_merchant_number text,
  rocket_merchant_number text,
  steadfast_api_key text,
  steadfast_secret_key text,
  -- Configurable delivery fees per shop
  delivery_fee_inside_dhaka integer NOT NULL DEFAULT 60,
  delivery_fee_outside_dhaka integer NOT NULL DEFAULT 120,
  -- Contact info shown on store + tracking page
  contact_phone text,
  contact_whatsapp text,
  -- Store-level privacy/terms (auto-generated or custom)
  custom_privacy_policy text,
  custom_terms text,
  -- SEO
  seo_title text,
  seo_description text,
  UNIQUE(agency_id, slug)
);

-- =====================
-- PRODUCTS
-- =====================
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  images text[] DEFAULT '{}',
  base_price integer NOT NULL,
  -- simple_stock: used ONLY when variants = '[]' (no-variant product)
  -- When variants exist, stock lives inside the JSONB variants field
  simple_stock integer NOT NULL DEFAULT 0,
  has_variants boolean GENERATED ALWAYS AS (jsonb_array_length(variants) > 0) STORED,
  variants jsonb DEFAULT '[]',
  -- variants format:
  -- [{"id":"uuid","type":"Size","options":[{"value":"S","stock":10,"price_modifier":0},{"value":"M","stock":5,"price_modifier":50}]}]
  -- price_modifier can be negative (discount) or positive (premium)
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  -- SEO for Facebook sharing
  seo_title text,
  seo_description text,
  UNIQUE(shop_id, slug)
);

-- =====================
-- DISCOUNT TIMERS
-- =====================
CREATE TABLE discount_timers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'SPECIAL OFFER',
  discount_percent integer NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  ends_at timestamptz NOT NULL,
  is_active boolean DEFAULT true
);

-- =====================
-- ORDER NUMBER SEQUENCE
-- =====================
CREATE SEQUENCE order_number_seq START 1000;

-- =====================
-- ORDERS
-- =====================
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  -- Collision-safe sequential order number: FM-001000, FM-001001 etc.
  order_number text UNIQUE NOT NULL DEFAULT 'FM-' || lpad(nextval('order_number_seq')::text, 6, '0'),
  shop_id uuid NOT NULL REFERENCES shops(id),
  product_id uuid REFERENCES products(id),
  variant_snapshot jsonb,
  -- snapshot: {"type":"Size","value":"M","price_modifier":50,"original_price":500,"final_price":550}
  customer_name text NOT NULL,
  customer_phone text NOT NULL,       -- stored normalized: +8801XXXXXXXXX
  customer_email text,
  customer_address text NOT NULL,
  delivery_zone text NOT NULL CHECK (delivery_zone IN ('inside_dhaka', 'outside_dhaka')),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price integer NOT NULL,        -- DISCOUNTED price (what customer actually pays per unit)
  original_unit_price integer,        -- pre-discount price, for display
  delivery_fee integer NOT NULL DEFAULT 0,
  discount_amount integer NOT NULL DEFAULT 0,
  total_price integer NOT NULL,       -- (unit_price × quantity) + delivery_fee
  payment_method text CHECK (payment_method IN ('bkash', 'nagad', 'rocket')),
  payment_trx_id text,
  payment_amount_expected integer,    -- amount customer should send (for RuxSpeed validation)
  payment_status text NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'verified', 'failed')),
  delivery_status text NOT NULL DEFAULT 'pending'
    CHECK (delivery_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  steadfast_consignment_id text,
  steadfast_tracking_code text,
  cancelled_at timestamptz,
  cancellation_reason text,
  stock_restored boolean DEFAULT false,
  notes text
);

-- =====================
-- INVOICES
-- =====================
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  agency_id uuid NOT NULL REFERENCES agencies(id),
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL,
  active_shop_count integer NOT NULL DEFAULT 0,
  amount_bdt integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid')),
  paid_at timestamptz,
  UNIQUE(agency_id, month, year)
);

-- =====================
-- CMS CONTENT
-- =====================
CREATE TABLE cms_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Seed default CMS values
INSERT INTO cms_content (key, value) VALUES
  ('hero_title', 'Bangladesh-এর সবচেয়ে শক্তিশালী F-Commerce Platform'),
  ('hero_subtitle', 'Messenger chaos থেকে professional online store — মাত্র কয়েক মিনিটে।'),
  ('feature_1', '১-ক্লিকে Steadfast কুরিয়ার বুকিং'),
  ('feature_2', 'Instant bKash/Nagad পেমেন্ট ভেরিফিকেশন'),
  ('feature_3', 'সম্পূর্ণ White-Label — আপনার ব্র্যান্ড, আপনার দাম'),
  ('contact_email', 'hello@fmanager.com'),
  ('contact_phone', '+880 1XXXXXXXXX'),
  ('privacy_policy', E'F-Manager Privacy Policy\n\nLast updated: January 2025\n\nF-Manager ("we") collects information necessary to provide our f-commerce platform services. This includes:\n\n1. Account Information: Email, name, phone number\n2. Store Data: Products, orders, customer information\n3. Payment Data: Transaction IDs for verification (we do not store payment credentials)\n4. Usage Data: Analytics to improve our services\n\nWe do not sell your data to third parties. Data is stored securely on Supabase infrastructure.\n\nFor questions, contact: hello@fmanager.com'),
  ('terms_of_service', E'F-Manager Terms of Service\n\nLast updated: January 2025\n\nBy using F-Manager, you agree to:\n\n1. Service Description: F-Manager provides a white-label f-commerce platform for agencies and sellers.\n2. User Obligations: You must provide accurate information and comply with Bangladeshi commerce laws.\n3. Billing: Agencies are billed 100 BDT per active shop per month.\n4. Termination: We reserve the right to suspend accounts for policy violations.\n5. Liability: F-Manager is not liable for disputes between sellers and customers.\n\nFor questions, contact: hello@fmanager.com'),
  ('privacy_updated_at', '2025-01-01'),
  ('terms_updated_at', '2025-01-01')
ON CONFLICT (key) DO NOTHING;

-- =====================
-- NOTIFICATIONS
-- =====================
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  is_read boolean DEFAULT false,
  link text
);

-- =====================
-- CUSTOMER BLACKLIST
-- =====================
-- Global cross-agency blacklist for fraud prevention
CREATE TABLE customer_blacklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  phone text NOT NULL,                          -- BD phone number, normalized
  reason text NOT NULL,                         -- "fraud", "fake_order", "abusive", "chargeback"
  notes text,                                   -- internal notes
  added_by_agency_id uuid REFERENCES agencies(id),
  added_by_shop_id uuid REFERENCES shops(id),
  is_active boolean DEFAULT true,
  UNIQUE(phone)                                 -- one record per phone globally
);

-- =====================
-- ORDER ITEMS (multi-product cart support)
-- =====================
-- orders table = the cart/session header
-- order_items = individual line items
-- This supports both single-product and multi-product checkout
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  product_name text NOT NULL,                  -- snapshot at time of order
  product_image text,                          -- snapshot
  variant_snapshot jsonb,                      -- {"type":"Size","value":"M","price_modifier":50}
  quantity integer NOT NULL DEFAULT 1,
  unit_price integer NOT NULL,
  total_price integer NOT NULL
);

-- =====================
-- ONBOARDING PROGRESS
-- =====================
CREATE TABLE onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('agency', 'shop')),
  completed_steps text[] DEFAULT '{}',
  -- Agency steps: ['branding','first_plan','first_shop']
  -- Shop steps: ['first_product','payment_setup','store_customized','first_order']
  is_complete boolean DEFAULT false,
  dismissed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================
-- PAYMENT WEBHOOK LOG
-- =====================
-- Stores all incoming RuxSpeed webhook events for audit + debugging
CREATE TABLE payment_webhook_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  sms_text text,
  sms_from text,
  extracted_trx_id text,
  extracted_amount integer,
  matched_order_id uuid REFERENCES orders(id),
  result text NOT NULL CHECK (result IN ('verified', 'amount_mismatch', 'not_found', 'duplicate', 'invalid_signature')),
  raw_payload jsonb
);

-- =====================
-- INDEXES FOR PERFORMANCE
-- =====================
CREATE INDEX idx_shops_agency_id ON shops(agency_id);
CREATE INDEX idx_shops_slug ON shops(slug);
CREATE INDEX idx_products_shop_id ON products(shop_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_orders_shop_id ON orders(shop_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_delivery_status ON orders(delivery_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_blacklist_phone ON customer_blacklist(phone);
CREATE INDEX idx_invoices_agency_id ON invoices(agency_id);
CREATE INDEX idx_discount_timers_shop_id ON discount_timers(shop_id);
CREATE INDEX idx_agencies_slug ON agencies(slug);
CREATE INDEX idx_agencies_custom_domain ON agencies(custom_domain);
