import { uploadAdminBannerImage } from './adminBannerUpload'
import type { AdminArchiveLookbookEntry } from './adminArchiveDetailConfig'
import { getRowSlotCount } from './archiveDetailLayout'
import { createEmptyAdminArchiveImageRef } from './adminArchiveDetailConfig'

export function dataUrlToFile(dataUrl: string, fileName: string): File {
  const [header, base64] = dataUrl.split(',')
  if (!base64) throw new Error('INVALID_DATA_URL')

  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }

  return new File([bytes], fileName || 'image.png', { type: mime })
}

export function isStoredBannerImageUrl(url: string | null | undefined): boolean {
  const normalized = url?.trim()
  if (!normalized) return false
  if (normalized.startsWith('data:') || normalized.startsWith('blob:')) return false
  return /\/storage\/v1\/object\/public\/home_banners\//i.test(normalized)
}

/** Supabase Storage URL or durable public path — never blob/data. */
export function isDurableArchiveImageUrl(url: string | null | undefined): boolean {
  const normalized = url?.trim()
  if (!normalized) return false
  if (normalized.startsWith('data:') || normalized.startsWith('blob:')) return false
  return normalized.startsWith('http') || normalized.startsWith('/')
}

export async function uploadArchiveImageSlot(
  file: File,
  storageKey: string,
): Promise<{ url: string; fileName: string }> {
  const uploaded = await uploadAdminBannerImage(file, storageKey)
  return { url: uploaded.url, fileName: uploaded.fileName }
}

/** Upload multiple files in parallel — each with its own storage key. */
export async function uploadArchiveImageBatch(
  items: Array<{ file: File; storageKey: string }>,
): Promise<Array<{ url: string; fileName: string }>> {
  return Promise.all(
    items.map(async ({ file, storageKey }) => uploadArchiveImageSlot(file, storageKey)),
  )
}

function resolveUploadFile(
  imageUrl: string | null,
  imageFileName: string | null,
  pendingFile: File | undefined,
  fallbackName: string,
): File {
  if (pendingFile) return pendingFile
  if (imageUrl?.startsWith('data:')) {
    return dataUrlToFile(imageUrl, imageFileName || fallbackName)
  }
  throw new Error('TEMP_IMAGE_RESELECT')
}

/**
 * Uploads every thumbnail / detail image for a lookbook entry to Supabase Storage.
 * Pending local files (selected before save) and legacy data URLs are uploaded here.
 */
export async function uploadArchiveLookbookImages(
  entry: AdminArchiveLookbookEntry,
  pendingFiles: Map<string, File>,
): Promise<AdminArchiveLookbookEntry> {
  const thumbKey = `archive-thumb-${entry.id}`
  let thumbnailUrl = entry.thumbnailUrl
  let thumbnailFileName = entry.thumbnailFileName

  if (!isDurableArchiveImageUrl(thumbnailUrl)) {
    try {
      const file = resolveUploadFile(thumbnailUrl, thumbnailFileName, pendingFiles.get(thumbKey), 'thumbnail.png')
      const uploaded = await uploadAdminBannerImage(file, thumbKey)
      thumbnailUrl = uploaded.url
      thumbnailFileName = uploaded.fileName
      pendingFiles.delete(thumbKey)
    } catch (error) {
      if (error instanceof Error && error.message === 'TEMP_IMAGE_RESELECT') {
        throw new Error('리스트 썸네일을 다시 선택한 뒤 저장해 주세요.')
      }
      throw error
    }
  }

  const detailRows = await Promise.all(
    entry.detailRows.map(async (row, rowIndex) => {
      const images = await Promise.all(
        Array.from({ length: getRowSlotCount(row) }, async (_, slotIndex) => {
          const current = row.images[slotIndex] ?? createEmptyAdminArchiveImageRef()
          const slotKey = `archive-row-${entry.id}-${row.id}-${slotIndex}`
          let imageUrl = current.imageUrl
          let imageFileName = current.imageFileName

          if (!imageUrl?.trim()) {
            return current
          }

          if (!isDurableArchiveImageUrl(imageUrl)) {
            try {
              const file = resolveUploadFile(
                imageUrl,
                imageFileName,
                pendingFiles.get(slotKey),
                `row-${rowIndex + 1}-slot-${slotIndex + 1}.png`,
              )
              const uploaded = await uploadAdminBannerImage(file, slotKey)
              imageUrl = uploaded.url
              imageFileName = uploaded.fileName
              pendingFiles.delete(slotKey)
            } catch (error) {
              if (error instanceof Error && error.message === 'TEMP_IMAGE_RESELECT') {
                throw new Error(`${rowIndex + 1}행 이미지를 다시 선택한 뒤 저장해 주세요.`)
              }
              throw error
            }
          }

          return { imageUrl, imageFileName }
        }),
      )

      return { ...row, images }
    }),
  )

  return {
    ...entry,
    thumbnailUrl,
    thumbnailFileName,
    detailRows,
  }
}
