-- =============================================================================
-- Admin Storage RLS — products + home_banners buckets
-- Supabase Dashboard → SQL Editor → New query → Run (전체 선택 후 실행)
--
-- upsert: true 덮어쓰기에 필요한 권한:
--   SELECT (조회) + INSERT (신규) + UPDATE (덮어쓰기) + DELETE (선택, 확장자 교체 시)
--
-- 증상 (정책 미적용 시):
--   "new row violates row-level security policy"  ← UPDATE 정책 없음
--   remove 후에도 "The resource already exists"  ← DELETE 정책 없음
-- =============================================================================

-- 0) 버킷 public 설정 (이미 있으면 public 유지)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  52428800,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'home_banners',
  'home_banners',
  true,
  52428800,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- legacy bucket name (기존 업로드 호환)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'main_images',
  'main_images',
  true,
  52428800,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 1) products / home_banners / main_images 관련 기존 정책 일괄 제거 (이름 충돌 방지)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND (
        policyname ILIKE '%products_storage%'
        OR policyname ILIKE '%products_storage_%'
        OR policyname ILIKE '%main_images_storage%'
        OR policyname ILIKE '%home_banners_storage%'
        OR policyname ILIKE '%product%storage%'
        OR policyname ILIKE '%main_image%'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- ── products bucket ─────────────────────────────────────────────────────────

CREATE POLICY "products_storage_select_public"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

CREATE POLICY "products_storage_insert_public"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'products');

-- upsert: true 가 기존 파일을 덮어쓸 때 반드시 필요
CREATE POLICY "products_storage_update_public"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

CREATE POLICY "products_storage_delete_public"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'products');

-- ── home_banners bucket (홈메인 어드민 배너) ────────────────────────────────

CREATE POLICY "home_banners_storage_select_public"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'home_banners');

CREATE POLICY "home_banners_storage_insert_public"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'home_banners');

CREATE POLICY "home_banners_storage_update_public"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'home_banners')
WITH CHECK (bucket_id = 'home_banners');

CREATE POLICY "home_banners_storage_delete_public"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'home_banners');

-- ── main_images bucket (legacy) ───────────────────────────────────────────

CREATE POLICY "main_images_storage_select_public"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'main_images');

CREATE POLICY "main_images_storage_insert_public"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'main_images');

CREATE POLICY "main_images_storage_update_public"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'main_images')
WITH CHECK (bucket_id = 'main_images');

CREATE POLICY "main_images_storage_delete_public"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'main_images');

-- 2) 적용 확인 (결과에 4 rows × products, 4 rows × main_images 권장)
-- SELECT policyname, cmd, roles
-- FROM pg_policies
-- WHERE schemaname = 'storage' AND tablename = 'objects'
--   AND policyname LIKE '%products_storage%' OR policyname LIKE '%main_images_storage%'
-- ORDER BY policyname;
