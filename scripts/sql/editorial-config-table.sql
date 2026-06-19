-- editorial_config — 에디토리얼 어드민 기획전 설정 (Supabase Dashboard → SQL Editor)
-- id='default' 단일 행에 metadata(jsonb)로 전체 설정 저장.

CREATE TABLE IF NOT EXISTS public.editorial_config (
  id text PRIMARY KEY DEFAULT 'default',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.editorial_config ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.editorial_config ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS editorial_config_updated_at_idx
  ON public.editorial_config (updated_at DESC);

-- ── RLS: 누구나 읽기 / 어드민(anon) 쓰기 ─────────────────────────────────────
ALTER TABLE public.editorial_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "editorial_config_select_public" ON public.editorial_config;
CREATE POLICY "editorial_config_select_public"
ON public.editorial_config FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "editorial_config_insert_anon" ON public.editorial_config;
CREATE POLICY "editorial_config_insert_anon"
ON public.editorial_config FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "editorial_config_update_anon" ON public.editorial_config;
CREATE POLICY "editorial_config_update_anon"
ON public.editorial_config FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "editorial_config_delete_anon" ON public.editorial_config;
CREATE POLICY "editorial_config_delete_anon"
ON public.editorial_config FOR DELETE
TO anon, authenticated
USING (true);
