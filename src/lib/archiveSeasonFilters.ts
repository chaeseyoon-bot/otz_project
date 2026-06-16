import type { ArchiveLookbookItem, ArchiveSeasonFilter, ArchiveSeasonId } from '../data/archiveLookbooks'

const ARCHIVE_SEASON_TITLE_PATTERN = /\b(\d{2})\s*(SS|FW)\b/i

export function parseArchiveSeasonFromTitle(title: string): { id: ArchiveSeasonId; label: string } | null {
  const match = title.match(ARCHIVE_SEASON_TITLE_PATTERN)
  if (!match) return null

  const label = `${match[1]}${match[2].toUpperCase()}`
  return { id: label.toLowerCase() as ArchiveSeasonId, label }
}

function seasonLabelFromId(id: ArchiveSeasonId): string {
  return `${id.slice(0, 2)}${id.slice(2).toUpperCase()}`
}

/** Season ids used for filtering — title first, else legacy seasons array. */
export function getArchiveItemSeasonIds(item: ArchiveLookbookItem): ArchiveSeasonId[] {
  const fromTitle = item.title?.trim() ? parseArchiveSeasonFromTitle(item.title) : null
  if (fromTitle) return [fromTitle.id]

  return item.seasons.filter((season): season is ArchiveSeasonId => season !== 'all')
}

export function compareArchiveSeasonIds(a: ArchiveSeasonId, b: ArchiveSeasonId): number {
  const parse = (id: ArchiveSeasonId) => {
    const match = /^(\d{2})(ss|fw)$/.exec(id)
    if (!match) return { year: 0, fwFirst: 0 }
    return {
      year: Number(match[1]),
      fwFirst: match[2] === 'fw' ? 1 : 0,
    }
  }

  const left = parse(a)
  const right = parse(b)
  if (left.year !== right.year) return right.year - left.year
  return right.fwFirst - left.fwFirst
}

/** ALL SEASON + one tab per season present in the archive list. */
export function buildArchiveSeasonFilters(items: ArchiveLookbookItem[]): ArchiveSeasonFilter[] {
  const seasonLabels = new Map<ArchiveSeasonId, string>()

  for (const item of items) {
    const fromTitle = item.title?.trim() ? parseArchiveSeasonFromTitle(item.title) : null
    if (fromTitle) {
      seasonLabels.set(fromTitle.id, fromTitle.label)
      continue
    }

    for (const season of item.seasons) {
      if (season === 'all') continue
      seasonLabels.set(season, seasonLabelFromId(season))
    }
  }

  const seasons = [...seasonLabels.entries()]
    .sort(([a], [b]) => compareArchiveSeasonIds(a, b))
    .map(([id, label]) => ({ id, label }))

  return [{ id: 'all', label: 'ALL SEASON' }, ...seasons]
}

export function archiveItemMatchesSeason(item: ArchiveLookbookItem, season: ArchiveSeasonId): boolean {
  if (season === 'all') return true
  return getArchiveItemSeasonIds(item).includes(season)
}
