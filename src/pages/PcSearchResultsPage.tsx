import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ProductCardUnit } from '../components/molecules/ProductCardUnit'
import { CategoryPcFilterBar } from '../components/organisms/CategoryPcFilterBar'
import { SearchResultsEmptyState } from '../components/organisms/SearchResultsEmptyState'
import { SearchResultsFallbackSections } from '../components/organisms/SearchResultsFallbackSections'
import { SEARCH_RESULT_RECOMMENDED_KEYWORDS } from '../data/searchContent'
import { figmaAsset } from '../lib/figmaAssetUrl'
import {
  clonePcFilters,
  EMPTY_PC_FILTERS,
  filterCategoryProducts,
} from '../lib/categoryProductFilter'
import { addRecentSearch } from '../lib/recentSearchStorage'
import {
  filterSearchResultsByQuery,
  getSearchResultsFallbackProducts,
  resolveSearchResultCount,
  SEARCH_RESULTS_CATALOG,
} from '../lib/searchResultsCatalog'
import { buildSearchResultsPath, readSearchQueryFromLocation } from '../lib/searchRoutes'
import { useSpaPathname } from '../hooks/useSpaPathname'
import { navigateSpa, type SpaPath } from '../lib/spaNavigation'

const SORT_OPTIONS = ['인기상품순', '낮은가격순', '높은가격순', '신상품순'] as const

const iconListChevron = figmaAsset('icons/list_chevron.svg')
const iconSortCheck = figmaAsset('icons/sort_check_outline.svg')

function PcSortDropdown({
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
        className="flex items-center gap-2 rounded-[2px] border-0 bg-transparent py-0 pl-4 pr-0 text-right text-bodyRegular2 text-dark"
        aria-expanded={sortOpen}
        aria-haspopup="listbox"
        onClick={onToggle}
      >
        {SORT_OPTIONS[sortIndex]}
        <img
          src={iconListChevron}
          alt=""
          aria-hidden
          className={`size-4 shrink-0 object-contain transition-transform ${sortOpen ? 'rotate-180' : ''}`}
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
                className="flex w-full items-center justify-between gap-3 border-0 bg-white py-3 pl-[15px] pr-[10px] text-left text-bodyRegular2 text-textDefault"
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

/** Figma 2978:14413 — PC search results PLP. */
export function PcSearchResultsPage() {
  const pathname = useSpaPathname()
  const [query, setQuery] = useState(() => readSearchQueryFromLocation())
  const sortRef = useRef<HTMLDivElement>(null)
  const [appliedPcFilters, setAppliedPcFilters] = useState(() => clonePcFilters(EMPTY_PC_FILTERS))
  const [likedItems, setLikedItems] = useState<boolean[]>(() => SEARCH_RESULTS_CATALOG.map(() => false))
  const [sortOpen, setSortOpen] = useState(false)
  const [sortIndex, setSortIndex] = useState(0)

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

  const handleToggleLike = (targetIndex: number) => {
    setLikedItems((prev) => prev.map((liked, index) => (index === targetIndex ? !liked : liked)))
  }

  return (
    <main className="hidden bg-white lg:block">
      <section className="mx-auto max-w-[1400px] px-0 pb-20 pt-10">
        <div className="flex items-end gap-2 border-b border-light2 pb-8">
          <h1 className="m-0 shrink-0 text-h2 text-dark">{`“${query}”`}</h1>
          <p className="m-0 pb-1 text-bodyRegular1 text-dark">
            검색결과 <span className="font-bold text-primaryText">{displayCountLabel}</span>개의 상품
          </p>
        </div>

        <div className="flex items-center gap-4 border-b border-light2 bg-whiteGray px-6 py-4">
          <span className="shrink-0 text-bodyRegular2 text-dark">추천 검색어</span>
          <div className="flex flex-wrap gap-2">
            {SEARCH_RESULT_RECOMMENDED_KEYWORDS.map((keyword) => (
              <button
                key={keyword}
                type="button"
                className="rounded-[120px] border border-lightGray bg-white px-4 py-2 text-bodySmall text-dark"
                onClick={() => commitSearch(keyword)}
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>

        {hasResults ? (
          <>
            <CategoryPcFilterBar
              products={queryMatchedProducts}
              appliedFilters={appliedPcFilters}
              onApply={setAppliedPcFilters}
              onResetAll={() => setAppliedPcFilters(clonePcFilters(EMPTY_PC_FILTERS))}
            />

            <div className="relative z-40 flex w-full items-center justify-between pb-5 pt-[50px]">
              <p className="m-0 text-bodyMedium1 text-dark">
                {displayCountLabel}개의 상품이 있습니다.
              </p>
              <PcSortDropdown
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

            <div className="grid grid-cols-4 gap-x-[10px] gap-y-14">
              {filteredProducts.map((product) => {
                const index = SEARCH_RESULTS_CATALOG.findIndex((item) => item.id === product.id)
                return (
                  <div key={product.id} className="min-w-0">
                    <ProductCardUnit
                      product={product}
                      liked={likedItems[index]}
                      onToggleLike={() => handleToggleLike(index)}
                      articleClassName="group flex w-full flex-col"
                      titleClassName="min-w-0 truncate pt-3 text-bodyRegular2 text-textDefault"
                      showSizeQuickSelect
                    />
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <SearchResultsEmptyState />
            <SearchResultsFallbackSections
              recentlyViewed={fallbackProducts.recentlyViewed}
              recommended={fallbackProducts.recommended}
              likedItems={likedItems}
              onToggleLike={handleToggleLike}
              variant="pc"
            />
          </>
        )}
      </section>
    </main>
  )
}
