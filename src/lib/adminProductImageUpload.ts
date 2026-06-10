import { supabase } from './supabase'
import { PRODUCT_PDP_CUTS, withProductImageCacheBust } from './productImage'

export type ProductPdpCut = (typeof PRODUCT_PDP_CUTS)[number]

/** PLP thumbnail priority when deriving `products.image_url`. */
export const PRIMARY_PRODUCT_IMAGE_CUT_PRIORITY: readonly ProductPdpCut[] = [
  '03',
  '01',
  '07',
  '02',
  '04',
  '05',
  '06',
  '08',
]

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
  cacheVersion?: string | null,
): string {
  const objectPath = adminProductCutObjectPath(folder, productId, cut, ext)
  const base = storageBaseUrl()
  if (!base) return `/assets/figma/products/${objectPath}`

  const { data } = supabase.storage.from('products').getPublicUrl(objectPath)
  return withProductImageCacheBust(data.publicUrl, cacheVersion)
}

function isDuplicateStorageObjectError(message: string, statusCode?: string | number): boolean {
  return (
    statusCode === 409 ||
    statusCode === '409' ||
    /already exists|duplicate/i.test(message)
  )
}

function isStorageRlsError(message: string): boolean {
  return /row-level security/i.test(message)
}

function formatStorageUploadError(cut: string, message: string, context?: string): Error {
  if (isStorageRlsError(message)) {
    return new Error(
      `이미지 업로드 권한이 없습니다 (컷 ${cut}${context ? ` · ${context}` : ''}). ` +
        'Supabase Dashboard → SQL Editor에서 `scripts/sql/admin-storage-policies.sql` 전체를 다시 실행해 주세요. ' +
        '특히 products 버킷에 UPDATE 정책(`products_storage_update_public`)이 생성됐는지 확인하세요. ' +
        '확인 쿼리: SELECT policyname, cmd FROM pg_policies WHERE tablename = \'objects\' AND policyname LIKE \'%products_storage%\';',
    )
  }
  if (isDuplicateStorageObjectError(message)) {
    return new Error(
      `같은 경로에 이미지가 이미 있습니다 (컷 ${cut}). Storage DELETE 정책이 없어 교체하지 못했습니다. ` +
        '`scripts/sql/admin-storage-policies.sql`을 실행한 뒤 다시 시도해 주세요.',
    )
  }
  return new Error(`이미지 업로드 실패 (컷 ${cut}): ${message}`)
}

/**
 * Upload with upsert; if Storage RLS blocks UPDATE, fall back to remove + insert.
 * Requires INSERT + UPDATE policies for upsert, and DELETE for the fallback path.
 */
async function uploadProductCutObject(
  objectPath: string,
  file: File,
  contentType: string,
  cut: string,
): Promise<void> {
  const bucket = supabase.storage.from('products')

  const upsertResult = await bucket.upload(objectPath, file, { upsert: true, contentType })
  if (!upsertResult.error) return

  const shouldFallback =
    isStorageRlsError(upsertResult.error.message) ||
    isDuplicateStorageObjectError(upsertResult.error.message, upsertResult.error.statusCode)

  if (!shouldFallback) {
    throw formatStorageUploadError(cut, upsertResult.error.message, 'upsert')
  }

  const siblingPath = objectPath.endsWith('.webp')
    ? objectPath.replace(/\.webp$/, '.png')
    : objectPath.replace(/\.png$/, '.webp')

  const { data: removed, error: removeError } = await bucket.remove([objectPath, siblingPath])
  if (removeError) {
    throw formatStorageUploadError(cut, removeError.message, 'remove')
  }

  if ((removed?.length ?? 0) > 0) {
    const retry = await bucket.upload(objectPath, file, { upsert: false, contentType })
    if (!retry.error) return
    throw formatStorageUploadError(cut, retry.error.message, 'retry-after-remove')
  }

  throw formatStorageUploadError(cut, upsertResult.error.message, 'upsert-blocked-no-delete')
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

  try {
    await uploadProductCutObject(
      objectPath,
      file,
      file.type || (ext === 'webp' ? 'image/webp' : 'image/png'),
      cut,
    )
    const url = adminProductCutPublicUrl(folder, productId, cut, ext, String(Date.now()))
    return { url, usedLocalFallback: false }
  } catch {
    // fall through to local preview data URL
  }

  return { url: dataUrl, usedLocalFallback: true }
}

