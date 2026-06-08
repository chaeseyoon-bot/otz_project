/**
 * Generates placeholder raster + SVG files under public/assets/figma/ so <img> and
 * tailwind background-image URLs resolve offline. Replace with real exports via
 * `npm run assets:download` (Figma REST API) or `npm run assets:sync` (Dev Mode localhost).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FROM_REGISTRY_PNG, FROM_REGISTRY_SVG } from './figma-asset-manifest.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'public', 'assets', 'figma')

const GENERIC_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="4" fill="#E8E8E8"/>
  <path d="M12 7v10M7 12h10" stroke="#666" stroke-width="1.5" stroke-linecap="round"/>
</svg>
`

async function fetchPngTemplate() {
  const pngUrl =
    'https://placehold.co/800x1200/eeeeee/6b6b6b/png?text=OTZ+Asset'
  const res = await fetch(pngUrl)
  if (!res.ok) {
    throw new Error(`Placeholder PNG request failed: ${res.status} ${pngUrl}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true })
  const pngBytes = await fetchPngTemplate()
  for (const name of FROM_REGISTRY_PNG) {
    const dest = path.join(outDir, name)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.writeFileSync(dest, pngBytes)
  }
  for (const name of FROM_REGISTRY_SVG) {
    const dest = path.join(outDir, name)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.writeFileSync(dest, GENERIC_SVG, 'utf8')
  }
  console.log(`Wrote ${FROM_REGISTRY_PNG.length} PNG + ${FROM_REGISTRY_SVG.length} SVG → ${outDir}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
