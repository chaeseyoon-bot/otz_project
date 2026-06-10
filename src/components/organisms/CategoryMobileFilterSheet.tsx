import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { DynamicColorSwatch } from '../atoms/DynamicColorSwatch'
import {
  FILTER_PRODUCT_INFO_OPTIONS,
  FILTER_SHOE_SIZES,
  type FilterProductInfoId,
  type FilterShoeSize,
} from '../../data/categoryFilterOptions'
import type { CategoryFilterableProduct, CategoryPcFilters } from '../../lib/categoryProductFilter'
import {
  clonePcFilters,
  EMPTY_PC_FILTERS,
  filterCategoryProducts,
} from '../../lib/categoryProductFilter'
import { buildDynamicColorFilterOptions } from '../../lib/productColor'

interface CategoryMobileFilterSheetProps {
  open: boolean
  products?: readonly CategoryFilterableProduct[]
  appliedFilters?: CategoryPcFilters
  onApply?: (filters: CategoryPcFilters) => void
  resultCount?: number
  onClose: () => void
}

function CloseIcon() {
  return (
    <span className="relative block size-4" aria-hidden>
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 rotate-45 bg-dark" />
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 -rotate-45 bg-dark" />
    </span>
  )
}

/** Mobile PLP — 상세필터 bottom sheet (dim + slide up, rounded-t-[16px]). */
export function CategoryMobileFilterSheet({
  open,
  products = [],
  appliedFilters = EMPTY_PC_FILTERS,
  onApply,
  resultCount,
  onClose,
}: CategoryMobileFilterSheetProps) {
  const [entered, setEntered] = useState(false)
  const [draftFilters, setDraftFilters] = useState<CategoryPcFilters>(() => clonePcFilters(appliedFilters))

  useEffect(() => {
    if (!open) {
      setEntered(false)
      return
    }
    setDraftFilters(clonePcFilters(appliedFilters))
    const frame = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [open, appliedFilters])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const dynamicColorOptions = useMemo(() => buildDynamicColorFilterOptions(products), [products])

  const previewCount = useMemo(
    () => filterCategoryProducts(products, draftFilters).length,
    [products, draftFilters],
  )

  const toggleSize = (size: FilterShoeSize) => {
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

  const handleReset = () => {
    setDraftFilters(clonePcFilters(EMPTY_PC_FILTERS))
  }

  const handleApply = () => {
    onApply?.(clonePcFilters(draftFilters))
    onClose()
  }

  if (!open) return null

  const formattedCount = (resultCount ?? previewCount).toLocaleString('ko-KR')

  return createPortal(
    <div
      className={`fixed inset-0 z-[50] flex touch-none flex-col justify-end bg-[var(--otz-color-overlay-strong)] transition-opacity duration-300 ease-out lg:hidden ${
        entered ? 'opacity-100' : 'opacity-0'
      }`}
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-filter-sheet-title"
        className={`flex max-h-[min(90vh,720px)] w-full flex-col rounded-t-[16px] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out motion-reduce:transition-none ${
          entered ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between px-4 pt-5 pb-4">
          <h2 id="category-filter-sheet-title" className="m-0 text-[16px] font-medium leading-[1.2] tracking-[-0.02em] text-dark">
            상세필터
          </h2>
          <button
            type="button"
            className="flex size-6 items-center justify-center border-0 bg-transparent p-0"
            aria-label="필터 닫기"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </header>

        <div className="h-fit min-h-0 overflow-y-auto" data-scroll-lock-allow>
          <section className="p-[15px]">
            <h3 className="m-0 text-[14px] font-medium leading-[1.4] tracking-[-0.02em] text-dark">사이즈</h3>
            <div className="mt-4 grid grid-cols-5 gap-2.5 border-t border-solid border-light2 bg-whiteGray px-[15px] py-5">
              {FILTER_SHOE_SIZES.map((size) => {
                const isSelected = draftFilters.sizes.has(size)
                return (
                  <button
                    key={size}
                    type="button"
                    className={`flex h-full w-full max-h-[100px] items-center justify-center rounded-[2px] border border-solid bg-white py-[11px] text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-dark ${
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
          </section>

          <section className="p-[15px]">
            <h3 className="m-0 text-[14px] font-medium leading-[1.4] tracking-[-0.02em] text-dark">컬러</h3>
            <div className="mt-4 grid grid-cols-4 gap-x-[15px] gap-y-[15px] border-y border-light2 bg-[var(--otz-color-surface-subtle)] px-[15px] py-5">
              {dynamicColorOptions.length > 0 ? (
                dynamicColorOptions.map((option) => {
                  const isSelected = draftFilters.colors.has(option.id)
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className="flex flex-col items-center gap-1 border-0 bg-transparent p-0"
                      aria-pressed={isSelected}
                      onClick={() => toggleColor(option.id)}
                    >
                      <DynamicColorSwatch
                        hex={option.hex}
                        swatchUrl={option.swatchUrl}
                        selected={isSelected}
                      />
                      <span className="text-[11px] font-normal leading-[1.2] tracking-[-0.04em] text-dark">
                        {option.label}
                      </span>
                    </button>
                  )
                })
              ) : (
                <p className="col-span-4 m-0 text-bodySmall text-subtleText">
                  등록된 상품 색상이 없습니다.
                </p>
              )}
            </div>
          </section>

          <section className="p-[15px]">
            <h3 className="m-0 text-[14px] font-medium leading-[1.4] tracking-[-0.02em] text-dark">상품정보</h3>
            <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-b border-solid border-light2 bg-whiteGray px-[15px] py-5">
              {FILTER_PRODUCT_INFO_OPTIONS.map((option) => {
                const isSelected = draftFilters.productInfo.has(option.id)
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`flex w-full items-center justify-center rounded-[2px] border border-solid bg-white py-3 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-dark ${
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
          </section>
        </div>

        <footer className="flex shrink-0 gap-2 border-t border-light2 bg-white px-5 py-4 pb-[calc(16px+env(safe-area-inset-bottom,0px))]">
          <button
            type="button"
            className="h-12 min-w-[108px] shrink-0 rounded-[8px] border border-solid border-dark bg-white px-4 text-[14px] font-medium leading-[1.2] tracking-[-0.02em] text-dark"
            onClick={handleReset}
          >
            초기화
          </button>
          <button
            type="button"
            className="h-12 min-w-0 flex-1 rounded-[8px] bg-dark px-4 text-[14px] font-medium leading-[1.2] tracking-[-0.02em] text-white"
            onClick={handleApply}
          >
            {formattedCount}개 상품 보기
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
