import localManifest from '../data/archiveLocalAssets.json'
import type { ArchiveLookbookDetail, ArchiveLookbookDetailImage } from '../data/archiveLookbookDetails'
import type { ArchiveLookbookItem } from '../data/archiveLookbooks'
import { archiveAsset } from './archiveAssetUrl'

export interface ArchiveLocalLookbookAssets {
  thumbnail: string
  images: string[]
}

const DEFAULT_ASPECT_RATIO = 460 / 575

function parseArchiveIdNumber(id: string): number {
  const match = /^archive-(\d+)$/.exec(id)
  return match ? Number(match[1]) : 0
}

function toDetailImage(file: string): ArchiveLookbookDetailImage {
  return { src: archiveAsset(file) }
}

/** Sorted archive-13 … archive-01 (newest id first). */
export function getLocalArchiveLookbookIds(): string[] {
  return Object.keys(localManifest as Record<string, ArchiveLocalLookbookAssets>).sort(
    (a, b) => parseArchiveIdNumber(b) - parseArchiveIdNumber(a),
  )
}

export function getLocalArchiveLookbookAssets(lookbookId: string): ArchiveLocalLookbookAssets | undefined {
  return (localManifest as Record<string, ArchiveLocalLookbookAssets>)[lookbookId]
}

export function buildLocalArchiveLookbookItems(): ArchiveLookbookItem[] {
  return getLocalArchiveLookbookIds()
    .map((id) => {
      const assets = getLocalArchiveLookbookAssets(id)
      if (!assets?.thumbnail) return null
      return {
        id,
        image: archiveAsset(assets.thumbnail),
        aspectRatio: DEFAULT_ASPECT_RATIO,
        seasons: ['all'],
      }
    })
    .filter((item): item is ArchiveLookbookItem => item != null)
}

export function getLocalArchiveLookbookDetail(lookbookId: string): ArchiveLookbookDetail | undefined {
  const assets = getLocalArchiveLookbookAssets(lookbookId)
  if (!assets?.images.length) return undefined

  const mobileImages = assets.images.map(toDetailImage)
  const pcBlocks = mobileImages.map((image) => ({ type: 'full' as const, image }))

  return {
    lookbookId,
    title: 'ARCHIVE',
    intro: null,
    firstRowImageCount: 1,
    mobileImages,
    pcBlocks,
  }
}
