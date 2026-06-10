-- Run in Supabase SQL Editor.
-- Admin product color registration — display name, HEX chip, optional texture swatch image.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS color_name text,
  ADD COLUMN IF NOT EXISTS color_hex text,
  ADD COLUMN IF NOT EXISTS color_swatch_url text;

COMMENT ON COLUMN public.products.color_name IS
  'Display color label (e.g. Black, 크림) — shown on PLP filter chips.';

COMMENT ON COLUMN public.products.color_hex IS
  'PLP filter chip fill — normalized #RRGGBB.';

COMMENT ON COLUMN public.products.color_swatch_url IS
  'Optional texture swatch image URL. When set, overrides plain HEX on filter chips.';
