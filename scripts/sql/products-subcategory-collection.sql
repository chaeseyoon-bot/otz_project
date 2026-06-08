-- Run in Supabase SQL Editor.
-- Adds subcategory (SHOES / BAG&ACC LNB tabs) and collection (로미타, 로마리, 3300…)
-- for admin registration and storefront PLP filtering.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS subcategory text,
  ADD COLUMN IF NOT EXISTS collection text;

COMMENT ON COLUMN public.products.subcategory IS
  'SHOES: 메리제인/운동화/… — ACC: 가방/모자/… (GNB mega menu labels)';

COMMENT ON COLUMN public.products.collection IS
  'Product line detected from name (로미타, 로마리, 3300, …). Used for COLLECTION PLP tab.';
