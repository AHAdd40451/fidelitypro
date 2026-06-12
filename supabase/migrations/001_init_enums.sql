-- ============================================================
-- Migration 001: Create all ENUM types
-- FidélityPro loyalty platform
-- ============================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('merchant', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE merchant_status AS ENUM ('active', 'suspended', 'pending', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'free', 'suspended', 'trial');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE wallet_provider AS ENUM ('apple', 'google');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE wallet_card_status AS ENUM ('pending', 'active', 'suspended', 'error');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_status AS ENUM ('draft', 'sent', 'failed', 'sending');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE points_transaction_type AS ENUM ('earn', 'redeem', 'adjust', 'bonus');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE offer_status AS ENUM ('active', 'inactive', 'draft');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE passkit_operation_type AS ENUM (
    'create_card',
    'update_card',
    'push_design',
    'send_notification',
    'sync_template',
    'test_connection',
    'webhook'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE passkit_operation_status AS ENUM ('success', 'failed', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE points_mode AS ENUM ('amount_based', 'fixed_visit');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
