# 🚀 F-MANAGER — MASTER BUILD PROMPT
> Feed this into Claude Opus 4.6 session by session. Each session is self-contained.

---

## WHO YOU ARE & WHAT YOU'RE BUILDING

You are a senior full-stack engineer building **F-Manager** — Bangladesh's first white-label, multi-tenant f-commerce SaaS platform. Think of it as **Shopify + Vercel's agency model**, built for Bangladeshi Facebook/Instagram commerce sellers, with native bKash/Nagad payment verification and Steadfast courier integration.

The platform has 4 tiers:
1. **Super Admin** (Team Sifr — the platform owners) → God-mode control
2. **Agency** → White-labels the software, resells to sellers under their own brand
3. **Shop Admin** → F-commerce seller managing their store, orders, products
4. **Customer** → Buyer who visits the store, selects product, checks out

**Revenue model:** Agencies pay 100 BDT per active shop per month to Team Sifr. Sellers pay agencies whatever the agency decides.

---

## TECH STACK (NON-NEGOTIABLE)

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router, RSC-first) |
| Database | Supabase (PostgreSQL + Auth + RLS + Realtime + Storage) |
| Deployment | Vercel |
| Styling | Tailwind CSS + shadcn/ui |
| UI Components | **21st.dev MCP** — use for all animated, polished components |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| Global State | Zustand |
| Icons | Lucide React |
| Rich Text | Tiptap (product descriptions only) |
| Charts | Recharts (area, bar, donut, line — Stripe-style, dark themed) |
| Email | **Resend** (`resend` npm package) — all transactional emails |
| Email Templates | React Email (`@react-email/components`) — JSX-based templates |
| File Uploads | Supabase Storage |
| Image Processing | `browser-image-compression` — compress before upload, max 800px, <200KB |

---

## DESIGN SYSTEM (NON-NEGOTIABLE)

### Theme
```css
--bg-primary: #0A0A0A;
--bg-secondary: #111111;
--bg-card: #141414;
--bg-hover: #1A1A1A;
--border: #222222;
--border-subtle: #1A1A1A;
--text-primary: #FAFAFA;
--text-secondary: #888888;
--text-muted: #555555;
--accent: #FFFFFF;
--accent-destructive: #FF3B3B;
--accent-success: #00C853;
--accent-warning: #FFB300;
```

### Typography
- Display/Headings: `Geist` (next/font)
- Body: `Geist Mono` for data, `Geist` for prose
- Never use Inter, Roboto, or system fonts

### UI Philosophy
- **Premium dark minimal** — think Linear.app meets Vercel dashboard
- Sidebar navigation on all admin panels (collapsible on mobile)
- Cards with `border: 1px solid var(--border)` and `background: var(--bg-card)`
- Data tables: zebra-free, hover highlight `var(--bg-hover)`
- Buttons: Primary = white bg + black text | Ghost = transparent + white border
- All modals use shadcn Dialog with dark overlay
- Toast notifications: bottom-right, dark themed
- Loading states: skeleton loaders (not spinners) for tables and cards
- Empty states: centered illustration + message on every list/table
- 21st.dev MCP: use for hero animations, stat counters, feature cards, any visually rich section

### Responsiveness
- Admin panels: desktop-first (sidebar collapses to drawer on mobile)
- Customer store/checkout: mobile-first (full-screen on phone)
- Landing page: fully responsive

---

## ARCHITECTURE

```
fmanager.com                              → Landing page
admin.fmanager.com                        → Super Admin panel
[agency-slug].fmanager.com               → Agency panel + seller stores
[custom-domain].com                       → Custom domain mapped to agency
[agency-slug].fmanager.com/store/[slug]  → Customer-facing store
```

### Middleware Routing Logic (middleware.ts — Edge Runtime)
```typescript
// 1. Extract hostname from request
// 2. If hostname === "admin.fmanager.com" → rewrite to /admin/*
// 3. If hostname === "fmanager.com" → marketing page, no rewrite
// 4. If hostname ends with ".fmanager.com" → extract slug, fetch agency from Supabase
// 5. If hostname is a custom domain → lookup agency by custom_domain field
// 6. Inject agency_id, agency theme (logo, primary_color) into request headers
// 7. Rewrite to appropriate internal route
// Use Supabase edge client (not Node client) in middleware
```

---

## COMPLETE DATABASE SCHEMA

Run all of this in Supabase SQL editor as migration `001_schema.sql`:

```sql
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
  ('contact_phone', '+880 1XXXXXXXXX');

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


---

## RLS POLICIES

Run as migration `002_rls.sql`:

```sql
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

-- ⚠️ CRITICAL: Use app_metadata NOT user_metadata for role.
-- app_metadata can only be written by service_role, so users cannot forge their own role.
-- Set this via Supabase dashboard or service_role API: auth.admin.updateUserById(id, { app_metadata: { role: 'super_admin' } })
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

-- AGENCIES
CREATE POLICY "Super admin full access on agencies" ON agencies
  FOR ALL USING (is_super_admin());

CREATE POLICY "Agency owner can read own agency" ON agencies
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Agency owner can update own agency" ON agencies
  FOR UPDATE USING (owner_id = auth.uid());

-- AGENCY PLANS
CREATE POLICY "Super admin full access on plans" ON agency_plans
  FOR ALL USING (is_super_admin());

CREATE POLICY "Agency owner manages own plans" ON agency_plans
  FOR ALL USING (
    agency_id = get_user_agency_id()
  );

CREATE POLICY "Public can read active plans" ON agency_plans
  FOR SELECT USING (is_active = true);

-- SHOPS
CREATE POLICY "Super admin full access on shops" ON shops
  FOR ALL USING (is_super_admin());

CREATE POLICY "Agency owner manages own shops" ON shops
  FOR ALL USING (
    agency_id = get_user_agency_id()
  );

CREATE POLICY "Shop owner manages own shop" ON shops
  FOR ALL USING (owner_id = auth.uid());

-- PRODUCTS
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

-- DISCOUNT TIMERS
CREATE POLICY "Shop owner manages own timers" ON discount_timers
  FOR ALL USING (shop_id = get_user_shop_id());

CREATE POLICY "Public can read active timers" ON discount_timers
  FOR SELECT USING (is_active = true AND ends_at > now());

-- ORDERS
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
-- Do NOT use FOR SELECT USING (true) — that exposes all orders to anyone.
-- The tracking page uses service_role via server action, not the anon client.
-- Public read is intentionally BLOCKED here; tracking uses server-side fetch.
-- (No public SELECT policy on orders — handled server-side with service_role)

-- INVOICES
CREATE POLICY "Super admin full access on invoices" ON invoices
  FOR ALL USING (is_super_admin());

CREATE POLICY "Agency sees own invoices" ON invoices
  FOR SELECT USING (agency_id = get_user_agency_id());

-- CMS CONTENT
CREATE POLICY "Super admin manages CMS" ON cms_content
  FOR ALL USING (is_super_admin());

CREATE POLICY "Public reads CMS" ON cms_content
  FOR SELECT USING (true);

-- NOTIFICATIONS
CREATE POLICY "User sees own notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- CUSTOMER BLACKLIST
ALTER TABLE customer_blacklist ENABLE ROW LEVEL SECURITY;

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

-- ORDER ITEMS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin full access on order_items" ON order_items
  FOR ALL USING (is_super_admin());

CREATE POLICY "Shop owner sees own order items" ON order_items
  FOR ALL USING (
    order_id IN (SELECT id FROM orders WHERE shop_id = get_user_shop_id())
  );

CREATE POLICY "Public can insert order items" ON order_items
  FOR INSERT WITH CHECK (true);

-- ONBOARDING PROGRESS
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User manages own onboarding" ON onboarding_progress
  FOR ALL USING (user_id = auth.uid());
```

---

## SUPABASE RPC FUNCTIONS

Run as migration `003_functions.sql`:

```sql
-- =====================
-- PHONE NORMALIZATION UTILITY
-- =====================
CREATE OR REPLACE FUNCTION normalize_bd_phone(p_phone text)
RETURNS text AS $$
DECLARE
  v_digits text;
BEGIN
  -- Strip all non-digit characters
  v_digits := regexp_replace(p_phone, '[^0-9]', '', 'g');
  -- Convert 01XXXXXXXXX → +8801XXXXXXXXX
  IF length(v_digits) = 11 AND v_digits LIKE '01%' THEN
    RETURN '+880' || v_digits;
  -- Already has country code: 8801XXXXXXXXX
  ELSIF length(v_digits) = 13 AND v_digits LIKE '880%' THEN
    RETURN '+' || v_digits;
  -- +8801XXXXXXXXX already
  ELSIF length(v_digits) = 14 THEN
    RETURN '+' || v_digits;
  ELSE
    RETURN p_phone; -- Return as-is if unrecognized
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================
-- ATOMIC STOCK DEDUCT (handles both variant and no-variant products)
-- =====================
CREATE OR REPLACE FUNCTION deduct_variant_stock(
  p_product_id uuid,
  p_variant_type text,   -- pass NULL for no-variant products
  p_variant_value text,  -- pass NULL for no-variant products
  p_quantity integer
)
RETURNS jsonb AS $$
DECLARE
  v_variants jsonb;
  v_new_variants jsonb;
  v_simple_stock integer;
  v_updated boolean := false;
  v_current_stock integer;
  i integer;
  j integer;
BEGIN
  -- Lock the product row
  SELECT variants, simple_stock INTO v_variants, v_simple_stock
  FROM products WHERE id = p_product_id FOR UPDATE;

  -- No-variant product: use simple_stock
  IF p_variant_type IS NULL OR jsonb_array_length(v_variants) = 0 THEN
    IF v_simple_stock < p_quantity THEN
      RAISE EXCEPTION 'Insufficient stock: % available', v_simple_stock;
    END IF;
    UPDATE products SET simple_stock = simple_stock - p_quantity WHERE id = p_product_id;
    RETURN jsonb_build_object('success', true, 'remaining_stock', v_simple_stock - p_quantity);
  END IF;

  -- Variant product: update JSONB
  v_new_variants := '[]'::jsonb;
  FOR i IN 0..jsonb_array_length(v_variants)-1 LOOP
    IF v_variants->i->>'type' = p_variant_type THEN
      DECLARE
        v_options jsonb := v_variants->i->'options';
        v_new_options jsonb := '[]'::jsonb;
      BEGIN
        FOR j IN 0..jsonb_array_length(v_options)-1 LOOP
          IF v_options->j->>'value' = p_variant_value THEN
            v_current_stock := (v_options->j->>'stock')::integer;
            IF v_current_stock < p_quantity THEN
              RAISE EXCEPTION 'Insufficient stock: % available', v_current_stock;
            END IF;
            v_new_options := v_new_options || jsonb_set(
              v_options->j, '{stock}', to_jsonb(v_current_stock - p_quantity)
            );
            v_updated := true;
          ELSE
            v_new_options := v_new_options || (v_options->j);
          END IF;
        END LOOP;
        v_new_variants := v_new_variants || jsonb_set(v_variants->i, '{options}', v_new_options);
      END;
    ELSE
      v_new_variants := v_new_variants || (v_variants->i);
    END IF;
  END LOOP;

  IF NOT v_updated THEN
    RAISE EXCEPTION 'Variant not found: % - %', p_variant_type, p_variant_value;
  END IF;

  UPDATE products SET variants = v_new_variants WHERE id = p_product_id;
  RETURN jsonb_build_object('success', true, 'remaining_stock', v_current_stock - p_quantity);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- RESTORE STOCK ON CANCEL (handles both variant and no-variant)
