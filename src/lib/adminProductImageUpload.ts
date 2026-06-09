import { supabase } from './supabase'
import { PRODUCT_PDP_CUTS } from './productImage'

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
): string {
  const objectPath = adminProductCutObjectPath(folder, productId, cut, ext)
  const base = storageBaseUrl()
  if (!base) return `/assets/figma/products/${objectPath}`

  const { data } = supabase.storage.from('products').getPublicUrl(objectPath)
  return data.publicUrl
}

function isDuplicateStorageObjectError(message: string, statusCode?: string | number): boolean {
  return (
    statusCode === 409 ||
    statusCode === '409' ||
    /already exists|duplicate/i.test(message)
  )
}

function formatStorageUploadError(cut: string, message: string): Error {
  if (/row-level security/i.test(message)) {
    return new Error(
      `이미지 업로드 권한이 없습니다 (컷 ${cut}). Supabase → SQL Editor에서 ` +
        '`scripts/sql/admin-storage-policies.sql`을 실행해 주세요. ' +
        '(INSERT 권한은 있어도 upsert/덮어쓰기는 추가 정책이 필요할 수 있습니다.)',
    )
  }
  if (isDuplicateStorageObjectError(message)) {
    return new Error(
      `같은 위치에 이미지가 이미 있습니다 (컷 ${cut}). ` +
        `이전 등록 시도에서 이미지만 Storage에 올라간 경우입니다. ` +
        `Supabase → Storage → products 버킷에서 해당 파일을 삭제하거나, ` +
        `SQL Editor에서 admin-storage-policies.sql의 DELETE 정책까지 실행한 뒤 다시 시도해 주세요.`,
    )
  }
  return new Error(`이미지 업로드 실패 (컷 ${cut}): ${message}`)
}

export interface UploadProductCutOptions {
  /**
   * When true (default for new registration), an existing object at the same path
   * is treated as success so a retried save can continue after a partial upload.
   */
  useExistingOnDuplicate?: boolean
}

/** Upload without upsert — works with INSERT-only Storage policies. Overwrites via remove + retry. */
async function uploadProductCutObject(
  objectPath: string,
  file: File,
  contentType: string,
  cut: string,
  options: UploadProductCutOptions = {},
): Promise<void> {
  const bucket = supabase.storage.from('products')
  const useExistingOnDuplicate = options.useExistingOnDuplicate ?? false

  const uploadOnce = (upsert: boolean) =>
    bucket.upload(objectPath, file, { upsert, contentType })

  const first = await uploadOnce(false)
  if (!first.error) return

  if (!isDuplicateStorageObjectError(first.error.message, first.error.statusCode)) {
    throw formatStorageUploadError(cut, first.error.message)
  }

  const siblingPath = objectPath.endsWith('.webp')
    ? objectPath.replace(/\.webp$/, '.png')
    : objectPath.replace(/\.png$/, '.webp')

  const { data: removed, error: removeError } = await bucket.remove([objectPath, siblingPath])
  if (removeError) {
    throw new Error(
      `기존 이미지를 교체할 수 없습니다 (컷 ${cut}). Supabase Storage DELETE 정책을 확인해 주세요.`,
    )
  }

  if ((removed?.length ?? 0) > 0) {
    const retry = await uploadOnce(false)
    if (!retry.error) return
    if (!isDuplicateStorageObjectError(retry.error.message, retry.error.statusCode)) {
      throw formatStorageUploadError(cut, retry.error.message)
    }
  }

  const upsertAttempt = await uploadOnce(true)
  if (!upsertAttempt.error) return

  if (useExistingOnDuplicate) {
    return
  }

  throw formatStorageUploadError(cut, first.error.message)
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
    return { url: adminProductCutPublicUrl(folder, productId, cut, ext), usedLocalFallback: false }
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
  options: UploadProductCutOptions = {},
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
      options,
    )

    urls[cut] = adminProductCutPublicUrl(folder, productId, cut, ext)
  }

  return urls
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
