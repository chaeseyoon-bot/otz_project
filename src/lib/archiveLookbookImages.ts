import {
  getArchiveLookbookDetail,
  type ArchiveLookbookDetail,
} from '../data/archiveLookbookDetails'
import { ARCHIVE_LOOKBOOK_ITEMS } from '../data/archiveLookbooks'

export const LOOKBOOK_HOME_IMAGE_SLOTS = 7
export const LOOKBOOK_HOME_MOBILE_VISIBLE = 3

export function getLatestArchiveLookbookId(): string {
  return ARCHIVE_LOOKBOOK_ITEMS[0]?.id ?? 'archive-01'
}

function padImageUrls(urls: string[], count: number, fallback: string): string[] {
  const result = urls.filter(Boolean)
  if (!result.length && fallback) result.push(fallback)
  while (result.length < count) {
    result.push(result[result.length - 1] ?? fallback)
  }
  return result.slice(0, count)
}

/** PC editorial layout — hero + grid (up to 7 images). */
export function extractPcImageUrlsFromDetail(detail: ArchiveLookbookDetail): string[] {
  const urls: string[] = []
  for (const block of detail.pcBlocks) {
    if (block.type === 'full') {
      urls.push(block.image.src)
    } else {
      urls.push(block.left.src, block.right.src)
    }
  }
  const fallback =
    detail.mobileImages[0]?.src ??
    urls[0] ??
    ARCHIVE_LOOKBOOK_ITEMS.find((item) => item.id === detail.lookbookId)?.image ??
    ''
  return padImageUrls(urls, LOOKBOOK_HOME_IMAGE_SLOTS, fallback)
}

/** Mobile home mosaic uses the first 3 images. */
export function extractMobileImageUrlsFromDetail(detail: ArchiveLookbookDetail): string[] {
  const fromMobile = detail.mobileImages.map((image) => image.src)
  const fromPc = extractPcImageUrlsFromDetail(detail)
  const source = fromMobile.length >= LOOKBOOK_HOME_MOBILE_VISIBLE ? fromMobile : fromPc
  const fallback = source[0] ?? fromPc[0] ?? ''
  return padImageUrls(source, LOOKBOOK_HOME_MOBILE_VISIBLE, fallback)
}

/** Unified 7-slot defaults for home lookbook (MO uses slots 0–2, PC uses 0–6). */
export function getDefaultLookbookSlotUrls(lookbookId: string): string[] {
  const detail = getArchiveLookbookDetail(lookbookId)
  if (!detail) {
    const item = ARCHIVE_LOOKBOOK_ITEMS.find((entry) => entry.id === lookbookId)
    const fallback = item?.image ?? ''
    return padImageUrls(fallback ? [fallback] : [], LOOKBOOK_HOME_IMAGE_SLOTS, fallback)
  }
  return extractPcImageUrlsFromDetail(detail)
}

export function resolveArchiveLookbookId(lookbookId: string | null | undefined): string {
  if (lookbookId && ARCHIVE_LOOKBOOK_ITEMS.some((item) => item.id === lookbookId)) {
    return lookbookId
  }
  return getLatestArchiveLookbookId()
}
