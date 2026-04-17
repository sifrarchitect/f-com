-- =============================================
-- F-Manager — Complete Database Setup
-- Run this ONCE in Supabase SQL Editor
-- =============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- TABLES
-- =====================

CREATE TABLE IF NOT EXISTS agencies (
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

CREATE TABLE IF NOT EXISTS agency_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name text NOT NULL,
  price integer NOT NULL,
  features text[] DEFAULT '{}',
  is_active boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS shops (
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
  delivery_fee_inside_dhaka integer NOT NULL DEFAULT 60,
  delivery_fee_outside_dhaka integer NOT NULL DEFAULT 120,
  contact_phone text,
  contact_whatsapp text,
  custom_privacy_policy text,
  custom_terms text,
  seo_title text,
  seo_description text,
  UNIQUE(agency_id, slug)
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  images text[] DEFAULT '{}',
  base_price integer NOT NULL,
  simple_stock integer NOT NULL DEFAULT 0,
  has_variants boolean GENERATED ALWAYS AS (jsonb_array_length(variants) > 0) STORED,
  variants jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  seo_title text,
  seo_description text,
  UNIQUE(shop_id, slug)
);

CREATE TABLE IF NOT EXISTS discount_timers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'SPECIAL OFFER',
  discount_percent integer NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  ends_at timestamptz NOT NULL,
  is_active boolean DEFAULT true
);

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  order_number text UNIQUE NOT NULL DEFAULT 'FM-' || lpad(nextval('order_number_seq')::text, 6, '0'),
  shop_id uuid NOT NULL REFERENCES shops(id),
  product_id uuid REFERENCES products(id),
  variant_snapshot jsonb,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  customer_address text NOT NULL,
  delivery_zone text NOT NULL CHECK (delivery_zone IN ('inside_dhaka', 'outside_dhaka')),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price integer NOT NULL,
  original_unit_price integer,
  delivery_fee integer NOT NULL DEFAULT 0,
  discount_amount integer NOT NULL DEFAULT 0,
  total_price integer NOT NULL,
  payment_method text CHECK (payment_method IN ('bkash', 'nagad', 'rocket')),
  payment_trx_id text,
  payment_amount_expected integer,
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

CREATE TABLE IF NOT EXISTS invoices (
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

CREATE TABLE IF NOT EXISTS cms_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  is_read boolean DEFAULT false,
  link text
);

CREATE TABLE IF NOT EXISTS customer_blacklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  phone text NOT NULL,
  reason text NOT NULL,
  notes text,
  added_by_agency_id uuid REFERENCES agencies(id),
  added_by_shop_id uuid REFERENCES shops(id),
  is_active boolean DEFAULT true,
  UNIQUE(phone)
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  product_name text NOT NULL,
  product_image text,
  variant_snapshot jsonb,
  quantity integer NOT NULL DEFAULT 1,
  unit_price integer NOT NULL,
  total_price integer NOT NULL
);

