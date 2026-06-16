import {
  ARCHIVE_LOOKBOOK_ITEMS,
  type ArchiveLookbookItem,
  type ArchiveSeasonId,
} from '../data/archiveLookbooks'
import {
  archiveEntryHasPublishableListData,
  getEffectiveArchiveDetailConfig,
  sortArchiveLookbooksNewestFirst,
} from './adminArchiveDetailConfig'
import { archiveItemMatchesSeason, parseArchiveSeasonFromTitle } from './archiveSeasonFilters'

function staticItemForId(id: string): ArchiveLookbookItem | undefined {
  return ARCHIVE_LOOKBOOK_ITEMS.find((item) => item.id === id)
}

function adminEntryToListItem(entry: {
  id: string
  title: string
  seasons: ArchiveSeasonId[]
  aspectRatio: number
  thumbnailUrl: string | null
}): ArchiveLookbookItem | null {
  const thumbnail = entry.thumbnailUrl?.trim()
  if (!thumbnail) return null

  const staticItem = staticItemForId(entry.id)
  const title = entry.title.trim() || staticItem?.title || ''
  const fromTitle = title ? parseArchiveSeasonFromTitle(title) : null
  const seasons: ArchiveSeasonId[] = fromTitle
    ? ['all', fromTitle.id]
    : entry.seasons.length
      ? entry.seasons
      : (staticItem?.seasons ?? ['all'])

  return {
    id: entry.id,
    image: thumbnail,
    aspectRatio: entry.aspectRatio || staticItem?.aspectRatio || 460 / 575,
    seasons,
    title: title || undefined,
  }
}

/** List thumbnails — admin entries (newest first), else static Figma manifest. */
export function resolveArchiveLookbookItems(): ArchiveLookbookItem[] {
  const admin = getEffectiveArchiveDetailConfig()
  const fromAdmin = sortArchiveLookbooksNewestFirst(admin.lookbooks)
    .filter(archiveEntryHasPublishableListData)
    .map(adminEntryToListItem)
    .filter((item): item is ArchiveLookbookItem => item != null)

  if (fromAdmin.length) return fromAdmin
  return ARCHIVE_LOOKBOOK_ITEMS
}

export function filterResolvedArchiveLookbooks(
  season: ArchiveSeasonId,
  items: ArchiveLookbookItem[] = resolveArchiveLookbookItems(),
): ArchiveLookbookItem[] {
  if (season === 'all') return items
  return items.filter((item) => archiveItemMatchesSeason(item, season))
}
