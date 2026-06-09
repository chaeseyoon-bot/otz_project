-- Admin product CRUD: products table RLS (anon key from browser)
-- Run in Supabase Dashboard → SQL Editor if INSERT/UPDATE fails with:
--   "new row violates row-level security policy for table products"

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_anon" ON public.products;
CREATE POLICY "products_select_anon"
ON public.products FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "products_insert_anon" ON public.products;
CREATE POLICY "products_insert_anon"
ON public.products FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "products_update_anon" ON public.products;
CREATE POLICY "products_update_anon"
ON public.products FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);
