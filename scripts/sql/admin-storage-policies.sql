-- Admin product image upload: Storage RLS for `products` bucket
-- Run in Supabase Dashboard → SQL Editor → New query → Run
--
-- Symptom without these policies:
--   "new row violates row-level security policy" on storage upload
--   → product registration fails before image_url is saved

-- 1) Public read (storefront + admin previews)
DROP POLICY IF EXISTS "products_storage_public_read" ON storage.objects;
CREATE POLICY "products_storage_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

-- 2) Admin browser uses anon key — allow upload / overwrite (upsert)
DROP POLICY IF EXISTS "products_storage_anon_insert" ON storage.objects;
CREATE POLICY "products_storage_anon_insert"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "products_storage_anon_update" ON storage.objects;
CREATE POLICY "products_storage_anon_update"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

-- 3) Replace existing cut images on edit (remove + re-upload)
DROP POLICY IF EXISTS "products_storage_anon_delete" ON storage.objects;
CREATE POLICY "products_storage_anon_delete"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'products');

-- Optional: home main banner bucket (same anon admin pattern)
DROP POLICY IF EXISTS "main_images_storage_public_read" ON storage.objects;
CREATE POLICY "main_images_storage_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'main_images');

DROP POLICY IF EXISTS "main_images_storage_anon_insert" ON storage.objects;
CREATE POLICY "main_images_storage_anon_insert"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'main_images');

DROP POLICY IF EXISTS "main_images_storage_anon_update" ON storage.objects;
CREATE POLICY "main_images_storage_anon_update"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'main_images')
WITH CHECK (bucket_id = 'main_images');

DROP POLICY IF EXISTS "main_images_storage_anon_delete" ON storage.objects;
CREATE POLICY "main_images_storage_anon_delete"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'main_images');
