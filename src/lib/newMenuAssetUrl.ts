/**
 * Assets under `public/assets/figma/NEW/` (Korean filenames — encode path segments for URLs).
 */
export function newMenuAsset(filename: string): string {
  const trimmed = filename.replace(/^\//, '')
  const base = (import.meta.env.VITE_FIGMA_ASSET_BASE as string | undefined)?.replace(/\/$/, '')
  const path = ['NEW', ...trimmed.split('/').filter(Boolean)]
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  if (base) {
    return `${base}/${path}`
  }
  return `/assets/figma/${path}`
}
