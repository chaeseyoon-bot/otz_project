import { archiveAsset } from '../lib/archiveAssetUrl'

export type ArchiveSeasonId = 'all' | (string & {})

export interface ArchiveSeasonFilter {
  id: ArchiveSeasonId
  label: string
}

export interface ArchiveLookbookItem {
  id: string
  image: string
  /** width / height — used for masonry column placement */
  aspectRatio: number
  seasons: ArchiveSeasonId[]
  title?: string
}

const ar = (width: number, height: number) => width / height

/** `public/assets/figma/ARCHIVE/*.png` — filename suffix `_26` → 26SS, `_25` → 25FW/25SS, `_24` → 24FW/24SS */
function seasonsFromArchiveFilename(filename: string): ArchiveSeasonId[] {
  const match = filename.match(/_(\d{2})\.png$/i)
  const seasons: ArchiveSeasonId[] = ['all']
  if (!match) return seasons

  switch (match[1]) {
    case '26':
      seasons.push('26ss')
      break
    case '25':
      seasons.push('25fw', '25ss')
      break
    case '24':
      seasons.push('24fw', '24ss')
      break
    default:
      break
  }
  return seasons
}

/** Figma ARCHIVE folder — ordered 01 → 10 */
const ARCHIVE_IMAGE_MANIFEST: { file: string; width: number; height: number }[] = [
  { file: '01_26.png', width: 460, height: 575 },
  { file: '02_26.png', width: 460, height: 460 },
  { file: '03_25.png', width: 460, height: 276 },
  { file: '04_25.png', width: 460, height: 575 },
  { file: '05_25.png', width: 460, height: 276 },
  { file: '06_25.png', width: 460, height: 460 },
  { file: '07_24.png', width: 460, height: 276 },
  { file: '08_24.png', width: 460, height: 575 },
  { file: '09_24.png', width: 460, height: 575 },
  { file: '10_24.png', width: 460, height: 460 },
]

export const ARCHIVE_LOOKBOOK_ITEMS: ArchiveLookbookItem[] = ARCHIVE_IMAGE_MANIFEST.map(
  ({ file, width, height }, index) => ({
    id: `archive-${String(index + 1).padStart(2, '0')}`,
    image: archiveAsset(file),
    aspectRatio: ar(width, height),
    seasons: seasonsFromArchiveFilename(file),
  }),
)

export function filterArchiveLookbooks(
  season: ArchiveSeasonId,
  items: ArchiveLookbookItem[] = ARCHIVE_LOOKBOOK_ITEMS,
): ArchiveLookbookItem[] {
  if (season === 'all') return items
  return items.filter((item) => item.seasons.includes(season))
}
