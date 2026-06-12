-- ============================================================
-- Migration 010: Seed demo / initial data
-- ============================================================

-- ============================================================
-- PassKit global config — insert only if table is empty
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM passkit_configs LIMIT 1) THEN
    INSERT INTO passkit_configs (
      environment,
      status,
      default_apple_template_id,
      default_google_template_id,
      webhook_url
    ) VALUES (
      'sandbox',
      'disconnected',
      NULL,   -- Set after PassKit account is configured
      NULL,   -- Set after PassKit account is configured
      NULL    -- Set to your Supabase edge function URL: /passkit-webhook
    );
  END IF;
END;
$$;

-- ============================================================
-- HOW TO CREATE AN ADMIN USER
-- ============================================================
--
-- Admin users cannot be seeded directly because they require
-- a matching auth.users record. Follow these steps:
--
-- 1. Create the user via Supabase Auth (dashboard or API):
--    POST /auth/v1/admin/users
--    { "email": "admin@fidelitypro.app", "password": "...", "email_confirm": true }
--
-- 2. After the user is created, note their UUID from auth.users.
--
-- 3. Insert or update their profile:
--    INSERT INTO profiles (id, email, full_name, role, merchant_id, status)
--    VALUES (
--      '<uuid-from-step-2>',
--      'admin@fidelitypro.app',
--      'FidélityPro Admin',
--      'admin',
--      NULL,
--      'active'
--    )
--    ON CONFLICT (id) DO UPDATE
--      SET role = 'admin', full_name = EXCLUDED.full_name;
--
-- 4. The user can now log in and will have full admin access.
--
-- ============================================================
-- NOTES ON DEMO MERCHANT
-- ============================================================
--
-- To create a demo merchant for testing:
--
--    INSERT INTO merchants (name, email, slug, owner_name)
--    VALUES ('Café Demo', 'demo@cafe.fr', 'cafe-demo', 'Marie Dupont');
--
--    -- Get the new merchant id:
--    SELECT id FROM merchants WHERE slug = 'cafe-demo';
--
--    -- Auto-populate dependent tables:
--    INSERT INTO merchant_settings (merchant_id) VALUES ('<merchant-id>');
--    INSERT INTO card_designs (merchant_id, merchant_name_on_card)
--    VALUES ('<merchant-id>', 'Café Demo');
--    INSERT INTO subscriptions (merchant_id) VALUES ('<merchant-id>');
--
-- ============================================================
