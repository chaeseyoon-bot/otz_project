/**
 * Probes storage upload variants (upsert on/off, remove+upload).
 * Run: node scripts/probe-storage-upload.mjs
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

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } },
)

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

const report = { project: process.env.VITE_SUPABASE_URL, results: [] }

function log(entry) {
  report.results.push(entry)
}

const path1 = 'shoes02/__probe_replace__.png'

const up1 = await supabase.storage.from('products').upload(path1, png, {
  upsert: false,
  contentType: 'image/png',
})
log({ step: 'first_upload', ok: !up1.error, error: up1.error?.message ?? null })

const up2 = await supabase.storage.from('products').upload(path1, png, {
  upsert: false,
  contentType: 'image/png',
})
log({ step: 'duplicate_upload_no_upsert', ok: !up2.error, error: up2.error?.message ?? null })

const rm = await supabase.storage.from('products').remove([path1])
log({ step: 'remove', ok: !rm.error, error: rm.error?.message ?? null })

const up3 = await supabase.storage.from('products').upload(path1, png, {
  upsert: false,
  contentType: 'image/png',
})
log({ step: 'upload_after_remove', ok: !up3.error, error: up3.error?.message ?? null })

if (!up3.error || up1.error) {
  await supabase.storage.from('products').remove([path1])
}

const out = path.join(__dirname, 'probe-storage-upload.json')
fs.writeFileSync(out, JSON.stringify(report, null, 2), 'utf8')
process.stdout.write(`wrote ${out}\n`)
