import localManifest from '../data/archiveLocalAssets.json'
import { archiveAsset } from './archiveAssetUrl'
import type { MergeArchiveLookbookFallback } from './adminArchiveDetailConfig'

interface ArchiveLocalLookbookAssets {
  thumbnail: string
  images: string[]
}

/** Durable `/assets/figma/ARCHIVE/...` URLs for merge/recovery. */
export function buildArchiveLocalFallbacksById(): Record<string, MergeArchiveLookbookFallback> {
  const manifest = localManifest as Record<string, ArchiveLocalLookbookAssets>
  const result: Record<string, MergeArchiveLookbookFallback> = {}

  for (const [id, assets] of Object.entries(manifest)) {
    result[id] = {
      imageUrls: assets.images.map((file) => archiveAsset(file)),
      fileNames: assets.images,
    }
  }

  return result
}
