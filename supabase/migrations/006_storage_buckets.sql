-- ============================================================
-- Migration 006: Create Supabase Storage buckets and their
--                Row Level Security policies
-- ============================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('merchant-logos', 'merchant-logos', true)
ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('card-assets', 'card-assets', true)
ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('offer-assets', 'offer-assets', false)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Storage RLS Policies — merchant-logos (public bucket)
-- ============================================================

-- Public: anyone can view merchant logos (bucket is public)
CREATE POLICY "merchant-logos: public select"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'merchant-logos');

-- Admin: full access to merchant-logos
CREATE POLICY "merchant-logos: admin all"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'merchant-logos'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'merchant-logos'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Merchant: insert/update/delete only within their own folder
-- Folder convention: merchant-logos/{merchant_id}/filename
CREATE POLICY "merchant-logos: merchant insert own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'merchant-logos'
    AND (storage.foldername(name))[1] = (
      SELECT merchant_id::text
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "merchant-logos: merchant update own folder"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'merchant-logos'
    AND (storage.foldername(name))[1] = (
      SELECT merchant_id::text
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'merchant-logos'
    AND (storage.foldername(name))[1] = (
      SELECT merchant_id::text
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "merchant-logos: merchant delete own folder"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'merchant-logos'
    AND (storage.foldername(name))[1] = (
      SELECT merchant_id::text
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

-- ============================================================
-- Storage RLS Policies — card-assets (public bucket)
-- ============================================================

CREATE POLICY "card-assets: public select"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'card-assets');

CREATE POLICY "card-assets: admin all"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'card-assets'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'card-assets'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "card-assets: merchant insert own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'card-assets'
    AND (storage.foldername(name))[1] = (
      SELECT merchant_id::text
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "card-assets: merchant update own folder"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'card-assets'
    AND (storage.foldername(name))[1] = (
      SELECT merchant_id::text
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'card-assets'
    AND (storage.foldername(name))[1] = (
      SELECT merchant_id::text
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "card-assets: merchant delete own folder"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'card-assets'
    AND (storage.foldername(name))[1] = (
      SELECT merchant_id::text
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

-- ============================================================
-- Storage RLS Policies — offer-assets (private bucket)
-- ============================================================

-- No public select — private bucket

CREATE POLICY "offer-assets: admin all"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'offer-assets'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'offer-assets'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "offer-assets: merchant select own folder"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'offer-assets'
    AND (storage.foldername(name))[1] = (
      SELECT merchant_id::text
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "offer-assets: merchant insert own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'offer-assets'
    AND (storage.foldername(name))[1] = (
      SELECT merchant_id::text
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "offer-assets: merchant update own folder"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'offer-assets'
    AND (storage.foldername(name))[1] = (
      SELECT merchant_id::text
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'offer-assets'
    AND (storage.foldername(name))[1] = (
      SELECT merchant_id::text
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "offer-assets: merchant delete own folder"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'offer-assets'
    AND (storage.foldername(name))[1] = (
      SELECT merchant_id::text
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );
