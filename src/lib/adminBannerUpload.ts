import { HOME_BANNERS_BUCKET, homeBannerAsset } from './homeBannersAssetUrl'
import { supabase } from './supabase'

function resolveExtension(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext && ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) {
    return ext === 'jpeg' ? 'jpg' : ext
  }
  return 'png'
}

function isDuplicateStorageObjectError(message: string, statusCode?: string | number): boolean {
  return (
    statusCode === 409 ||
    statusCode === '409' ||
    /already exists|duplicate/i.test(message)
  )
}

function formatBannerUploadError(message: string): Error {
  if (/bucket not found/i.test(message)) {
    return new Error(
      'Storage 버킷 "home_banners"를 찾을 수 없습니다. Supabase Dashboard → Storage에서 ' +
        'public 버킷 이름이 정확히 home_banners 인지 확인하고, ' +
        'SQL Editor에서 `scripts/sql/admin-storage-policies.sql`을 실행해 주세요.',
    )
  }
  if (/row-level security/i.test(message)) {
    return new Error(
      '이미지 업로드 권한이 없습니다. Supabase → SQL Editor에서 ' +
        '`scripts/sql/admin-storage-policies.sql`을 실행해 주세요.',
    )
  }
  if (isDuplicateStorageObjectError(message)) {
    return new Error(
      '같은 위치에 이미지가 이미 있습니다. Supabase Storage DELETE 정책이 없으면 ' +
        '기존 파일을 교체할 수 없습니다. SQL Editor에서 home_banners DELETE 정책을 추가해 주세요.',
    )
  }
  return new Error(`이미지 업로드 실패: ${message}`)
}

/** Maps admin upload slot keys to versioned `home_banners/admin/` paths (no overwrite of seed assets). */
export function resolveAdminBannerObjectPath(folder: string, file: File): string {
  const ext = resolveExtension(file)
  const safeFolder = folder.replace(/[^a-zA-Z0-9-_]/g, '_')
  return `admin/${safeFolder}_${Date.now()}.${ext}`
}

async function uploadMainImageObject(objectPath: string, file: File, contentType: string): Promise<void> {
  const bucket = supabase.storage.from(HOME_BANNERS_BUCKET)

  const uploadOnce = (upsert: boolean) =>
    bucket.upload(objectPath, file, { upsert, contentType })

  const first = await uploadOnce(false)
  if (!first.error) return

  if (!isDuplicateStorageObjectError(first.error.message, first.error.statusCode)) {
    throw formatBannerUploadError(first.error.message)
  }

  const base = objectPath.replace(/\.[^.]+$/, '')
  const siblingPaths = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].map((e) => `${base}.${e}`)

  const { error: removeError } = await bucket.remove(siblingPaths)
  if (removeError) {
    throw new Error('기존 이미지를 교체할 수 없습니다. Supabase Storage DELETE 정책을 확인해 주세요.')
  }

  const retry = await uploadOnce(false)
  if (!retry.error) return

  if (!isDuplicateStorageObjectError(retry.error.message, retry.error.statusCode)) {
    throw formatBannerUploadError(retry.error.message)
  }

  const upsertAttempt = await uploadOnce(true)
  if (!upsertAttempt.error) return

  throw formatBannerUploadError(first.error.message)
}

/** Uploads a home main image to Supabase Storage (`home_banners` bucket). */
export async function uploadAdminBannerImage(
  file: File,
  folder: string,
): Promise<{ url: string; fileName: string; usedLocalFallback: boolean }> {
  const objectPath = resolveAdminBannerObjectPath(folder, file)
  const contentType = file.type || `image/${resolveExtension(file)}`

  await uploadMainImageObject(objectPath, file, contentType)
  const url = `${homeBannerAsset(objectPath)}?v=${Date.now()}`
  return { url, fileName: file.name, usedLocalFallback: false }
}