/** Uploads all pending cut files for a product. */
export async function uploadAdminProductCutImages(
  filesByCut: Partial<Record<ProductPdpCut, File>>,
  folder: string,
  productId: number,
): Promise<Partial<Record<ProductPdpCut, string>>> {
  const urls: Partial<Record<ProductPdpCut, string>> = {}

  for (const cut of PRODUCT_PDP_CUTS) {
    const file = filesByCut[cut]
    if (!file) continue
    const result = await uploadAdminProductCutImage(file, folder, productId, cut)
    urls[cut] = result.url
  }

  return urls
}

/**
 * Uploads pending cut files to Supabase Storage (`products` bucket) before DB insert.
 * Throws on storage errors — no local data-URL fallback.
 */
export async function uploadAdminProductCutImagesStrict(
  filesByCut: Partial<Record<ProductPdpCut, File>>,
  folder: string,
  productId: number,
): Promise<Partial<Record<ProductPdpCut, string>>> {
  const urls: Partial<Record<ProductPdpCut, string>> = {}

  for (const cut of PRODUCT_PDP_CUTS) {
    const file = filesByCut[cut]
    if (!file) continue

    const ext = resolveExtension(file)
    const objectPath = adminProductCutObjectPath(folder, productId, cut, ext)

    await uploadProductCutObject(
      objectPath,
      file,
      file.type || (ext === 'webp' ? 'image/webp' : 'image/png'),
      cut,
    )

    urls[cut] = adminProductCutPublicUrl(folder, productId, cut, ext, String(Date.now()))
  }

  return urls
}

export function adminProductColorSwatchObjectPath(
  folder: string,
  productId: number,
  ext: 'png' | 'webp' = 'png',
): string {
  return `${folder}/detail_${productId}_swatch.${ext}`
}

export function adminProductColorSwatchPublicUrl(
  folder: string,
  productId: number,
  ext: 'png' | 'webp' = 'png',
  cacheVersion?: string | null,
): string {
  const objectPath = adminProductColorSwatchObjectPath(folder, productId, ext)
  const base = storageBaseUrl()
  if (!base) return `/assets/figma/products/${objectPath}`

  const { data } = supabase.storage.from('products').getPublicUrl(objectPath)
  return withProductImageCacheBust(data.publicUrl, cacheVersion)
}

/** Uploads optional color texture swatch for PLP filter chips. */
export async function uploadAdminProductColorSwatchStrict(
  file: File,
  folder: string,
  productId: number,
): Promise<string> {
  const ext = resolveExtension(file)
  const objectPath = adminProductColorSwatchObjectPath(folder, productId, ext)

  await uploadProductCutObject(
    objectPath,
    file,
    file.type || (ext === 'webp' ? 'image/webp' : 'image/png'),
    'swatch',
  )

  return adminProductColorSwatchPublicUrl(folder, productId, ext, String(Date.now()))
}

/** Picks the canonical public URL to store in `products.image_url`. */
export function resolvePrimaryProductImageUrl(
  uploadedUrls: Partial<Record<ProductPdpCut, string>>,
  folder: string,
  productId: number,
  fallbackImageUrl?: string | null,
): string {
  for (const cut of PRIMARY_PRODUCT_IMAGE_CUT_PRIORITY) {
    const url = uploadedUrls[cut]
    if (url?.startsWith('http')) return url
  }

  const trimmedFallback = fallbackImageUrl?.trim()
  if (trimmedFallback) return trimmedFallback

  return adminProductCutPublicUrl(folder, productId, '03')
}
