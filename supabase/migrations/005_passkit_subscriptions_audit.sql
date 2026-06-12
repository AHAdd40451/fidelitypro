-- ============================================================
-- Migration 005: Create tables — subscriptions, passkit_configs,
--                passkit_operations, audit_logs, public_page_views
-- ============================================================

-- subscriptions: one-to-one with merchants
CREATE TABLE IF NOT EXISTS subscriptions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id   uuid NOT NULL UNIQUE REFERENCES merchants (id) ON DELETE CASCADE,
  plan_name     text NOT NULL DEFAULT 'Free',
  monthly_price numeric NOT NULL DEFAULT 0,
  status        subscription_status NOT NULL DEFAULT 'free',
  starts_at     timestamptz DEFAULT now(),
  renews_at     timestamptz,
  ends_at       timestamptz,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_merchant_id ON subscriptions (merchant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status      ON subscriptions (status);

CREATE OR REPLACE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- passkit_configs: global singleton-like configuration for the PassKit integration
CREATE TABLE IF NOT EXISTS passkit_configs (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  environment               text NOT NULL DEFAULT 'sandbox',
  status                    text NOT NULL DEFAULT 'disconnected',
  default_apple_template_id text,
  default_google_template_id text,
  webhook_url               text,
  last_tested_at            timestamptz,
  created_at                timestamptz DEFAULT now(),
  updated_at                timestamptz DEFAULT now()
);

CREATE OR REPLACE TRIGGER trg_passkit_configs_updated_at
  BEFORE UPDATE ON passkit_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- passkit_operations: audit log for every PassKit API call
CREATE TABLE IF NOT EXISTS passkit_operations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id      uuid REFERENCES merchants (id) ON DELETE SET NULL,
  customer_id      uuid REFERENCES customers (id) ON DELETE SET NULL,
  wallet_card_id   uuid REFERENCES wallet_cards (id) ON DELETE SET NULL,
  operation_type   passkit_operation_type NOT NULL,
  provider         text,
  status           passkit_operation_status NOT NULL DEFAULT 'pending',
  request_payload  jsonb,
  response_payload jsonb,
  error_message    text,
  created_by       uuid REFERENCES profiles (id) ON DELETE SET NULL,
  created_at       timestamptz DEFAULT now()
);

-- Indexes on passkit_operations
CREATE INDEX IF NOT EXISTS idx_passkit_ops_merchant_id  ON passkit_operations (merchant_id);
CREATE INDEX IF NOT EXISTS idx_passkit_ops_customer_id  ON passkit_operations (customer_id);
CREATE INDEX IF NOT EXISTS idx_passkit_ops_status       ON passkit_operations (status);
CREATE INDEX IF NOT EXISTS idx_passkit_ops_created_at   ON passkit_operations (created_at DESC);

-- audit_logs: immutable; no updated_at
CREATE TABLE IF NOT EXISTS audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid REFERENCES profiles (id) ON DELETE SET NULL,
  actor_role  text,
  merchant_id uuid REFERENCES merchants (id) ON DELETE SET NULL,
  action      text NOT NULL,
  target_type text,
  target_id   text,
  metadata    jsonb NOT NULL DEFAULT '{}',
  ip_address  text,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id    ON audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_merchant_id ON audit_logs (merchant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action      ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at  ON audit_logs (created_at DESC);

-- public_page_views: analytics; no updated_at
CREATE TABLE IF NOT EXISTS public_page_views (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
  event_type  text NOT NULL DEFAULT 'page_view',
  metadata    jsonb,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_public_page_views_merchant_id ON public_page_views (merchant_id);
CREATE INDEX IF NOT EXISTS idx_public_page_views_event_type  ON public_page_views (event_type);
CREATE INDEX IF NOT EXISTS idx_public_page_views_created_at  ON public_page_views (created_at DESC);
