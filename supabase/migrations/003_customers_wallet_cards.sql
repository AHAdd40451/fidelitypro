-- ============================================================
-- Migration 003: Create tables — customers, wallet_cards
-- ============================================================

CREATE TABLE IF NOT EXISTS customers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     uuid NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
  first_name      text NOT NULL,
  phone           text NOT NULL,
  email           text,
  qr_code_token   text NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  points_balance  integer NOT NULL DEFAULT 0,
  visits_count    integer NOT NULL DEFAULT 0,
  last_visit_at   timestamptz,
  apple_pass_serial text,
  google_wallet_id  text,
  wallet_status   wallet_card_status NOT NULL DEFAULT 'pending',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Indexes on customers
CREATE INDEX IF NOT EXISTS idx_customers_merchant_id   ON customers (merchant_id);
CREATE INDEX IF NOT EXISTS idx_customers_qr_code_token ON customers (qr_code_token);
CREATE INDEX IF NOT EXISTS idx_customers_phone         ON customers (phone);
CREATE INDEX IF NOT EXISTS idx_customers_email         ON customers (email);

CREATE OR REPLACE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- wallet_cards: tracks per-provider pass records
CREATE TABLE IF NOT EXISTS wallet_cards (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     uuid NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
  customer_id     uuid NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
  provider        wallet_provider NOT NULL,
  passkit_pass_id text,
  passkit_serial  text,
  wallet_url      text,
  status          wallet_card_status NOT NULL DEFAULT 'pending',
  last_synced_at  timestamptz,
  last_error      text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE (customer_id, provider)
);

-- Indexes on wallet_cards
CREATE INDEX IF NOT EXISTS idx_wallet_cards_merchant_id  ON wallet_cards (merchant_id);
CREATE INDEX IF NOT EXISTS idx_wallet_cards_customer_id  ON wallet_cards (customer_id);

CREATE OR REPLACE TRIGGER trg_wallet_cards_updated_at
  BEFORE UPDATE ON wallet_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
