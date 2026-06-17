import {
  ARCHIVE_LOOKBOOK_ITEMS,
  type ArchiveLookbookItem,
  type ArchiveSeasonId,
} from '../data/archiveLookbooks'
import {
  archiveEntryHasPublishableListData,
  getEffectiveArchiveDetailConfig,
  isPublishableArchiveImageUrl,
  type AdminArchiveLookbookEntry,
} from './adminArchiveDetailConfig'
import { buildLocalArchiveLookbookItems } from './archiveLocalAssets'
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

function resolveAdminListItem(
  entry: AdminArchiveLookbookEntry,
  localById: Map<string, ArchiveLookbookItem>,
): ArchiveLookbookItem | null {
  const local = localById.get(entry.id)
  const thumbnailUrl = isPublishableArchiveImageUrl(entry.thumbnailUrl)
    ? entry.thumbnailUrl!.trim()
    : local?.image

  const adminItem = adminEntryToListItem({ ...entry, thumbnailUrl: thumbnailUrl ?? null })
  return adminItem ?? local ?? null
}

/** List thumbnails — order follows admin config array (sidebar order). */
export function resolveArchiveLookbookItems(): ArchiveLookbookItem[] {
  const admin = getEffectiveArchiveDetailConfig()
  const localItems = buildLocalArchiveLookbookItems()
  const localById = new Map(localItems.map((item) => [item.id, item]))

  if (admin.lookbooks.length) {
    const fromAdmin = admin.lookbooks
      .map((entry) => resolveAdminListItem(entry, localById))
      .filter((item): item is ArchiveLookbookItem => item != null)

    if (fromAdmin.length) return fromAdmin
  }

  if (localItems.length) return localItems
  return ARCHIVE_LOOKBOOK_ITEMS
}

export function filterResolvedArchiveLookbooks(
  season: ArchiveSeasonId,
  items: ArchiveLookbookItem[] = resolveArchiveLookbookItems(),
): ArchiveLookbookItem[] {
  if (season === 'all') return items
  return items.filter((item) => archiveItemMatchesSeason(item, season))
}
