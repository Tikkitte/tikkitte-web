DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'promo_code'
      AND policyname = 'Anyone can read active promo codes'
  ) THEN
    CREATE POLICY "Anyone can read active promo codes" ON promo_code
      FOR SELECT
      USING (active = true);
  END IF;
END $$;
