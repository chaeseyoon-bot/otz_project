/**
 * Bulk-sets every row in `public.products.stock` to 100 per admin size (220–260).
 * Also writes scripts/product-stock-seed-report.json.
 * Run: node scripts/seed-product-stock.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT = path.join(__dirname, 'product-stock-seed-report.json')

const ADMIN_STOCK_SIZES = ['220', '225', '230', '235', '240', '245', '250', '255', '260']
const DEFAULT_PRODUCT_STOCK_QTY = 100

function loadEnv() {
  const envPath = path.join(ROOT, '.env')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!m) continue
    const v = m[2].trim().replace(/^["']|["']$/g, '')
    if (process.env[m[1]] === undefined) process.env[m[1]] = v
  }
}

function buildDefaultProductStock() {
  return Object.fromEntries(ADMIN_STOCK_SIZES.map((size) => [size, DEFAULT_PRODUCT_STOCK_QTY]))
}

loadEnv()

const url = (process.env.VITE_SUPABASE_URL ?? '').trim().replace(/^["']|["']$/g, '')
const key = (process.env.VITE_SUPABASE_ANON_KEY ?? '').trim().replace(/^["']|["']$/g, '')

const report = {
  ok: false,
  updatedCount: 0,
  stock: buildDefaultProductStock(),
  error: null,
}

if (!url || !key) {
  report.error = 'VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing in .env'
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8')
  process.stderr.write(`${report.error}\n`)
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })
const stock = buildDefaultProductStock()

const { data, error } = await supabase
  .from('products')
  .update({ stock })
  .not('id', 'is', null)
  .select('id')

if (error) {
  report.error = error.message
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8')
  process.stderr.write(`Failed: ${error.message}\n`)
  process.exit(1)
}

report.ok = true
report.updatedCount = data?.length ?? 0
report.updatedIds = (data ?? []).map((row) => row.id)

fs.writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8')
process.stdout.write(`Updated ${report.updatedCount} product(s). Report: ${OUT}\n`)
