-- ============================================================
-- Migration 002: Create tables — merchants, profiles,
--                merchant_settings, card_designs
-- ============================================================

-- merchants must be created before profiles because profiles
-- has a foreign key reference to merchants.

CREATE TABLE IF NOT EXISTS merchants (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text NOT NULL,
  owner_name            text,
  email                 text NOT NULL UNIQUE,
  phone                 text,
  business_type         text,
  logo_url              text,
  card_background_color text NOT NULL DEFAULT '#1e3a5f',
  card_text_color       text NOT NULL DEFAULT '#ffffff',
  accent_color          text NOT NULL DEFAULT '#f0c040',
  welcome_message       text,
  slug                  text NOT NULL UNIQUE,
  points_mode           points_mode NOT NULL DEFAULT 'amount_based',
  points_per_euro       numeric NOT NULL DEFAULT 1,
  fixed_points_per_visit integer NOT NULL DEFAULT 10,
  subscription_status   subscription_status NOT NULL DEFAULT 'free',
  status                merchant_status NOT NULL DEFAULT 'active',
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- Indexes on merchants
CREATE INDEX IF NOT EXISTS idx_merchants_slug               ON merchants (slug);
CREATE INDEX IF NOT EXISTS idx_merchants_email              ON merchants (email);
CREATE INDEX IF NOT EXISTS idx_merchants_status             ON merchants (status);
CREATE INDEX IF NOT EXISTS idx_merchants_subscription_status ON merchants (subscription_status);

-- profiles references auth.users (Supabase Auth) and optionally merchants
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email       text NOT NULL,
  full_name   text,
  role        user_role NOT NULL DEFAULT 'merchant',
  merchant_id uuid REFERENCES merchants (id) ON DELETE SET NULL,
  status      text NOT NULL DEFAULT 'active',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_merchant_id ON profiles (merchant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role        ON profiles (role);

-- merchant_settings: one-to-one with merchants
CREATE TABLE IF NOT EXISTS merchant_settings (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id            uuid NOT NULL UNIQUE REFERENCES merchants (id) ON DELETE CASCADE,
  public_page_enabled    boolean NOT NULL DEFAULT true,
  phone_required         boolean NOT NULL DEFAULT true,
  email_required         boolean NOT NULL DEFAULT false,
  custom_welcome_message text,
  apple_wallet_enabled   boolean NOT NULL DEFAULT true,
  google_wallet_enabled  boolean NOT NULL DEFAULT true,
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);

-- card_designs: one-to-one with merchants
CREATE TABLE IF NOT EXISTS card_designs (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id               uuid NOT NULL UNIQUE REFERENCES merchants (id) ON DELETE CASCADE,
  logo_url                  text,
  background_color          text NOT NULL DEFAULT '#1e3a5f',
  text_color                text NOT NULL DEFAULT '#ffffff',
  accent_color              text NOT NULL DEFAULT '#f0c040',
  merchant_name_on_card     text NOT NULL,
  card_title                text NOT NULL DEFAULT 'Carte de fidélité',
  card_description          text,
  points_label              text NOT NULL DEFAULT 'Points',
  qr_label                  text NOT NULL DEFAULT 'Scanner pour ajouter des points',
  apple_template_id         text,
  google_template_id        text,
  passkit_program_id        text,
  passkit_template_id       text,
  last_pushed_to_passkit_at timestamptz,
  sync_status               text NOT NULL DEFAULT 'not_synced',
  created_at                timestamptz DEFAULT now(),
  updated_at                timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_card_designs_merchant_id ON card_designs (merchant_id);

-- updated_at triggers (function defined in 008_functions_triggers.sql,
-- but we create triggers here that will be valid after that migration runs.
-- To keep migrations self-contained we define the function early or use a
-- deferred approach. The function is idempotent so we define it here too.)

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

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
