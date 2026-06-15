/**
 * Downloads raster/SVG exports from the Figma REST API into `public/assets/figma/home_banners/`
 * using semantic filenames from `figma-assets.registry.json`.
 *
 * Requires: FIGMA_ACCESS_TOKEN or VITE_FIGMA_ACCESS_TOKEN (Personal Access Token)
 * Optional: FIGMA_FILE_KEY (defaults to registry fileKey)
 *
 * Validates payloads so HTML error pages are never saved as images.
 * If the token is missing, falls back to copying legacy hashed filenames when present.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const REGISTRY_PATH = path.join(__dirname, 'figma-assets.registry.json')
const OUT_DIR = path.join(ROOT, 'public', 'assets', 'figma', 'home_banners')
const LEGACY_OUT_DIRS = [
  OUT_DIR,
  path.join(ROOT, 'public', 'assets', 'figma', 'main_images'),
  path.join(ROOT, 'public', 'assets', 'figma'),
]

function loadEnvFile() {
  const envPath = path.join(ROOT, '.env')
  if (!fs.existsSync(envPath)) return
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!m) continue
    const key = m[1]
    let val = m[2].trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = val
  }
}

function readRegistry() {
  const raw = fs.readFileSync(REGISTRY_PATH, 'utf8')
  return JSON.parse(raw)
}

function isProbablyHtml(buf) {
  const probe = buf.subarray(0, Math.min(600, buf.length)).toString('utf8').trimStart().toLowerCase()
  return probe.startsWith('<!doctype') || probe.startsWith('<html') || probe.startsWith('<html ')
}

function validateAssetBuffer(buf, ext) {
  if (!buf?.length) return false
  if (isProbablyHtml(buf)) return false
  const e = ext.toLowerCase()
  if (e === '.png') {
    return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47
  }
  if (e === '.jpg' || e === '.jpeg') {
    return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
  }
  if (e === '.gif') {
    const s = buf.subarray(0, 6).toString('ascii')
    return s === 'GIF87a' || s === 'GIF89a'
  }
  if (e === '.webp') {
    return buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP'
  }
  if (e === '.svg') {
    const head = buf.subarray(0, Math.min(800, buf.length)).toString('utf8').trimStart()
    return head.startsWith('<svg') || head.startsWith('<?xml')
  }
  return false
}

async function fetchAsBuffer(url) {
  const res = await fetch(url)
  const ct = (res.headers.get('content-type') || '').toLowerCase()
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`)
  }
  if (ct.includes('text/html')) {
    throw new Error(`Unexpected HTML content-type for ${url}`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  if (isProbablyHtml(buf)) {
    throw new Error(`Body looks like HTML for ${url}`)
  }
  return buf
}

async function figmaImageUrls(fileKey, token, ids, format, scale) {
  const params = new URLSearchParams()
  params.set('ids', ids.join(','))
  params.set('format', format)
  if (scale != null && scale !== 1 && ['png', 'jpg', 'jpeg', 'webp'].includes(format)) {
    params.set('scale', String(scale))
  }
  const url = `https://api.figma.com/v1/images/${fileKey}?${params.toString()}`
  const res = await fetch(url, { headers: { 'X-Figma-Token': token } })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json?.err || json?.message || `Figma images API ${res.status}`)
  }
  if (json.err) {
    throw new Error(String(json.err))
  }
  return json.images || {}
}

function copyLegacy(asset) {
  const dest = path.join(OUT_DIR, asset.output)
  const legacyNames = asset.legacy || []
  for (const dir of LEGACY_OUT_DIRS) {
    for (const name of legacyNames) {
      const src = path.join(dir, name)
      if (fs.existsSync(src)) {
        fs.mkdirSync(path.dirname(dest), { recursive: true })
        fs.copyFileSync(src, dest)
        return { ok: true, via: path.relative(ROOT, src) }
      }
    }
  }
  return { ok: false }
}

async function downloadViaApi(registry, token) {
  const fileKey = process.env.FIGMA_FILE_KEY || registry.fileKey
  const assets = registry.assets
  const scale =
    Number(process.env.FIGMA_EXPORT_SCALE || registry.exportScale || 2) || 2
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const byFormat = new Map()
  for (const a of assets) {
    const fmt = a.format
    if (!byFormat.has(fmt)) byFormat.set(fmt, [])
    byFormat.get(fmt).push(a)
  }

  let ok = 0
  let failed = []

  for (const [format, group] of byFormat) {
    const chunkSize = 40
    for (let i = 0; i < group.length; i += chunkSize) {
      const slice = group.slice(i, i + chunkSize)
      const ids = slice.map((a) => a.nodeId)
      const urls = await figmaImageUrls(fileKey, token, ids, format, scale)

      for (const asset of slice) {
        const url = urls[asset.nodeId]
        if (!url) {
          failed.push({ output: asset.output, reason: 'No render URL returned for node' })
          continue
        }
        try {
          const buf = await fetchAsBuffer(url)
          const ext = path.extname(asset.output)
          if (!validateAssetBuffer(buf, ext)) {
            failed.push({ output: asset.output, reason: 'Validation failed (not a valid image/SVG)' })
            continue
          }
          fs.writeFileSync(path.join(OUT_DIR, asset.output), buf)
          ok += 1
        } catch (e) {
          failed.push({ output: asset.output, reason: String(e.message || e) })
        }
      }
    }
  }

  return { ok, failed }
}

async function main() {
  loadEnvFile()
  const registry = readRegistry()
  const token =
    process.env.FIGMA_ACCESS_TOKEN ||
    process.env.FIGMA_TOKEN ||
    process.env.VITE_FIGMA_ACCESS_TOKEN

  if (token) {
    const sc = Number(process.env.FIGMA_EXPORT_SCALE || registry.exportScale || 2) || 2
    console.log(`Downloading from Figma REST API (raster scale=${sc}x, design node ${registry.designNodeId || '—'})…`)
    const { ok, failed } = await downloadViaApi(registry, token)
    console.log(`Saved ${ok} file(s) → ${OUT_DIR}`)
    if (failed.length) {
      console.warn('Failures:', failed.length)
      for (const f of failed) console.warn(`  - ${f.output}: ${f.reason}`)
    }
    return
  }

  console.warn(
    'FIGMA_ACCESS_TOKEN / VITE_FIGMA_ACCESS_TOKEN not set — copying from legacy hashed files when available.',
  )
  let copied = 0
  const missingOutputs = []

  for (const asset of registry.assets) {
    const dest = path.join(OUT_DIR, asset.output)
    const r = copyLegacy(asset)
    if (r.ok) {
      copied += 1
      console.log(`Copied ${asset.output} ← ${r.via}`)
      continue
    }
    if (!fs.existsSync(dest) || fs.statSync(dest).size === 0) {
      missingOutputs.push(asset.output)
    }
  }

  console.log(`Legacy copy: ${copied}/${registry.assets.length}.`)
  if (missingOutputs.length) {
    console.warn(
      `Still missing ${missingOutputs.length} output(s). Run npm run assets:seed or set FIGMA_ACCESS_TOKEN / VITE_FIGMA_ACCESS_TOKEN:`,
    )
    missingOutputs.forEach((m) => console.warn(`  - ${m}`))
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
