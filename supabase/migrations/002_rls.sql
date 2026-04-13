-- =============================================
-- F-Manager Row Level Security Policies
-- Migration: 002_rls.sql
-- =============================================

-- Enable RLS on all tables
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

-- =====================
-- HELPER FUNCTIONS
-- =====================

-- ⚠️ CRITICAL: Use app_metadata NOT user_metadata for role.
-- app_metadata can only be written by service_role, so users cannot forge their own role.
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function: get_agency_id_for_user
CREATE OR REPLACE FUNCTION get_user_agency_id()
RETURNS uuid AS $$
  SELECT id FROM agencies WHERE owner_id = auth.uid() LIMIT 1
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function: get_shop_id_for_user
CREATE OR REPLACE FUNCTION get_user_shop_id()
RETURNS uuid AS $$
  SELECT id FROM shops WHERE owner_id = auth.uid() LIMIT 1
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================
-- AGENCIES
-- =====================
CREATE POLICY "Super admin full access on agencies" ON agencies
  FOR ALL USING (is_super_admin());

CREATE POLICY "Agency owner can read own agency" ON agencies
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Agency owner can update own agency" ON agencies
  FOR UPDATE USING (owner_id = auth.uid());

-- =====================
-- AGENCY PLANS
-- =====================
CREATE POLICY "Super admin full access on plans" ON agency_plans
  FOR ALL USING (is_super_admin());

CREATE POLICY "Agency owner manages own plans" ON agency_plans
  FOR ALL USING (
    agency_id = get_user_agency_id()
  );

CREATE POLICY "Public can read active plans" ON agency_plans
  FOR SELECT USING (is_active = true);

-- =====================
-- SHOPS
-- =====================
CREATE POLICY "Super admin full access on shops" ON shops
  FOR ALL USING (is_super_admin());

CREATE POLICY "Agency owner manages own shops" ON shops
  FOR ALL USING (
    agency_id = get_user_agency_id()
  );

CREATE POLICY "Shop owner manages own shop" ON shops
  FOR ALL USING (owner_id = auth.uid());

-- =====================
-- PRODUCTS
-- =====================
CREATE POLICY "Super admin full access on products" ON products
  FOR ALL USING (is_super_admin());

CREATE POLICY "Shop owner manages own products" ON products
  FOR ALL USING (
    shop_id = get_user_shop_id()
  );

CREATE POLICY "Public can read active products" ON products
  FOR SELECT USING (
    is_active = true AND
    shop_id IN (SELECT id FROM shops WHERE is_active = true)
  );

-- =====================
-- DISCOUNT TIMERS
-- =====================
CREATE POLICY "Shop owner manages own timers" ON discount_timers
  FOR ALL USING (shop_id = get_user_shop_id());

CREATE POLICY "Public can read active timers" ON discount_timers
  FOR SELECT USING (is_active = true AND ends_at > now());

-- =====================
-- ORDERS
-- =====================
CREATE POLICY "Super admin full access on orders" ON orders
  FOR ALL USING (is_super_admin());

CREATE POLICY "Agency sees all orders in their shops" ON orders
  FOR SELECT USING (
    shop_id IN (SELECT id FROM shops WHERE agency_id = get_user_agency_id())
  );

CREATE POLICY "Shop owner sees own orders" ON orders
  FOR ALL USING (shop_id = get_user_shop_id());

CREATE POLICY "Public can insert orders" ON orders
  FOR INSERT WITH CHECK (true);

-- ⚠️ Public order read: ONLY allow reading by order_number for tracking page.
-- The tracking page uses service_role via server action, not the anon client.
-- Public read is intentionally BLOCKED here; tracking uses server-side fetch.

-- =====================
-- INVOICES
-- =====================
CREATE POLICY "Super admin full access on invoices" ON invoices
  FOR ALL USING (is_super_admin());

CREATE POLICY "Agency sees own invoices" ON invoices
  FOR SELECT USING (agency_id = get_user_agency_id());

-- =====================
-- CMS CONTENT
-- =====================
CREATE POLICY "Super admin manages CMS" ON cms_content
  FOR ALL USING (is_super_admin());

CREATE POLICY "Public reads CMS" ON cms_content
  FOR SELECT USING (true);

-- =====================
-- NOTIFICATIONS
-- =====================
CREATE POLICY "User sees own notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- =====================
-- CUSTOMER BLACKLIST
-- =====================
CREATE POLICY "Super admin full access on blacklist" ON customer_blacklist
  FOR ALL USING (is_super_admin());

CREATE POLICY "Agency can view all blacklist entries" ON customer_blacklist
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM agencies WHERE owner_id = auth.uid())
  );

CREATE POLICY "Agency can add to blacklist" ON customer_blacklist
  FOR INSERT WITH CHECK (
    added_by_agency_id = get_user_agency_id()
  );

CREATE POLICY "Shop owner can view blacklist" ON customer_blacklist
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM shops WHERE owner_id = auth.uid())
  );

CREATE POLICY "Shop owner can add to blacklist" ON customer_blacklist
  FOR INSERT WITH CHECK (
    added_by_shop_id = get_user_shop_id()
  );

-- =====================
-- ORDER ITEMS
-- =====================
CREATE POLICY "Super admin full access on order_items" ON order_items
  FOR ALL USING (is_super_admin());

CREATE POLICY "Shop owner sees own order items" ON order_items
  FOR ALL USING (
    order_id IN (SELECT id FROM orders WHERE shop_id = get_user_shop_id())
  );

CREATE POLICY "Public can insert order items" ON order_items
  FOR INSERT WITH CHECK (true);

-- =====================
-- ONBOARDING PROGRESS
-- =====================
CREATE POLICY "User manages own onboarding" ON onboarding_progress
  FOR ALL USING (user_id = auth.uid());

-- =====================
-- PAYMENT WEBHOOK LOG
-- =====================
CREATE POLICY "Super admin full access on webhook log" ON payment_webhook_log
  FOR ALL USING (is_super_admin());

CREATE POLICY "Shop owner reads own webhook log" ON payment_webhook_log
  FOR SELECT USING (
    shop_id = get_user_shop_id()
  );