-- =====================
CREATE OR REPLACE FUNCTION restore_variant_stock(p_order_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_order RECORD;
  v_variants jsonb;
  v_new_variants jsonb;
  i integer;
  j integer;
BEGIN
  SELECT o.product_id, o.variant_snapshot, o.quantity, o.stock_restored
  INTO v_order FROM orders o WHERE o.id = p_order_id FOR UPDATE;

  IF v_order.stock_restored THEN
    RETURN jsonb_build_object('success', false, 'error', 'Stock already restored');
  END IF;

  IF v_order.product_id IS NULL THEN
    UPDATE orders SET stock_restored = true, delivery_status = 'cancelled', cancelled_at = now()
    WHERE id = p_order_id;
    RETURN jsonb_build_object('success', true);
  END IF;

  -- No-variant product
  IF v_order.variant_snapshot IS NULL THEN
    UPDATE products SET simple_stock = simple_stock + v_order.quantity WHERE id = v_order.product_id;
    UPDATE orders SET stock_restored = true, delivery_status = 'cancelled', cancelled_at = now()
    WHERE id = p_order_id;
    RETURN jsonb_build_object('success', true);
  END IF;

  -- Variant product
  SELECT variants INTO v_variants FROM products WHERE id = v_order.product_id FOR UPDATE;
  v_new_variants := '[]'::jsonb;
  FOR i IN 0..jsonb_array_length(v_variants)-1 LOOP
    IF v_variants->i->>'type' = v_order.variant_snapshot->>'type' THEN
      DECLARE
        v_options jsonb := v_variants->i->'options';
        v_new_options jsonb := '[]'::jsonb;
      BEGIN
        FOR j IN 0..jsonb_array_length(v_options)-1 LOOP
          IF v_options->j->>'value' = v_order.variant_snapshot->>'value' THEN
            v_new_options := v_new_options || jsonb_set(
              v_options->j, '{stock}',
              to_jsonb((v_options->j->>'stock')::integer + v_order.quantity)
            );
          ELSE
            v_new_options := v_new_options || (v_options->j);
          END IF;
        END LOOP;
        v_new_variants := v_new_variants || jsonb_set(v_variants->i, '{options}', v_new_options);
      END;
    ELSE
      v_new_variants := v_new_variants || (v_variants->i);
    END IF;
  END LOOP;

  UPDATE products SET variants = v_new_variants WHERE id = v_order.product_id;
  UPDATE orders SET stock_restored = true, delivery_status = 'cancelled', cancelled_at = now()
  WHERE id = p_order_id;

  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- CHECK BLACKLIST
-- =====================
CREATE OR REPLACE FUNCTION is_customer_blacklisted(p_phone text)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM customer_blacklist
    WHERE phone = p_phone AND is_active = true
  )
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================
-- CREATE NOTIFICATION HELPER
-- =====================
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_link text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link)
  VALUES (p_user_id, p_type, p_title, p_message, p_link);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- TRIGGER: Notify shop owner on new order
-- =====================
CREATE OR REPLACE FUNCTION notify_shop_on_new_order()
RETURNS trigger AS $$
DECLARE
  v_shop_owner_id uuid;
BEGIN
  SELECT owner_id INTO v_shop_owner_id FROM shops WHERE id = NEW.shop_id;
  IF v_shop_owner_id IS NOT NULL THEN
    PERFORM create_notification(
      v_shop_owner_id,
      'new_order',
      'New Order Received!',
      'Order ' || NEW.order_number || ' from ' || NEW.customer_name || ' — ' || NEW.total_price || ' BDT',
      '/dashboard/orders'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_order_notify
  AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION notify_shop_on_new_order();

-- =====================
-- TRIGGER: Notify shop owner on payment verified
-- =====================
CREATE OR REPLACE FUNCTION notify_on_payment_verified()
RETURNS trigger AS $$
DECLARE
  v_shop_owner_id uuid;
BEGIN
  IF OLD.payment_status = 'pending' AND NEW.payment_status = 'verified' THEN
    SELECT owner_id INTO v_shop_owner_id FROM shops WHERE id = NEW.shop_id;
    IF v_shop_owner_id IS NOT NULL THEN
      PERFORM create_notification(
        v_shop_owner_id,
        'payment_verified',
        '✅ Payment Verified',
        NEW.order_number || ' — ' || NEW.payment_method || ' — ' || NEW.total_price || ' BDT',
        '/dashboard/orders'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_payment_verified_notify
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION notify_on_payment_verified();

-- =====================
-- TRIGGER: Low stock alert (fires when variant stock or simple_stock drops below 5)
-- =====================
CREATE OR REPLACE FUNCTION notify_on_low_stock()
RETURNS trigger AS $$
DECLARE
  v_shop_owner_id uuid;
  v_variant jsonb;
  v_option jsonb;
BEGIN
  SELECT owner_id INTO v_shop_owner_id FROM shops WHERE id = NEW.shop_id;
  IF v_shop_owner_id IS NULL THEN RETURN NEW; END IF;

  -- Check simple_stock
  IF OLD.simple_stock > 5 AND NEW.simple_stock <= 5 AND NEW.simple_stock > 0 THEN
    PERFORM create_notification(v_shop_owner_id, 'low_stock',
      '⚠️ Low Stock: ' || NEW.name,
      'Only ' || NEW.simple_stock || ' units left',
      '/dashboard/products');
  END IF;

  -- Check variant stocks
  FOR v_variant IN SELECT jsonb_array_elements(NEW.variants) LOOP
    FOR v_option IN SELECT jsonb_array_elements(v_variant->'options') LOOP
      IF (v_option->>'stock')::integer <= 5 AND (v_option->>'stock')::integer > 0 THEN
        PERFORM create_notification(v_shop_owner_id, 'low_stock',
          '⚠️ Low Stock: ' || NEW.name || ' - ' || (v_variant->>'type') || ': ' || (v_option->>'value'),
          'Only ' || (v_option->>'stock') || ' units left',
          '/dashboard/products');
      END IF;
    END LOOP;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_low_stock_notify
  AFTER UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION notify_on_low_stock();

-- =====================
-- GENERATE MONTHLY INVOICES (called by cron)
-- =====================
RETURNS void AS $$
DECLARE
  v_agency RECORD;
  v_active_shops integer;
  v_month integer := EXTRACT(MONTH FROM now());
  v_year integer := EXTRACT(YEAR FROM now());
BEGIN
  FOR v_agency IN SELECT id FROM agencies WHERE is_active = true LOOP
    SELECT COUNT(*) INTO v_active_shops
    FROM shops
    WHERE agency_id = v_agency.id AND is_active = true;
    
    INSERT INTO invoices (agency_id, month, year, active_shop_count, amount_bdt)
    VALUES (v_agency.id, v_month, v_year, v_active_shops, v_active_shops * 100)
    ON CONFLICT (agency_id, month, year) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- CRON JOB
-- =====================
SELECT cron.schedule(
  'monthly-invoice-generation',
  '0 9 1 * *',  -- 9am on 1st of every month
  'SELECT generate_monthly_invoices()'
);
```

---

## FOLDER STRUCTURE

Create this exact structure:

```
f-manager/
├── app/
│   ├── not-found.tsx                    # Global 404 page
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                     # Landing page
│   │   ├── privacy/page.tsx             # F-Manager SaaS Privacy Policy
│   │   └── terms/page.tsx               # F-Manager SaaS Terms of Service
│   ├── (admin)/
│   │   ├── layout.tsx
│   │   └── admin/
│   │       ├── not-found.tsx
│   │       ├── loading.tsx
│   │       ├── error.tsx
│   │       ├── page.tsx                 # Dashboard
│   │       ├── agencies/
│   │       │   ├── page.tsx
│   │       │   ├── loading.tsx
│   │       │   └── [id]/page.tsx
│   │       ├── orders/page.tsx
│   │       ├── blacklist/page.tsx
│   │       ├── billing/page.tsx
│   │       └── cms/page.tsx
│   ├── (agency)/
│   │   ├── layout.tsx
│   │   ├── not-found.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── page.tsx
│   │   ├── onboarding/page.tsx
│   │   ├── shops/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── settings/
│   │   │   ├── branding/page.tsx
│   │   │   └── plans/page.tsx
│   │   └── billing/page.tsx
│   ├── (shop)/
│   │   ├── layout.tsx
│   │   ├── not-found.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       ├── loading.tsx
│   │       ├── onboarding/page.tsx
│   │       ├── orders/
│   │       │   ├── page.tsx
│   │       │   └── [id]/page.tsx        # Order detail + print slip
│   │       ├── products/
│   │       │   ├── page.tsx
│   │       │   ├── loading.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [id]/edit/page.tsx
│   │       ├── store/page.tsx           # Store customization (incl. discount timers)
│   │       ├── payments/page.tsx
│   │       └── billing/page.tsx
│   ├── (store)/
│   │   ├── layout.tsx
│   │   └── store/
│   │       └── [shopSlug]/
│   │           ├── page.tsx             # Product listing / store home
│   │           ├── not-found.tsx        # Shop not found page
│   │           ├── privacy/page.tsx     # Store-specific Privacy Policy
│   │           ├── terms/page.tsx       # Store-specific Terms of Service
│   │           └── [productSlug]/
│   │               └── page.tsx         # Product detail + checkout
│   ├── track/
│   │   └── [orderNumber]/
│   │       └── page.tsx                 # Customer order tracking (public)
│   ├── api/
│   │   ├── health/route.ts
│   │   ├── ruxspeed-webhook/route.ts
│   │   └── resend-webhook/route.ts
│   ├── suspended/page.tsx
│   └── opengraph-image.tsx              # OG image for main domain
├── components/
│   ├── ui/
│   ├── shared/
│   │   ├── NotificationBell.tsx
│   │   ├── NotificationDropdown.tsx
│   │   ├── OnboardingChecklist.tsx
│   │   └── BlacklistBadge.tsx
│   ├── admin/
│   │   ├── DoomsdayButton.tsx
│   │   ├── AgencyTable.tsx
│   │   ├── KillSwitch.tsx
│   │   └── BlacklistTable.tsx
│   ├── agency/
│   │   ├── PlanBuilder.tsx
│   │   ├── ShopTable.tsx
│   │   ├── BrandingEditor.tsx
│   │   └── AgencyOnboarding.tsx
│   ├── shop/
│   │   ├── OrderTable.tsx
│   │   ├── OrderDetailModal.tsx
│   │   ├── OrderPrintSlip.tsx
│   │   ├── BulkSteadfastModal.tsx
│   │   ├── ProductForm.tsx
│   │   ├── VariantBuilder.tsx
│   │   ├── StoreEditor.tsx
│   │   ├── DiscountTimerManager.tsx     # Full timer CRUD in store settings
│   │   ├── StoreLinkCopy.tsx
│   │   └── ShopOnboarding.tsx
│   └── store/
│       ├── StoreLayout.tsx              # Reads agency headers, applies branding
│       ├── ProductGrid.tsx
│       ├── ProductCard.tsx
│       ├── CheckoutForm.tsx
│       ├── PaymentVerification.tsx
│       ├── DiscountBanner.tsx
│       ├── CountdownTimer.tsx
│       └── BlacklistWarning.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── actions/
│   │   ├── agencies.ts
│   │   ├── shops.ts
│   │   ├── products.ts
│   │   ├── orders.ts
│   │   ├── blacklist.ts
│   │   ├── notifications.ts
│   │   ├── onboarding.ts
│   │   └── cms.ts
│   ├── email/
│   │   ├── resend.ts
│   │   └── templates/
│   │       ├── OrderConfirmation.tsx
│   │       ├── PaymentVerified.tsx
│   │       ├── NewOrderAlert.tsx
│   │       ├── ShopInvite.tsx
│   │       ├── AgencyInvite.tsx
│   │       ├── InvoiceGenerated.tsx
│   │       ├── OrderCancelled.tsx
│   │       └── WelcomeAgency.tsx
│   ├── steadfast.ts
│   ├── ruxspeed.ts
│   ├── phone.ts                         # normalizePhone() utility
│   ├── validations.ts
│   └── utils.ts
├── types/
│   └── database.ts
├── middleware.ts
├── next.config.js
├── supabase/
│   └── migrations/
│       ├── 001_schema.sql
│       ├── 002_rls.sql
│       ├── 003_functions.sql
│       └── 004_triggers.sql
├── public/
│   ├── robots.txt
│   └── sitemap.xml                      # Static or generated
├── .env.local.example
└── README.md
```

---

## THREE-FILE SUPABASE CLIENT PATTERN

### lib/supabase/client.ts (Browser)
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### lib/supabase/server.ts (Server Components)
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          } catch {}
        },
      },
    }
  )
}
```

### lib/supabase/middleware.ts (Edge Middleware)
```typescript
import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'
import type { NextResponse } from 'next/server'

export function createClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )
}
```

---

## next.config.js (Required)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Required for wildcard subdomain routing on Vercel
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

## package.json Scripts (Required)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:types": "npx supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > types/database.ts",
    "db:reset": "npx supabase db reset",
    "email:dev": "email dev --dir src/lib/email/templates --port 3001"
  }
}
```

## lib/phone.ts — Phone Normalization Utility

```typescript
// Always normalize before storing or comparing phone numbers
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '')
  if (digits.length === 11 && digits.startsWith('01')) return '+880' + digits
  if (digits.length === 13 && digits.startsWith('880')) return '+' + digits
  if (digits.length === 14) return '+' + digits
  return phone // fallback: return as-is
}

