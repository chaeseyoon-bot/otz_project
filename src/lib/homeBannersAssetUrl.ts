export const HOME_BANNERS_BUCKET = 'home_banners'

const LOCAL_HOME_BANNERS_BASE = '/assets/figma/home_banners'

function homeBannersStorageBase(): string {
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '')
  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/${HOME_BANNERS_BUCKET}`
  }
  if (import.meta.env.DEV) {
    console.warn(
      '[homeBannersAssetUrl] VITE_SUPABASE_URL is unset — falling back to /assets/figma/home_banners (local).',
    )
  }
  return LOCAL_HOME_BANNERS_BASE
}

function encodeStorageObjectPath(objectPath: string): string {
  return objectPath.split('/').map(encodeURIComponent).join('/')
}

/** Rewrites legacy `main_images` storage/local paths to `home_banners`. */
export function rewriteHomeBannerImageUrl(url: string | null | undefined): string | null {
  if (url == null || url === '') return url ?? null
  if (!url.includes('main_images')) return url

  return url
    .replace(/\/object\/public\/main_images\//g, '/object/public/home_banners/')
    .replace(/\/assets\/figma\/main_images\//g, '/assets/figma/home_banners/')
    .replace(/\/main_images\//g, '/home_banners/')
}

/** Deep-rewrites any string containing `main_images` inside JSON-like config trees. */
export function deepRewriteHomeBannerUrls<T>(value: T): T {
  if (value === null || value === undefined) return value
  if (typeof value === 'string') {
    return (value.includes('main_images') ? rewriteHomeBannerImageUrl(value) : value) as T
  }
  if (Array.isArray(value)) {
    return value.map((item) => deepRewriteHomeBannerUrls(item)) as T
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      out[key] = deepRewriteHomeBannerUrls(nested)
    }
    return out as T
  }
  return value
}

/** Home main static assets — Supabase Storage `home_banners` bucket, local fallback under `public/assets/figma/home_banners/`. */
export function homeBannerAsset(filename: string): string {
  const name = filename.replace(/^\//, '').replace(/^(main_images|home_banners)\//, '')
  const localPath = `${LOCAL_HOME_BANNERS_BASE}/${name}`

  const base = homeBannersStorageBase()
  if (base.startsWith('http')) {
    return `${base}/${encodeStorageObjectPath(name)}`
  }
  return localPath
}

/** @deprecated Use `homeBannerAsset` */
export const mainImageAsset = homeBannerAsset

/** @deprecated Use `HOME_BANNERS_BUCKET` */
export const MAIN_IMAGES_BUCKET = HOME_BANNERS_BUCKET
