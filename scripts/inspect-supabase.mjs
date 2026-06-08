/**
 * One-off Supabase inspector. Writes findings to scripts/supabase-report.json
 * (avoids console encoding issues on Windows PowerShell).
 * Run: node scripts/inspect-supabase.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT = path.join(__dirname, 'supabase-report.json')

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
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
const report = { tables: {}, storage: {} }

async function dumpTable(name) {
  const { data, error, count } = await supabase
    .from(name)
    .select('*', { count: 'exact' })
    .limit(12)
  if (error) {
    report.tables[name] = { error: error.message }
    return
  }
  report.tables[name] = {
    count,
    columns: data?.length ? Object.keys(data[0]) : [],
    rows: data ?? [],
  }
}

async function dumpStorage() {
  const { data: buckets, error } = await supabase.storage.listBuckets()
  report.storage.buckets = error ? { error: error.message } : buckets.map((b) => b.name)
  const candidateBuckets = [
    ...(Array.isArray(report.storage.buckets) ? report.storage.buckets : []),
    'product_images',
    'products',
    'product',
    'images',
    'image',
    'shoes',
    'bags',
    'acc',
    'assets',
    'public',
    'otz',
  ]
  const prefixes = ['', 'shoes', 'bags', 'acc']
  report.storage.listings = {}
  for (const bucket of [...new Set(candidateBuckets)]) {
    for (const prefix of prefixes) {
      const { data: files, error: e2 } = await supabase.storage.from(bucket).list(prefix, { limit: 30 })
      if (e2) continue
      if (files?.length) {
        report.storage.listings[`${bucket}/${prefix}`] = files.map((f) => f.name)
      }
    }
  }
}

async function probeDirectUrls() {
  const base = process.env.VITE_SUPABASE_URL.replace(/\/$/, '')
  // Probe many naming conventions for a single id using GET (public buckets reject HEAD).
  const id = 1001
  const candidates = [
    `${id}.png`,
    `${id}.webp`,
    `${id}_01.png`,
    `${id}_03.png`,
    `${id}_07.png`,
    `${id}_03.webp`,
    `${id}_07.webp`,
    `${id}_03_big.png`,
    `${id}_07_big.png`,
    `${id}_03_big.webp`,
    `${id}_07_big.webp`,
    `detail_${id}_03_big.png`,
    `detail_${id}_07_big.png`,
    `${id}/03.png`,
    `${id}/07.png`,
    `${id}/${id}_03.png`,
  ]
  report.storage.directProbe = {}
  for (const name of candidates) {
    const url = `${base}/storage/v1/object/public/products/${name}`
    try {
      const res = await fetch(url) // GET
      const ct = res.headers.get('content-type') || ''
      report.storage.directProbe[name] = `${res.status} ${ct}`
    } catch (e) {
      report.storage.directProbe[name] = String(e.message || e)
    }
  }
}

async function listProductsBucket() {
  const candidates = [
    { bucket: 'products', prefix: '' },
    { bucket: 'products', prefix: '1001' },
  ]
  report.storage.productsListing = {}
  for (const { bucket, prefix } of candidates) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 40 })
    report.storage.productsListing[`${bucket}/${prefix}`] = error
      ? { error: error.message }
      : data.map((f) => f.name)
  }
}

async function dumpRestSchema() {
  const base = process.env.VITE_SUPABASE_URL.replace(/\/$/, '')
  const key = process.env.VITE_SUPABASE_ANON_KEY
  try {
    const res = await fetch(`${base}/rest/v1/`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
    const json = await res.json()
    const defs = json.definitions || json.components?.schemas || {}
    report.restSchema = {}
    for (const [name, def] of Object.entries(defs)) {
      const props = def.properties || {}
      report.restSchema[name] = Object.fromEntries(
        Object.entries(props).map(([col, meta]) => [col, meta.type || meta.format || '?']),
      )
    }
  } catch (e) {
    report.restSchema = { error: String(e.message || e) }
  }
}

for (const t of ['products', 'product', 'shoes', 'bags', 'acc', 'items']) await dumpTable(t)
await dumpStorage()
await probeDirectUrls()
await listProductsBucket()
await dumpRestSchema()

fs.writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8')
process.stdout.write(`wrote ${OUT}\n`)
