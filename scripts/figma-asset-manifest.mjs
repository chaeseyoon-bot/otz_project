/**
 * Asset basenames under `public/assets/figma/` — semantic names + fixed UI icons.
 * Primary list comes from `figma-assets.registry.json`.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const registry = JSON.parse(fs.readFileSync(path.join(__dirname, 'figma-assets.registry.json'), 'utf8'))

export const FROM_REGISTRY_PNG = registry.assets.filter((a) => a.output.endsWith('.png')).map((a) => a.output)
export const FROM_REGISTRY_SVG = registry.assets.filter((a) => a.output.endsWith('.svg')).map((a) => a.output)

/** Header / tab icons — copy from existing files; do not seed as placeholders. */
export const EXTRA_RASTER_NAMES = []

export const EXTRA_SVG_NAMES = [
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

/** All basenames referenced by the app (registry + fixed UI icons). */
export const FIGMA_RASTER_NAMES = [...FROM_REGISTRY_PNG, ...EXTRA_RASTER_NAMES]
export const FIGMA_SVG_NAMES = [...FROM_REGISTRY_SVG, ...EXTRA_SVG_NAMES]
