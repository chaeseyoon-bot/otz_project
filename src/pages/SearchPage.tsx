import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ProductThumbImage } from '../components/atoms/ProductThumbImage'
import { MobileSearchSectionHeader } from '../components/molecules/MobileSearchSectionHeader'
import { SearchHighlightText } from '../components/molecules/SearchHighlightText'
import { MobileSearchHeader } from '../components/organisms/MobileSearchHeader'
import {
  POPULAR_SEARCHES,
  SEASON_KEYWORDS,
  type SearchProductThumb,
} from '../data/searchContent'
import { figmaAsset } from '../lib/figmaAssetUrl'
import { useSearchAutocomplete, useSearchCatalog } from '../hooks/useSearchCatalog'
import { useProducts } from '../hooks/useProducts'
import {
  addRecentSearch,
  clearRecentSearches,
  readRecentSearches,
  removeRecentSearch,
} from '../lib/recentSearchStorage'
import { mappedProductsToThumbs } from '../lib/searchResultsCatalog'
import { readRecentlyViewedProducts } from '../lib/recentlyViewedStorage'
import { getProductDetailPath } from '../lib/productRoutes'
import { buildSearchResultsPath } from '../lib/searchRoutes'
import { navigateSpa, type SpaPath } from '../lib/spaNavigation'
import { useSpaPathname } from '../hooks/useSpaPathname'

const iconSearchClose = figmaAsset('icons/search_close.svg')

function HorizontalProductRow({
  products,
  className,
}: {
  products: readonly SearchProductThumb[]
  className?: string
}) {
  return (
    <div
      className={`flex w-full gap-2 overflow-x-auto overscroll-x-contain pr-[15px] touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden${className ? ` ${className}` : ''}`}
    >
      {products.map((product) => (
        <button
          key={product.id}
          type="button"
          className="flex h-[100px] w-[80px] shrink-0 items-center justify-center overflow-hidden border-0 bg-light2 p-0"
          aria-label={product.title}
          onClick={() => navigateSpa(getProductDetailPath(product.id))}
        >
          <ProductThumbImage
            src={product.image}
            alt={product.title}
            className="size-[80px] object-contain object-center mix-blend-multiply"
            draggable={false}
          />
        </button>
      ))}
    </div>
  )
}

