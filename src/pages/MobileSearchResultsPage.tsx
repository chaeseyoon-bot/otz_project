import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { ProductCardUnit } from '../components/molecules/ProductCardUnit'
import { CategoryMobileFilterSheet } from '../components/organisms/CategoryMobileFilterSheet'
import { MobileSearchHeader } from '../components/organisms/MobileSearchHeader'
import { SearchResultsEmptyState } from '../components/organisms/SearchResultsEmptyState'
import { SearchResultsFallbackSections } from '../components/organisms/SearchResultsFallbackSections'
import { SEARCH_RESULT_RECOMMENDED_KEYWORDS } from '../data/searchContent'
import {
  clonePcFilters,
  EMPTY_PC_FILTERS,
  filterCategoryProducts,
} from '../lib/categoryProductFilter'
import { figmaAsset } from '../lib/figmaAssetUrl'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import { useMobileShellFixedPin } from '../hooks/useMobileShellFixedPin'
import { addRecentSearch } from '../lib/recentSearchStorage'
import { buildSearchResultsPath } from '../lib/searchRoutes'
import { getSearchResultsFallbackProducts, resolveSearchResultCount } from '../lib/searchResultsCatalog'
import {
  DEFAULT_STOREFRONT_SORT_INDEX,
  sortSearchProducts,
  STOREFRONT_SORT_OPTIONS,
  toSearchFilterableProduct,
} from '../lib/storefrontSearch'
import { getProductDetailPath } from '../lib/productRoutes'
import { useSearchProducts } from '../hooks/useSearchProducts'
import { useSearchResultsQuery } from '../hooks/useSearchResultsQuery'
import { useSpaPathname } from '../hooks/useSpaPathname'
import { navigateSpa, type SpaPath } from '../lib/spaNavigation'

const SORT_OPTIONS = STOREFRONT_SORT_OPTIONS

const iconListChevron = figmaAsset('icons/list_chevron.svg')
const iconSortCheck = figmaAsset('icons/sort_check_outline.svg')
const iconListFilter = figmaAsset('icons/list_filter.svg')