export function isValidBDPhone(phone: string): boolean {
  const normalized = normalizePhone(phone)
  return /^\+8801[3-9]\d{8}$/.test(normalized)
}
```

**CRITICAL: Call `normalizePhone()` on EVERY phone number before:**
- Storing in `orders.customer_phone`
- Looking up in `customer_blacklist`
- Displaying in order detail
- Passing to Steadfast API

---

## AUTH + ROUTING CLARIFICATION (Critical)

### How agency vs shop admin are distinguished on same subdomain

On `[agency-slug].fmanager.com`:
- `/` and `/settings/*`, `/shops/*`, `/orders`, `/billing` → Agency panel (requires agency owner auth)
- `/dashboard` and `/dashboard/*` → Shop panel (requires shop owner auth)

**Login page behavior (`[slug].fmanager.com/login`):**
```
Single login form for BOTH agency owners and shop owners.
After login, check auth.users app_metadata.role:
  - role === 'agency_owner' → redirect to /
  - role === 'shop_owner' → redirect to /dashboard
  - no role set (first login via invite) → redirect to onboarding
```

**Setting roles on user creation (via service_role):**
```typescript
// When creating agency owner:
await supabase.auth.admin.updateUserById(userId, {
  app_metadata: { role: 'agency_owner', agency_id: agencyId }
})

// When creating shop owner:
await supabase.auth.admin.updateUserById(userId, {
  app_metadata: { role: 'shop_owner', shop_id: shopId, agency_id: agencyId }
})

// Super admin (set manually once):
await supabase.auth.admin.updateUserById(userId, {
  app_metadata: { role: 'super_admin' }
})
```

**Auth guards on each layout:**
```typescript
// (agency)/layout.tsx
const role = session?.user.app_metadata?.role
if (role !== 'agency_owner') redirect('/login')
const agencyId = session?.user.app_metadata?.agency_id

// (shop)/layout.tsx
const role = session?.user.app_metadata?.role
if (role !== 'shop_owner') redirect('/login')
const shopId = session?.user.app_metadata?.shop_id

// (admin)/layout.tsx
const role = session?.user.app_metadata?.role
if (role !== 'super_admin') redirect('https://fmanager.com')
```

**This means `get_user_agency_id()` and `get_user_shop_id()` RLS helpers are
backup checks — the real filtering starts at the layout level from `app_metadata`.**

---

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'fmanager.com'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createClient(request, response)
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // 1. Super Admin panel
  if (hostname === `admin.${APP_DOMAIN}`) {
    url.pathname = `/admin${url.pathname}`
    return NextResponse.rewrite(url, response)
  }

  // 2. Main marketing site
  if (hostname === APP_DOMAIN || hostname === `www.${APP_DOMAIN}`) {
    return response
  }

  // 3. Agency subdomain (*.fmanager.com)
  let agencySlug: string | null = null
  if (hostname.endsWith(`.${APP_DOMAIN}`)) {
    agencySlug = hostname.replace(`.${APP_DOMAIN}`, '')
  }

  // 4. Custom domain lookup
  let agencyData: { id: string; name: string; logo_url: string | null; primary_color: string; is_active: boolean } | null = null

  if (agencySlug) {
    const { data } = await supabase
      .from('agencies')
      .select('id, name, logo_url, primary_color, is_active')
      .eq('slug', agencySlug)
      .single()
    agencyData = data
  } else {
    const { data } = await supabase
      .from('agencies')
      .select('id, name, logo_url, primary_color, is_active')
      .eq('custom_domain', hostname)
      .single()
    agencyData = data
  }

  if (!agencyData) {
    return NextResponse.redirect(new URL('/', `https://${APP_DOMAIN}`))
  }

  if (!agencyData.is_active) {
    url.pathname = '/suspended'
    return NextResponse.rewrite(url)
  }

  // 5. Inject agency context into headers
  const res = NextResponse.next()
  res.headers.set('x-agency-id', agencyData.id)
  res.headers.set('x-agency-name', agencyData.name)
  res.headers.set('x-agency-logo', agencyData.logo_url || '')
  res.headers.set('x-agency-color', agencyData.primary_color)
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

---

## ENVIRONMENT VARIABLES (.env.local.example)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_DOMAIN=fmanager.com
NEXT_PUBLIC_APP_URL=https://fmanager.com

# Steadfast
STEADFAST_API_URL=https://portal.steadfast.com.bd/public-api
# Each shop has their own keys stored in DB, not env

# RuxSpeed
RUXSPEED_WEBHOOK_SECRET=your-hmac-secret

# Super Admin
SUPER_ADMIN_EMAIL=admin@fmanager.com
```

---

## EMAIL SYSTEM (Resend + React Email)

### lib/email/resend.ts
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  react,
  from = 'F-Manager <noreply@fmanager.com>'
}: {
  to: string | string[]
  subject: string
  react: React.ReactElement
  from?: string
}) {
  try {
    const { data, error } = await resend.emails.send({ from, to, subject, react })
    if (error) console.error('Resend error:', error)
    return { data, error }
  } catch (err) {
    console.error('Email send failed:', err)
    return { data: null, error: err }
  }
}
```

### Email Trigger Map (where each email fires)

| Trigger | Template | Recipients |
|---|---|---|
| New agency created by super admin | `AgencyInvite.tsx` | Agency owner email |
| Agency first login (welcome) | `WelcomeAgency.tsx` | Agency owner |
| New shop created by agency | `ShopInvite.tsx` | Shop owner email |
| Order placed (payment pending) | `OrderConfirmation.tsx` | Customer (if email provided) |
| Payment verified by RuxSpeed | `PaymentVerified.tsx` | Customer (if email provided) + shop owner |
| New order arrives | `NewOrderAlert.tsx` | Shop owner |
| Monthly invoice generated | `InvoiceGenerated.tsx` | Agency owner |
| Order cancelled | `OrderCancelled.tsx` | Customer (if email provided) |

### Email Templates Spec

All templates use `@react-email/components`. Dark branded design consistent with F-Manager theme.

**OrderConfirmation.tsx**
```
Subject: "Order Confirmed — [order_number]"
Content:
- F-Manager logo header (or agency logo if white-label)
- "Thanks [customer_name], your order is confirmed!"
- Order summary table: product, variant, quantity, price
- Delivery address
- Payment instructions (if still pending): method + merchant number
- Order number + "Use this to track your order: fmanager.com/track/[order_number]"
- Footer: shop name + agency branding
```

**PaymentVerified.tsx**
```
Subject: "✅ Payment Verified — [order_number]"
Content:
- Big green checkmark
- "Payment received! Your order is being processed."
- Order summary
- Tracking info will be shared once shipped
- Track link
```

**NewOrderAlert.tsx**
```
Subject: "🛍 New Order: [order_number] — [amount] BDT"
Content:
- "You have a new order!"
- Customer name, phone, address
- Product + variant + quantity
- Payment method + TrxID (if submitted)
- CTA button: "View Order" → links to dashboard
```

**ShopInvite.tsx**
```
Subject: "You've been invited to [Agency Name]'s platform"
Content:
- Agency logo
- "[Agency Name] has created a store for you on their platform"
- Login details / set password link
- Getting started steps
- CTA: "Set Up Your Store"
```

**InvoiceGenerated.tsx**
```
Subject: "Invoice for [Month Year] — [amount] BDT due"
Content:
- Invoice number
- Active shop count × 100 BDT breakdown
- Due date (end of month)
- Payment instructions (bKash number)
- CTA: "View Invoice"
```

---

## RESEND ENV VARIABLES

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@fmanager.com
RESEND_FROM_NAME=F-Manager
```

---

## CUSTOMER BLACKLIST SYSTEM

### How it works
- Any shop owner or agency admin can blacklist a customer phone number
- Blacklist is **global and cross-agency** — one blacklisted number is flagged everywhere
- Super admin can view, manage, and remove entries
- On checkout: phone number is checked against blacklist before order is accepted

### Checkout Blacklist Check (in checkout Server Action)
```typescript
// Before inserting order:
const { data: isBlacklisted } = await supabase
  .rpc('is_customer_blacklisted', { p_phone: normalizedPhone })

if (isBlacklisted) {
  return { error: 'Unable to process order. Please contact the shop.' }
  // Do NOT reveal they are blacklisted — just show generic error
}
```

### /admin/blacklist — Super Admin Blacklist Page
```
Table: All blacklisted numbers
Columns: Phone | Reason | Notes | Added by (agency/shop) | Date | Actions
Actions per row: Remove from blacklist | View orders by this phone

Add to blacklist button: phone + reason + notes
Search by phone number
Export CSV
```

### Shop Admin — Add to Blacklist
```
In order detail modal:
- "Blacklist Customer" button (with reason dropdown)
- Reasons: Fake Order | Payment Fraud | Abusive | Other
- Notes field
- On submit: INSERT into customer_blacklist
- Show warning badge on any future orders from this phone
```

### Blacklist Warning in Order Table
```
If order.customer_phone matches any blacklist entry:
- Show red "⚠ BLACKLISTED" badge next to customer name
- Tooltip: "This number was blacklisted by [agency/shop] for: [reason]"
```

---

## NOTIFICATION BELL SYSTEM

### NotificationBell.tsx (shared component, all admin panels)
```typescript
// Placed in top-right of every admin panel header
// Shows unread count badge (red dot or number)
// On click: opens dropdown showing last 20 notifications

// Supabase Realtime subscription:
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // Add to notification list, increment badge count
    // Play subtle sound (optional, user can disable)
  })
  .subscribe()
```

### NotificationDropdown.tsx
```
Dropdown panel (300px wide, max-height 400px, scroll):
- Header: "Notifications" + "Mark all read" button
- Each item:
  - Icon (based on type: 🛍 order, ✅ payment, ⚠ system)
  - Title (bold if unread)
  - Message (truncated 60 chars)
  - Time ago (e.g., "2 minutes ago")
  - Unread = white background; read = var(--bg-secondary)
  - Click → navigate to link, mark as read
- Empty state: "No notifications yet"
- Footer: "View all" → /notifications page
```

### Notification Types
| Type | Icon | Fires when |
|---|---|---|
| `new_order` | 🛍 | Customer places order |
| `payment_verified` | ✅ | RuxSpeed verifies payment |
| `payment_failed` | ❌ | TrxID match fails after timeout |
| `low_stock` | ⚠️ | Any product variant drops below 5 |
| `shop_suspended` | 🔴 | Agency kills shop |
| `invoice_generated` | 📄 | Monthly invoice created |
| `new_shop` | 🏪 | Agency creates a new shop (notify super admin) |

---

## ONBOARDING FLOW

### Agency First-Run (/onboarding)
```
Triggered: When agency logs in and onboarding_progress.is_complete = false

Full-screen overlay OR dedicated /onboarding page (redirect on first login)

Step 1 — Welcome
- "Welcome to F-Manager! Let's set up your agency in 3 steps."
- Progress bar: 0/3

Step 2 — Branding
- Upload logo
- Set agency display name
- Pick primary color
- Preview of how their panel will look
- "Save & Continue"
- Marks step 'branding' complete

Step 3 — Create Your First Plan
- Plan name, price, features
- "Save & Continue"
- Marks step 'first_plan' complete

Step 4 — Add Your First Shop
- Shop name, owner email, assign plan
- "Create Shop & Finish"
- Marks step 'first_shop' complete + is_complete = true

Done screen:
- "🎉 You're all set!"
- "Your agency panel is ready at [slug].fmanager.com"
- "Go to Dashboard" button

Skip option: "I'll do this later" (sets dismissed = true)
```

### Shop Admin First-Run (/dashboard/onboarding)
```
Triggered: When shop owner logs in and onboarding not complete

Floating checklist widget (bottom-right corner, collapsible):
Shows progress: X/4 steps complete

Step 1 — Add Your First Product ○
→ "Add Product" button → /dashboard/products/new

Step 2 — Set Up Payment ○
→ "Setup bKash/Nagad" → /dashboard/payments

Step 3 — Customize Your Store ○
→ "Edit Store" → /dashboard/store

Step 4 — Share Your Store Link ○
→ Shows store URL with copy button
→ Share to Facebook button (opens FB share dialog)

Each step auto-checks when completed (server detects via DB state)
Checklist persists until all 4 done or dismissed
```

---

## CUSTOMER ORDER TRACKING PAGE

### /track/[orderNumber] (Public, no auth)
```
URL: fmanager.com/track/FM-ABC12345

Design: Clean, minimal, mobile-first. Shows agency/shop branding.

Sections:

1. Header
   - Shop logo + name
   - "Order Tracking"

2. Order Status Timeline (vertical stepper)
   Step 1: ✅ Order Placed — [date/time]
   Step 2: ✅ Payment Verified — [date/time] (or ⏳ Pending)
   Step 3: ○ Processing (or ✅ if done)
   Step 4: ○ Shipped — [tracking code if available]
   Step 5: ○ Delivered

   Active step highlighted. Future steps grayed out.

3. Order Summary Card
   - Product name + variant
   - Quantity × price
   - Delivery fee
   - Total

4. Delivery Info
   - Customer name (partial: "Rahim ***")
   - Address (partial: "Dhaka, ***")
   - Delivery zone

5. Steadfast Tracking (if consignment_id exists)
   - "Track with Steadfast →" link
   - Tracking code displayed

6. Contact Shop button (opens WhatsApp or phone)

Page refreshes data every 30 seconds (simple polling, no Realtime needed)
```

---

## SHOP ADMIN — EXTRA FEATURES

### Copy Store Link (StoreLinkCopy.tsx)
```
In shop dashboard header AND in /dashboard/store page:

Component:
- Text input (read-only): "https://[agency-slug].fmanager.com/store/[shop-slug]"
- Copy button (clipboard icon) → copies URL → shows "Copied!" toast
- Share to Facebook button → window.open('https://www.facebook.com/sharer/sharer.php?u=...')
- Share to WhatsApp button → opens wa.me link with message
- QR Code button → generates QR code of store URL (use `qrcode.react` library)
```

### Print Order Slip (/dashboard/orders/[id])
```
Print slip page (also accessible from order detail modal via "Print Slip" button):

Print-optimized layout (use @media print CSS):
┌─────────────────────────────────┐
│  [SHOP LOGO]   [SHOP NAME]      │
│  Order: ORD-XXXXXXXX            │
│  Date: DD/MM/YYYY               │
├─────────────────────────────────┤
│  CUSTOMER                       │
│  Name: [name]                   │
│  Phone: [phone]                 │
│  Address: [address]             │
│  Zone: Inside Dhaka             │
├─────────────────────────────────┤
│  PRODUCT                        │
│  [Product name]                 │
│  Variant: Size - L              │
│  Qty: 2 × 500 BDT = 1000 BDT   │
│  Delivery: 60 BDT               │
│  TOTAL: 1060 BDT                │
├─────────────────────────────────┤
│  Payment: bKash ✓ VERIFIED      │
│  TrxID: ABC123456               │
└─────────────────────────────────┘

Button: "Print Slip" → window.print()
Button: "Download PDF" → use browser print to PDF
```

### Bulk Steadfast Send (BulkSteadfastModal.tsx)
```
In /dashboard/orders page:

Checkbox column added to order table (only for verified, not-yet-sent orders)
"Select All" checkbox in header

When 1+ orders selected, floating action bar appears at bottom:
"X orders selected — [Send to Steadfast] [Cancel]"

On "Send to Steadfast":
- Opens confirmation modal listing selected orders
- Progress bar during batch send
- Sends one by one with 300ms delay (rate limit safety)
- Shows results: "X sent successfully, Y failed"
- Failed orders shown with error reason
- Success: updates all to delivery_status = 'processing'
```

---

## TECHNICAL STANDARDS ADDITIONS

### TypeScript Database Types
```bash
# Run after setting up Supabase project:
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
```
Then import in all files:
```typescript
import type { Database } from '@/types/database'
type Order = Database['public']['Tables']['orders']['Row']
type Shop = Database['public']['Tables']['shops']['Row']
// etc.
```
**NEVER use raw type annotations for DB data — always use generated types.**

### loading.tsx + error.tsx (Required for every route group)
Every route must have:
```typescript
// loading.tsx — skeleton UI matching the page layout
export default function Loading() {
  return <PageSkeleton /> // custom skeleton per page
}

// error.tsx
'use client'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <p className="text-destructive">Something went wrong.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

### Image Compression Before Upload
```typescript
// In all image upload handlers:
import imageCompression from 'browser-image-compression'

const compressedFile = await imageCompression(file, {
  maxSizeMB: 0.2,       // 200KB max
  maxWidthOrHeight: 800, // 800px max dimension
  useWebWorker: true,
})
// Then upload compressedFile to Supabase Storage
```

### /api/health Route
```typescript
// app/api/health/route.ts
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    await supabase.from('cms_content').select('id').limit(1)
    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch {
    return Response.json({ status: 'error', database: 'disconnected' }, { status: 503 })
  }
}
```

### Cart Decision: Single-Product Checkout
F-Manager uses **single-product checkout** by design — this is the norm for Bangladeshi f-commerce where each Facebook post promotes one product. The `order_items` table exists for future multi-product support but the MVP checkout is:
1 order = 1 product = 1 checkout form.
Do NOT build a cart/basket UI in MVP. Keep it Messenger-commerce native.

---

## UPDATED ENV VARIABLES

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_DOMAIN=fmanager.com
NEXT_PUBLIC_APP_URL=https://fmanager.com

# Resend (Email)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@fmanager.com
RESEND_FROM_NAME=F-Manager

# Steadfast
STEADFAST_API_URL=https://portal.steadfast.com.bd/public-api

# RuxSpeed
RUXSPEED_WEBHOOK_SECRET=your-hmac-secret

# Super Admin
SUPER_ADMIN_EMAIL=admin@fmanager.com
```

---

## PRIVACY & TERMS PAGES

### F-Manager SaaS — fmanager.com/privacy + fmanager.com/terms
```
Both pages share the same layout as the marketing site (navbar + footer).
Content is stored in cms_content table:
  Key: 'privacy_policy' → full HTML/markdown content
  Key: 'terms_of_service' → full HTML/markdown content

/privacy page:
- Title: "Privacy Policy"
- Last updated date
- Sections: Data Collected | How We Use It | Third Parties | Your Rights | Contact
- Default content: auto-seeded in cms_content with Bangladesh-appropriate boilerplate
- Super admin can edit via /admin/cms

/terms page:
- Title: "Terms of Service"
- Sections: Service Description | User Obligations | Billing | Termination | Liability
- Default content: seeded in cms_content
- Super admin can edit via /admin/cms

Add these keys to cms_content seed:
  ('privacy_policy', '...default privacy policy text...')
  ('terms_of_service', '...default terms text...')
  ('privacy_updated_at', '2025-01-01')
  ('terms_updated_at', '2025-01-01')
```

### Seller Store — /store/[shopSlug]/privacy + /store/[shopSlug]/terms
```
Each seller store has its own Privacy + Terms pages.
These are auto-generated from shop data OR use the seller's custom text.

/store/[shopSlug]/privacy:
- Shows agency logo + shop name in header
- Title: "[Shop Name] — Privacy Policy"
- Default auto-generated content using shop data:
  "This store is operated by [shop name]. Orders placed here are processed by
   [shop name] via the F-Manager platform..."
- If shop.custom_privacy_policy is set → show that instead
- Footer links back to store

/store/[shopSlug]/terms:
- Title: "[Shop Name] — Terms & Conditions"
- Default: "By placing an order you agree to provide accurate information..."
  Covers: order process, payment, delivery, returns, contact
- If shop.custom_terms is set → show that instead
- Footer links back to store

Both pages are public, no auth required.
Shop footer MUST link to: Privacy Policy | Terms | Track Order
```

### Add to cms_content seed in migration:
```sql
INSERT INTO cms_content (key, value) VALUES
  ('privacy_policy', 'F-Manager Privacy Policy\n\nLast updated: January 2025\n\nF-Manager ("we") collects information to provide our services...'),
  ('terms_of_service', 'F-Manager Terms of Service\n\nLast updated: January 2025\n\nBy using F-Manager you agree to these terms...'),
  ('privacy_updated_at', '2025-01-01'),
  ('terms_updated_at', '2025-01-01')
ON CONFLICT (key) DO NOTHING;
```

---

## STORE PAGE — FULL SPEC (Complete Shopify-Level)

### SEO Metadata (Critical for Facebook sharing)
```typescript
// In /store/[shopSlug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const shop = await getShopBySlug(params.shopSlug)
  return {
    title: shop.seo_title || shop.name,
    description: shop.seo_description || shop.description || `Shop at ${shop.name}`,
    openGraph: {
      title: shop.seo_title || shop.name,
      description: shop.seo_description || shop.description,
      images: shop.banner_url ? [{ url: shop.banner_url, width: 1200, height: 400 }] : [],
      type: 'website',
    },
  }
}

// In /store/[shopSlug]/[productSlug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProductBySlug(params.shopSlug, params.productSlug)
  return {
    title: product.seo_title || product.name,
    description: product.seo_description || product.description?.slice(0, 160),
    openGraph: {
      title: product.seo_title || product.name,
      description: product.seo_description || product.description?.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0], width: 800, height: 800 }] : [],
      type: 'product',
    },
  }
}
// This metadata makes product URLs show rich previews when shared on Facebook/WhatsApp
```

### Store Homepage: /store/[shopSlug]
```
Header:
- Agency logo (left, from middleware headers) + Shop name (center)
- Nav links: Home | Track Order (/track/[any]) | Privacy | Terms
- "My Orders" button → links to /track (with order number input)

Discount Banner (if active timer AND ends_at > now()):
- Full-width sticky banner at top
- Label text (e.g., "EID SALE") + "[X]% OFF" badge
- Live countdown: "Ends in: 02d 14h 33m 52s" — pure CSS/JS, no page reload
- Background: var(--brand-color) from agency

Product Grid:
- Responsive: 2 cols mobile, 3 cols tablet, 4 cols desktop
- Product card:
  - Image (aspect-square, object-cover, next/image, lazy loaded)
  - Discount badge (top-left corner) if timer active: "-20%"
  - "OUT OF STOCK" dark overlay if all stock = 0
  - Product name (truncated 2 lines)
  - Price section:
    - If timer active: crossed-out original + discounted price in brand color
    - If no timer: just price
  - "Order Now" button (brand color background)
- Sort: by sort_order column (seller can reorder in dashboard)

Empty state (0 products):
- Centered icon + "This store is coming soon!"
- Contact shop button (WhatsApp/phone)

Store Footer:
- Shop name + short description
- Links: Privacy Policy | Terms | Track Your Order
- Contact: phone + WhatsApp button
- "Powered by F-Manager" (subtle, small — respects white-label but keeps attribution)
  Agency can toggle this off in branding settings (add `show_powered_by boolean DEFAULT true` to agencies)
```

### Product + Checkout Page: /store/[shopSlug]/[productSlug]
```
MOBILE-FIRST LAYOUT. Full page scroll on phone.

Section 1 — Product Display:
- Image carousel (swipeable on mobile, thumbnails on desktop)
  - Use Embla Carousel (lightweight, touch-native)
  - Zoom on tap/click
- Product name (H1)
- Price display:
  - Timer active: ~~original_price BDT~~ → discounted_price BDT (-X%)
  - No timer: base_price BDT
- Short description (first 100 chars, expandable)
- Full description (Tiptap rendered HTML, collapsed behind "Read more")

Section 2 — Variant Selector:
- For each variant type (e.g., "Size"):
  - Label: "Size" (bold)
  - Pill buttons for each option value: S | M | L | XL
  - Selected: brand color background + white text
  - Out of stock: gray + line-through + disabled
  - Price modifier shown if not zero: "+50 BDT"
- Stock indicator:
  - stock > 10: nothing shown
  - 6-10: "✓ In Stock"
  - 1-5: "⚡ Only [X] left!"
  - 0: "✗ Out of Stock" (disable order button completely)
- Quantity selector (stepper: − 1 +), max = min(stock, 10)

Section 3 — Checkout Form (same page, below product):
Fields:
- Full Name * (text, max 100)
- Phone Number * (BD format: 01XXXXXXXXX) — validated with isValidBDPhone()
- Email (optional, for order confirmation)
- Full Delivery Address * (textarea)
- Delivery Zone * (radio buttons):
  "🏙 Inside Dhaka — [shop.delivery_fee_inside_dhaka] BDT"
  "🌍 Outside Dhaka — [shop.delivery_fee_outside_dhaka] BDT"
  Note: fees are per-shop, read from shops table, NOT hardcoded

Section 4 — Order Summary (sticky on desktop, above submit on mobile):
- Product + variant selected
- Quantity × unit price
- Discount amount (if timer active): -[discount] BDT
- Delivery fee: +[fee] BDT
- ━━━━━━━━━━
- Total: [total] BDT

Section 5 — Payment:
- Payment method (radio with logos):
  ◉ bKash  ◎ Nagad  ◎ Rocket
  Only show options where shop has merchant number set
- Dynamic payment instruction box (updates on method selection):
  ┌────────────────────────────────────┐
  │ Send [total] BDT to:               │
  │ bKash: [shop.bkash_merchant_number]│
  │ Send Money (not payment)           │
  │ Reference: [customer phone]        │
  └────────────────────────────────────┘
- Transaction ID input *
  - Placeholder: "e.g., 8N7GK3XBDQ"
  - Min 8 chars validation

Submit Button: "Place Order →" (brand color, full width, large)
- Disabled while submitting (shows spinner)
- Shows validation errors inline before submitting

On Submit (Server Action flow):
1. Validate ALL fields with Zod (server-side)
2. normalizePhone(customer_phone)
3. Check blacklist: rpc('is_customer_blacklisted', { p_phone: normalizedPhone })
4. Check stock (re-verify server-side, don't trust client)
5. Calculate final price (re-calculate server-side, don't trust client):
   - Get active discount timer for this product/shop
   - Apply discount to base_price
   - Add delivery fee from shop record
6. INSERT order with payment_amount_expected = total_price
7. deduct_variant_stock() RPC atomically
8. Send OrderConfirmation email to customer (if email provided)
9. Send NewOrderAlert email to shop owner
10. Return { order_id, order_number } to client
11. Client subscribes to Supabase Realtime on orders row
12. Show "Verifying payment..." animated state

Payment Verification UI:
- Full-screen overlay (not dismissable)
- Animated pulsing circle + "Verifying your payment..."
- Timer countdown: "Verification window: 09:58"
- On Realtime payment_status = 'verified':
  - Framer Motion: checkmark SVG path draw animation
  - Confetti burst (canvas-confetti library)
  - "🎉 Payment Verified! Your order is confirmed."
  - Show order number + "Track your order" link
  - Show estimated delivery: "Delivered within 2-5 business days"
- On timeout (10 min):
  - Show: "Verification pending. Your Order ID: [FM-XXXXXX]"
  - "Track your order at fmanager.com/track/[orderNumber]"
  - "Contact shop: [contact_phone]"
- On payment_status = 'failed':
  - Show error: "Payment verification failed. Please try again or contact the shop."
  - "Try Again" button (re-opens payment form with same order)

Empty state (product out of stock on page load):
- Show product info but grey out everything
- "This product is currently out of stock"
- "Notify me" (optional — can add phone/email for restock alert, future feature)
```

### Store-Level Settings in Shop Dashboard (/dashboard/store)
```
Full store customization page with LIVE PREVIEW (right panel, iframe or simulated).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAB 1: Store Appearance
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Store name (read-only, set at creation)
- Store description (textarea, shown on store homepage)
- Primary color picker (hex + visual swatch)
  → Applied to buttons, accents, countdown banners
- Banner section:
  - Toggle: Show banner (on/off)
  - Banner image upload (1200×400px, compressed)
  - Banner title text (optional overlay)
  - Banner subtitle text (optional)
- SEO settings:
  - Page title (for browser tab + og:title)
  - Meta description (160 chars max, for og:description)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAB 2: Discount Timers
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Active Timers section:
- List of all active discount_timers for this shop
- Each card: label | applies to | discount % | ends at | countdown | Edit | Deactivate

Add New Timer form:
- Timer label (text): e.g., "EID SALE 🌙", "FLASH OFFER ⚡"
- Applies to:
  - Radio: "All products in my store" (product_id = NULL)
  - Radio: "Specific product" → dropdown of shop's products
- Discount percentage (slider 5-90%, + manual input)
  → Live preview: shows "Original: 500 BDT → Discounted: 400 BDT"
- End date (date picker)
- End time (time picker, default 23:59)
- Timezone: Asia/Dhaka (fixed, no option needed)
- Active toggle (default ON)
- Save button

Validation rules:
- Only ONE active timer per product at a time (or one store-wide timer)
- If store-wide timer + product-specific timer both exist → product-specific takes precedence
- Cannot set end time in the past

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAB 3: Delivery & Payment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Delivery fees:
- Inside Dhaka delivery fee (BDT, default 60)
- Outside Dhaka delivery fee (BDT, default 120)

Payment methods (enable/disable each):
- bKash merchant number
- Nagad merchant number
- Rocket merchant number
(At least one must be enabled to accept orders)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAB 4: Contact & Legal
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Contact phone (shown on tracking page + store footer)
- WhatsApp number (for "Chat on WhatsApp" button)
- Custom Privacy Policy (textarea, optional — leave blank to use auto-generated)
- Custom Terms & Conditions (textarea, optional)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAB 5: Store Link & Sharing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
(Same as StoreLinkCopy component)
- Read-only URL display
- Copy, Facebook share, WhatsApp share, QR code
```

---

### Layout
- Dark sidebar with logo "F-Manager" + "Admin" badge
- Nav items: Dashboard, Agencies, Orders, Blacklist, Billing, CMS, Settings
- Notification bell in header (top-right)

### /admin — Dashboard (Stripe-Level Analytics)
```
LAYOUT: 3-column grid on desktop, stacked on mobile.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROW 1 — KPI METRIC CARDS (6 cards, animated counters via 21st.dev)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Total Agencies
   - Value: count of agencies
   - Sub: "+X new this month" (green delta badge)

2. Total Active Shops
   - Value: sum of active shops across ALL agencies
   - Sub: "X inactive" (muted)

3. Platform MRR (Monthly Recurring Revenue)
   - Value: active_shops × 100 BDT
   - Sub: "Expected this month"
   - Trend arrow: vs last month

4. Total Collected (Paid Invoices)
   - Value: sum of paid invoices this year
   - Sub: "X invoices paid"

5. Outstanding Amount
   - Value: sum of unpaid invoices
   - Sub: "X invoices unpaid" (red if > 0)

6. Total Orders (Platform-Wide)
   - Value: total orders count ever
   - Sub: "+X today"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROW 2 — REVENUE CHART (full width, Stripe-style)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Chart: Area chart using Recharts
- X-axis: last 12 months
- Y-axis: BDT collected (paid invoices per month)
- Two lines: "Expected Revenue" (dotted) vs "Collected Revenue" (solid)
- Time range toggle: 3M | 6M | 12M
- Hover tooltip: month name + amount + shop count that month
- Chart background: var(--bg-card), line color: white

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROW 3 — TWO COLUMNS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEFT (60%): Top Agencies Table
- Columns: Agency name | Active Shops | Monthly Bill | Status
- Sorted by active shop count desc
- Click row → go to /admin/agencies/[id]
- "View All" link to /admin/agencies

RIGHT (40%): Platform Activity Feed
- Real-time list of recent events:
  - "🏢 New agency registered: [name]"
  - "🏪 New shop created under [agency]"
  - "💰 Invoice paid: [agency] — [amount] BDT"
  - "🚨 Agency blocked: [name]"
- Each item: icon + message + time ago
- Max 20 items, scroll

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROW 4 — QUICK ACTIONS + DOOMSDAY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Quick Action buttons (top of page, below header):
- "+ Add Agency" → opens Add Agency modal directly from dashboard
- "View Unpaid Invoices" → links to /admin/billing?filter=unpaid
- "Edit Homepage" → links to /admin/cms

Doomsday Section (bottom of page, red border card):
- Title: "⚠ Emergency Controls"
- Description: "This will instantly suspend ALL agencies and shops platform-wide."
- Button: "EMERGENCY SUSPEND ALL" (red, full-width)
- On click: confirmation modal — must type "SUSPEND ALL" to confirm
- On confirm: UPDATE agencies SET is_active = false
- Toast: "All [X] agencies suspended. Platform offline."
```

### /admin/agencies — Agency Management
```
Header: "Agencies" + "Add Agency" button (opens modal)

Add Agency Modal:
- Agency name (text)
- Slug (auto-generated from name, editable)
- Owner name
- Owner email
- Plan limit (number, default 100)
- On submit: creates agency record + sends invite email via Supabase Auth

Data Table Columns:
- Agency Name + Subdomain tag
- Owner email  
- Active Shops / Plan Limit
- Monthly Bill (active shops × 100 BDT)
- Status (green "Active" / red "Blocked" badge)
- Actions: View | Toggle (Enable/Disable) | Delete

Toggle Logic:
- UPDATE agencies SET is_active = !current WHERE id = agency_id
- Cascades: when agency disabled, all shops under it become unreachable via middleware
- Show confirm modal before disable
```

### /admin/agencies/[id] — Agency Detail
```
- Agency info card (name, slug, domain, owner, created_at)
- Stats: total shops, active shops, pending invoice
- Revenue chart for this agency (last 6 months)
- Shop list table (with orders + revenue per shop)
- Invoice history for this agency
- Kill switch toggle at top of page
```

### /admin/orders — Platform-Wide Orders (new page)
```
All orders from all shops, all agencies in one table.
Columns: Order ID | Customer | Shop | Agency | Product | Amount | Payment | Delivery | Date
Filters: by agency, by shop, by payment status, by delivery status, date range
Search: by customer name, phone, order ID
Export to CSV button
```

### /admin/billing — Billing Center
```
Table: Invoice list across all agencies
Columns: Agency, Month/Year, Active Shops, Amount, Status, Actions

Filter: by month, by status (paid/unpaid)

Per row actions:
- "Mark as Paid" button → UPDATE invoices SET status='paid', paid_at=now()
- Download receipt (generate simple PDF or CSV)

Summary card at top:
- Total collected this month
- Total outstanding
```

### /admin/cms — Homepage + Legal Editor
```
Two sections:

SECTION 1 — Homepage Content:
- Hero Title (large text input)
- Hero Subtitle (textarea)
- Feature 1 / 2 / 3 Text
- CTA Button Text
- Contact Email
- Contact Phone
Save → UPSERT cms_content records
"Changes are live immediately on fmanager.com"

SECTION 2 — Legal Pages:
- Privacy Policy (full Tiptap rich text editor, CMS key: 'privacy_policy')
- Terms of Service (full Tiptap rich text editor, CMS key: 'terms_of_service')
- "Privacy last updated" date picker
- "Terms last updated" date picker
Save → UPSERT cms_content
"Live at fmanager.com/privacy and fmanager.com/terms"
```

---

## PANEL 2: AGENCY ADMIN — FULL SPEC

**Access:** `[slug].fmanager.com` or custom domain | Auth: Supabase email/pass

Middleware injects `x-agency-id` header. All queries filter by this agency_id.

### Layout
- Sidebar: Dashboard, Shops, Orders, Plans, Branding, Billing
- Header: Agency logo + name (from their own branding settings)
- Show suspension banner if agency is_active = false

### /orders — Cross-Shop Orders (Agency-wide)
```
All orders from ALL shops under this agency in one unified view.

Filter tabs: All | Pending Payment | Verified | Sent to Steadfast | Delivered

Table columns:
- Order ID | Customer name + phone | Shop name | Product + variant
- Amount (BDT) | Payment method | Payment status badge
- Delivery status badge | Created at

Search: by customer name, phone, order ID
Filter: by shop (dropdown), by payment status, date range
Export CSV button

Click any row → order detail modal
```

### / — Dashboard (Full Analytics)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROW 0 — PLATFORM FEE ALERT BANNER (top of page)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subtle amber alert box (only if unpaid invoice exists):
"⚠ Platform fee due: [X] shops × 100 BDT = [Y] BDT for [Month Year]"
Dismiss button. Links to /billing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROW 1 — QUICK ACTIONS (icon buttons, horizontal row)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- "+ Add New Shop" → opens Add Shop modal instantly
- "Create Plan" → links to /settings/plans
- "Branding Settings" → links to /settings/branding
- "View All Orders" → links to /orders (cross-shop orders page)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROW 2 — KPI METRIC CARDS (5 cards)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Total Shops
   - Value: count of all shops
   - Sub: "X active, Y inactive"

2. Monthly Revenue (Estimated)
   - Value: sum of all active shops' plan prices
   - Sub: "Across X active shops"
   - Delta: vs last month

3. Total Orders This Month
   - Value: count of orders from all shops this month
   - Sub: "+X today"

4. Verified Payments This Month
   - Value: count of orders with payment_status = 'verified' this month
   - Sub: "X pending verification"

5. Total Revenue Collected (All Time)
   - Value: sum of total_price of verified orders across all shops
   - Sub: "Since account creation"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROW 3 — REVENUE + ORDERS CHART
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Chart: Dual-axis bar + line chart (Recharts)
- Bars: Total orders per day (last 30 days)
- Line: Revenue per day (BDT, verified orders only)
- X-axis: dates
- Toggle: 7D | 30D | 3M
- Hover tooltip: date + orders + revenue

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROW 4 — TWO COLUMNS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEFT (55%): Top Performing Shops
- Columns: Shop name | Orders (30d) | Revenue (30d) | Plan | Status
- Sorted by revenue desc
- Click → /shops/[id]
- Kill switch toggle directly in this table

RIGHT (45%): Recent Orders Feed (cross-shop)
- Most recent 15 orders across ALL this agency's shops
- Each row: customer name | product | amount | shop name | payment status badge | time
- Click → opens order detail modal
- "View All Orders" link at bottom

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROW 5 — PAYMENT STATUS BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Donut/pie chart:
- Verified payments (green)
- Pending payments (yellow)
- Failed payments (red)
- Total in center: "X Total Orders"
Values shown as count + percentage
```

### /settings/branding
```
Form:
- Logo upload (drag & drop → Supabase Storage upload → saves logo_url)
- Agency display name
- Primary color picker:
  - Hex input field
  - Color swatch preview
  - (This color is used throughout their subdomain's UI)
- Subdomain display (read-only): "[slug].fmanager.com"
- Custom domain input:
  - Text input: "your-domain.com"
  - Save → stores in agencies.custom_domain
  - Show DNS instructions:
    "Add this CNAME to your DNS:
     Name: @ or www
     Value: cname.vercel-dns.com"
  - "Verify Domain" button → server checks DNS resolution

Live preview panel (right side):
- Shows how their branded panel looks with selected color/logo
```

### /settings/plans
```
Plan cards grid:
- Plan name badge
- Price in BDT
- Features list
- Active/Inactive toggle
- Edit / Delete actions

Add Plan button → modal:
- Plan name (text)
- Price (BDT, number)
- Features (tag input — press Enter to add each feature)
- Is active toggle

Edit/Delete plan with confirmation
```

### /shops
```
Stats bar: X total | Y active | Z inactive

Data table:
- Shop name + slug
- Owner email
- Assigned plan + price
- Status badge
- Orders count (last 30 days)
- Actions: View | Edit | Toggle (Kill Switch)

Add New Shop modal:
- Shop name
- Slug (auto from name, editable)
- Owner email (sends invite)
- Assign plan (dropdown of this agency's plans)
- On create: creates shop record + auth invite

Kill Switch per row:
- Toggle → UPDATE shops SET is_active = !current
- When disabled: customer store shows "Shop unavailable" page
- Confirm modal before disabling
```

---

## PANEL 3: SHOP ADMIN — FULL SPEC

**Access:** `[agency-slug].fmanager.com/dashboard` | Auth: Supabase email/pass

Middleware injects `x-agency-id`, server queries verify shop belongs to agency.

### Layout
- Sidebar: Overview, Orders, Products, Store Setup, Payments, Billing
- Show branded header with agency logo
- Notification bell top-right (Supabase Realtime, shows new orders + payment alerts)
- Onboarding checklist widget (floating, bottom-right) until all steps complete

### /dashboard — Overview (Full Analytics)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROW 0 — QUICK ACTIONS (top, always visible)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Primary buttons:
- "+ Add Product" → goes to /dashboard/products/new
- "View All Orders" → goes to /dashboard/orders
- "Customize Store" → goes to /dashboard/store
- "Setup Payment" → goes to /dashboard/payments

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROW 1 — KPI CARDS (6 cards, animated)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Today's Orders
   - Value: orders created today
   - Sub: "X verified, Y pending"
   - Delta badge: vs yesterday

2. Today's Revenue
   - Value: sum of verified orders today (BDT)
   - Sub: "Verified payments only"

3. This Month's Orders
   - Value: orders this calendar month
   - Delta: vs last month (% change, color coded)

4. This Month's Revenue
   - Value: sum of verified orders this month (BDT)
   - Delta: vs last month

5. Pending Payments
   - Value: count of orders with payment_status = 'pending'
   - Sub: "Awaiting verification"
   - Badge: red if > 0

6. Total Revenue (All Time)
   - Value: sum of ALL verified orders ever
   - Sub: "Since store opened"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROW 2 — REVENUE CHART (full width)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Area chart (Recharts, Stripe-style):
- X-axis: last 30 days (or 7D / 30D / 3M toggle)
- Y-axis: Revenue in BDT
- Shaded area under curve, white stroke
- Second line (dashed): Order count (right Y-axis)
- Hover: date + revenue + orders tooltip
- Empty state: "No orders yet — share your store link to start selling"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROW 3 — THREE COLUMNS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEFT (40%): Recent Orders
- Last 8 orders
- Each row: customer name | product+variant | amount | payment badge | delivery badge
- Click → full order detail modal (shows: customer info, product, variant, address, 
  payment method, TrxID, delivery status, Steadfast tracking code if sent)
- "View All →" link

CENTER (30%): Payment Breakdown
- Donut chart:
  - Verified (green)
  - Pending (amber)
  - Failed (red)
- Below chart: counts + BDT amounts for each

RIGHT (30%): Stock Alerts
- List of products/variants with stock < 5
- Each item: product name + variant + "X left" (red badge)
- "Restock" button → opens product edit
- Empty state: "✓ All products well-stocked"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROW 4 — ORDERS BY DELIVERY ZONE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Two stat cards side by side:
- Inside Dhaka: X orders | Y BDT revenue
- Outside Dhaka: X orders | Y BDT revenue

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROW 5 — TOP PRODUCTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Table: Products ranked by orders this month
- Product name + image thumbnail
- Orders count
- Revenue generated
- Stock remaining
- Edit button
Max 5 rows. "View All Products →" link.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROW 6 — BILLING STATUS (bottom)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Small card:
- Current plan: [plan name] — [price] BDT/month
- Status: Paid ✓ / Overdue ⚠
- "View Billing Details" link
```

### /dashboard/orders
```
Filter tabs: All | Pending Payment | Verified | Sent to Steadfast | Delivered | Cancelled

Table columns:
- Checkbox (for bulk actions)
- Order ID (FM-XXXXXX, short display)
- Customer name + phone (blacklist badge if flagged)
- Product + variant
- Total (BDT)
- Payment method + TrxID
- Payment status badge (color-coded)
- Delivery status badge
- Created at (relative: "2 hours ago")
- Actions

Actions per order:
- View details (modal — shows everything: customer info, address, product, variant,
  payment method, TrxID, payment_amount_expected, notes, Steadfast tracking code)
- "Send to Steadfast" button (only if payment_status = 'verified' AND delivery_status = 'pending')
- "Cancel Order" button (only if delivery_status = 'pending' or 'processing'):
  - Opens modal: reason text input (required)
  - On confirm: calls restore_variant_stock() RPC
  - Updates delivery_status = 'cancelled', cancellation_reason = reason
  - Sends OrderCancelled email to customer if email provided
- Update delivery status dropdown (manual override)
- Print Slip → opens /dashboard/orders/[id] print view
- Blacklist Customer (in order detail modal)

Steadfast API call (exact spec):
POST https://portal.steadfast.com.bd/public-api/create-order
Headers: Api-Key: [shop.steadfast_api_key], Secret-Key: [shop.steadfast_secret_key]
Content-Type: application/json
Body: {
  invoice: order.order_number,
  recipient_name: order.customer_name,
  recipient_phone: order.customer_phone,  // already normalized +8801XXXXXXXXX
  recipient_address: order.customer_address,
  cod_amount: order.total_price,
  note: "F-Manager | " + order.order_number
}
On success: save consignment_id + tracking_code to order, set delivery_status = 'processing'
On error: show exact Steadfast error message in toast

Bulk actions (when checkboxes selected):
- Floating bar at bottom: "X orders selected"
- "Send to Steadfast" → bulk send with progress modal
- "Export CSV" → downloads selected as CSV
- "Print All Slips" → opens print view for selected
```

### /dashboard/products
```
View toggle: Grid | List

Drag-to-reorder: products can be dragged to change sort_order (using @dnd-kit/sortable)
This order is reflected on the customer store product grid.

Product cards (grid):
- Product image (first image)
- Discount badge (if active timer: "-X%")
- Name + base price
- Variant count OR "No variants — Stock: X"
- Stock status badge: In Stock / Low Stock / Out of Stock
- Active / Inactive toggle
- Edit | Delete buttons

Add/Edit Product (/dashboard/products/new + /dashboard/products/[id]/edit):

Section 1 — Basic Info:
- Product name (required)
- Slug (auto-generated from name, lowercase, hyphens — editable, must be unique per shop)
- Is active toggle
- Sort order (number, optional — drag is preferred)

Section 2 — Images:
- Drag & drop upload, max 5 images
- Show file size warning if > 200KB (compressed automatically)
- Reorder by drag
- First image = main image shown in grid and OG image

Section 3 — Description:
- Tiptap rich text editor
- Toolbar: Bold | Italic | Bullet list | Ordered list | Link | Clear
- No color or font options (keep it clean)

Section 4 — Pricing:
- Base price (BDT, required, integer only)

Section 5 — Inventory Type:
- Radio: "Simple product (no variants)" | "Product with variants"

If "Simple product":
- Stock count input (integer, min 0)
- Saved to products.simple_stock

If "Product with variants":
- Variant builder (Shopify-like):
  - "+ Add Variant Type" button
  - Each type: name input (Size/Color/etc) + options list
  - Each option: value (S/M/L) + stock (integer) + price modifier (+/-BDT)
  - Drag-to-reorder options
  - Remove option / Remove type
  - Live combination preview table
- Note: simple_stock is ignored when variants exist

Section 6 — SEO (collapsible, optional):
- SEO title (defaults to product name)
- SEO / OG description (defaults to first 160 chars of description)
- Preview card showing how it looks when shared on Facebook

Save → server action → validates uniqueness of slug → upserts product
On success: redirect to /dashboard/products with success toast
On slug conflict: show inline error "This URL is already taken, try: [slug]-2"
```

### /dashboard/store — Store Customization
```
Full 5-tab store editor. Complete spec is in the STORE PAGE — FULL SPEC section above
(TAB 1: Appearance | TAB 2: Discount Timers | TAB 3: Delivery & Payment |
TAB 4: Contact & Legal | TAB 5: Store Link & Sharing)

Left panel: tabbed settings form
Right panel: live preview iframe of actual store, auto-refreshes on save
Mobile: preview collapses behind "Preview Store" toggle button
```

### /dashboard/payments
```
RuxSpeed Setup card:
- Status: "● Connected" (green) or "● Not Connected" (gray)
- Secret key (masked): ••••••••••  [Reveal] [Copy]
- Regenerate Key button (warning modal: "Old key stops working immediately")
- Enable/Disable RuxSpeed toggle

Setup guide (collapsible accordion, 5 steps):
  1. Download "RuxSpeed Agent" from Play Store → [Open Play Store]
  2. Open app → Enter your Secret Key → [Copy Key]
  3. Grant SMS reading permission
  4. Keep app running in background (disable battery optimization)
  5. Test: send small bKash transfer → "Connected" status appears here

Payment Verification Log:
- Last 50 webhook events for this shop
- Columns: Time | Method | Amount | TrxID | Matched Order | Result
- Results: ✅ Verified | ❌ Amount mismatch | ❌ TrxID not found | ❌ Duplicate
- Click row → opens matched order if exists
- Empty state: "No events yet. Set up RuxSpeed Agent to start."
```

---

## PANEL 4: CUSTOMER STORE — FULL SPEC

**Access:** `[agency-slug].fmanager.com/store/[shop-slug]`
**No auth required.**

> ⚠️ The complete customer store spec — homepage, product page, checkout form, payment verification, all edge cases, SEO metadata, and privacy/terms pages — is fully defined in the **STORE PAGE — FULL SPEC** section above. Build from that section, not this one.

### StoreLayout Component (components/store/StoreLayout.tsx)
```typescript
// This is the root layout for all store pages
// Reads agency context from Next.js headers() — injected by middleware
import { headers } from 'next/headers'

export default async function StoreLayout({ children }) {
  const headersList = headers()
  const agencyLogo = headersList.get('x-agency-logo') || ''
  const agencyColor = headersList.get('x-agency-color') || '#FFFFFF'
  const agencyName = headersList.get('x-agency-name') || ''

  return (
    <div style={{ '--brand-color': agencyColor } as React.CSSProperties}>
      {/* Header with agency logo + shop name */}
      {/* Discount banner (fetched server-side) */}
      {children}
      {/* Store footer with privacy/terms links */}
    </div>
  )
}
// ⚠️ CSS variable --brand-color is applied here and used everywhere in store components
// Do NOT hardcode any brand colors in store components — always use var(--brand-color)
```

### Suspended Shop Page
```
When shop.is_active = false:
- Show agency logo
- Title: "This store is temporarily unavailable"
- Subtext: "Please check back later or contact us."
- Contact button (if shop.contact_phone is set)
- No error details exposed
```

### RuxSpeed Webhook Handler: /api/ruxspeed-webhook/route.ts
```typescript
// POST handler
// 1. Read raw body as text (needed for HMAC)
// 2. Compute HMAC-SHA256 with RUXSPEED_WEBHOOK_SECRET over raw body
// 3. Compare with x-ruxspeed-signature header (timing-safe comparison)
// 4. If mismatch → return 401
// 5. Parse body: { shop_secret_key, sms_text, sms_from, received_at }
// 6. Find shop by payment_secret_key using service_role client
// 7. Parse SMS text to extract TrxID and AMOUNT using regex patterns:
//    - bKash: /Tk\s*([\d,]+\.?\d*).*TrxID\s*([A-Z0-9]+)/i
//    - Nagad: /Tk\s*([\d,]+\.?\d*).*Ref\s*([A-Z0-9]+)/i
//    - Rocket: /BDT\s*([\d,]+\.?\d*).*Ref\s*([A-Z0-9]+)/i
//    Remove commas from amount string before parsing
// 8. Find pending order:
//    WHERE shop_id = shop.id
//      AND payment_trx_id = extracted_trxid
//      AND payment_status = 'pending'
// 9. ⚠️ CRITICAL: Validate amount matches:
//    extracted_amount >= order.payment_amount_expected
//    (allow ±5 BDT tolerance for rounding)
//    If amount mismatch → UPDATE orders SET payment_status = 'failed'
//    and return 200 (don't 400, to avoid webhook retries)
// 10. If valid → UPDATE orders SET payment_status = 'verified'
// 11. Fire Resend email: PaymentVerified to customer + NewOrderAlert to shop owner
// 12. Return 200 { success: true }
// 13. Use service_role Supabase client (not anon) — webhooks are server-to-server
```

---

## LANDING PAGE — FULL SPEC

**URL:** `fmanager.com` | CMS-powered via `cms_content` table

### Design Direction
Premium editorial dark. NOT corporate SaaS generic.
- Black background (#0A0A0A)
- Sharp white type
- Thin 1px white borders on cards and sections
- 21st.dev MCP: use for hero text animation, stat counters, floating feature cards
- Framer Motion: scroll-triggered reveals for each section
- Font: Geist Display for headings, Geist for body

### Section 1: Navbar
```
- Logo: "F·Manager" (white, bold, tracking-tight)
- Links: Features | For Agencies | Pricing | Login
- CTA button: "Start Free" (white bg, black text, rounded-full)
- Sticky on scroll (background blur on scroll)
```

### Section 2: Hero
```
- Animated badge (21st.dev): "🇧🇩 Built for Bangladesh"
- H1 (large, animated word-by-word reveal):
  "[cms: hero_title]"
