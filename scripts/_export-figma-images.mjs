import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'public', 'assets', 'figma', 'brand_story')

const envPath = path.join(ROOT, '.env')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!m || process.env[m[1]] !== undefined) continue
    let val = m[2].trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    process.env[m[1]] = val
  }
}

const token = process.env.FIGMA_ACCESS_TOKEN || process.env.VITE_FIGMA_ACCESS_TOKEN
const fileKey = process.env.FIGMA_FILE_KEY || '3bBi5a4TlJxUjdrFmkgp0e'
const scale = process.env.FIGMA_EXPORT_SCALE || '2'

const exports = [
  { id: '2952:1157', file: 'hero_banner.png' },
  { id: '2952:1182', file: 'signature_image_left.png' },
  { id: '2968:4955', file: 'signature_object.png' },
  { id: '2952:1195', file: 'romari_banner.png' },
  { id: '2952:1270', file: 'lomita_banner.png' },
  { id: '2952:1279', file: 'topi_banner_bg.png' },
  { id: '2952:1280', file: 'topi_banner.png' },
  { id: '2952:1356', file: 'heritage_banner.png' },
]

if (!token) {
  console.error('NO_TOKEN')
  process.exit(1)
}

fs.mkdirSync(OUT_DIR, { recursive: true })

const ids = exports.map((e) => e.id).join(',')
const metaRes = await fetch(
  `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(ids)}&format=png&scale=${scale}`,
  { headers: { 'X-Figma-Token': token } },
)
const meta = await metaRes.json()
if (!meta.images) {
  console.error(meta)
  process.exit(1)
}

for (const item of exports) {
  const url = meta.images[item.id]
  if (!url) {
    console.warn('Skip missing', item.id, item.file)
    continue
  }
  const imgRes = await fetch(url)
  const buf = Buffer.from(await imgRes.arrayBuffer())
  const outPath = path.join(OUT_DIR, item.file)
  fs.writeFileSync(outPath, buf)
  console.log('OK', item.file, buf.length)
}