function MobilePlpSortDropdown({
  sortOpen,
  sortIndex,
  sortRef,
  onToggle,
  onSelect,
}: {
  sortOpen: boolean
  sortIndex: number
  sortRef: React.RefObject<HTMLDivElement | null>
  onToggle: () => void
  onSelect: (index: number) => void
}) {
  return (
    <div ref={sortRef} className="relative shrink-0">
      <button
        type="button"
        className="flex items-center gap-0.5 border-0 bg-transparent p-0 text-bodyMedium2 text-textDefault"
        aria-expanded={sortOpen}
        aria-haspopup="listbox"
        onClick={onToggle}
      >
        {SORT_OPTIONS[sortIndex]}
        <img
          src={iconListChevron}
          alt=""
          aria-hidden
          className={`size-[14px] shrink-0 object-contain transition-transform ${sortOpen ? 'rotate-180' : ''}`}
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
                className="flex w-full items-center justify-between gap-3 border-0 bg-white py-3 pl-[15px] pr-[10px] text-left text-bodySmall text-textDefault"
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

/** Figma 2978:14848 — mobile search results PLP. */
export function MobileSearchResultsPage() {
  const pathname = useSpaPathname()
  const [query, setQuery] = useSearchResultsQuery()
  const sortRef = useRef<HTMLDivElement>(null)
  const [appliedPcFilters] = useState(() => clonePcFilters(EMPTY_PC_FILTERS))
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set())
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [sortIndex, setSortIndex] = useState(DEFAULT_STOREFRONT_SORT_INDEX)
  const [fallbackProducts, setFallbackProducts] = useState({
    recentlyViewed: [] as ReturnType<typeof toSearchFilterableProduct>[],
    recommended: [] as ReturnType<typeof toSearchFilterableProduct>[],
  })
  const { sentinelRef, barRef, pinned, shellLeft, shellWidth, barHeight } = useMobileShellFixedPin()

  const { products: matchedProducts, isLoading, error } = useSearchProducts(query)

  useLockBodyScroll(filterOpen)

  useEffect(() => {
    getSearchResultsFallbackProducts().then((result) => {
      setFallbackProducts({
        recentlyViewed: result.recentlyViewed.map(toSearchFilterableProduct),
        recommended: result.recommended.map(toSearchFilterableProduct),
      })
    })
  }, [pathname])

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

  const commitSearch = useCallback((term: string) => {
    const value = term.trim()
    if (!value) return
    addRecentSearch(value)
    navigateSpa(buildSearchResultsPath(value) as SpaPath)
    setQuery(value)
    setSortOpen(false)
    setFilterOpen(false)
    window.scrollTo(0, 0)
  }, [])

  const queryMatchedProducts = useMemo(
    () => sortSearchProducts(matchedProducts, sortIndex).map(toSearchFilterableProduct),
    [matchedProducts, sortIndex],
  )

  const filteredProducts = useMemo(
    () => filterCategoryProducts(queryMatchedProducts, appliedPcFilters),
    [appliedPcFilters, queryMatchedProducts],
  )

  const hasResults = filteredProducts.length > 0
  const displayCount = resolveSearchResultCount(query, filteredProducts.length)
  const displayCountLabel = displayCount.toLocaleString('ko-KR')

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

  const handleBack = () => {
    navigateSpa('/search')
  }

  return (
    <main className="w-full min-w-0 bg-white lg:hidden">
      <MobileSearchHeader
        query={query}
        onQueryChange={setQuery}
        onCommitSearch={() => commitSearch(query)}
        onBack={handleBack}
        backAriaLabel="검색으로 돌아가기"
        className="sticky top-0 z-40 shrink-0 bg-white"
      />

      <section className="flex flex-col gap-3 px-[15px] py-6">
        <h2 className="m-0 text-bodyRegular2 text-dark">추천 검색어</h2>
        <div className="flex gap-2 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {SEARCH_RESULT_RECOMMENDED_KEYWORDS.map((keyword) => (
            <button
              key={keyword}
              type="button"
              className="shrink-0 rounded-[120px] border border-lightGray bg-white px-4 py-2 text-bodySmall text-dark"
              onClick={() => commitSearch(keyword)}
            >
              {keyword}
            </button>
          ))}
        </div>
      </section>

      {isLoading ? (
        <p className="py-20 text-center text-bodySmall text-light4">상품을 검색하는 중입니다…</p>
      ) : error ? (
        <p className="py-20 text-center text-bodySmall text-light4">검색에 실패했습니다. ({error})</p>
      ) : hasResults ? (
        <>
          <div ref={sentinelRef} className="pointer-events-none h-px w-full shrink-0" aria-hidden />
          {pinned ? <div aria-hidden className="shrink-0" style={{ height: barHeight }} /> : null}
          <div ref={barRef} className="bg-white" style={mobileStickyBarStyle}>
            <div className="flex h-11 items-center justify-between border-y border-light2 px-[15px] py-3.5">
              <button
                type="button"
                className="flex items-center gap-1 border-0 bg-transparent p-0 text-bodyMedium2 text-textDefault"
                aria-label="필터"
                aria-expanded={filterOpen}
                onClick={() => {
                  setFilterOpen(true)
                  setSortOpen(false)
                }}
              >
                <span>필터</span>
                <img src={iconListFilter} alt="" aria-hidden className="size-3.5 object-contain" draggable={false} />
              </button>
              <MobilePlpSortDropdown
                sortOpen={sortOpen}
                sortIndex={sortIndex}
                sortRef={sortRef}
                onToggle={() => setSortOpen((open) => !open)}
                onSelect={(index) => {
                  setSortIndex(index)
                  setSortOpen(false)
                }}
              />
            </div>
          </div>

          <CategoryMobileFilterSheet
            open={filterOpen}
            resultCount={displayCount}
            onClose={() => setFilterOpen(false)}
          />

          <p className="m-0 px-[15px] py-[15px] text-bodySmall text-textDefault">
            <span className="font-semibold text-dark">{displayCountLabel}</span>개의 상품이 있습니다.
          </p>

          <section className="px-[15px] pb-[50px]">
            <div className="grid grid-cols-2 gap-x-2 gap-y-12">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="min-w-0 cursor-pointer"
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
                    titleClassName="line-clamp-2 pt-3 text-bodySmall text-textDefault"
                    showSizeQuickSelect
                  />
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <SearchResultsEmptyState />
          <SearchResultsFallbackSections
            recentlyViewed={fallbackProducts.recentlyViewed}
            recommended={fallbackProducts.recommended}
            likedIds={likedIds}
            onToggleLike={handleToggleLike}
            variant="mobile"
          />
        </>
      )}
    </main>
  )
}