/** Figma 2689:5739 — mobile search overlay (recent / season / popular / products / autocomplete). */
export function SearchPage() {
  const pathname = useSpaPathname()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>(() => readRecentSearches())
  const [recentlyViewed, setRecentlyViewed] = useState<SearchProductThumb[]>(() =>
    readRecentlyViewedProducts(),
  )
  const { rows } = useSearchCatalog()
  const { products: forYouProducts } = useProducts({ flag: 'is_foru', limit: 6 })
  const { products: catalogProducts } = useProducts({ limit: 6 })

  const recommendedProducts = useMemo(() => {
    const source =
      forYouProducts.length > 0
        ? forYouProducts
        : catalogProducts
    return mappedProductsToThumbs(source)
  }, [catalogProducts, forYouProducts])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    setRecentlyViewed(readRecentlyViewedProducts())
  }, [pathname])

  const trimmedQuery = query.trim()
  const isTyping = trimmedQuery.length > 0

  const autocompleteItems = useSearchAutocomplete(trimmedQuery, rows)

  const commitSearch = useCallback((term: string) => {
    const value = term.trim()
    if (!value) return
    setRecentSearches(addRecentSearch(value))
    navigateSpa(buildSearchResultsPath(value) as SpaPath)
    inputRef.current?.blur()
  }, [])

  const handleBack = () => {
    window.history.back()
  }

  const popularLeft = POPULAR_SEARCHES.slice(0, 5)
  const popularRight = POPULAR_SEARCHES.slice(5, 10)

  return (
    <div className="flex min-h-[calc(100vh-50px)] w-full min-w-0 flex-col overflow-x-hidden bg-white lg:hidden">
      <MobileSearchHeader
        query={query}
        onQueryChange={setQuery}
        onCommitSearch={() => commitSearch(query)}
        onBack={handleBack}
        backAriaLabel="검색 닫기"
        inputRef={inputRef}
        autoFocus
      />

      {isTyping ? (
        <ul className="m-0 list-none px-[15px] pt-6">
          {autocompleteItems.length > 0 ? (
            autocompleteItems.map((item) => (
              <li key={item} className="border-b border-light2 last:border-b-0">
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
        <div className="min-w-0 flex-1 w-full overflow-x-hidden pb-10">
          {recentSearches.length > 0 ? (
            <section className="px-[15px] pt-6">
              <MobileSearchSectionHeader
                title="최근 검색어"
                actionLabel="전체삭제"
                onAction={() => setRecentSearches(clearRecentSearches())}
              />
              <div className="mt-4 flex gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {recentSearches.map((term) => (
                  <div
                    key={term}
                    className="flex shrink-0 items-center gap-1.5 rounded-[120px] bg-light2 py-2 pl-4 pr-3"
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
                        className="size-[14px] shrink-0 object-contain"
                        draggable={false}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {SEASON_KEYWORDS.length > 0 ? (
            <section
              className={`w-full overflow-x-hidden pl-[15px] pr-0 ${recentSearches.length > 0 ? 'pt-8' : 'pt-6'}`}
            >
              <MobileSearchSectionHeader title="시즌 키워드" className="w-full pr-[15px]" />
              <div className="mt-4 flex w-full max-w-full gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {SEASON_KEYWORDS.map((keyword) => (
                  <button
                    key={keyword}
                    type="button"
                    className="shrink-0 rounded-[120px] border border-gray bg-white px-4 py-2 text-bodySmall text-dark"
                    onClick={() => commitSearch(keyword)}
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section
            className={`px-[15px] ${
              recentSearches.length > 0 || SEASON_KEYWORDS.length > 0 ? 'pt-8' : 'pt-6'
            }`}
          >
            <MobileSearchSectionHeader title="인기 검색어" />
            <div className="mt-4 flex w-full gap-0 text-bodyRegular2">
              <ol className="m-0 flex flex-1 list-none flex-col p-0">
                {popularLeft.map((term, index) => {
                  const rank = index + 1
                  const isTopThree = rank <= 3
                  return (
                    <li key={term}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-1 border-0 bg-transparent py-2 text-left"
                        onClick={() => commitSearch(term)}
                      >
                        <span className="w-[18px] shrink-0 text-dark">{rank}.</span>
                        <span className={isTopThree ? 'text-primaryText' : 'text-textDefault'}>{term}</span>
                      </button>
                    </li>
                  )
                })}
              </ol>
              <ol className="m-0 flex flex-1 list-none flex-col p-0">
                {popularRight.map((term, index) => {
                  const rank = index + 6
                  return (
                    <li key={term}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-1 border-0 bg-transparent py-2 text-left"
                        onClick={() => commitSearch(term)}
                      >
                        <span className="w-[18px] shrink-0 text-dark">{rank}.</span>
                        <span className="text-textDefault">{term}</span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </div>
          </section>

          {recentlyViewed.length > 0 ? (
            <section className="pl-[15px] pt-8">
              <div className="flex w-full min-w-0 flex-col items-start justify-start gap-4">
                <MobileSearchSectionHeader title="최근 본 상품" className="w-full pr-[15px]" />
                <HorizontalProductRow products={recentlyViewed} />
              </div>
            </section>
          ) : null}

          {recommendedProducts.length > 0 ? (
            <section className="pl-[15px] pt-8">
              <div className="flex min-w-0 flex-col gap-4">
                <MobileSearchSectionHeader title="추천 상품" className="w-full pr-[15px]" />
                <HorizontalProductRow products={recommendedProducts} />
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  )
}