- Subtitle:
  "[cms: hero_subtitle]"
- Two CTA buttons:
  - "Start Selling Free" (white, filled, large)
  - "Become a Reseller →" (ghost, outlined)
- Below: Payment method logos (bKash, Nagad, Rocket, Steadfast) in a subtle row
- Background: subtle grid pattern or noise texture
- Optional: Floating dashboard mockup screenshot (perspective transform)
```

### Section 3: Social Proof Ticker
```
Horizontal scrolling marquee (CSS animation):
"Steadfast Integration  ·  bKash Verified  ·  Nagad Verified  ·  White-Label Ready  ·  Multi-Tenant  ·  Real-Time Orders  ·"
```

### Section 4: For Sellers
```
Label badge: "FOR SELLERS"
Heading: "আপনার Facebook Store, এখন Professional"
Subtext: "Orders, payments, courier — সব একই জায়গায়"

3 Feature cards (21st.dev animated cards):
1. 🛒 "Smart Order Management"
   "Messenger-এর লিংক থেকে অর্ডার আসে, আপনি শুধু Confirm করেন"

2. ✅ "Instant Payment Verification"  
   "bKash SMS match হওয়ার সাথে সাথে screen-এ ✅ — manually check করতে হয় না"

3. 📦 "1-Click Steadfast Booking"
   "Customer info auto-fill, একটা click-এ parcel booking done"
