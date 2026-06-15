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
  loadAdminArchiveDetailConfig,
} from './adminArchiveDetailConfig'

function toDetailImage(ref: { imageUrl: string | null }): ArchiveLookbookDetailImage | null {
  const src = ref.imageUrl?.trim()
  if (!src) return null
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

  return {
    lookbookId: entry.id,
    title,
    mobileImages: imagesForDetail,
    pcBlocks: rowInputs.length ? buildPcBlocksFromRows(rowInputs) : [],
  }
}

/** Resolves archive lookbook detail — admin overrides merged over static presets. */
export function getArchiveLookbookDetail(lookbookId: string): ArchiveLookbookDetail | undefined {
  const admin = loadAdminArchiveDetailConfig()
  const entry = admin.lookbooks.find((item) => item.id === lookbookId)

  if (entry && archiveEntryHasDetailData(entry)) {
    return resolveFromAdminEntry(entry)
  }

  return getStaticArchiveLookbookDetail(lookbookId)
}
