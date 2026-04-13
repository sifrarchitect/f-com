-- =============================================
-- F-Manager RPC Functions
-- Migration: 003_functions.sql
-- =============================================

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
-- GENERATE MONTHLY INVOICES (called by cron)
-- =====================
CREATE OR REPLACE FUNCTION generate_monthly_invoices()
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