```

### Section 5: For Agencies
```
Label badge: "FOR AGENCIES"
Heading: "আপনার নামে SaaS বেচুন"
Subtext: "White-label করুন, নিজের দামে বেচুন, profit রাখুন"

3 Feature cards:
1. 🏷️ "100% White-Label"
   "আপনার logo, আপনার domain, আপনার brand — আমাদের কোনো নাম থাকবে না"

2. 💰 "নিজের Pricing, নিজের Profit"  
   "আপনি যা charge করবেন সবই আপনার। আমরা নিই শুধু 100 BDT/shop"

3. ⚡ "Central Control Panel"
   "100টা seller manage করুন একটা dashboard থেকে"
```

### Section 6: Shopify-Like Features Grid
```
Heading: "Everything You Need to Sell Online"

6-card grid:
- 🏪 "Custom Online Store" — Shopify-like store with your products
- 🎨 "Discount Timers" — Countdown timers for flash sales
- 📦 "Variant Management" — Size, color, stock per variant
- 📱 "Mobile Checkout" — Buyers order from phone seamlessly
- 🔒 "Secure Payments" — bKash/Nagad verification built-in
- 📊 "Order Tracking" — Track every order to delivery
```

### Section 7: How It Works (3 steps)
```
Step 1: "Agency Signs Up"
→ Gets their own subdomain or custom domain instantly

