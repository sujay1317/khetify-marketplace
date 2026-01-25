-- =====================================================
-- PRODUCTION SECURITY HARDENING MIGRATION
-- =====================================================

-- 1. Drop the overly permissive seller profiles policy
-- This policy allows unauthenticated access to ALL profile columns including phone numbers
DROP POLICY IF EXISTS "Anyone can view seller profiles" ON public.profiles;

-- 2. Revoke public access to role checking functions to prevent role enumeration
-- These functions work in RLS policies without needing public EXECUTE permissions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM anon;

-- 3. Add missing storage policies for shop-images bucket (using IF NOT EXISTS equivalent)
DO $$ 
BEGIN
  -- Check and create INSERT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload own shop images'
  ) THEN
    CREATE POLICY "Users can upload own shop images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'shop-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
  
  -- Check and create UPDATE policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update own shop images'
  ) THEN
    CREATE POLICY "Users can update own shop images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'shop-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
  
  -- Check and create DELETE policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete own shop images'
  ) THEN
    CREATE POLICY "Users can delete own shop images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'shop-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;