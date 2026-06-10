/**
 * Removes probe rows left by `test-product-registration.mjs` (and similar names).
 * Run: node scripts/cleanup-test-products.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

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

loadEnv()

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY
if (!url || !key) {
  console.error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY required in .env')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

const PROBE_IDS = [1997, 1998, 1999]

const { data: byName, error: nameError } = await supabase
  .from('products')
  .select('id, name')
  .ilike('name', '%registration_test%')

if (nameError) {
  console.error(nameError.message)
  process.exit(1)
}

const idSet = new Set([...PROBE_IDS, ...(byName ?? []).map((row) => row.id)])
const ids = [...idSet]

if (!ids.length) {
  console.log('No test products found.')
  process.exit(0)
}

const { data: preview } = await supabase.from('products').select('id, name').in('id', ids)
console.log('Deleting:', preview ?? [])

const { error: deleteError } = await supabase.from('products').delete().in('id', ids)
if (deleteError) {
  console.error(deleteError.message)
  process.exit(1)
}

console.log(`Deleted ${ids.length} test product(s).`)
