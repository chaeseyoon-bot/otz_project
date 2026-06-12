import { ARCHIVE_LOOKBOOK_ITEMS, type ArchiveLookbookItem, type ArchiveSeasonId } from '../data/archiveLookbooks'
import { loadAdminArchiveDetailConfig } from './adminArchiveDetailConfig'

/** List thumbnails — admin override merged over static manifest. */
export function resolveArchiveLookbookItems(): ArchiveLookbookItem[] {
  const admin = loadAdminArchiveDetailConfig()

  return ARCHIVE_LOOKBOOK_ITEMS.map((item) => {
    const entry = admin.lookbooks.find((lookbook) => lookbook.id === item.id)
    const thumbnailUrl = entry?.thumbnailUrl?.trim()
    if (thumbnailUrl) {
      return { ...item, image: thumbnailUrl }
    }
    return item
  })
}

export function filterResolvedArchiveLookbooks(season: ArchiveSeasonId): ArchiveLookbookItem[] {
  const items = resolveArchiveLookbookItems()
  if (season === 'all') return items
  return items.filter((item) => item.seasons.includes(season))
}
