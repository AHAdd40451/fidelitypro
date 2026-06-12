-- ============================================================
-- Migration 004: Create tables — points_transactions, offers,
--                offer_redemptions, notifications,
--                notification_recipients
-- ============================================================

-- points_transactions: immutable ledger; no updated_at intentionally
CREATE TABLE IF NOT EXISTS points_transactions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     uuid NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
  customer_id     uuid NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
  type            points_transaction_type NOT NULL DEFAULT 'earn',
  amount_paid     numeric,
  points_added    integer NOT NULL DEFAULT 0,
  points_removed  integer NOT NULL DEFAULT 0,
  balance_after   integer NOT NULL,
  description     text,
  created_by      uuid REFERENCES profiles (id) ON DELETE SET NULL,
  created_at      timestamptz DEFAULT now()
);

-- Indexes on points_transactions
CREATE INDEX IF NOT EXISTS idx_points_tx_merchant_id  ON points_transactions (merchant_id);
CREATE INDEX IF NOT EXISTS idx_points_tx_customer_id  ON points_transactions (customer_id);
CREATE INDEX IF NOT EXISTS idx_points_tx_created_at   ON points_transactions (created_at DESC);

-- offers
CREATE TABLE IF NOT EXISTS offers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id      uuid NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
  label            text NOT NULL,
  description      text,
  points_required  integer NOT NULL,
  status           offer_status NOT NULL DEFAULT 'active',
  times_redeemed   integer NOT NULL DEFAULT 0,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- Indexes on offers
CREATE INDEX IF NOT EXISTS idx_offers_merchant_id ON offers (merchant_id);
CREATE INDEX IF NOT EXISTS idx_offers_status      ON offers (status);

CREATE OR REPLACE TRIGGER trg_offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- offer_redemptions: immutable; no updated_at
CREATE TABLE IF NOT EXISTS offer_redemptions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id  uuid NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
  offer_id     uuid NOT NULL REFERENCES offers (id) ON DELETE CASCADE,
  customer_id  uuid NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
  points_spent integer NOT NULL,
  redeemed_by  uuid REFERENCES profiles (id) ON DELETE SET NULL,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_offer_redemptions_merchant_id  ON offer_redemptions (merchant_id);
CREATE INDEX IF NOT EXISTS idx_offer_redemptions_offer_id     ON offer_redemptions (offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_redemptions_customer_id  ON offer_redemptions (customer_id);

-- notifications
CREATE TABLE IF NOT EXISTS notifications (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id      uuid NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
  title            text NOT NULL,
  message          text NOT NULL,
  target_type      text NOT NULL DEFAULT 'all_customers',
  target_filter    jsonb,
  recipients_count integer NOT NULL DEFAULT 0,
  status           notification_status NOT NULL DEFAULT 'draft',
  sent_by          uuid REFERENCES profiles (id) ON DELETE SET NULL,
  sent_at          timestamptz,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_merchant_id ON notifications (merchant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status      ON notifications (status);

CREATE OR REPLACE TRIGGER trg_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- notification_recipients: no updated_at
CREATE TABLE IF NOT EXISTS notification_recipients (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id  uuid NOT NULL REFERENCES notifications (id) ON DELETE CASCADE,
  customer_id      uuid NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
  wallet_card_id   uuid REFERENCES wallet_cards (id) ON DELETE SET NULL,
  status           text NOT NULL DEFAULT 'pending',
  error_message    text,
  sent_at          timestamptz
);

CREATE INDEX IF NOT EXISTS idx_notif_recipients_notification_id ON notification_recipients (notification_id);
CREATE INDEX IF NOT EXISTS idx_notif_recipients_customer_id     ON notification_recipients (customer_id);
