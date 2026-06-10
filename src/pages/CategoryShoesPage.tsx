import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { CategoryMobileFilterSheet } from '../components/organisms/CategoryMobileFilterSheet'
import { CategoryMobileHeader } from '../components/organisms/CategoryMobileHeader'
import { CategoryMobileMainDropdown } from '../components/organisms/CategoryMobileMainDropdown'
import { CategoryLnb, CategoryLnbMobileSubChips } from '../components/organisms/CategoryLnb'
import { CategoryPcFilterBar } from '../components/organisms/CategoryPcFilterBar'
import { getLnbSubItems } from '../data/categoryMobileMain'
import { ProductCardUnit } from '../components/molecules/ProductCardUnit'
import type { CategoryShoeProduct } from '../data/categoryShoesProducts'
import {
  clonePcFilters,
  EMPTY_PC_FILTERS,
  filterCategoryProducts,
} from '../lib/categoryProductFilter'
import { useCategoryPlpRoute } from '../hooks/useCategoryPlpRoute'
import { useProducts, type UiProduct } from '../hooks/useProducts'
import {
  getCategoryPlpMainLabel,
  navigateCategoryPlp,
  subLabelFromPlpState,
  type CategoryPlpMainId,
} from '../lib/categoryRoutes'
import {
  matchesCollectionProduct,
  matchesSubcategoryProduct,
} from '../data/productTaxonomy'
import { getProductDetailPath } from '../lib/productRoutes'
import { navigateSpa } from '../lib/spaNavigation'
import { useMobileGnb } from '../contexts/MobileGnbContext'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import { useMobileShellFixedPin } from '../hooks/useMobileShellFixedPin'
import { figmaAsset } from '../lib/figmaAssetUrl'

const SORT_OPTIONS = ['인기상품순', '낮은가격순', '높은가격순', '신상품순'] as const

/** Adapts a CSV-backed product into the PLP's filterable shape. */
function toFilterableProduct(item: UiProduct): CategoryShoeProduct {
  const soldOut = Boolean(item.badges?.some((badge) => badge.id === 'sold-out'))
  return {
    ...item,
    productName: item.title,
    filterSizes: [],
    filterColors: item.filterColors ?? [],
    productColorHex: item.colorHex ?? null,
    productColorName: item.colorName ?? null,
    productColorSwatchUrl: item.colorSwatchUrl ?? null,
    freeShipping: item.freeShipping ?? true,
    soldOut,
  }
}

/** Narrows the full catalog to the active main category. */
function matchesMainCategory(item: UiProduct, mainId: CategoryPlpMainId): boolean {
  if (mainId === 'all') return true
  if (mainId === 'shoes') return item.category === 'shoes'
  if (mainId === 'bag-acc') return item.category === 'bagacc'
  return true // collection spans every category; filtered by name keyword instead
}

const iconListChevron = figmaAsset('icons/list_chevron.svg')
const iconSortCheck = figmaAsset('icons/sort_check_outline.svg')
const iconListFilter = figmaAsset('icons/list_filter.svg')

