/**
 * Backfill `products.image_url` from files already on Supabase Storage (`products` bucket).
 *
 * Usage:
 *   node scripts/backfill-product-image-urls.mjs           # empty image_url only
 *   node scripts/backfill-product-image-urls.mjs --dry-run # preview, no DB writes
 *   node scripts/backfill-product-image-urls.mjs --all     # overwrite existing URLs too
 *
 * Requires `.env` with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
 * RLS: scripts/sql/products-rls-admin.sql (UPDATE policy) must be applied.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT = path.join(__dirname, 'backfill-product-image-urls.json')

const SHOES01_MAX_ID = 1026
const CUT_PRIORITY = ['03', '01', '07', '02', '04', '05', '06', '08']
const EXT_PRIORITY = ['webp', 'png']
const STORAGE_FOLDERS = ['shoes01', 'shoes02', 'bag&acc']

const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')
const overwriteAll = args.has('--all')

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

function resolveStorageFolder(row) {
  const label = (row.category ?? '').toString().trim().toLowerCase()
  if (label === 'shoes01' || label === 'shoes02') return label
  if (label === 'bag' || label === 'acc' || label === 'bag&acc') return 'bag&acc'
  if (label.startsWith('shoes')) return row.id <= SHOES01_MAX_ID ? 'shoes01' : 'shoes02'
  if (row.id >= 3001 || row.id >= 2001) return 'bag&acc'
  return row.id <= SHOES01_MAX_ID ? 'shoes01' : 'shoes02'
}

function folderCandidates(primaryFolder) {
  if (primaryFolder === 'shoes01') return ['shoes01', 'shoes02']
  if (primaryFolder === 'shoes02') return ['shoes02', 'shoes01']
  return [primaryFolder]
}

function isEmptyImageUrl(value) {
  return value == null || String(value).trim() === ''
}

function buildPublicUrl(base, folder, fileName) {
  const objectPath = `${encodeURIComponent(folder)}/${encodeURIComponent(fileName)}`
  return `${base}/storage/v1/object/public/products/${objectPath}`
}

/** @returns Map<number, Map<string, Set<'png'|'webp'>>> */
function parseStorageIndex(folder, fileNames) {
  const byProductId = new Map()
  const re = /^detail_(\d+)_(\d{2})_big\.(png|webp)$/i

  for (const name of fileNames) {
    const match = re.exec(name)
    if (!match) continue
    const productId = Number(match[1])
    const cut = match[2]
    const ext = match[3].toLowerCase()
    if (!byProductId.has(productId)) byProductId.set(productId, new Map())
    const cuts = byProductId.get(productId)
    if (!cuts.has(cut)) cuts.set(cut, new Set())
    cuts.get(cut).add(ext)
  }

  return { folder, byProductId }
}

function pickImageUrl(base, productId, primaryFolder, indexes) {
  const folders = folderCandidates(primaryFolder)

  for (const folder of folders) {
    const index = indexes.find((entry) => entry.folder === folder)
    if (!index) continue

    const cuts = index.byProductId.get(productId)
    if (!cuts) continue

    for (const cut of CUT_PRIORITY) {
      const exts = cuts.get(cut)
      if (!exts) continue
      for (const ext of EXT_PRIORITY) {
        if (exts.has(ext)) {
          return buildPublicUrl(base, folder, `detail_${productId}_${cut}_big.${ext}`)
        }
      }
    }
  }

  return null
}

async function listFolderFiles(supabase, folder) {
  const names = []
  let offset = 0

  while (true) {
    const { data, error } = await supabase.storage.from('products').list(folder, {
      limit: 1000,
      offset,
    })
    if (error) throw new Error(`Storage list failed (${folder}): ${error.message}`)
    if (!data?.length) break

    for (const item of data) {
      if (item.name) names.push(item.name)
    }

    if (data.length < 1000) break
    offset += 1000
  }

  return names
}

loadEnv()

const supabaseUrl = process.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })

const report = {
  dryRun,
  overwriteAll,
  storageFolders: {},
  summary: {},
  updated: [],
  skipped: [],
  notFound: [],
  errors: [],
}

console.log(dryRun ? '[dry-run] Preview only — no DB updates.' : '[live] Updating products.image_url…')

const indexes = []
for (const folder of STORAGE_FOLDERS) {
  const fileNames = await listFolderFiles(supabase, folder)
  report.storageFolders[folder] = fileNames.length
  indexes.push(parseStorageIndex(folder, fileNames))
  console.log(`  Storage ${folder}: ${fileNames.length} file(s)`)
}

const { data: products, error: fetchError } = await supabase
  .from('products')
  .select('id, category, name, image_url')
  .order('id')

if (fetchError) {
  console.error(fetchError.message)
  process.exit(1)
}

for (const row of products ?? []) {
  const hadUrl = !isEmptyImageUrl(row.image_url)

  if (hadUrl && !overwriteAll) {
    report.skipped.push({ id: row.id, reason: 'already_has_url' })
    continue
  }

  const primaryFolder = resolveStorageFolder(row)
  const imageUrl = pickImageUrl(supabaseUrl, row.id, primaryFolder, indexes)

  if (!imageUrl) {
    report.notFound.push({ id: row.id, name: row.name, folder: primaryFolder })
    continue
  }

  if (dryRun) {
    report.updated.push({ id: row.id, image_url: imageUrl, action: hadUrl ? 'would_overwrite' : 'would_set' })
    continue
  }

  const { error: updateError } = await supabase
    .from('products')
    .update({ image_url: imageUrl })
    .eq('id', row.id)

  if (updateError) {
    report.errors.push({ id: row.id, error: updateError.message })
  } else {
    report.updated.push({ id: row.id, image_url: imageUrl, action: hadUrl ? 'overwritten' : 'set' })
  }
}

report.summary = {
  totalProducts: products?.length ?? 0,
  updated: report.updated.length,
  skipped: report.skipped.length,
  notFound: report.notFound.length,
  errors: report.errors.length,
}

fs.writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8')

console.log('')
console.log(`Done. updated=${report.summary.updated} skipped=${report.summary.skipped} notFound=${report.summary.notFound} errors=${report.summary.errors}`)
console.log(`Report: ${OUT}`)

if (report.errors.length > 0) process.exit(1)
