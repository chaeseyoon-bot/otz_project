export const MAIN_IMAGES_BUCKET = 'main_images'

function mainImagesStorageBase(): string {
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '')
  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/${MAIN_IMAGES_BUCKET}`
  }
  if (import.meta.env.DEV) {
    console.warn(
      '[mainImagesAssetUrl] VITE_SUPABASE_URL is unset — falling back to /assets/figma/main_images (local).',
    )
  }
  return '/assets/figma/main_images'
}

const LOCAL_MAIN_IMAGES_BASE = '/assets/figma/main_images'

function encodeStorageObjectPath(objectPath: string): string {
  return objectPath.split('/').map(encodeURIComponent).join('/')
}

/** Home main static assets — Supabase Storage `main_images` bucket, local fallback under `public/assets/figma/main_images/`. */
export function mainImageAsset(filename: string): string {
  const name = filename.replace(/^\//, '').replace(/^main_images\//, '')
  const localPath = `${LOCAL_MAIN_IMAGES_BASE}/${name}`

  const base = mainImagesStorageBase()
  if (base.startsWith('http')) {
    return `${base}/${encodeStorageObjectPath(name)}`
  }
  return localPath
}