Step 2: "Onboards Sellers"
→ Sellers get their own store, manage products & orders

Step 3: "Buyers Purchase"
→ Pay via bKash/Nagad, verified automatically in seconds
```

### Section 8: Pricing
```
Two cards side by side:

FOR AGENCIES (black card, white border):
- "100 BDT / shop / month"
- Features list: Unlimited plans, White-label, Agency panel, Kill switch controls
- CTA: "Register as Agency"

FOR SELLERS:
- "Set by your Agency"
- Features list: Full order management, Payment verification, Steadfast courier, Product store
- CTA: "Contact an Agency"
```

### Section 9: Footer
```
- Logo + tagline: "Bangladesh's f-commerce OS"
- Links: Features | For Agencies | Pricing | Privacy | Terms | Contact
- Contact email + phone (from CMS)
- "Built with ❤️ by Team Sifr"
- Copyright © {new Date().getFullYear()} F-Manager — dynamic year, never hardcoded
```

---

## ERROR HANDLING STANDARDS

```typescript
// Pattern for all server actions:
type ActionResult<T> = {
  data: T | null
  error: string | null
}

// Pattern for all API routes:
// Return: { success: boolean, data?: any, error?: string }

// Supabase error mapping:
const supabaseErrorMap: Record<string, string> = {
  '23505': 'This record already exists.',
  '23503': 'Referenced record not found.',
  'PGRST116': 'Record not found.',
  '42501': 'You do not have permission for this action.',
}

