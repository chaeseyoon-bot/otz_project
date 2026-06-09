/**
 * Simulates admin product registration: storage upload + products insert.
 * Run: node scripts/test-product-registration.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT = path.join(__dirname, 'product-registration-test.json')

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

const report = { steps: [] }

function log(step, result) {
  report.steps.push({ step, ...result })
}

const testId = 1999
const folder = 'shoes02'
const objectPath = `${folder}/detail_${testId}_03_big.png`
const base = process.env.VITE_SUPABASE_URL.replace(/\/$/, '')
const imageUrl = `${base}/storage/v1/object/public/products/${encodeURIComponent(folder)}/${encodeURIComponent(`detail_${testId}_03_big.png`)}`

// 1x1 PNG
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

for (const bucket of ['products', 'main_images']) {
  const probePath = bucket === 'products' ? objectPath : `product_detail_${testId}_03.png`
  const { error: bucketError } = await supabase.storage.from(bucket).upload(probePath, png, {
    upsert: true,
    contentType: 'image/png',
  })
  log(`storage_upload_${bucket}`, {
    ok: !bucketError,
    error: bucketError?.message ?? null,
    objectPath: probePath,
  })
  if (!bucketError) await supabase.storage.from(bucket).remove([probePath])
}

const { error: uploadError } = await supabase.storage.from('products').upload(objectPath, png, {
  upsert: true,
  contentType: 'image/png',
})
log('storage_upload_products_final', { ok: !uploadError, error: uploadError?.message ?? null, objectPath, imageUrl })

const { data: existing } = await supabase.from('products').select('id').eq('id', testId).maybeSingle()
if (existing) {
  await supabase.from('products').delete().eq('id', testId)
}

const payload = {
  id: testId,
  category: 'shoes02',
  name: '__registration_test__',
  price: 1000,
  discount_rate: 0,
  is_new: false,
  is_foru: false,
  subcategory: null,
  collection: null,
  stock: { '230': 10 },
  image_url: imageUrl,
}

const { error: insertError } = await supabase.from('products').insert(payload)
log('insert_with_image_url', { ok: !insertError, error: insertError?.message ?? null, code: insertError?.code ?? null })

if (!insertError) {
  await supabase.from('products').delete().eq('id', testId)
}

const { error: insertNoImage } = await supabase.from('products').insert({
  ...payload,
  id: testId - 1,
  image_url: null,
})
log('insert_null_image_url', { ok: !insertNoImage, error: insertNoImage?.message ?? null, code: insertNoImage?.code ?? null })

const { error: insertEmptyImage } = await supabase.from('products').insert({
  ...payload,
  id: testId - 2,
  image_url: '',
})
log('insert_empty_image_url', { ok: !insertEmptyImage, error: insertEmptyImage?.message ?? null, code: insertEmptyImage?.code ?? null })

if (!insertNoImage) await supabase.from('products').delete().eq('id', testId - 1)
if (!insertEmptyImage) await supabase.from('products').delete().eq('id', testId - 2)

fs.writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8')
process.stdout.write(`wrote ${OUT}\n`)
