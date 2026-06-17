/**
 * Restores all archive lookbooks from src/data/archiveLocalAssets.json into Supabase.
 * Preserves existing admin metadata (title, intro, row layout) when publishable.
 *
 * Usage: node scripts/restore-archive-lookbooks.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const env = fs.readFileSync(path.join(ROOT, '.env'), 'utf8')
const get = (k) => env.match(new RegExp(`${k}=(.+)`))?.[1]?.trim()

const supabaseUrl = get('VITE_SUPABASE_URL')
const supabaseKey = get('VITE_SUPABASE_ANON_KEY')

const manifest = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src/data/archiveLocalAssets.json'), 'utf8'),
)

function archiveAssetPath(filename) {
  const segments = ['ARCHIVE', filename]
    .flatMap((part) => part.split('/').filter(Boolean))
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  return `/assets/figma/${segments}`
}

function isPublishableUrl(url) {
  if (!url?.trim()) return false
  if (url.startsWith('blob:') || url.startsWith('data:')) return false
  return url.startsWith('http') || url.startsWith('/')
}

function rowHasPublishableImages(row) {
  return row.images
    .slice(0, row.columnsPerRow)
    .every((img) => isPublishableUrl(img.imageUrl))
}

function buildDetailRowsFromLocal(id, images) {
  return images.map((file, index) => ({
    id: `row-restore-${id}-${index}`,
    columnsPerRow: 1,
    images: [{ imageUrl: archiveAssetPath(file), imageFileName: file }],
  }))
}

function buildEntryFromLocal(id, assets, existing) {
  const publishableThumb = isPublishableUrl(existing?.thumbnailUrl)
    ? existing.thumbnailUrl.trim()
    : archiveAssetPath(assets.thumbnail)

  const publishableRows =
    existing?.detailRows?.length &&
    existing.detailRows.every(rowHasPublishableImages) &&
    existing.detailRows.some((row) =>
      row.images.slice(0, row.columnsPerRow).some((img) => img.imageUrl?.trim()),
    )
      ? existing.detailRows
      : buildDetailRowsFromLocal(id, assets.images)

  const num = Number(/^archive-(\d+)$/.exec(id)?.[1] ?? 0)

  return {
    id,
    title: existing?.title?.trim() || '',
    seasons: Array.isArray(existing?.seasons) && existing.seasons.length ? existing.seasons : ['all'],
    aspectRatio: existing?.aspectRatio || 0.8,
    thumbnailUrl: publishableThumb,
    thumbnailFileName: existing?.thumbnailFileName || assets.thumbnail,
    detailRows: publishableRows,
    introHeading: existing?.introHeading || '',
    introBody: existing?.introBody || '',
    createdAt: existing?.createdAt || new Date(Date.UTC(2020, 0, num || 1)).toISOString(),
  }
}

async function fetchRemote() {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/archive_lookbooks_config?id=eq.default&select=metadata,updated_at`,
    { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } },
  )
  const data = await res.json()
  return data[0]?.metadata ?? null
}

async function upsertConfig(lookbooks) {
  const payload = {
    version: 1,
    lookbooks: lookbooks.sort((a, b) => {
      const aNum = Number(/^archive-(\d+)$/.exec(a.id)?.[1] ?? 0)
      const bNum = Number(/^archive-(\d+)$/.exec(b.id)?.[1] ?? 0)
      return bNum - aNum
    }),
    updatedAt: new Date().toISOString(),
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/archive_lookbooks_config`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      id: 'default',
      metadata: payload,
      updated_at: payload.updatedAt,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Upsert failed (${res.status}): ${text}`)
  }

  return payload
}

const remote = await fetchRemote()
const existingById = new Map((remote?.lookbooks ?? []).map((entry) => [entry.id, entry]))

const lookbooks = Object.entries(manifest).map(([id, assets]) =>
  buildEntryFromLocal(id, assets, existingById.get(id)),
)

console.log(`Restoring ${lookbooks.length} lookbooks to Supabase…`)
const saved = await upsertConfig(lookbooks)
console.log('Done. Lookbooks:', saved.lookbooks.map((lb) => `${lb.id} (${lb.detailRows.length} rows)`).join(', '))
