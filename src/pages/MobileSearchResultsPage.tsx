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
import {
  buildSearchResultsPath,
  readSearchQueryFromLocation,
} from '../lib/searchRoutes'
import { useSpaPathname } from '../hooks/useSpaPathname'
import {
  filterSearchResultsByQuery,
  getSearchResultsFallbackProducts,
  resolveSearchResultCount,
  SEARCH_RESULTS_CATALOG,
} from '../lib/searchResultsCatalog'
import { navigateSpa, type SpaPath } from '../lib/spaNavigation'

const SORT_OPTIONS = ['인기상품순', '낮은가격순', '높은가격순', '신상품순'] as const

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
  const [query, setQuery] = useState(() => readSearchQueryFromLocation())
  const sortRef = useRef<HTMLDivElement>(null)
  const [appliedPcFilters] = useState(() => clonePcFilters(EMPTY_PC_FILTERS))
  const [likedItems, setLikedItems] = useState<boolean[]>(() => SEARCH_RESULTS_CATALOG.map(() => false))
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [sortIndex, setSortIndex] = useState(0)
  const { sentinelRef, barRef, pinned, shellLeft, shellWidth, barHeight } = useMobileShellFixedPin()

  useLockBodyScroll(filterOpen)

  useEffect(() => {
    setQuery(readSearchQueryFromLocation())
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

  const queryMatchedProducts = useMemo(() => filterSearchResultsByQuery(query), [query])

  const filteredProducts = useMemo(
    () => filterCategoryProducts(queryMatchedProducts, appliedPcFilters),
    [appliedPcFilters, queryMatchedProducts],
  )

  const hasResults = filteredProducts.length > 0
  const displayCount = resolveSearchResultCount(query, filteredProducts.length)
  const displayCountLabel = displayCount.toLocaleString('ko-KR')

  const fallbackProducts = useMemo(() => getSearchResultsFallbackProducts(), [])

  const mobileStickyBarStyle: CSSProperties | undefined = pinned
    ? {
        position: 'fixed',
        top: 0,
        left: shellLeft,
        width: shellWidth,
        zIndex: 30,
      }
    : undefined

  const handleToggleLike = (targetIndex: number) => {
    setLikedItems((prev) => prev.map((liked, index) => (index === targetIndex ? !liked : liked)))
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

      {hasResults ? (
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
          {filteredProducts.map((product) => {
            const index = SEARCH_RESULTS_CATALOG.findIndex((item) => item.id === product.id)
            return (
              <div key={product.id} className="min-w-0">
                <ProductCardUnit
                  product={product}
                  liked={likedItems[index]}
                  onToggleLike={() => handleToggleLike(index)}
                  articleClassName="group flex w-full flex-col"
                  titleClassName="line-clamp-2 pt-3 text-bodySmall text-textDefault"
                  showSizeQuickSelect
                />
              </div>
            )
          })}
        </div>
      </section>
        </>
      ) : (
        <>
          <SearchResultsEmptyState />
          <SearchResultsFallbackSections
            recentlyViewed={fallbackProducts.recentlyViewed}
            recommended={fallbackProducts.recommended}
            likedItems={likedItems}
            onToggleLike={handleToggleLike}
            variant="mobile"
          />
        </>
      )}
    </main>
  )
}
