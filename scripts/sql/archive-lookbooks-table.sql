-- archive_lookbooks_config — 아카이브 어드민 룩북 목록·상세 (Supabase Dashboard → SQL Editor)
-- id='default' 단일 행에 metadata(jsonb)로 전체 설정 저장.

CREATE TABLE IF NOT EXISTS public.archive_lookbooks_config (
  id text PRIMARY KEY DEFAULT 'default',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.archive_lookbooks_config ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.archive_lookbooks_config ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS archive_lookbooks_config_updated_at_idx
  ON public.archive_lookbooks_config (updated_at DESC);

-- ── RLS: 누구나 읽기 / 어드민(anon) 쓰기 ─────────────────────────────────────
ALTER TABLE public.archive_lookbooks_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "archive_lookbooks_config_select_public" ON public.archive_lookbooks_config;
CREATE POLICY "archive_lookbooks_config_select_public"
ON public.archive_lookbooks_config FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "archive_lookbooks_config_insert_anon" ON public.archive_lookbooks_config;
CREATE POLICY "archive_lookbooks_config_insert_anon"
ON public.archive_lookbooks_config FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "archive_lookbooks_config_update_anon" ON public.archive_lookbooks_config;
CREATE POLICY "archive_lookbooks_config_update_anon"
ON public.archive_lookbooks_config FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "archive_lookbooks_config_delete_anon" ON public.archive_lookbooks_config;
CREATE POLICY "archive_lookbooks_config_delete_anon"
ON public.archive_lookbooks_config FOR DELETE
TO anon, authenticated
USING (true);
