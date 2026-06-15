import type { ArchiveLookbookDetail } from '../data/archiveLookbookDetails'
import { getArchiveLookbookDetail } from './archiveLookbookDetailResolver'
import { getLatestArchiveLookbookIdFromConfig, loadAdminArchiveDetailConfig } from './adminArchiveDetailConfig'
import { resolveArchiveLookbookItems } from './archiveLookbooksResolver'

export const LOOKBOOK_HOME_IMAGE_SLOTS = 7
export const LOOKBOOK_HOME_MOBILE_VISIBLE = 3

export function getLatestArchiveLookbookId(): string {
  return (
    getLatestArchiveLookbookIdFromConfig() ??
    resolveArchiveLookbookItems()[0]?.id ??
    'archive-01'
  )
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
    } else if (block.type === 'split') {
      urls.push(block.left.src, block.right.src)
    } else {
      urls.push(block.left.src, block.center.src, block.right.src)
    }
  }
  const fallback =
    detail.mobileImages[0]?.src ??
    urls[0] ??
    resolveArchiveLookbookItems().find((item) => item.id === detail.lookbookId)?.image ??
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
    const item = resolveArchiveLookbookItems().find((entry) => entry.id === lookbookId)
    const fallback = item?.image ?? ''
    return padImageUrls(fallback ? [fallback] : [], LOOKBOOK_HOME_IMAGE_SLOTS, fallback)
  }
  return extractPcImageUrlsFromDetail(detail)
}

export function resolveArchiveLookbookId(lookbookId: string | null | undefined): string {
  const items = resolveArchiveLookbookItems()
  if (lookbookId && items.some((item) => item.id === lookbookId)) {
    return lookbookId
  }
  if (lookbookId && loadAdminArchiveDetailConfig().lookbooks.some((entry) => entry.id === lookbookId)) {
    return lookbookId
  }
  return getLatestArchiveLookbookId()
}
