import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  FILTER_COLOR_OPTIONS,
  FILTER_PC_SHOE_SIZES,
  FILTER_PRODUCT_INFO_OPTIONS,
  type FilterColorOption,
  type FilterPcShoeSize,
  type FilterProductInfoId,
} from '../../data/categoryFilterOptions'
import type { CategoryFilterableProduct, CategoryPcFilters } from '../../lib/categoryProductFilter'
import {
  clonePcFilters,
  EMPTY_PC_FILTERS,
  filterCategoryProducts,
  pcFilterSelectionCount,
} from '../../lib/categoryProductFilter'
import { figmaAsset } from '../../lib/figmaAssetUrl'

const iconPlus = figmaAsset('icons/list_plus.svg')
const iconMinus = figmaAsset('icons/list_minus.svg')
const iconRefresh = figmaAsset('icons/list_refresh.svg')

type PcFilterId = 'size' | 'color' | 'productInfo'

const FILTER_CHIPS: { id: PcFilterId; label: string; countKey: keyof CategoryPcFilters }[] = [
  { id: 'size', label: '사이즈', countKey: 'sizes' },
  { id: 'color', label: '색상', countKey: 'colors' },
  { id: 'productInfo', label: '상품정보', countKey: 'productInfo' },
]

function ColorSwatch({ option, selected }: { option: FilterColorOption; selected: boolean }) {
  let fillStyle: CSSProperties = { backgroundColor: option.fill }
  if (option.variant === 'stripe') {
    fillStyle = {
      backgroundImage:
        'repeating-linear-gradient(90deg, #1a1a1a 0, #1a1a1a 3px, #ffffff 3px, #ffffff 6px)',
    }
  } else if (option.variant === 'etc') {
    fillStyle = {
      backgroundColor: '#f0f0f0',
      backgroundImage:
        'repeating-linear-gradient(135deg, transparent, transparent 4px, #d8d8d8 4px, #d8d8d8 5px)',
    }
  }

  const swatchStyle: CSSProperties = {
    ...fillStyle,
    boxSizing: 'border-box',
    border: selected ? '4px solid #ffffff' : '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: selected ? '0 0 0 1px #1a1a1a' : undefined,
  }

  return <div className="size-[30px] shrink-0 overflow-hidden rounded-full" style={swatchStyle} aria-hidden />
}

interface PcFilterChipProps {
  label: string
  selectionCount: number
  isOpen: boolean
  onClick: () => void
}

function PcFilterChip({ label, selectionCount, isOpen, onClick }: PcFilterChipProps) {
  return (
    <button
      type="button"
      aria-expanded={isOpen}
      className={`flex w-[140px] shrink-0 items-center justify-between gap-2 rounded-[2px] border border-solid bg-white py-3 pl-[15px] pr-[10px] text-left font-normal tracking-[-0.02em] text-dark ${
        isOpen ? 'border-dark' : 'border-lightGray'
      }`}
      onClick={onClick}
    >
      <span className="text-[15px] leading-[1.4]">
        {label}
        {selectionCount > 0 ? (
          <>
            {' '}
            <span className="font-bold">({selectionCount})</span>
          </>
        ) : null}
      </span>
      <img
        src={isOpen ? iconMinus : iconPlus}
        alt=""
        aria-hidden
        className="size-[17px] shrink-0 object-contain"
        draggable={false}
      />
    </button>
  )
}

export interface CategoryPcFilterBarProps<T extends CategoryFilterableProduct> {
  products: readonly T[]
  appliedFilters: CategoryPcFilters
  onApply: (filters: CategoryPcFilters) => void
  onResetAll: () => void
}

