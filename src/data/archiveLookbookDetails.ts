import { archiveAsset } from '../lib/archiveAssetUrl'
import { ARCHIVE_LOOKBOOK_ITEMS, type ArchiveLookbookItem } from './archiveLookbooks'

export interface ArchiveLookbookDetailImage {
  src: string
  alt?: string
}

export type ArchivePcDetailBlock =
  | { type: 'full'; image: ArchiveLookbookDetailImage }
  | { type: 'split'; left: ArchiveLookbookDetailImage; right: ArchiveLookbookDetailImage }
  | {
      type: 'triple'
      left: ArchiveLookbookDetailImage
      center: ArchiveLookbookDetailImage
      right: ArchiveLookbookDetailImage
    }

export type ArchiveColumnsPerRow = 1 | 2 | 3

export function buildPcBlockFromRowImages(
  images: ArchiveLookbookDetailImage[],
  columnsPerRow: ArchiveColumnsPerRow,
): ArchivePcDetailBlock | null {
  if (!images.length) return null

  const count = Math.min(columnsPerRow, images.length) as 1 | 2 | 3
  const chunk = images.slice(0, count)

  if (count === 1) {
    return { type: 'full', image: chunk[0] }
  }
  if (count === 2) {
    return { type: 'split', left: chunk[0], right: chunk[1] }
  }
  return { type: 'triple', left: chunk[0], center: chunk[1], right: chunk[2] }
}

/** Groups flat detail images into PC row blocks (uniform columns per row). */
export function buildPcBlocksFromImages(
  images: ArchiveLookbookDetailImage[],
  columnsPerRow: ArchiveColumnsPerRow,
): ArchivePcDetailBlock[] {
  const blocks: ArchivePcDetailBlock[] = []
  let index = 0

  while (index < images.length) {
    const remaining = images.length - index
    const count = Math.min(columnsPerRow, remaining) as 1 | 2 | 3
    const chunk = images.slice(index, index + count)
    const block = buildPcBlockFromRowImages(chunk, count)
    if (block) blocks.push(block)
    index += count
  }

  return blocks
}

export interface ArchiveDetailRowInput {
  columnsPerRow: ArchiveColumnsPerRow
  images: ArchiveLookbookDetailImage[]
}

/** Builds PC blocks from per-row column settings (mixed 1/2/3 layout). */
export function buildPcBlocksFromRows(rows: ArchiveDetailRowInput[]): ArchivePcDetailBlock[] {
  const blocks: ArchivePcDetailBlock[] = []

  for (const row of rows) {
    const block = buildPcBlockFromRowImages(row.images, row.columnsPerRow)
    if (block) blocks.push(block)
  }

  return blocks
}

export interface ArchiveLookbookDetail {
  lookbookId: string
  /** Figma 2679:10527 / 2679:12040 */
  title: string
  /** MO 2679:10237 — full width, natural height, vertical stack */
  mobileImages: ArchiveLookbookDetailImage[]
  /** PC 2679:10534 — 1400px editorial layout */
  pcBlocks: ArchivePcDetailBlock[]
}

function img(file: string, alt?: string): ArchiveLookbookDetailImage {
  return { src: archiveAsset(file), alt }
}

/** `public/assets/figma/ARCHIVE/detail01_01.png` … `detail01_07.png` */
const DETAIL_01_IMAGES = {
  hero: img('detail01_01.png'),
  row2Left: img('detail01_02.png'),
  row2Right: img('detail01_03.png'),
  row3Left: img('detail01_04.png'),
  row3Right: img('detail01_05.png'),
  row4Left: img('detail01_06.png'),
  row4Right: img('detail01_07.png'),
} as const

const ARCHIVE_01_PC_BLOCKS: ArchivePcDetailBlock[] = [
  { type: 'full', image: DETAIL_01_IMAGES.hero },
  { type: 'split', left: DETAIL_01_IMAGES.row2Left, right: DETAIL_01_IMAGES.row2Right },
  { type: 'split', left: DETAIL_01_IMAGES.row3Left, right: DETAIL_01_IMAGES.row3Right },
  { type: 'split', left: DETAIL_01_IMAGES.row4Left, right: DETAIL_01_IMAGES.row4Right },
]

const DETAIL_PRESETS: Record<string, Omit<ArchiveLookbookDetail, 'lookbookId'>> = {
  'archive-01': {
    title: '26SS NEW EDITION',
    mobileImages: [
      DETAIL_01_IMAGES.hero,
      DETAIL_01_IMAGES.row2Left,
      DETAIL_01_IMAGES.row2Right,
      DETAIL_01_IMAGES.row3Left,
      DETAIL_01_IMAGES.row3Right,
      DETAIL_01_IMAGES.row4Left,
      DETAIL_01_IMAGES.row4Right,
    ],
    pcBlocks: ARCHIVE_01_PC_BLOCKS,
  },
}

function fallbackDetailFromListItem(item: ArchiveLookbookItem): ArchiveLookbookDetail {
  const single: ArchiveLookbookDetailImage = { src: item.image }
  return {
    lookbookId: item.id,
    title: item.title ?? 'ARCHIVE',
    mobileImages: [single],
    pcBlocks: [{ type: 'full', image: single }],
  }
}

/** Static preset / fallback only — skips admin overrides. */
export function getStaticArchiveLookbookDetail(lookbookId: string): ArchiveLookbookDetail | undefined {
  const listItem = ARCHIVE_LOOKBOOK_ITEMS.find((item) => item.id === lookbookId)
  if (!listItem) return undefined

  const preset = DETAIL_PRESETS[lookbookId]
  if (preset) {
    return { lookbookId, ...preset }
  }

  return fallbackDetailFromListItem(listItem)
}

/** @deprecated Use `getArchiveLookbookDetail` from `../lib/archiveLookbookDetailResolver`. */
export function getArchiveLookbookDetail(lookbookId: string): ArchiveLookbookDetail | undefined {
  return getStaticArchiveLookbookDetail(lookbookId)
}