CREATE TABLE IF NOT EXISTS onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('agency', 'shop')),
  completed_steps text[] DEFAULT '{}',
  is_complete boolean DEFAULT false,
  dismissed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_webhook_log (
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
-- INDEXES
-- =====================
CREATE INDEX IF NOT EXISTS idx_shops_agency_id ON shops(agency_id);
CREATE INDEX IF NOT EXISTS idx_shops_slug ON shops(slug);
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_status ON orders(delivery_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_blacklist_phone ON customer_blacklist(phone);
CREATE INDEX IF NOT EXISTS idx_invoices_agency_id ON invoices(agency_id);
CREATE INDEX IF NOT EXISTS idx_discount_timers_shop_id ON discount_timers(shop_id);
CREATE INDEX IF NOT EXISTS idx_agencies_slug ON agencies(slug);
CREATE INDEX IF NOT EXISTS idx_agencies_custom_domain ON agencies(custom_domain);

-- =====================
-- SEED CMS (English)
-- =====================
INSERT INTO cms_content (key, value) VALUES
  ('hero_title', 'Bangladesh''s Most Powerful F-Commerce Platform'),
  ('hero_subtitle', 'From Messenger chaos to professional online store — in minutes.'),
  ('feature_1', 'One-click Steadfast courier booking'),
  ('feature_2', 'Instant bKash/Nagad payment verification'),
  ('feature_3', 'Complete white-label — your brand, your pricing'),
  ('contact_email', 'hello@fmanager.com'),
  ('contact_phone', '+880 1XXXXXXXXX'),
  ('privacy_policy', E'F-Manager Privacy Policy\n\nLast updated: January 2025\n\nF-Manager ("we") collects information necessary to provide our f-commerce platform services. This includes:\n\n1. Account Information: Email, name, phone number\n2. Store Data: Products, orders, customer information\n3. Payment Data: Transaction IDs for verification (we do not store payment credentials)\n4. Usage Data: Analytics to improve our services\n\nWe do not sell your data to third parties. Data is stored securely on Supabase infrastructure.\n\nFor questions, contact: hello@fmanager.com'),
  ('terms_of_service', E'F-Manager Terms of Service\n\nLast updated: January 2025\n\nBy using F-Manager, you agree to:\n\n1. Service Description: F-Manager provides a white-label f-commerce platform for agencies and sellers.\n2. User Obligations: You must provide accurate information and comply with Bangladeshi commerce laws.\n3. Billing: Agencies are billed 100 BDT per active shop per month.\n4. Termination: We reserve the right to suspend accounts for policy violations.\n5. Liability: F-Manager is not liable for disputes between sellers and customers.\n\nFor questions, contact: hello@fmanager.com'),
  ('privacy_updated_at', '2025-01-01'),
  ('terms_updated_at', '2025-01-01')
ON CONFLICT (key) DO NOTHING;

-- =====================
-- RLS
-- =====================
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhook_log ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_agency_id()
RETURNS uuid AS $$
  SELECT id FROM agencies WHERE owner_id = auth.uid() LIMIT 1
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_shop_id()
RETURNS uuid AS $$
  SELECT id FROM shops WHERE owner_id = auth.uid() LIMIT 1
$$ LANGUAGE sql SECURITY DEFINER;

-- Agencies
CREATE POLICY "Super admin full access on agencies" ON agencies FOR ALL USING (is_super_admin());
CREATE POLICY "Agency owner can read own agency" ON agencies FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Agency owner can update own agency" ON agencies FOR UPDATE USING (owner_id = auth.uid());

-- Agency Plans
CREATE POLICY "Super admin full access on plans" ON agency_plans FOR ALL USING (is_super_admin());
CREATE POLICY "Agency owner manages own plans" ON agency_plans FOR ALL USING (agency_id = get_user_agency_id());
CREATE POLICY "Public can read active plans" ON agency_plans FOR SELECT USING (is_active = true);

-- Shops
CREATE POLICY "Super admin full access on shops" ON shops FOR ALL USING (is_super_admin());
CREATE POLICY "Agency owner manages own shops" ON shops FOR ALL USING (agency_id = get_user_agency_id());
CREATE POLICY "Shop owner manages own shop" ON shops FOR ALL USING (owner_id = auth.uid());

-- Products
CREATE POLICY "Super admin full access on products" ON products FOR ALL USING (is_super_admin());
CREATE POLICY "Shop owner manages own products" ON products FOR ALL USING (shop_id = get_user_shop_id());
CREATE POLICY "Public can read active products" ON products FOR SELECT USING (is_active = true AND shop_id IN (SELECT id FROM shops WHERE is_active = true));

-- Discount Timers
CREATE POLICY "Shop owner manages own timers" ON discount_timers FOR ALL USING (shop_id = get_user_shop_id());
CREATE POLICY "Public can read active timers" ON discount_timers FOR SELECT USING (is_active = true AND ends_at > now());

-- Orders
CREATE POLICY "Super admin full access on orders" ON orders FOR ALL USING (is_super_admin());
CREATE POLICY "Agency sees all orders in their shops" ON orders FOR SELECT USING (shop_id IN (SELECT id FROM shops WHERE agency_id = get_user_agency_id()));
CREATE POLICY "Shop owner sees own orders" ON orders FOR ALL USING (shop_id = get_user_shop_id());
CREATE POLICY "Public can insert orders" ON orders FOR INSERT WITH CHECK (true);

-- Invoices
CREATE POLICY "Super admin full access on invoices" ON invoices FOR ALL USING (is_super_admin());
CREATE POLICY "Agency sees own invoices" ON invoices FOR SELECT USING (agency_id = get_user_agency_id());

-- CMS
CREATE POLICY "Super admin manages CMS" ON cms_content FOR ALL USING (is_super_admin());
CREATE POLICY "Public reads CMS" ON cms_content FOR SELECT USING (true);

-- Notifications
CREATE POLICY "User sees own notifications" ON notifications FOR ALL USING (user_id = auth.uid());

-- Blacklist
CREATE POLICY "Super admin full access on blacklist" ON customer_blacklist FOR ALL USING (is_super_admin());
CREATE POLICY "Agency can view all blacklist entries" ON customer_blacklist FOR SELECT USING (EXISTS (SELECT 1 FROM agencies WHERE owner_id = auth.uid()));
CREATE POLICY "Agency can add to blacklist" ON customer_blacklist FOR INSERT WITH CHECK (added_by_agency_id = get_user_agency_id());
CREATE POLICY "Shop owner can view blacklist" ON customer_blacklist FOR SELECT USING (EXISTS (SELECT 1 FROM shops WHERE owner_id = auth.uid()));
CREATE POLICY "Shop owner can add to blacklist" ON customer_blacklist FOR INSERT WITH CHECK (added_by_shop_id = get_user_shop_id());

-- Order Items
CREATE POLICY "Super admin full access on order_items" ON order_items FOR ALL USING (is_super_admin());
CREATE POLICY "Shop owner sees own order items" ON order_items FOR ALL USING (order_id IN (SELECT id FROM orders WHERE shop_id = get_user_shop_id()));
CREATE POLICY "Public can insert order items" ON order_items FOR INSERT WITH CHECK (true);

-- Onboarding
CREATE POLICY "User manages own onboarding" ON onboarding_progress FOR ALL USING (user_id = auth.uid());

-- Webhook Log
CREATE POLICY "Super admin full access on webhook log" ON payment_webhook_log FOR ALL USING (is_super_admin());
CREATE POLICY "Shop owner reads own webhook log" ON payment_webhook_log FOR SELECT USING (shop_id = get_user_shop_id());

-- =====================
-- FUNCTIONS
-- =====================

CREATE OR REPLACE FUNCTION normalize_bd_phone(p_phone text)
RETURNS text AS $$
DECLARE v_digits text;
BEGIN
  v_digits := regexp_replace(p_phone, '[^0-9]', '', 'g');
  IF length(v_digits) = 11 AND v_digits LIKE '01%' THEN RETURN '+880' || v_digits;
  ELSIF length(v_digits) = 13 AND v_digits LIKE '880%' THEN RETURN '+' || v_digits;
  ELSIF length(v_digits) = 14 THEN RETURN '+' || v_digits;
  ELSE RETURN p_phone;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION deduct_variant_stock(p_product_id uuid, p_variant_type text, p_variant_value text, p_quantity integer)
RETURNS jsonb AS $$
DECLARE
  v_variants jsonb; v_new_variants jsonb; v_simple_stock integer;
  v_updated boolean := false; v_current_stock integer; i integer; j integer;
BEGIN
  SELECT variants, simple_stock INTO v_variants, v_simple_stock FROM products WHERE id = p_product_id FOR UPDATE;
  IF p_variant_type IS NULL OR jsonb_array_length(v_variants) = 0 THEN
    IF v_simple_stock < p_quantity THEN RAISE EXCEPTION 'Insufficient stock: % available', v_simple_stock; END IF;
    UPDATE products SET simple_stock = simple_stock - p_quantity WHERE id = p_product_id;
    RETURN jsonb_build_object('success', true, 'remaining_stock', v_simple_stock - p_quantity);
  END IF;
  v_new_variants := '[]'::jsonb;
  FOR i IN 0..jsonb_array_length(v_variants)-1 LOOP
    IF v_variants->i->>'type' = p_variant_type THEN
      DECLARE v_options jsonb := v_variants->i->'options'; v_new_options jsonb := '[]'::jsonb;
      BEGIN
        FOR j IN 0..jsonb_array_length(v_options)-1 LOOP
          IF v_options->j->>'value' = p_variant_value THEN
            v_current_stock := (v_options->j->>'stock')::integer;
            IF v_current_stock < p_quantity THEN RAISE EXCEPTION 'Insufficient stock: % available', v_current_stock; END IF;
            v_new_options := v_new_options || jsonb_set(v_options->j, '{stock}', to_jsonb(v_current_stock - p_quantity));
            v_updated := true;
          ELSE v_new_options := v_new_options || (v_options->j);
          END IF;
        END LOOP;
        v_new_variants := v_new_variants || jsonb_set(v_variants->i, '{options}', v_new_options);
      END;
    ELSE v_new_variants := v_new_variants || (v_variants->i);
    END IF;
  END LOOP;
  IF NOT v_updated THEN RAISE EXCEPTION 'Variant not found: % - %', p_variant_type, p_variant_value; END IF;
  UPDATE products SET variants = v_new_variants WHERE id = p_product_id;
  RETURN jsonb_build_object('success', true, 'remaining_stock', v_current_stock - p_quantity);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION restore_variant_stock(p_order_id uuid)
RETURNS jsonb AS $$
DECLARE v_order RECORD; v_variants jsonb; v_new_variants jsonb; i integer; j integer;
BEGIN
  SELECT o.product_id, o.variant_snapshot, o.quantity, o.stock_restored INTO v_order FROM orders o WHERE o.id = p_order_id FOR UPDATE;
  IF v_order.stock_restored THEN RETURN jsonb_build_object('success', false, 'error', 'Stock already restored'); END IF;
  IF v_order.product_id IS NULL THEN
    UPDATE orders SET stock_restored = true, delivery_status = 'cancelled', cancelled_at = now() WHERE id = p_order_id;
    RETURN jsonb_build_object('success', true);
  END IF;
  IF v_order.variant_snapshot IS NULL THEN
    UPDATE products SET simple_stock = simple_stock + v_order.quantity WHERE id = v_order.product_id;
    UPDATE orders SET stock_restored = true, delivery_status = 'cancelled', cancelled_at = now() WHERE id = p_order_id;
    RETURN jsonb_build_object('success', true);
  END IF;
  SELECT variants INTO v_variants FROM products WHERE id = v_order.product_id FOR UPDATE;
  v_new_variants := '[]'::jsonb;
  FOR i IN 0..jsonb_array_length(v_variants)-1 LOOP
    IF v_variants->i->>'type' = v_order.variant_snapshot->>'type' THEN
      DECLARE v_options jsonb := v_variants->i->'options'; v_new_options jsonb := '[]'::jsonb;
      BEGIN
        FOR j IN 0..jsonb_array_length(v_options)-1 LOOP
          IF v_options->j->>'value' = v_order.variant_snapshot->>'value' THEN
            v_new_options := v_new_options || jsonb_set(v_options->j, '{stock}', to_jsonb((v_options->j->>'stock')::integer + v_order.quantity));
          ELSE v_new_options := v_new_options || (v_options->j);
          END IF;
        END LOOP;
        v_new_variants := v_new_variants || jsonb_set(v_variants->i, '{options}', v_new_options);
      END;
    ELSE v_new_variants := v_new_variants || (v_variants->i);
    END IF;
  END LOOP;
  UPDATE products SET variants = v_new_variants WHERE id = v_order.product_id;
  UPDATE orders SET stock_restored = true, delivery_status = 'cancelled', cancelled_at = now() WHERE id = p_order_id;
  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_customer_blacklisted(p_phone text)
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM customer_blacklist WHERE phone = p_phone AND is_active = true)
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_notification(p_user_id uuid, p_type text, p_title text, p_message text, p_link text DEFAULT NULL)
RETURNS void AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link) VALUES (p_user_id, p_type, p_title, p_message, p_link);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION generate_monthly_invoices()
RETURNS void AS $$
DECLARE v_agency RECORD; v_active_shops integer; v_month integer := EXTRACT(MONTH FROM now()); v_year integer := EXTRACT(YEAR FROM now());
BEGIN
  FOR v_agency IN SELECT id FROM agencies WHERE is_active = true LOOP
    SELECT COUNT(*) INTO v_active_shops FROM shops WHERE agency_id = v_agency.id AND is_active = true;
    INSERT INTO invoices (agency_id, month, year, active_shop_count, amount_bdt)
    VALUES (v_agency.id, v_month, v_year, v_active_shops, v_active_shops * 100)
    ON CONFLICT (agency_id, month, year) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- TRIGGERS
