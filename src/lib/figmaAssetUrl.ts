/**
 * Static assets live in `public/assets/figma/` using readable filenames (see `scripts/figma-assets.registry.json`).
 * Optional: set `VITE_FIGMA_ASSET_BASE` (e.g. `http://127.0.0.1:3845/assets`) while Figma Desktop
 * is open with Dev Mode to load live exports without copying files.
 */
export function figmaAsset(name: string): string {
  const trimmed = name.replace(/^\//, '')
  const base = (import.meta.env.VITE_FIGMA_ASSET_BASE as string | undefined)?.replace(/\/$/, '')
  if (base) {
    return `${base}/${trimmed}`
  }
  return `/assets/figma/${trimmed}`
}

/** Resolves catalog/storage URLs as-is; otherwise treats value as a figma asset key. */
export function resolveAssetUrl(name: string): string {
  if (/^https?:\/\//.test(name) || name.startsWith('/')) {
    return name
  }
  return figmaAsset(name)
}
