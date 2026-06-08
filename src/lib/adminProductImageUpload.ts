import { supabase } from './supabase'
import { PRODUCT_PDP_CUTS } from './productImage'

function storageBaseUrl(): string {
  return (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function resolveExtension(file: File): 'png' | 'webp' {
  const ext = file.name.split('.').pop()?.toLowerCase()
  return ext === 'webp' ? 'webp' : 'png'
}

export function adminProductCutObjectPath(
  folder: string,
  productId: number,
  cut: string,
  ext: 'png' | 'webp' = 'png',
): string {
  return `${folder}/detail_${productId}_${cut}_big.${ext}`
}

export function adminProductCutPublicUrl(
  folder: string,
  productId: number,
  cut: string,
  ext: 'png' | 'webp' = 'png',
): string {
  const base = storageBaseUrl()
  const objectPath = adminProductCutObjectPath(folder, productId, cut, ext)
  if (!base) return `/assets/figma/products/${objectPath}`
  return `${base}/storage/v1/object/public/products/${encodeURIComponent(folder)}/${encodeURIComponent(`detail_${productId}_${cut}_big.${ext}`)}`
}

/** Uploads a PDP cut image to Supabase Storage (`products/{folder}/detail_{id}_{cut}_big.{ext}`). */
export async function uploadAdminProductCutImage(
  file: File,
  folder: string,
  productId: number,
  cut: string,
): Promise<{ url: string; usedLocalFallback: boolean }> {
  const ext = resolveExtension(file)
  const objectPath = adminProductCutObjectPath(folder, productId, cut, ext)
  const dataUrl = await readFileAsDataUrl(file)

  const { error } = await supabase.storage.from('products').upload(objectPath, file, {
    upsert: true,
    contentType: file.type || (ext === 'webp' ? 'image/webp' : 'image/png'),
  })

  if (!error) {
    return { url: adminProductCutPublicUrl(folder, productId, cut, ext), usedLocalFallback: false }
  }

  return { url: dataUrl, usedLocalFallback: true }
}

/** Uploads all pending cut files for a product. */
export async function uploadAdminProductCutImages(
  filesByCut: Partial<Record<(typeof PRODUCT_PDP_CUTS)[number], File>>,
  folder: string,
  productId: number,
): Promise<Partial<Record<(typeof PRODUCT_PDP_CUTS)[number], string>>> {
  const urls: Partial<Record<(typeof PRODUCT_PDP_CUTS)[number], string>> = {}

  for (const cut of PRODUCT_PDP_CUTS) {
    const file = filesByCut[cut]
    if (!file) continue
    const result = await uploadAdminProductCutImage(file, folder, productId, cut)
    urls[cut] = result.url
  }

  return urls
}