-- =====================

CREATE OR REPLACE FUNCTION notify_shop_on_new_order()
RETURNS trigger AS $$
DECLARE v_shop_owner_id uuid;
BEGIN
  SELECT owner_id INTO v_shop_owner_id FROM shops WHERE id = NEW.shop_id;
  IF v_shop_owner_id IS NOT NULL THEN
    PERFORM create_notification(v_shop_owner_id, 'new_order', 'New Order Received!',
      'Order ' || NEW.order_number || ' from ' || NEW.customer_name || ' — ' || NEW.total_price || ' BDT', '/dashboard/orders');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_order_notify ON orders;
CREATE TRIGGER on_new_order_notify AFTER INSERT ON orders FOR EACH ROW EXECUTE FUNCTION notify_shop_on_new_order();

CREATE OR REPLACE FUNCTION notify_on_payment_verified()
RETURNS trigger AS $$
DECLARE v_shop_owner_id uuid;
BEGIN
  IF OLD.payment_status = 'pending' AND NEW.payment_status = 'verified' THEN
    SELECT owner_id INTO v_shop_owner_id FROM shops WHERE id = NEW.shop_id;
    IF v_shop_owner_id IS NOT NULL THEN
      PERFORM create_notification(v_shop_owner_id, 'payment_verified', 'Payment Verified',
        NEW.order_number || ' — ' || NEW.payment_method || ' — ' || NEW.total_price || ' BDT', '/dashboard/orders');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_payment_verified_notify ON orders;
