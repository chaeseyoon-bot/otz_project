-- Run in Supabase SQL Editor.
-- Admin product registration — free shipping flag for PLP "무료배송" filter.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS free_shipping boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.products.free_shipping IS
  'When true, product matches PLP "무료배송" filter.';
