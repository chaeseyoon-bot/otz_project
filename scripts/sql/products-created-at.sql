-- Track admin registration time for NEW PLP ordering (newest first).
-- Run once in Supabase SQL Editor.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS created_at timestamptz;

COMMENT ON COLUMN public.products.created_at IS
  'Admin product registration timestamp — NEW menu sorts by this column (newest first).';

-- Backfill legacy rows (only where created_at is still unset).
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id ASC) AS rn
  FROM public.products
),
bounds AS (
  SELECT COALESCE(MAX(rn), 0) AS max_rn FROM ranked
)
UPDATE public.products AS p
SET created_at = now() - ((SELECT max_rn FROM bounds) - r.rn) * interval '1 minute'
FROM ranked AS r
WHERE p.id = r.id
  AND p.created_at IS NULL;

UPDATE public.products
SET created_at = now()
WHERE created_at IS NULL;

ALTER TABLE public.products
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN created_at SET NOT NULL;
