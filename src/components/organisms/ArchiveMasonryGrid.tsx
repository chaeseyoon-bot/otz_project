import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ArchiveLookbookItem } from '../../data/archiveLookbooks'
import { useMeasuredAspectRatios } from '../../hooks/useMeasuredAspectRatios'

const MOBILE_COLUMN_GAP_PX = 8
const PC_COLUMN_GAP_PX = 10

export interface ArchiveMasonryGridProps {
  items: ArchiveLookbookItem[]
  className?: string
  /** Figma MO 2열 / PC 3열 */
  columnCount?: 2 | 3
  variant?: 'mobile' | 'pc'
  onItemClick?: (item: ArchiveLookbookItem) => void
}

function estimateItemHeight(aspectRatio: number, columnWidth: number): number {
  if (aspectRatio <= 0) return columnWidth
  return columnWidth / aspectRatio
}

/** Place each item in the column with the smallest accumulated height (shortest-column masonry). */
export function distributeMasonryColumns(
  items: ArchiveLookbookItem[],
  columnCount: number,
  columnWidthPx: number,
  columnGapPx: number,
  aspectRatios: Record<string, number>,
): ArchiveLookbookItem[][] {
  const columns: ArchiveLookbookItem[][] = Array.from({ length: columnCount }, () => [])
  const heights = Array(columnCount).fill(0)

  for (const item of items) {
    let targetIndex = 0
    for (let i = 1; i < columnCount; i += 1) {
      if (heights[i] < heights[targetIndex]) targetIndex = i
    }
    columns[targetIndex].push(item)
    const ratio = aspectRatios[item.id] ?? item.aspectRatio
    heights[targetIndex] += estimateItemHeight(ratio, columnWidthPx) + columnGapPx
  }

  return columns
}

/** Figma 2624:12588 (MO) / 2474:3521 (PC) — masonry; fixed column width, image height from aspect ratio. */
export function ArchiveMasonryGrid({
  items,
  className = '',
  columnCount,
  variant = 'mobile',
  onItemClick,
}: ArchiveMasonryGridProps) {
  const isPc = variant === 'pc'
  const resolvedColumnCount = columnCount ?? (isPc ? 3 : 2)
  const gapPx = isPc ? PC_COLUMN_GAP_PX : MOBILE_COLUMN_GAP_PX
  const gapClass = isPc ? 'gap-[10px]' : 'gap-2'
  const containerRef = useRef<HTMLDivElement>(null)
  const [columnWidthPx, setColumnWidthPx] = useState(isPc ? 460 : 173)

  const measuredAspectRatios = useMeasuredAspectRatios(items)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    const measure = () => {
      const width = el.clientWidth
      if (width <= 0) return
      const nextColumnWidth = (width - gapPx * (resolvedColumnCount - 1)) / resolvedColumnCount
      setColumnWidthPx(nextColumnWidth)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [gapPx, resolvedColumnCount])

  const columns = useMemo(
    () => distributeMasonryColumns(items, resolvedColumnCount, columnWidthPx, gapPx, measuredAspectRatios),
    [items, resolvedColumnCount, columnWidthPx, gapPx, measuredAspectRatios],
  )

  return (
    <div ref={containerRef} className={`flex w-full items-start justify-center ${gapClass} ${className}`}>
      {columns.map((columnItems, columnIndex) => (
        <div key={columnIndex} className={`flex min-w-0 flex-1 flex-col ${gapClass}`}>
          {columnItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="block w-full overflow-hidden border-0 bg-light p-0"
              aria-label={item.title ?? '룩북 보기'}
              onClick={() => onItemClick?.(item)}
            >
              <img
                src={item.image}
                alt=""
                className="block h-auto w-full"
                loading="lazy"
                draggable={false}
              />
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
