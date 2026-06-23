import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { ProductThumbImage } from '../atoms/ProductThumbImage'
import { useHorizontalMouseDragScroll } from '../../hooks/useHorizontalMouseDragScroll'
import { SearchHighlightText } from '../molecules/SearchHighlightText'
import { PC_POPULAR_SEARCHES, PC_SEASON_KEYWORDS, type SearchProductThumb } from '../../data/searchContent'
import { figmaAsset } from '../../lib/figmaAssetUrl'
import { useSearchAutocomplete, useSearchCatalog } from '../../hooks/useSearchCatalog'
import {
  addRecentSearch,
  clearRecentSearches,
  readRecentSearches,
  removeRecentSearch,
} from '../../lib/recentSearchStorage'
import { mappedProductsToThumbs } from '../../lib/searchResultsCatalog'
import { readRecentlyViewedProducts } from '../../lib/recentlyViewedStorage'
import { getProductDetailPath } from '../../lib/productRoutes'
import { buildSearchResultsPath } from '../../lib/searchRoutes'
import { navigateSpa, type SpaPath } from '../../lib/spaNavigation'
import { useSpaPathname } from '../../hooks/useSpaPathname'

const iconSearch = figmaAsset('icons/gnb_search.svg')
const iconSearchClose = figmaAsset('icons/search_close.svg')

const SEARCH_PLACEHOLDER = '검색어를 입력해 주세요'
const PC_RECENTLY_VIEWED_LIMIT = 10
const PC_RECENTLY_VIEWED_PAGE_SIZE = 4

function chunkProducts<T>(items: readonly T[], pageSize: number): T[][] {
  const pages: T[][] = []
  for (let index = 0; index < items.length; index += pageSize) {
    pages.push(items.slice(index, index + pageSize))
  }
  return pages
}

function PcSearchProductThumb({
  product,
  onNavigate,
}: {
  product: SearchProductThumb
  onNavigate?: () => void
}) {
  return (
    <button
      type="button"
      className="aspect-[170/212] w-[calc((100%-1.5rem)/4)] shrink-0 overflow-hidden border-0 bg-light p-0"
      aria-label={product.title}
      onClick={() => {
        onNavigate?.()
        navigateSpa(getProductDetailPath(product.id))
      }}
    >
      <div className="flex h-full w-full items-center justify-center bg-light">
        <div className="aspect-square w-full max-h-full">
          <ProductThumbImage
            src={product.image}
            alt={product.title}
            className="size-full object-contain object-center mix-blend-multiply"
            draggable={false}
          />
        </div>
      </div>
    </button>
  )
}

