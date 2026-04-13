-- =============================================
-- F-Manager Triggers + Cron Jobs
-- Migration: 004_triggers.sql
-- =============================================

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
-- CRON JOB: Monthly invoice generation
-- Runs at 9am on 1st of every month (Bangladesh time)
-- Requires pg_cron extension enabled in Supabase dashboard
-- =====================
SELECT cron.schedule(
  'monthly-invoice-generation',
  '0 9 1 * *',
  'SELECT generate_monthly_invoices()'
);