// All forms: React Hook Form + Zod inline validation
// All async buttons: disabled + loading spinner during request  
// All tables: skeleton loader rows while loading
// All lists: empty state component with icon + message + action button
// 404 pages: custom branded 404 for each panel
// Suspended shop page: clean "This store is temporarily unavailable" page
```

---

## PERFORMANCE STANDARDS

- React Server Components (RSC) for all data-fetching pages — no client-side DB fetching
- `Suspense` + `loading.tsx` skeletons on every route — match the page layout shape
- `next/image` for ALL images — Supabase Storage domain in `next.config.js` remotePatterns
- `next/font` — Geist loaded once in root layout only
- Dynamic imports (`next/dynamic`) for: Tiptap editor, Recharts, QR code generator, canvas-confetti
- Store pages: `export const revalidate = 60` — ISR, revalidate every 60 seconds
- Admin pages: `export const dynamic = 'force-dynamic'` — always fresh data
- Supabase Realtime: subscribe ONLY on checkout verification page — unsubscribe on unmount
- No `useEffect` for data fetching — RSC or Server Actions only
- Always `SELECT` only needed columns — never `SELECT *` on any table
- Always `.limit(50)` on list queries — never unbounded
- Recharts wrapped in `<Suspense>` — never block page render for charts
- `next/link` prefetching is on by default — never disable

---

## SECURITY STANDARDS

- All mutations via Next.js Server Actions — no client-side direct DB writes
- Server Actions: validate session + check `app_metadata.role` before every mutation
- Zod validation on ALL inputs: client (UX feedback) AND server (actual enforcement)
- `normalizePhone()` on every phone number before DB write or comparison
- RuxSpeed webhook: raw body HMAC-SHA256 with `crypto.timingSafeEqual` (timing-attack safe)
- RuxSpeed: validate extracted SMS amount matches `payment_amount_expected` ±5 BDT
- Steadfast API keys: stored per-shop in DB — never in env vars
- `SUPABASE_SERVICE_ROLE_KEY`: server-only — never in `NEXT_PUBLIC_*` or client bundles
- Rate limiting: `@upstash/ratelimit` + Upstash Redis — 3 checkout attempts per IP per 5 min
- HTML sanitization: `DOMPurify` on all HTML rendered from DB (product descriptions, CMS)
- Slug sanitization: `/[^a-z0-9-]/g` — only lowercase alphanumeric and hyphens
- Image upload: validate MIME type server-side (`file.type.startsWith('image/')`) — reject others
- Webhook routes: return 405 for non-POST requests
- Super admin role: ONLY settable via service_role API — never via client auth calls
- Error messages to users: always generic — never expose DB errors, stack traces, or UUIDs
- Order numbers (FM-XXXXXX): shown to customers — internal UUIDs never exposed in URLs

---

## BUILD ORDER (Session Sequence for Claude Opus)

### SESSION 1 — Foundation
- All 4 SQL migrations (schema + RLS + functions + triggers)
- `next.config.js`, `lib/phone.ts`, three-file Supabase client
- `types/database.ts` generation + `lib/validations.ts` + `lib/utils.ts`
- `middleware.ts` (edge routing)
- `package.json` scripts, `.env.local.example`, `README.md`

### SESSION 2 — Email System
- `resend`, `@react-email/components` installed
- `lib/email/resend.ts`
- All 8 email templates (OrderConfirmation, PaymentVerified, NewOrderAlert, ShopInvite, AgencyInvite, InvoiceGenerated, OrderCancelled, WelcomeAgency)

### SESSION 3 — Layouts + Auth + Onboarding
- Auth pages for all 3 panel types (single login form, role-based redirect)
- Sidebar layouts for each panel group
- `NotificationBell.tsx` + `NotificationDropdown.tsx` (Realtime)
- Role detection from `app_metadata` + auth guards
- Agency onboarding wizard (3-step)
- Shop onboarding checklist widget (floating, 4-step)

### SESSION 4 — Landing Page + Legal Pages
- Full marketing landing page (all 9 sections, CMS-powered, 21st.dev animated)
- `fmanager.com/privacy` + `fmanager.com/terms` (CMS-powered, editable via admin)
- `robots.txt`, `sitemap.xml`

### SESSION 5 — Super Admin Panel
- Dashboard (Stripe analytics, 12-month chart, activity feed)
- Agency management + kill switch + doomsday button
- Platform-wide orders page
- Blacklist management
- Billing center
- CMS + legal editor

### SESSION 6 — Agency Panel
- Dashboard (full analytics, dual-axis chart, cross-shop feed)
- Cross-shop orders page (with export CSV)
- White-label branding + custom domain + domain verify
- Plan creator (CRUD)
- Shop management + kill switch

### SESSION 7 — Shop Admin Panel
- Dashboard (Stripe-level analytics, 6 KPI cards, charts)
- Orders: full table + detail modal + cancel + print slip + bulk Steadfast
- Products: grid + add/edit with variant builder, SEO section, image compression
- Store customization: 5-tab editor (appearance, timers, delivery, legal, sharing)
- Payments: RuxSpeed setup + verification log
- Billing status page

### SESSION 8 — Customer Store + Tracking
- Store homepage (product grid, discount banner, countdown)
- Product + checkout page (variant selector, delivery fee from DB, payment instructions)
- Blacklist check at checkout
- Realtime payment verification + success animation (canvas-confetti)
- RuxSpeed webhook handler (with amount validation + payment_webhook_log)
- Customer order tracking page (`/track/[orderNumber]`)
- Store Privacy + Terms pages (`/store/[slug]/privacy`, `/store/[slug]/terms`)
- `generateMetadata` on all store + product pages (og:title, og:image, og:description)

### SESSION 9 — Polish + Production
- `loading.tsx` skeleton screens for every route
- `error.tsx` boundaries for every route group
- `not-found.tsx` for app root + each panel
- Empty states on all tables and lists
- `/api/health` endpoint
- `suspended/page.tsx`
- Mobile responsiveness final pass (test at 375px, 414px, 768px, 1280px)
- Rate limiting on checkout (`@upstash/ratelimit`)
- HTML sanitization on product descriptions (DOMPurify)
- Full security audit: RLS policies, env vars, webhook signatures
- Vercel deployment guide in README

---

## README.md TEMPLATE

```markdown
# F-Manager

