/**
 * Pulls assets from Figma Dev Mode local server (default http://127.0.0.1:3845).
 * Requests use semantic basenames from figma-asset-manifest — Dev Mode must expose those paths.
 * For production exports from the file, prefer `npm run assets:sync` (REST API; token in `.env`).
 *
 *   set FIGMA_DEV_ORIGIN=http://127.0.0.1:3845 && npm run assets:sync:dev
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FIGMA_RASTER_NAMES, FIGMA_SVG_NAMES } from './figma-asset-manifest.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'public', 'assets', 'figma', 'home_banners')
const origin = (process.env.FIGMA_DEV_ORIGIN || 'http://127.0.0.1:3845').replace(/\/$/, '')

const names = [...new Set([...FIGMA_RASTER_NAMES, ...FIGMA_SVG_NAMES])]

async function main() {
  fs.mkdirSync(outDir, { recursive: true })
  let ok = 0
  for (const name of names) {
    const url = `${origin}/assets/${name}`
    const res = await fetch(url)
    if (!res.ok) {
      console.warn(`Skip (${res.status}): ${url}`)
      continue
    }
    const buf = Buffer.from(await res.arrayBuffer())
    fs.writeFileSync(path.join(outDir, name), buf)
    ok += 1
  }
  console.log(`Downloaded ${ok}/${names.length} assets from ${origin} → ${outDir}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
