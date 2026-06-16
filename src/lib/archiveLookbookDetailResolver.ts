import {
  buildPcBlocksFromRows,
  getStaticArchiveLookbookDetail,
  type ArchiveLookbookDetail,
  type ArchiveLookbookDetailImage,
} from '../data/archiveLookbookDetails'
import { ARCHIVE_LOOKBOOK_ITEMS } from '../data/archiveLookbooks'
import {
  type AdminArchiveLookbookEntry,
  archiveEntryHasDetailData,
  archiveEntryHasPublishableListData,
  getEffectiveArchiveDetailConfig,
  isPublishableArchiveImageUrl,
} from './adminArchiveDetailConfig'

function toDetailImage(ref: { imageUrl: string | null }): ArchiveLookbookDetailImage | null {
  const src = ref.imageUrl?.trim()
  if (!src || !isPublishableArchiveImageUrl(src)) return null
  return { src }
}

function flattenRowImages(entry: AdminArchiveLookbookEntry): ArchiveLookbookDetailImage[] {
  const images: ArchiveLookbookDetailImage[] = []

  for (const row of entry.detailRows) {
    for (let index = 0; index < row.columnsPerRow; index += 1) {
      const image = toDetailImage(row.images[index] ?? { imageUrl: null })
      if (image) images.push(image)
    }
  }

  return images
}

function resolveFromAdminEntry(entry: AdminArchiveLookbookEntry): ArchiveLookbookDetail {
  const listItem = ARCHIVE_LOOKBOOK_ITEMS.find((item) => item.id === entry.id)
  const staticDetail = getStaticArchiveLookbookDetail(entry.id)
  const title = entry.title.trim() || staticDetail?.title || listItem?.title || 'ARCHIVE'

  const rowInputs = entry.detailRows
    .map((row) => {
      const images = row.images
        .slice(0, row.columnsPerRow)
        .map(toDetailImage)
        .filter((image): image is ArchiveLookbookDetailImage => image != null)

      if (images.length !== row.columnsPerRow) return null

      return { columnsPerRow: row.columnsPerRow, images }
    })
    .filter((row): row is NonNullable<typeof row> => row != null)

  const mobileImages = flattenRowImages(entry)

  const imagesForDetail = mobileImages.length
    ? mobileImages
    : entry.thumbnailUrl?.trim()
      ? [{ src: entry.thumbnailUrl.trim() }]
      : (staticDetail?.mobileImages ?? (listItem ? [{ src: listItem.image }] : []))

  const introHeading = entry.introHeading?.trim() ?? ''
  const introBody = entry.introBody?.trim() ?? ''
  const intro =
    introHeading || introBody ? { heading: introHeading, body: introBody } : null

  const firstRowImageCount =
    rowInputs[0]?.images.length ?? (imagesForDetail.length > 0 ? 1 : 0)

  return {
    lookbookId: entry.id,
    title,
    intro,
    firstRowImageCount,
    mobileImages: imagesForDetail,
    pcBlocks: rowInputs.length ? buildPcBlocksFromRows(rowInputs) : [],
  }
}

/** Resolves archive lookbook detail — admin overrides merged over static presets. */
export function getArchiveLookbookDetail(lookbookId: string): ArchiveLookbookDetail | undefined {
  const admin = getEffectiveArchiveDetailConfig()
  const entry = admin.lookbooks.find((item) => item.id === lookbookId)

  if (entry && archiveEntryHasDetailData(entry) && archiveEntryHasPublishableListData(entry)) {
    return resolveFromAdminEntry(entry)
  }

  return getStaticArchiveLookbookDetail(lookbookId)
}