> Bangladesh's white-label, multi-tenant f-commerce SaaS platform.
> Shopify-like stores + bKash/Nagad payments + Steadfast courier + Agency white-labeling.

## Architecture

Super Admin (Team Sifr)
    └── Agency (White-label reseller)
            └── Shop Admin (F-commerce seller)
                    └── Customer (Buyer)

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL + Auth + RLS + Realtime + Storage)
- **Deployment**: Vercel
- **UI**: Tailwind CSS + shadcn/ui + 21st.dev + Framer Motion

## How Subdomain Routing Works
Every request hits Vercel edge middleware.
- `admin.fmanager.com` → Super Admin panel
- `agency-name.fmanager.com` → Agency panel + their stores
- `custom-domain.com` → Looked up via `agencies.custom_domain` field
- Agency theme (logo, color) is injected into headers and applied globally

## Environment Variables
See `.env.local.example`

## Database Setup
1. Create Supabase project
2. Run migrations in order: 001 → 002 → 003
3. Enable pg_cron extension in Supabase dashboard

## Subdomain Local Testing
Add to `/etc/hosts`:
127.0.0.1 admin.fmanager.localhost
127.0.0.1 test-agency.fmanager.localhost
Use `localhost:3000` → set NEXT_PUBLIC_APP_DOMAIN=fmanager.localhost

## Deployment (Vercel)
1. Add domain `fmanager.com` to Vercel project
2. Add wildcard domain `*.fmanager.com`
3. Set all environment variables
4. Deploy

## Payment Verification Flow
RuxSpeed Android app reads incoming SMS → sends to /api/ruxspeed-webhook →
HMAC verified → TrxID matched to pending order → Supabase Realtime notifies
checkout page → success animation shown to customer.

## Billing Logic
pg_cron runs on 1st of each month → counts active shops per agency →
generates invoice records → super admin sees unpaid invoices → manually
confirms payment → marks invoice as paid.
```

---

## FINAL NOTES FOR CLAUDE OPUS

### Critical Implementation Rules
- `use server` on ALL server actions — `use client` ONLY for hooks/interactivity
- Every component: proper TypeScript types from `types/database.ts` — zero `any`
- Every Supabase query: use the correct client (browser/server/middleware — never mix)
- JSONB variants structure is load-bearing — get it right in Session 1, test with real data
- `normalizePhone()` on every phone — missed normalization = blacklist bypass
- `app_metadata.role` for auth — NOT `user_metadata` (users can write their own user_metadata)
- `payment_amount_expected` stored at order creation — compare in webhook, not recalculated

### 21st.dev MCP Usage
- Landing page: hero animation, animated stat counters, feature cards, ticker
- All admin dashboards: KPI metric cards with number animations
- Onboarding wizard: step indicators, progress bars
- Any section that needs visual richness — call 21st.dev before writing raw HTML

### Store Quality Bar (Shopify-level)
The customer-facing store is the product sellers show to their buyers. It must be:
- Pixel-perfect on iPhone SE (375px) and above
- All images lazy-loaded, never layout-shift
- Countdown timer in real-time (no page reload)
- Checkout form: no page reload on submit, inline errors, smooth transitions
- Payment success: animated, satisfying, shareable
- SEO metadata complete on every page (for Facebook share previews)
- Privacy + Terms pages present — buyers need them for trust

### Schema Reminders
- `orders.unit_price` = DISCOUNTED final price (what customer pays)
- `orders.original_unit_price` = pre-discount price (for display/analytics)
- `orders.payment_amount_expected` = total_price (for RuxSpeed validation)
- `products.simple_stock` = stock for no-variant products
- `products.variants = []` means simple product → use simple_stock
- `discount_timers`: product-specific beats store-wide when both exist
- All phone numbers in DB: normalized to `+8801XXXXXXXXX` format

### README Reminders
- Update migration count if adding migrations (currently 001-004)
- Document all env vars with description and example
- Include local subdomain testing instructions (hosts file)
- Include Vercel deployment checklist (wildcard domain, env vars)

### What Opus Should NOT Do
- Do NOT use `user_metadata` for role checks — use `app_metadata`
- Do NOT use `SELECT *` on any table
- Do NOT hardcode delivery fees (60/120 BDT) — read from `shops` table
- Do NOT hardcode year in copyright — use `new Date().getFullYear()`
- Do NOT expose internal UUIDs in customer-facing URLs — use `order_number`
- Do NOT skip Zod validation on server actions — even if client already validates
- Do NOT use `useEffect` for data fetching — RSC or Server Actions only
- Do NOT add `NEXT_PUBLIC_` prefix to service role key or secret keys