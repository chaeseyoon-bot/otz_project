/**
 * Removes `public/assets/figma/**` then restores non-Figma UI icons (header logo, tab bar).
 * Run before `node scripts/download-figma-assets.mjs` when refreshing raster exports.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'public', 'assets', 'figma')
const STAGING = path.join(__dirname, '.figma-ui-icon-staging')

/** Paths relative to `public/assets/figma` — not exported from Figma API registry. */
const PRESERVE_REL = [
  'logo_otz.svg',
  'icon_header_category.svg',
  'icon_header_search.svg',
  'icon_header_cart.svg',
  'icons/tab_home.svg',
  'icons/tab_category.svg',
  'icons/tab_heart.svg',
  'icons/tab_user.svg',
  'icons/tab_recent.svg',
]

function stagePreserve() {
  fs.rmSync(STAGING, { recursive: true, force: true })
  fs.mkdirSync(STAGING, { recursive: true })
  let n = 0
  for (const rel of PRESERVE_REL) {
    const src = path.join(OUT_DIR, rel)
    if (!fs.existsSync(src)) continue
    const dest = path.join(STAGING, rel)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(src, dest)
    n += 1
  }
  if (n) console.log(`Staged ${n} UI icon file(s) for restore.`)
}

function restorePreserve() {
  if (!fs.existsSync(STAGING)) return
  let n = 0
  for (const rel of PRESERVE_REL) {
    const src = path.join(STAGING, rel)
    if (!fs.existsSync(src)) continue
    const dest = path.join(OUT_DIR, rel)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(src, dest)
    n += 1
  }
  fs.rmSync(STAGING, { recursive: true, force: true })
  if (n) console.log(`Restored ${n} UI icon file(s).`)
}

function wipeFigmaDir() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })
  console.log(`Emptied ${OUT_DIR}`)
}

function main() {
  stagePreserve()
  wipeFigmaDir()
  restorePreserve()
}

main()
