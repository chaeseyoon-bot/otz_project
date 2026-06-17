import {
  ARCHIVE_LOOKBOOK_ITEMS,
  type ArchiveLookbookItem,
  type ArchiveSeasonId,
} from '../data/archiveLookbooks'
import {
  archiveEntryHasPublishableListData,
  compareArchiveLookbooksNewestFirst,
  getEffectiveArchiveDetailConfig,
  isPublishableArchiveImageUrl,
  sortArchiveLookbooksNewestFirst,
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

function sortLookbookItemsNewestFirst(items: ArchiveLookbookItem[]): ArchiveLookbookItem[] {
  const adminEntryForId = (id: string): AdminArchiveLookbookEntry | undefined =>
    getEffectiveArchiveDetailConfig().lookbooks.find((entry) => entry.id === id)

  return [...items].sort((a, b) => {
    const adminA = adminEntryForId(a.id)
    const adminB = adminEntryForId(b.id)
    if (adminA && adminB) return compareArchiveLookbooksNewestFirst(adminA, adminB)
    const aNum = Number(/^archive-(\d+)$/.exec(a.id)?.[1] ?? 0)
    const bNum = Number(/^archive-(\d+)$/.exec(b.id)?.[1] ?? 0)
    return bNum - aNum
  })
}

/** List thumbnails — local assets always shown; admin enriches when URLs are durable. */
export function resolveArchiveLookbookItems(): ArchiveLookbookItem[] {
  const localItems = buildLocalArchiveLookbookItems()
  const admin = getEffectiveArchiveDetailConfig()
  const adminById = new Map(admin.lookbooks.map((entry) => [entry.id, entry]))

  if (localItems.length) {
    const merged = localItems.map((local) => {
      const entry = adminById.get(local.id)
      if (!entry) return local

      const thumbnailUrl = isPublishableArchiveImageUrl(entry.thumbnailUrl)
        ? entry.thumbnailUrl!.trim()
        : local.image

      const adminItem = adminEntryToListItem({ ...entry, thumbnailUrl })
      return adminItem ?? local
    })

    for (const entry of sortArchiveLookbooksNewestFirst(admin.lookbooks)) {
      if (localItems.some((item) => item.id === entry.id)) continue
      const adminItem = adminEntryToListItem(entry)
      if (adminItem) merged.push(adminItem)
    }

    return sortLookbookItemsNewestFirst(merged)
  }

  const fromAdmin = sortArchiveLookbooksNewestFirst(admin.lookbooks)
    .filter(archiveEntryHasPublishableListData)
    .map(adminEntryToListItem)
    .filter((item): item is ArchiveLookbookItem => item != null)

  if (fromAdmin.length) return sortLookbookItemsNewestFirst(fromAdmin)
  return ARCHIVE_LOOKBOOK_ITEMS
}

export function filterResolvedArchiveLookbooks(
  season: ArchiveSeasonId,
  items: ArchiveLookbookItem[] = resolveArchiveLookbookItems(),
): ArchiveLookbookItem[] {
  if (season === 'all') return items
  return items.filter((item) => archiveItemMatchesSeason(item, season))
}