function SortDropdown({
  sortOpen,
  sortIndex,
  sortRef,
  onToggle,
  onSelect,
  buttonClassName,
  chevronSize,
}: {
  sortOpen: boolean
  sortIndex: number
  sortRef: React.RefObject<HTMLDivElement | null>
  onToggle: () => void
  onSelect: (index: number) => void
  buttonClassName: string
  chevronSize: 'mobile' | 'desktop'
}) {
  const chevronSizeClass = chevronSize === 'mobile' ? 'size-[14px]' : 'size-[17px]'
  return (
    <div ref={sortRef} className="relative shrink-0">
      <button
        type="button"
        className={buttonClassName}
        aria-expanded={sortOpen}
        aria-haspopup="listbox"
        onClick={onToggle}
      >
        {SORT_OPTIONS[sortIndex]}
        <img
          src={iconListChevron}
          alt=""
          aria-hidden
          className={`${chevronSizeClass} shrink-0 object-contain transition-transform ${sortOpen ? 'rotate-180' : ''}`}
          draggable={false}
        />
      </button>
      {sortOpen ? (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 m-0 mt-2 min-w-[118px] list-none overflow-hidden rounded-[2px] border border-solid border-textDefault bg-white"
        >
          {SORT_OPTIONS.map((option, index) => (
            <li
              key={option}
              role="option"
              aria-selected={index === sortIndex}
              className="border-b border-solid border-[#e8e8e8] last:border-b-0"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 border-0 bg-white py-3 pl-[15px] pr-[10px] text-left text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault"
                onClick={() => onSelect(index)}
              >
                {option}
                {index === sortIndex ? (
                  <img src={iconSortCheck} alt="" aria-hidden className="size-5 shrink-0 object-contain" draggable={false} />
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

/** Figma 2439:9261 — SHOES category product list (PC PLP). */
export function CategoryShoesPage() {
  const route = useCategoryPlpRoute()
  const { products: rawProducts, isLoading, error } = useProducts()
  const [appliedPcFilters, setAppliedPcFilters] = useState(() => clonePcFilters(EMPTY_PC_FILTERS))
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [activeMainId, setActiveMainId] = useState<CategoryPlpMainId>(route.mainId)
  const [activeSubIndex, setActiveSubIndex] = useState(route.subIndex)
  const [mainMenuOpen, setMainMenuOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [sortIndex, setSortIndex] = useState(0)
  const sortRef = useRef<HTMLDivElement>(null)
  const { isOpen: gnbOpen } = useMobileGnb()
  const { sentinelRef, barRef, pinned, shellLeft, shellWidth, barHeight } = useMobileShellFixedPin()

  useLockBodyScroll(mainMenuOpen || filterOpen)

  useEffect(() => {
    setActiveMainId(route.mainId)
    setActiveSubIndex(route.subIndex)
  }, [route.mainId, route.subIndex])

  useEffect(() => {
    if (!gnbOpen) return
    setMainMenuOpen(false)
    setFilterOpen(false)
    setSortOpen(false)
  }, [gnbOpen])

  const mobileStickyBarStyle: CSSProperties | undefined = pinned
    ? {
        position: 'fixed',
        top: 0,
        left: shellLeft,
        width: shellWidth,
        zIndex: 30,
      }
    : undefined

  const handleToggleLike = (productId: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
  }

  useEffect(() => {
    if (!sortOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [sortOpen])

  useEffect(() => {
    if (!mainMenuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMainMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mainMenuOpen])

  const handleSelectMainCategory = (mainId: CategoryPlpMainId) => {
    setActiveMainId(mainId)
    setActiveSubIndex(0)
    setMainMenuOpen(false)
    setSortOpen(false)
    navigateCategoryPlp(mainId, null, { replace: true })
  }

  const handleSubChange = (index: number) => {
    setActiveSubIndex(index)
    navigateCategoryPlp(activeMainId, subLabelFromPlpState(activeMainId, index), {
      replace: true,
    })
  }

  // 1) Narrow to the active main category (shoes / bag&acc / collection).
  const mainProducts = useMemo(
    () => rawProducts.filter((item) => matchesMainCategory(item, activeMainId)),
    [rawProducts, activeMainId],
  )

  // 2) Apply the sub-category tab (SHOES / BAG＆ACC subcategories, COLLECTION lines).
  const subProducts = useMemo(() => {
    if (activeMainId === 'all' || activeSubIndex <= 0) return mainProducts
    const keyword = getLnbSubItems(activeMainId)[activeSubIndex - 1]
    if (!keyword) return mainProducts

    if (activeMainId === 'collection') {
      return mainProducts.filter((item) => matchesCollectionProduct(item, keyword))
    }

    return mainProducts.filter((item) => matchesSubcategoryProduct(item, keyword))
  }, [mainProducts, activeMainId, activeSubIndex])

  const categoryProducts = useMemo(() => subProducts.map(toFilterableProduct), [subProducts])

  // 3) Apply PC facet filters (size/color/etc.).
  const filteredProducts = useMemo(
    () => filterCategoryProducts(categoryProducts, appliedPcFilters),
    [categoryProducts, appliedPcFilters],
  )

  const displayProductCount = filteredProducts.length.toLocaleString('ko-KR')

  return (
    <main className="bg-white lg:w-full">
      {/* Mobile category chrome — Figma 2497:5882; sub-tabs + filter stick on scroll */}
      <div className="relative lg:hidden">
        <div className="relative z-50 bg-white">
          <CategoryMobileHeader
            title={getCategoryPlpMainLabel(activeMainId)}
            menuOpen={mainMenuOpen}
            onTitleToggle={() => {
              setMainMenuOpen((open) => !open)
              setSortOpen(false)
              setFilterOpen(false)
            }}
          />
          {mainMenuOpen ? (
            <CategoryMobileMainDropdown activeMainId={activeMainId} onSelect={handleSelectMainCategory} />
          ) : null}
        </div>
        {mainMenuOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 touch-none bg-[var(--otz-color-overlay-strong)] lg:hidden"
            aria-label="대카테고리 닫기"
            onClick={() => setMainMenuOpen(false)}
          />
        ) : null}
        <div ref={sentinelRef} className="pointer-events-none h-px w-full shrink-0" aria-hidden />
        {pinned ? <div aria-hidden className="shrink-0" style={{ height: barHeight }} /> : null}
        <div ref={barRef} className="bg-white" style={mobileStickyBarStyle}>
          {activeMainId !== 'all' ? (
            <CategoryLnbMobileSubChips
              activeMainId={activeMainId}
              activeSubIndex={activeSubIndex}
              onSubChange={handleSubChange}
            />
          ) : null}
          <div className="relative z-40 flex h-11 items-center justify-between border-b border-light2 bg-white px-4">
            <button
              type="button"
              className="flex items-center gap-1 border-0 bg-transparent p-0 text-[13px] font-medium leading-[1.2] tracking-[-0.02em] text-textDefault"
              aria-label="필터"
              aria-expanded={filterOpen}
              onClick={() => {
                setFilterOpen(true)
                setMainMenuOpen(false)
                setSortOpen(false)
              }}
            >
              <span>필터</span>
              <img src={iconListFilter} alt="" aria-hidden className="size-3.5 object-contain" draggable={false} />
            </button>
            <SortDropdown
              sortOpen={sortOpen}
              sortIndex={sortIndex}
              sortRef={sortRef}
              onToggle={() => setSortOpen((open) => !open)}
              onSelect={(index) => {
                setSortIndex(index)
                setSortOpen(false)
              }}
              buttonClassName="flex items-center gap-0.5 border-0 bg-transparent p-0 text-[13px] font-medium leading-[1.2] tracking-[-0.02em] text-textDefault"
              chevronSize="mobile"
            />
          </div>
        </div>
      </div>

      <CategoryMobileFilterSheet
        open={filterOpen}
        products={categoryProducts}
        appliedFilters={appliedPcFilters}
        onApply={setAppliedPcFilters}
        resultCount={filteredProducts.length}
        onClose={() => setFilterOpen(false)}
      />

      <section className="px-[15px] pb-[50px] pt-0 lg:mx-auto lg:max-w-[1400px] lg:px-0 lg:pb-20 lg:pt-10">
        <div className="flex gap-[60px] lg:items-start">
          <CategoryLnb
            activeMainId={activeMainId}
            activeSubIndex={activeSubIndex}
            onSubChange={handleSubChange}
            onMainSelect={handleSelectMainCategory}
          />

          <div className="min-w-0 flex-1">
            {/* PC filters — Figma 2895:23912 */}
            <CategoryPcFilterBar
              products={categoryProducts}
              appliedFilters={appliedPcFilters}
              onApply={setAppliedPcFilters}
              onResetAll={() => setAppliedPcFilters(clonePcFilters(EMPTY_PC_FILTERS))}
            />

            {/* Mobile product count — Figma 2573:9959 */}
            <p className="m-0 py-[15px] text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault lg:hidden">
              <span className="font-semibold text-dark">{displayProductCount}</span>개의 상품이 있습니다.
            </p>

            {/* Desktop count + sort */}
            <div className="relative z-40 mt-5 hidden items-center justify-between gap-4 lg:mt-0 lg:flex lg:pt-[50px] lg:pb-5">
              <p className="m-0 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault lg:text-[16px]">
                <span className="font-semibold text-dark">{displayProductCount}</span>개의 상품이 있습니다.
              </p>
              <SortDropdown
                sortOpen={sortOpen}
                sortIndex={sortIndex}
                sortRef={sortRef}
                onToggle={() => setSortOpen((open) => !open)}
                onSelect={(index) => {
                  setSortIndex(index)
                  setSortOpen(false)
                }}
                buttonClassName="flex items-center gap-1 border-0 bg-transparent p-0 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-dark lg:text-[14px]"
                chevronSize="desktop"
              />
            </div>

            {/* Product grid */}
            {isLoading ? (
              <p className="py-20 text-center text-[13px] text-light4">상품을 불러오는 중입니다…</p>
            ) : error ? (
              <p className="py-20 text-center text-[13px] text-light4">상품을 불러오지 못했습니다. ({error})</p>
            ) : filteredProducts.length === 0 ? (
              <p className="py-20 text-center text-[13px] text-light4">표시할 상품이 없습니다.</p>
            ) : (
              <div className="mt-0 grid grid-cols-2 gap-x-[6px] gap-y-[50px] lg:mt-0 lg:grid-cols-4 lg:gap-x-[10px] lg:gap-y-14">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="cursor-pointer p-0"
                    role="link"
                    tabIndex={0}
                    onClick={() => navigateSpa(getProductDetailPath(product.id))}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        navigateSpa(getProductDetailPath(product.id))
                      }
                    }}
                  >
                    <ProductCardUnit
                      product={product}
                      liked={likedIds.has(product.id)}
                      onToggleLike={() => handleToggleLike(product.id)}
                      articleClassName="group flex w-full flex-col"
                      titleClassName="min-w-0 truncate pt-[7px] text-[13px] font-normal leading-[1.35] tracking-[-0.02em] text-textDefault lg:pt-3 lg:text-[14px] lg:leading-[1.4]"
                      showSizeQuickSelect
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