CREATE TRIGGER on_payment_verified_notify AFTER UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION notify_on_payment_verified();

CREATE OR REPLACE FUNCTION notify_on_low_stock()
RETURNS trigger AS $$
DECLARE v_shop_owner_id uuid; v_variant jsonb; v_option jsonb;
BEGIN
  SELECT owner_id INTO v_shop_owner_id FROM shops WHERE id = NEW.shop_id;
  IF v_shop_owner_id IS NULL THEN RETURN NEW; END IF;
  IF OLD.simple_stock > 5 AND NEW.simple_stock <= 5 AND NEW.simple_stock > 0 THEN
    PERFORM create_notification(v_shop_owner_id, 'low_stock', 'Low Stock: ' || NEW.name, 'Only ' || NEW.simple_stock || ' units left', '/dashboard/products');
  END IF;
  FOR v_variant IN SELECT jsonb_array_elements(NEW.variants) LOOP
    FOR v_option IN SELECT jsonb_array_elements(v_variant->'options') LOOP
      IF (v_option->>'stock')::integer <= 5 AND (v_option->>'stock')::integer > 0 THEN
        PERFORM create_notification(v_shop_owner_id, 'low_stock',
          'Low Stock: ' || NEW.name || ' - ' || (v_variant->>'type') || ': ' || (v_option->>'value'),
          'Only ' || (v_option->>'stock') || ' units left', '/dashboard/products');
      END IF;
    END LOOP;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_low_stock_notify ON products;
CREATE TRIGGER on_low_stock_notify AFTER UPDATE ON products FOR EACH ROW EXECUTE FUNCTION notify_on_low_stock();

-- =====================
-- ENABLE REALTIME for notifications
-- =====================
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
