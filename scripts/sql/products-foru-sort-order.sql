-- Run in Supabase SQL Editor.
-- For You main section — manual display order (1 = leftmost / first).

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS foru_sort_order integer;

COMMENT ON COLUMN public.products.foru_sort_order IS
  'For You main section sort key — lower numbers appear first. NULL when is_foru is false.';
