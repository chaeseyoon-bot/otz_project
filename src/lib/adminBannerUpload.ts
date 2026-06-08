import { MAIN_IMAGES_BUCKET, mainImageAsset } from './mainImagesAssetUrl'
import { supabase } from './supabase'

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function resolveExtension(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext && ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) {
    return ext === 'jpeg' ? 'jpg' : ext
  }
  return 'png'
}

/** Maps admin upload slot keys to flat `main_images` object names (no virtual folders). */
export function resolveAdminBannerObjectPath(folder: string, file: File): string {
  const ext = resolveExtension(file)

  const mainMatch = folder.match(/^main-(\d+)$/)
  if (mainMatch) {
    const n = Number(mainMatch[1]) + 1
    return `banner_${String(n).padStart(2, '0')}.${ext}`
  }

  const quickMatch = folder.match(/^quick-(\d+)$/)
  if (quickMatch) {
    const n = Number(quickMatch[1]) + 1
    return `category_${String(n).padStart(2, '0')}.${ext}`
  }

  if (folder === 'brand') {
    return `brand_01.${ext}`
  }

  const seriesMatch = folder.match(/^series-(\d+)$/)
  if (seriesMatch) {
    const seriesFiles = ['brand_03', 'brand_02', 'brand_05', 'brand_04']
    const idx = Number(seriesMatch[1])
    const base = seriesFiles[idx] ?? `series_${String(idx + 1).padStart(2, '0')}`
    return `${base}.${ext}`
  }

  const safeFolder = folder.replace(/[^a-zA-Z0-9-_]/g, '_')
  return `admin_${safeFolder}_${Date.now()}.${ext}`
}

/** Uploads a home main image to Supabase Storage (`main_images` bucket, flat filenames). */
export async function uploadAdminBannerImage(
  file: File,
  folder: string,
): Promise<{ url: string; fileName: string; usedLocalFallback: boolean }> {
  const dataUrl = await readFileAsDataUrl(file)
  const objectPath = resolveAdminBannerObjectPath(folder, file)

  const { error } = await supabase.storage.from(MAIN_IMAGES_BUCKET).upload(objectPath, file, {
    upsert: true,
    contentType: file.type || `image/${resolveExtension(file)}`,
  })

  if (!error) {
    return { url: mainImageAsset(objectPath), fileName: file.name, usedLocalFallback: false }
  }

  console.error('스토리지 에러 상세:', error)
  return { url: dataUrl, fileName: file.name, usedLocalFallback: true }
}
