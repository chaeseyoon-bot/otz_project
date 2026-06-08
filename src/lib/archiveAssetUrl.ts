/**
 * Assets under `public/assets/figma/ARCHIVE/` (e.g. `01_26.png`).
 */
export function archiveAsset(filename: string): string {
  const trimmed = filename.replace(/^\//, '')
  const base = (import.meta.env.VITE_FIGMA_ASSET_BASE as string | undefined)?.replace(/\/$/, '')
  const path = ['ARCHIVE', ...trimmed.split('/').filter(Boolean)]
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  if (base) {
    return `${base}/${path}`
  }
  return `/assets/figma/${path}`
}
