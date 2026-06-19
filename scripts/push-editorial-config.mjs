/**
 * Push editorial config JSON to Supabase `editorial_config` table.
 *
 * Usage:
 *   node scripts/extract-edge-editorial-localStorage.mjs
 *   node scripts/push-editorial-config.mjs
 *   node scripts/push-editorial-config.mjs scripts/_edge-editorial-export.json
 *
 * Requires `.env` with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
 * Run `scripts/sql/editorial-config-table.sql` in Supabase first.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DEFAULT_INPUT = path.join(__dirname, '_edge-editorial-export.json')

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
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_INPUT
if (!fs.existsSync(inputPath)) {
  console.error(`Input not found: ${inputPath}`)
  process.exit(1)
}

const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
const payload = {
  version: 1,
  events: raw.events ?? [],
  updatedAt: raw.updatedAt ?? new Date().toISOString(),
}

const supabase = createClient(url, key)
const { error } = await supabase.from('editorial_config').upsert(
  {
    id: 'default',
    metadata: payload,
    updated_at: payload.updatedAt,
  },
  { onConflict: 'id' },
)

if (error) {
  console.error('Upsert failed:', error.message)
  process.exit(1)
}

console.log(`Pushed ${payload.events.length} editorial events to Supabase`)
console.log('updatedAt:', payload.updatedAt)
