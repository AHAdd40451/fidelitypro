-- ============================================================
-- Migration 007: Enable RLS and create all table-level policies
-- Depends on: get_my_merchant_id() defined in 008 — but since
-- migrations run in order we define a placeholder here and
-- redefine in 008. Actually we define helper functions here
-- so policies work immediately.
-- ============================================================

-- Helper: is_admin() — checks if current user has admin role
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

-- Helper: get_my_merchant_id() — returns merchant_id for current user
CREATE OR REPLACE FUNCTION get_my_merchant_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT merchant_id FROM profiles WHERE profiles.id = auth.uid();
$$;

-- ============================================================
-- Enable RLS on all tables
-- ============================================================

ALTER TABLE profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants               ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_settings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_designs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers               ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_cards            ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_redemptions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications           ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE passkit_configs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE passkit_operations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_page_views       ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

CREATE POLICY "profiles: users read own"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles: admin read all"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "profiles: admin update all"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "profiles: users update own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================
-- MERCHANTS POLICIES
-- ============================================================

CREATE POLICY "merchants: admin all"
  ON merchants FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "merchants: merchant read own"
  ON merchants FOR SELECT
  TO authenticated
  USING (id = get_my_merchant_id());

CREATE POLICY "merchants: merchant update own limited"
  ON merchants FOR UPDATE
  TO authenticated
  USING (id = get_my_merchant_id())
  WITH CHECK (id = get_my_merchant_id());

-- ============================================================
-- MERCHANT_SETTINGS POLICIES
-- ============================================================

CREATE POLICY "merchant_settings: admin all"
  ON merchant_settings FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "merchant_settings: merchant read own"
  ON merchant_settings FOR SELECT
  TO authenticated
  USING (merchant_id = get_my_merchant_id());

CREATE POLICY "merchant_settings: merchant update own"
  ON merchant_settings FOR UPDATE
  TO authenticated
  USING (merchant_id = get_my_merchant_id())
  WITH CHECK (merchant_id = get_my_merchant_id());

-- ============================================================
-- CARD_DESIGNS POLICIES
-- ============================================================

CREATE POLICY "card_designs: admin all"
  ON card_designs FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "card_designs: merchant read own"
  ON card_designs FOR SELECT
  TO authenticated
  USING (merchant_id = get_my_merchant_id());

CREATE POLICY "card_designs: merchant update own"
  ON card_designs FOR UPDATE
  TO authenticated
  USING (merchant_id = get_my_merchant_id())
  WITH CHECK (merchant_id = get_my_merchant_id());

-- ============================================================
-- CUSTOMERS POLICIES
-- ============================================================

CREATE POLICY "customers: admin all"
  ON customers FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "customers: merchant crud own"
  ON customers FOR ALL
  TO authenticated
  USING (merchant_id = get_my_merchant_id())
  WITH CHECK (merchant_id = get_my_merchant_id());

-- ============================================================
-- WALLET_CARDS POLICIES
-- ============================================================

CREATE POLICY "wallet_cards: admin all"
  ON wallet_cards FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "wallet_cards: merchant read own"
  ON wallet_cards FOR SELECT
  TO authenticated
  USING (merchant_id = get_my_merchant_id());

-- ============================================================
-- POINTS_TRANSACTIONS POLICIES
-- ============================================================

CREATE POLICY "points_transactions: admin all"
  ON points_transactions FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "points_transactions: merchant read own"
  ON points_transactions FOR SELECT
  TO authenticated
  USING (merchant_id = get_my_merchant_id());

-- Allow merchants to insert transactions for their own customers
CREATE POLICY "points_transactions: merchant insert own"
  ON points_transactions FOR INSERT
  TO authenticated
  WITH CHECK (merchant_id = get_my_merchant_id());

-- ============================================================
-- OFFERS POLICIES
-- ============================================================

CREATE POLICY "offers: admin all"
  ON offers FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "offers: merchant crud own"
  ON offers FOR ALL
  TO authenticated
  USING (merchant_id = get_my_merchant_id())
  WITH CHECK (merchant_id = get_my_merchant_id());

-- ============================================================
-- OFFER_REDEMPTIONS POLICIES
-- ============================================================

CREATE POLICY "offer_redemptions: admin all"
  ON offer_redemptions FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "offer_redemptions: merchant read own"
  ON offer_redemptions FOR SELECT
  TO authenticated
  USING (merchant_id = get_my_merchant_id());

CREATE POLICY "offer_redemptions: merchant insert own"
  ON offer_redemptions FOR INSERT
  TO authenticated
  WITH CHECK (merchant_id = get_my_merchant_id());

-- ============================================================
-- NOTIFICATIONS POLICIES
-- ============================================================

CREATE POLICY "notifications: admin all"
  ON notifications FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "notifications: merchant crud own"
  ON notifications FOR ALL
  TO authenticated
  USING (merchant_id = get_my_merchant_id())
  WITH CHECK (merchant_id = get_my_merchant_id());

-- ============================================================
-- NOTIFICATION_RECIPIENTS POLICIES
-- ============================================================

CREATE POLICY "notification_recipients: admin all"
  ON notification_recipients FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Merchant can read recipients for their own notifications
CREATE POLICY "notification_recipients: merchant read own"
  ON notification_recipients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM notifications n
      WHERE n.id = notification_recipients.notification_id
        AND n.merchant_id = get_my_merchant_id()
    )
  );

-- ============================================================
-- SUBSCRIPTIONS POLICIES
-- ============================================================

CREATE POLICY "subscriptions: admin all"
  ON subscriptions FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "subscriptions: merchant read own"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (merchant_id = get_my_merchant_id());

-- ============================================================
-- PASSKIT_CONFIGS POLICIES
-- ============================================================

CREATE POLICY "passkit_configs: admin all"
  ON passkit_configs FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- PASSKIT_OPERATIONS POLICIES
-- ============================================================

CREATE POLICY "passkit_operations: admin all"
  ON passkit_operations FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "passkit_operations: merchant read own"
  ON passkit_operations FOR SELECT
  TO authenticated
  USING (merchant_id = get_my_merchant_id());

-- ============================================================
-- AUDIT_LOGS POLICIES
-- ============================================================

CREATE POLICY "audit_logs: admin read all"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (is_admin());

-- ============================================================
-- PUBLIC_PAGE_VIEWS POLICIES
-- ============================================================

-- Anonymous users (and authenticated) can insert page_view analytics
CREATE POLICY "public_page_views: anon insert"
  ON public_page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "public_page_views: admin read all"
  ON public_page_views FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "public_page_views: merchant read own"
  ON public_page_views FOR SELECT
  TO authenticated
  USING (merchant_id = get_my_merchant_id());
