-- ============================================================
-- Migration 012: SECURITY DEFINER function for merchant signup
-- Bypasses RLS so signup works regardless of whether email
-- confirmation is enabled on the remote Supabase project.
-- ============================================================

CREATE OR REPLACE FUNCTION signup_merchant(
  p_user_id       uuid,
  p_email         text,
  p_business_name text,
  p_owner_name    text,
  p_phone         text,
  p_business_type text,
  p_bg_color      text,
  p_text_color    text,
  p_accent_color  text,
  p_welcome_msg   text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_merchant_id uuid;
  v_slug        text;
BEGIN
  -- Verify the user actually exists in auth.users (prevents spoofing)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Invalid user';
  END IF;

  -- Prevent duplicate registration
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User already registered';
  END IF;

  v_slug := lower(regexp_replace(p_business_name, '[^a-zA-Z0-9]+', '-', 'g'))
            || '-' || to_hex(extract(epoch FROM now())::bigint);

  INSERT INTO public.merchants (
    name, owner_name, email, phone, business_type, slug,
    card_background_color, card_text_color, accent_color, welcome_message,
    status, points_mode, points_per_euro
  ) VALUES (
    p_business_name, p_owner_name, p_email, p_phone, p_business_type, v_slug,
    p_bg_color, p_text_color, p_accent_color, p_welcome_msg,
    'active', 'amount_based', 1
  ) RETURNING id INTO v_merchant_id;

  INSERT INTO public.profiles (id, email, full_name, role, merchant_id, status)
  VALUES (p_user_id, p_email, p_owner_name, 'merchant', v_merchant_id, 'active');

  INSERT INTO public.merchant_settings (
    merchant_id, public_page_enabled, phone_required, email_required,
    apple_wallet_enabled, google_wallet_enabled
  ) VALUES (v_merchant_id, true, true, false, true, true);

  INSERT INTO public.card_designs (
    merchant_id, background_color, text_color, accent_color,
    merchant_name_on_card, card_title, points_label, qr_label, sync_status
  ) VALUES (
    v_merchant_id, p_bg_color, p_text_color, p_accent_color,
    p_business_name, 'Carte de fidélité', 'Points',
    'Scanner pour gagner des points', 'not_synced'
  );

  INSERT INTO public.subscriptions (merchant_id, plan_name, monthly_price, status, starts_at)
  VALUES (v_merchant_id, 'Free', 0, 'free', now());

  RETURN json_build_object('merchant_id', v_merchant_id);
END;
$$;

-- Grant anon so the call works even before email confirmation
-- (anon is the role used when there is no active session)
GRANT EXECUTE ON FUNCTION signup_merchant TO anon, authenticated;
