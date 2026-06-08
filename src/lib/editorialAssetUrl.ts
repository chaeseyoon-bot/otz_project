/**
 * Assets under `public/assets/figma/EDITORIAL/` (e.g. `01.png`).
 */
export function editorialAsset(filename: string): string {
  const trimmed = filename.replace(/^\//, '')
  const base = (import.meta.env.VITE_FIGMA_ASSET_BASE as string | undefined)?.replace(/\/$/, '')
  const path = ['EDITORIAL', ...trimmed.split('/').filter(Boolean)]
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  if (base) {
    return `${base}/${path}`
  }
  return `/assets/figma/${path}`
}
