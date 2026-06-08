-- Run in Supabase SQL Editor.
-- 1) Default stock for newly inserted products (220–260, qty 100 each)
-- 2) One-time backfill for existing rows

ALTER TABLE public.products
  ALTER COLUMN stock SET DEFAULT '{
    "220": 100,
    "225": 100,
    "230": 100,
    "235": 100,
    "240": 100,
    "245": 100,
    "250": 100,
    "255": 100,
    "260": 100
  }'::jsonb;

UPDATE public.products
SET stock = '{
  "220": 100,
  "225": 100,
  "230": 100,
  "235": 100,
  "240": 100,
  "245": 100,
  "250": 100,
  "255": 100,
  "260": 100
}'::jsonb;