/** Figma 13:1096 — PC category PLP inline filter (chip row + panel + apply footer). */
export function CategoryPcFilterBar<T extends CategoryFilterableProduct>({
  products,
  appliedFilters,
  onApply,
  onResetAll,
}: CategoryPcFilterBarProps<T>) {
  const rootRef = useRef<HTMLElement>(null)
  const [openFilter, setOpenFilter] = useState<PcFilterId | null>(null)
  const [draftFilters, setDraftFilters] = useState<CategoryPcFilters>(() => clonePcFilters(appliedFilters))

  useEffect(() => {
    setDraftFilters(clonePcFilters(appliedFilters))
  }, [appliedFilters])

  const previewCount = useMemo(
    () => filterCategoryProducts(products, draftFilters).length,
    [products, draftFilters],
  )

  const toggleFilter = (id: PcFilterId) => {
    setOpenFilter((prev) => (prev === id ? null : id))
  }

  const toggleSize = (size: FilterPcShoeSize) => {
    setDraftFilters((prev) => {
      const next = clonePcFilters(prev)
      if (next.sizes.has(size)) next.sizes.delete(size)
      else next.sizes.add(size)
      return next
    })
  }

  const toggleColor = (id: string) => {
    setDraftFilters((prev) => {
      const next = clonePcFilters(prev)
      if (next.colors.has(id)) next.colors.delete(id)
      else next.colors.add(id)
      return next
    })
  }

  const toggleProductInfo = (id: FilterProductInfoId) => {
    setDraftFilters((prev) => {
      const next = clonePcFilters(prev)
      if (next.productInfo.has(id)) next.productInfo.delete(id)
      else next.productInfo.add(id)
      return next
    })
  }

  const handleDraftReset = () => {
    setDraftFilters(clonePcFilters(EMPTY_PC_FILTERS))
  }

  const handleResetAll = () => {
    setDraftFilters(clonePcFilters(EMPTY_PC_FILTERS))
    setOpenFilter(null)
    onResetAll()
  }

  const handleApply = () => {
    onApply(clonePcFilters(draftFilters))
    setOpenFilter(null)
  }

  useEffect(() => {
    if (!openFilter) return
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpenFilter(null)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [openFilter])

  const formattedPreviewCount = previewCount.toLocaleString('ko-KR')

  return (
    <section ref={rootRef} className="hidden lg:block" aria-label="상품 필터">
      <div
        className={`flex h-[60px] items-start gap-2 pt-3.5 ${
          openFilter === null ? 'border-b border-solid border-light2 pb-3.5' : 'pb-2.5'
        }`}
      >
        {FILTER_CHIPS.map(({ id, label, countKey }) => (
          <PcFilterChip
            key={id}
            label={label}
            selectionCount={pcFilterSelectionCount(draftFilters, countKey)}
            isOpen={openFilter === id}
            onClick={() => toggleFilter(id)}
          />
        ))}
        <button
          type="button"
          className="flex size-[45px] shrink-0 items-center justify-center rounded-[2px] border border-solid border-lightGray bg-white"
          aria-label="필터 초기화"
          onClick={handleResetAll}
        >
          <img src={iconRefresh} alt="" aria-hidden className="size-6 object-contain" draggable={false} />
        </button>
      </div>

      {openFilter !== null ? (
        <>
          <div className="h-px w-full bg-light2" aria-hidden />
          <div className="bg-whiteGray p-[25px]">
            {openFilter === 'size' ? (
              <div className="grid grid-cols-[repeat(13,minmax(0,1fr))] gap-2.5">
                {FILTER_PC_SHOE_SIZES.map((size) => {
                  const isSelected = draftFilters.sizes.has(size)
                  return (
                    <button
                      key={size}
                      type="button"
                      className={`flex items-center justify-center rounded-[2px] border border-solid bg-white py-3 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-dark ${
                        isSelected ? 'border-dark' : 'border-lightGray'
                      }`}
                      aria-pressed={isSelected}
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            ) : null}

            {openFilter === 'color' ? (
              <div className="grid grid-cols-10 gap-x-2.5 gap-y-[15px]">
                {FILTER_COLOR_OPTIONS.map((option) => {
                  const isSelected = draftFilters.colors.has(option.id)
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className="flex w-full flex-col items-center gap-1 border-0 bg-transparent p-0"
                      aria-pressed={isSelected}
                      onClick={() => toggleColor(option.id)}
                    >
                      <ColorSwatch option={option} selected={isSelected} />
                      <span className="whitespace-nowrap text-[11px] font-normal leading-[1.2] tracking-[-0.04em] text-dark">
                        {option.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : null}

            {openFilter === 'productInfo' ? (
              <div className="flex w-fit flex-wrap gap-2.5">
                {FILTER_PRODUCT_INFO_OPTIONS.map((option) => {
                  const isSelected = draftFilters.productInfo.has(option.id)
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`flex w-[163px] items-center justify-center rounded-[2px] border border-solid bg-white px-4 py-3 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-dark ${
                        isSelected ? 'border-dark' : 'border-lightGray'
                      }`}
                      aria-pressed={isSelected}
                      onClick={() => toggleProductInfo(option.id)}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>
          <div className="h-px w-full bg-light2" aria-hidden />
          <div className="flex items-center justify-center gap-2.5 border-t border-solid border-light2 p-[15px]">
            <button
              type="button"
              className="flex h-[46px] shrink-0 items-center justify-center rounded-[8px] border border-solid border-dark bg-white px-[26px] text-[15px] font-semibold leading-[1.2] tracking-[-0.04em] text-black"
              onClick={handleDraftReset}
            >
              초기화
            </button>
            <button
              type="button"
              className="flex h-[46px] shrink-0 items-center justify-center rounded-[8px] bg-black px-[26px] text-[15px] font-semibold leading-[1.2] tracking-[-0.04em] text-white"
              onClick={handleApply}
            >
              {formattedPreviewCount}개 상품 보기
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