function PcRecentlyViewedCarousel({
  products,
  onProductNavigate,
}: {
  products: readonly SearchProductThumb[]
  onProductNavigate?: () => void
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState({ widthPercent: 100, leftPercent: 0 })
  const pages = useMemo(
    () => chunkProducts(products, PC_RECENTLY_VIEWED_PAGE_SIZE),
    [products],
  )

  const syncIndicator = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return

    const { scrollLeft, scrollWidth, clientWidth } = el
    if (scrollWidth <= clientWidth) {
      setIndicator({ widthPercent: 100, leftPercent: 0 })
      return
    }

    setIndicator({
      widthPercent: (clientWidth / scrollWidth) * 100,
      leftPercent: (scrollLeft / scrollWidth) * 100,
    })
  }, [])

  const snapToNearestPage = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return

    const pageWidth = el.clientWidth
    if (pageWidth <= 0 || pages.length <= 1) return

    const maxScrollLeft = pageWidth * (pages.length - 1)
    const pageIndex = Math.round(el.scrollLeft / pageWidth)
    const targetLeft = Math.min(maxScrollLeft, Math.max(0, pageIndex * pageWidth))

    if (Math.abs(el.scrollLeft - targetLeft) < 1) {
      syncIndicator()
      return
    }

    el.scrollTo({ left: targetLeft, behavior: 'smooth' })
  }, [pages.length, syncIndicator])

  const handleDragEnd = useCallback(() => {
    snapToNearestPage()
    syncIndicator()
  }, [snapToNearestPage, syncIndicator])

  useHorizontalMouseDragScroll(scrollerRef, { onDragEnd: handleDragEnd })

  useEffect(() => {
    syncIndicator()
    const el = scrollerRef.current
    if (!el) return

    const resizeObserver = new ResizeObserver(syncIndicator)
    resizeObserver.observe(el)
    return () => resizeObserver.disconnect()
  }, [pages, syncIndicator])

  return (
    <>
      <div
        ref={scrollerRef}
        onScroll={syncIndicator}
        className="flex snap-x snap-mandatory cursor-grab overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden active:cursor-grabbing"
      >
        {pages.map((pageProducts, pageIndex) => (
          <div
            key={`recently-viewed-page-${pageIndex}`}
            className="flex w-full shrink-0 snap-start snap-always gap-2"
          >
            {pageProducts.map((product) => (
              <PcSearchProductThumb
                key={product.id}
                product={product}
                onNavigate={onProductNavigate}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="relative h-0.5 w-full bg-lightGray" aria-hidden>
        <div
          className="absolute top-0 h-full bg-dark"
          style={{
            width: `${indicator.widthPercent}%`,
            left: `${indicator.leftPercent}%`,
          }}
        />
      </div>
    </>
  )
}

export interface PcSearchPanelContentProps {
  query: string
  onQueryChange: (value: string) => void
  inputRef: RefObject<HTMLInputElement | null>
  onSearchCommit?: () => void
  /** Close search panel when navigating to a product from recently viewed. */
  onProductNavigate?: () => void
}

/** Figma 2685:20208 — PC GNB search dropdown (conditional sections). */
export function PcSearchPanelContent({
  query,
  onQueryChange,
  inputRef,
  onSearchCommit,
  onProductNavigate,
}: PcSearchPanelContentProps) {
  const pathname = useSpaPathname()
  const [recentSearches, setRecentSearches] = useState<string[]>(() => readRecentSearches())
  const [recentlyViewed, setRecentlyViewed] = useState<SearchProductThumb[]>(() => readRecentlyViewedProducts())
  const { rows } = useSearchCatalog()

  useEffect(() => {
    setRecentlyViewed(readRecentlyViewedProducts().slice(0, PC_RECENTLY_VIEWED_LIMIT))
  }, [pathname])

  const trimmedQuery = query.trim()
  const isTyping = trimmedQuery.length > 0

  const autocompleteItems = useSearchAutocomplete(trimmedQuery, rows)

  const commitSearch = useCallback(
    (term: string) => {
      const value = term.trim()
      if (!value) return
      setRecentSearches(addRecentSearch(value))
      onQueryChange(value)
      inputRef.current?.blur()
      onSearchCommit?.()
      navigateSpa(buildSearchResultsPath(value) as SpaPath)
    },
    [inputRef, onQueryChange, onSearchCommit],
  )

  const hasRecentSearches = recentSearches.length > 0
  const hasRecentlyViewed = recentlyViewed.length > 0
  const hasSeasonKeywords = PC_SEASON_KEYWORDS.length > 0
  const hasLeftColumn = hasRecentSearches || hasRecentlyViewed
  const visibleRecentlyViewed = recentlyViewed.slice(0, PC_RECENTLY_VIEWED_LIMIT)

  return (
    <div className="mx-auto w-full px-10 pb-[60px] pt-[30px] xl:px-[160px]">
      <div className="flex flex-col gap-8 pt-4">
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center gap-2.5">
            <input
              ref={inputRef}
              id="pc-gnb-search-input"
              type="search"
              name="q"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') commitSearch(query)
              }}
              placeholder={SEARCH_PLACEHOLDER}
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-bodyRegular1 text-dark outline-none placeholder:text-textDefault"
              autoComplete="off"
              aria-label="검색어 입력"
            />
            <button
              type="button"
              className="flex size-10 shrink-0 items-center justify-center border-0 bg-transparent p-0"
              aria-label="검색 실행"
              onClick={() => commitSearch(query)}
            >
              <img src={iconSearch} alt="" aria-hidden className="size-10 object-contain" draggable={false} />
            </button>
          </div>
          <div className="h-px w-full bg-dark" aria-hidden />
        </div>

        {isTyping ? (
          <ul className="m-0 list-none">
            {autocompleteItems.length > 0 ? (
              autocompleteItems.map((item) => (
                <li key={item} className="border-b border-lightGray last:border-b-0">
                  <button
                    type="button"
                    className="flex w-full border-0 bg-transparent py-3 text-left text-bodyRegular2 text-dark"
                    onClick={() => commitSearch(item)}
                  >
                    <SearchHighlightText text={item} query={trimmedQuery} />
                  </button>
                </li>
              ))
            ) : (
              <li className="py-3 text-bodySmall text-subtleText">일치하는 검색어가 없습니다.</li>
            )}
          </ul>
        ) : (
          <div className={`flex items-start ${hasLeftColumn ? 'gap-12' : 'justify-center'}`}>
            {hasLeftColumn ? (
              <div className="flex min-w-0 flex-1 flex-col gap-8">
                {hasRecentSearches ? (
                  <section className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <h2 className="m-0 text-[18px] font-medium leading-[1.2] tracking-[-0.02em] text-dark">
                        최근 검색어
                      </h2>
                      <button
                        type="button"
                        className="border-0 bg-transparent p-0 text-bodyRegular2 text-textDefault underline"
                        onClick={() => setRecentSearches(clearRecentSearches())}
                      >
                        전체삭제
                      </button>
                    </div>
                    <div className="flex max-h-[160px] flex-wrap content-start gap-2 overflow-hidden">
                      {recentSearches.map((term) => (
                        <div
                          key={term}
                          className="flex items-center gap-1.5 rounded-[120px] bg-light2 py-2 pl-4 pr-3"
                        >
                          <button
                            type="button"
                            className="border-0 bg-transparent p-0 text-bodySmall text-dark"
                            onClick={() => commitSearch(term)}
                          >
                            {term}
                          </button>
                          <button
                            type="button"
                            className="flex items-center justify-center border-0 bg-transparent p-0"
                            aria-label={`${term} 삭제`}
                            onClick={() => setRecentSearches(removeRecentSearch(term))}
                          >
                            <img
                              src={iconSearchClose}
                              alt=""
                              aria-hidden
                              className="size-[14px] object-contain"
                              draggable={false}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                {hasRecentlyViewed ? (
                  <section className="flex flex-col gap-4">
                    <h2 className="m-0 text-[18px] font-medium leading-[1.2] tracking-[-0.02em] text-dark">
                      최근 본 상품
                    </h2>
                    <PcRecentlyViewedCarousel
                      products={visibleRecentlyViewed}
                      onProductNavigate={onProductNavigate}
                    />
                  </section>
                ) : null}
              </div>
            ) : null}

            {hasLeftColumn ? <div className="w-px shrink-0 self-stretch bg-lightGray" aria-hidden /> : null}

            <div
              className={`flex shrink-0 gap-8 ${
                hasLeftColumn ? 'w-[600px]' : 'w-full max-w-[600px] justify-center'
              }`}
            >
              <section className="flex min-w-0 flex-1 flex-col gap-6">
                <h2 className="m-0 text-[18px] font-medium leading-[1.2] tracking-[-0.02em] text-dark">
                  인기 검색어
                </h2>
                <div className="flex gap-2">
                  <div className="flex flex-col gap-4 text-bodyRegular2 text-dark">
                    {PC_POPULAR_SEARCHES.map((_, index) => (
                      <span key={`rank-${index + 1}`} className="w-4">
                        {index + 1}.
                      </span>
                    ))}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-4">
                    {PC_POPULAR_SEARCHES.map((term, index) => (
                      <button
                        key={term}
                        type="button"
                        className={`w-fit border-0 bg-transparent p-0 text-left text-bodyRegular2 ${
                          index < 3 ? 'text-primaryText' : 'text-textDefault'
                        }`}
                        onClick={() => commitSearch(term)}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {hasSeasonKeywords ? (
                <section className="flex min-w-0 flex-1 flex-col gap-6">
                  <h2 className="m-0 text-[18px] font-medium leading-[1.2] tracking-[-0.02em] text-dark">
                    시즌 키워드
                  </h2>
                  <ul className="m-0 flex list-none flex-col gap-4 p-0">
                    {PC_SEASON_KEYWORDS.map((keyword) => (
                      <li key={keyword}>
                        <button
                          type="button"
                          className="border-0 bg-transparent p-0 text-left text-bodyRegular2 text-textDefault"
                          onClick={() => commitSearch(keyword)}
                        >
                          {keyword}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
