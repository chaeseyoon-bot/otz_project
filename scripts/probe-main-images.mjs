/**
 * Probes home_banners bucket upload (banner admin flow).
 * Run: node scripts/probe-main-images.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT = path.join(__dirname, 'probe-main-images.json')

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

const bucket = 'home_banners'
const results = []

function log(entry) {
  results.push(entry)
}

const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
log({
  step: 'listBuckets',
  ok: !bucketError,
  buckets: buckets?.map((b) => ({ name: b.name, public: b.public })) ?? null,
  error: bucketError?.message ?? null,
})

const probePath = '__probe_banner__.png'
const existingPath = 'banner_01.png'
const versionedPath = `admin/main-0_${Date.now()}.png`

const upUpsertExisting = await supabase.storage.from(bucket).upload(existingPath, png, {
  upsert: true,
  contentType: 'image/png',
})
log({
  step: 'upload_banner_01_upsert_true',
  ok: !upUpsertExisting.error,
  error: upUpsertExisting.error?.message ?? null,
  status: upUpsertExisting.error?.statusCode ?? null,
})

const upVersioned = await supabase.storage.from(bucket).upload(versionedPath, png, {
  upsert: false,
  contentType: 'image/png',
})
log({
  step: 'upload_versioned_admin_path',
  ok: !upVersioned.error,
  path: versionedPath,
  error: upVersioned.error?.message ?? null,
  status: upVersioned.error?.statusCode ?? null,
})

if (!upVersioned.error) {
  await supabase.storage.from(bucket).remove([versionedPath])
}

const upNew = await supabase.storage.from(bucket).upload(probePath, png, {
  upsert: false,
  contentType: 'image/png',
})
log({
  step: 'upload_new_upsert_false',
  ok: !upNew.error,
  error: upNew.error?.message ?? null,
  status: upNew.error?.statusCode ?? null,
})

if (!upNew.error) {
  const dup = await supabase.storage.from(bucket).upload(probePath, png, {
    upsert: false,
    contentType: 'image/png',
  })
  log({
    step: 'duplicate_no_upsert',
    ok: !dup.error,
    error: dup.error?.message ?? null,
    status: dup.error?.statusCode ?? null,
  })

  const rm = await supabase.storage.from(bucket).remove([probePath])
  log({
    step: 'remove_probe',
    ok: !rm.error,
    error: rm.error?.message ?? null,
    removed: rm.data ?? null,
  })

  const retry = await supabase.storage.from(bucket).upload(probePath, png, {
    upsert: false,
    contentType: 'image/png',
  })
  log({
    step: 'upload_after_remove',
    ok: !retry.error,
    error: retry.error?.message ?? null,
  })

  await supabase.storage.from(bucket).remove([probePath])
}

for (const existingPath of ['banner_01.png', 'banner_99.png']) {
  const fresh = await supabase.storage.from(bucket).upload(existingPath, png, {
    upsert: false,
    contentType: 'image/png',
  })
  log({
    step: `fresh_upload_${existingPath}`,
    ok: !fresh.error,
    error: fresh.error?.message ?? null,
    status: fresh.error?.statusCode ?? null,
  })

  const removed = await supabase.storage.from(bucket).remove([existingPath])
  log({
    step: `remove_${existingPath}`,
    ok: !removed.error,
    error: removed.error?.message ?? null,
    removed: removed.data ?? null,
  })

  const retry = await supabase.storage.from(bucket).upload(existingPath, png, {
    upsert: false,
    contentType: 'image/png',
  })
  log({
    step: `reupload_${existingPath}`,
    ok: !retry.error,
    error: retry.error?.message ?? null,
    status: retry.error?.statusCode ?? null,
  })

  await supabase.storage.from(bucket).remove([existingPath])
}

fs.writeFileSync(OUT, JSON.stringify(results, null, 2), 'utf8')
process.stdout.write(`wrote ${OUT}\n`)
