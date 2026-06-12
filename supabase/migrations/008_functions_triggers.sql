-- ============================================================
-- Migration 008: Functions and Triggers
-- ============================================================

-- ============================================================
-- 1. update_updated_at_column() — already defined in 002 but
--    redefined here for completeness and idempotency
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- 2. get_current_profile() — returns the calling user's profile
-- ============================================================

CREATE OR REPLACE FUNCTION get_current_profile()
RETURNS TABLE (
  id          uuid,
  email       text,
  full_name   text,
  role        user_role,
  merchant_id uuid,
  status      text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.merchant_id,
    p.status
  FROM profiles p
  WHERE p.id = auth.uid();
$$;

-- ============================================================
-- 3. is_admin() — returns true if current user is admin
-- ============================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  );
$$;

-- ============================================================
-- 4. get_my_merchant_id() — returns merchant_id for current user
-- ============================================================

CREATE OR REPLACE FUNCTION get_my_merchant_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT merchant_id FROM profiles WHERE profiles.id = auth.uid();
$$;

-- ============================================================
-- 5. get_public_merchant_by_slug(p_slug text)
--    Safe public function — does NOT expose sensitive columns
-- ============================================================

CREATE OR REPLACE FUNCTION get_public_merchant_by_slug(p_slug text)
RETURNS TABLE (
  name                  text,
  logo_url              text,
  card_background_color text,
  card_text_color       text,
  accent_color          text,
  welcome_message       text,
  slug                  text,
  apple_wallet_enabled  boolean,
  google_wallet_enabled boolean,
  public_page_enabled   boolean
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    m.name,
    m.logo_url,
    m.card_background_color,
    m.card_text_color,
    m.accent_color,
    m.welcome_message,
    m.slug,
    ms.apple_wallet_enabled,
    ms.google_wallet_enabled,
    ms.public_page_enabled
  FROM merchants m
  JOIN merchant_settings ms ON ms.merchant_id = m.id
  WHERE m.slug = p_slug
    AND m.status = 'active';
$$;

-- ============================================================
-- 6. generate_unique_qr_token() — generates a URL-safe unique token
-- ============================================================

CREATE OR REPLACE FUNCTION generate_unique_qr_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token text;
  v_exists boolean;
BEGIN
  LOOP
    -- Generate a URL-safe base64 token from 12 random bytes (~16 chars)
    v_token := replace(replace(
      encode(gen_random_bytes(12), 'base64'),
      '+', '-'), '/', '_');
    -- Strip any trailing '=' padding
    v_token := rtrim(v_token, '=');

    SELECT EXISTS (
      SELECT 1 FROM customers WHERE qr_code_token = v_token
    ) INTO v_exists;

    EXIT WHEN NOT v_exists;
  END LOOP;

  RETURN v_token;
END;
$$;

-- ============================================================
-- 7. add_customer_points(...) — atomic point addition
-- ============================================================

CREATE OR REPLACE FUNCTION add_customer_points(
  p_customer_id      uuid,
  p_merchant_id      uuid,
  p_amount_paid      numeric,
  p_points_to_add    integer,
  p_transaction_type points_transaction_type DEFAULT 'earn',
  p_description      text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_customer     customers%ROWTYPE;
  v_new_balance  integer;
  v_tx_id        uuid;
BEGIN
  -- Verify customer belongs to merchant
  SELECT * INTO v_customer
  FROM customers
  WHERE id = p_customer_id
    AND merchant_id = p_merchant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer % not found for merchant %', p_customer_id, p_merchant_id;
  END IF;

  -- Calculate new balance
  v_new_balance := v_customer.points_balance + p_points_to_add;

  -- Update customer
  UPDATE customers
  SET
    points_balance = v_new_balance,
    visits_count   = visits_count + 1,
    last_visit_at  = now(),
    updated_at     = now()
  WHERE id = p_customer_id;

  -- Insert transaction record
  INSERT INTO points_transactions (
    merchant_id,
    customer_id,
    type,
    amount_paid,
    points_added,
    points_removed,
    balance_after,
    description,
    created_by
  ) VALUES (
    p_merchant_id,
    p_customer_id,
    p_transaction_type,
    p_amount_paid,
    CASE WHEN p_points_to_add > 0 THEN p_points_to_add ELSE 0 END,
    0,
    v_new_balance,
    COALESCE(p_description, 'Points ajoutés'),
    auth.uid()
  )
  RETURNING id INTO v_tx_id;

  -- Return summary
  RETURN jsonb_build_object(
    'success',       true,
    'customer_id',   p_customer_id,
    'points_added',  p_points_to_add,
    'new_balance',   v_new_balance,
    'transaction_id', v_tx_id
  );
END;
$$;

-- ============================================================
-- 8. redeem_customer_offer(...) — atomic offer redemption
-- ============================================================

CREATE OR REPLACE FUNCTION redeem_customer_offer(
  p_customer_id uuid,
  p_offer_id    uuid,
  p_merchant_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offer        offers%ROWTYPE;
  v_customer     customers%ROWTYPE;
  v_new_balance  integer;
  v_redemption_id uuid;
  v_tx_id        uuid;
BEGIN
  -- Fetch and validate offer
  SELECT * INTO v_offer
  FROM offers
  WHERE id = p_offer_id
    AND merchant_id = p_merchant_id
    AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offer % not found or not active for merchant %', p_offer_id, p_merchant_id;
  END IF;

  -- Fetch and validate customer
  SELECT * INTO v_customer
  FROM customers
  WHERE id = p_customer_id
    AND merchant_id = p_merchant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer % not found for merchant %', p_customer_id, p_merchant_id;
  END IF;

  -- Check customer has enough points
  IF v_customer.points_balance < v_offer.points_required THEN
    RAISE EXCEPTION 'Insufficient points: customer has %, offer requires %',
      v_customer.points_balance, v_offer.points_required;
  END IF;

  -- Deduct points from customer
  v_new_balance := v_customer.points_balance - v_offer.points_required;

  UPDATE customers
  SET
    points_balance = v_new_balance,
    updated_at     = now()
  WHERE id = p_customer_id;

  -- Insert offer redemption record
  INSERT INTO offer_redemptions (
    merchant_id,
    offer_id,
    customer_id,
    points_spent,
    redeemed_by
  ) VALUES (
    p_merchant_id,
    p_offer_id,
    p_customer_id,
    v_offer.points_required,
    auth.uid()
  )
  RETURNING id INTO v_redemption_id;

  -- Insert points transaction (type = redeem)
  INSERT INTO points_transactions (
    merchant_id,
    customer_id,
    type,
    amount_paid,
    points_added,
    points_removed,
    balance_after,
    description,
    created_by
  ) VALUES (
    p_merchant_id,
    p_customer_id,
    'redeem',
    NULL,
    0,
    v_offer.points_required,
    v_new_balance,
    'Récompense: ' || v_offer.label,
    auth.uid()
  )
  RETURNING id INTO v_tx_id;

  -- Increment times_redeemed on offer
  UPDATE offers
  SET
    times_redeemed = times_redeemed + 1,
    updated_at     = now()
  WHERE id = p_offer_id;

  -- Return summary
  RETURN jsonb_build_object(
    'success',         true,
    'customer_id',     p_customer_id,
    'offer_id',        p_offer_id,
    'offer_label',     v_offer.label,
    'points_spent',    v_offer.points_required,
    'new_balance',     v_new_balance,
    'redemption_id',   v_redemption_id,
    'transaction_id',  v_tx_id
  );
END;
$$;

-- ============================================================
-- UPDATED_AT TRIGGERS (idempotent — OR REPLACE handles re-runs)
-- Tables that already have triggers from earlier migrations
-- are re-declared safely with CREATE OR REPLACE TRIGGER.
-- ============================================================

CREATE OR REPLACE TRIGGER trg_merchants_updated_at
  BEFORE UPDATE ON merchants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_merchant_settings_updated_at
  BEFORE UPDATE ON merchant_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_card_designs_updated_at
  BEFORE UPDATE ON card_designs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_passkit_configs_updated_at
  BEFORE UPDATE ON passkit_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TRIGGER: auto-generate qr_code_token before customer insert
-- ============================================================

CREATE OR REPLACE FUNCTION before_customer_insert_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.qr_code_token IS NULL OR NEW.qr_code_token = '' THEN
    NEW.qr_code_token := generate_unique_qr_token();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER before_customer_insert
  BEFORE INSERT ON customers
  FOR EACH ROW EXECUTE FUNCTION before_customer_insert_fn();
