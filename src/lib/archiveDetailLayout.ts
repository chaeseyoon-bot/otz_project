import type { ArchiveColumnsPerRow } from '../data/archiveLookbookDetails'

/** Figma 141-3059 PC archive detail row layouts. */
export type ArchiveRowLayout =
  | 'full'
  | 'intro-split'
  | 'asymmetric-small-left'
  | 'asymmetric-small-right'
  | 'equal-2'
  | 'equal-3'

export const ARCHIVE_ROW_LAYOUT_OPTIONS: Array<{ value: ArchiveRowLayout; label: string }> = [
  { value: 'full', label: '전체 (1장)' },
  { value: 'intro-split', label: '이미지 + 소개' },
  { value: 'asymmetric-small-left', label: '2분할 (좌 소)' },
  { value: 'asymmetric-small-right', label: '2분할 (우 소)' },
  { value: 'equal-2', label: '2분할 (균등)' },
  { value: 'equal-3', label: '3분할 (균등)' },
]

/** Auto layout cycle after bulk upload — matches Figma 141-3059 image rows. */
export const ARCHIVE_FIGMA_AUTO_LAYOUTS: ArchiveRowLayout[] = [
  'full',
  'intro-split',
  'asymmetric-small-left',
  'full',
  'asymmetric-small-right',
  'asymmetric-small-left',
]

export function isArchiveRowLayout(value: unknown): value is ArchiveRowLayout {
  return (
    value === 'full' ||
    value === 'intro-split' ||
    value === 'asymmetric-small-left' ||
    value === 'asymmetric-small-right' ||
    value === 'equal-2' ||
    value === 'equal-3'
  )
}

export function rowLayoutSlotCount(layout: ArchiveRowLayout): number {
  if (layout === 'equal-3') return 3
  if (layout === 'full' || layout === 'intro-split') return 1
  return 2
}

export function columnsPerRowFromLayout(layout: ArchiveRowLayout): ArchiveColumnsPerRow {
  const count = rowLayoutSlotCount(layout)
  return count === 3 ? 3 : count === 2 ? 2 : 1
}

export function inferRowLayout(
  columnsPerRow: ArchiveColumnsPerRow,
  rowLayout?: ArchiveRowLayout,
): ArchiveRowLayout {
  if (rowLayout && isArchiveRowLayout(rowLayout)) return rowLayout
  if (columnsPerRow === 3) return 'equal-3'
  if (columnsPerRow === 2) return 'equal-2'
  return 'full'
}

export function getRowSlotCount(row: {
  columnsPerRow: ArchiveColumnsPerRow
  rowLayout?: ArchiveRowLayout
}): number {
  return rowLayoutSlotCount(inferRowLayout(row.columnsPerRow, row.rowLayout))
}

export function layoutForRemainingImageCount(count: number): ArchiveRowLayout {
  if (count <= 1) return 'full'
  if (count === 2) return 'equal-2'
  return 'equal-3'
}

/** Returns layout + slot count for each row when distributing `totalImages` from Figma pattern. */
export function planFigmaAutoLayoutRows(
  totalImages: number,
  startLayoutIndex = 0,
): Array<{ layout: ArchiveRowLayout; slotCount: number }> {
  const plan: Array<{ layout: ArchiveRowLayout; slotCount: number }> = []
  let imageIndex = 0
  let layoutIndex = startLayoutIndex

  while (imageIndex < totalImages) {
    const layout = ARCHIVE_FIGMA_AUTO_LAYOUTS[layoutIndex % ARCHIVE_FIGMA_AUTO_LAYOUTS.length]
    const slotCount = rowLayoutSlotCount(layout)
    const remaining = totalImages - imageIndex

    if (remaining < slotCount) {
      const fallbackLayout = layoutForRemainingImageCount(remaining)
      plan.push({ layout: fallbackLayout, slotCount: remaining })
      break
    }

    plan.push({ layout, slotCount })
    imageIndex += slotCount
    layoutIndex += 1
  }

  return plan
}
