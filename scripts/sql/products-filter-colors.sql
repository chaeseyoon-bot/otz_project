-- Run in Supabase SQL Editor.
-- PLP 색상 필터용 — admin 등록 시 FILTER_COLOR_OPTIONS id 배열 저장 (예: beige, brown).

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS filter_colors text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.products.filter_colors IS
  'PLP color filter ids — matches storefront FILTER_COLOR_OPTIONS (beige, brown, white, …).';
