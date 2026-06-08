import type { ProductCardItem } from '../components/molecules/ProductCardUnit'
import { buildShoesCategoryProducts } from '../data/categoryShoesProducts'
import {
  DEMO_PC_SEARCH_RESULT_TOTAL,
  DEMO_RECENTLY_VIEWED_PRODUCTS,
  DEMO_SEARCH_RESULT_TOTAL,
  RECOMMENDED_SEARCH_PRODUCTS,
  type SearchProductThumb,
} from '../data/searchContent'
import { seedRecentlyViewedIfEmpty } from './recentlyViewedStorage'

export const SEARCH_RESULTS_CATALOG = buildShoesCategoryProducts()

/** Figma 2978:14707 — demo query with zero matches. */
export const DEMO_EMPTY_SEARCH_QUERY = '운동복'

const FALLBACK_ROW_SIZE = 5

function thumbToCatalogProduct(thumb: SearchProductThumb): ProductCardItem | undefined {
  const match = thumb.id.match(/search-product-(\d+)/)
  if (!match) return undefined
  return SEARCH_RESULTS_CATALOG.find((product) => product.id === `shoes-${match[1]}`)
}

export function filterSearchResultsByQuery(query: string) {
  const trimmed = query.trim()
  if (!trimmed) return []

  const lower = trimmed.toLowerCase()
  return SEARCH_RESULTS_CATALOG.filter((product) => product.title.toLowerCase().includes(lower))
}

/** Demo totals for Figma preview keywords (only when matches exist). */
export function resolveSearchResultCount(query: string, filteredLength: number) {
  if (filteredLength === 0) return 0
  if (query.includes('메리제인')) return DEMO_PC_SEARCH_RESULT_TOTAL
  if (query.includes('스니커즈') || query.includes('운동화')) return DEMO_SEARCH_RESULT_TOTAL
  return filteredLength
}

export function getSearchResultsFallbackProducts() {
  const recentlyViewed = seedRecentlyViewedIfEmpty([...DEMO_RECENTLY_VIEWED_PRODUCTS])
    .map(thumbToCatalogProduct)
    .filter((product): product is ProductCardItem => product !== undefined)

  const recommended = RECOMMENDED_SEARCH_PRODUCTS.map(thumbToCatalogProduct).filter(
    (product): product is ProductCardItem => product !== undefined,
  )

  const fallbackRecently =
    recentlyViewed.length >= FALLBACK_ROW_SIZE
      ? recentlyViewed.slice(0, FALLBACK_ROW_SIZE)
      : [...recentlyViewed, ...SEARCH_RESULTS_CATALOG].slice(0, FALLBACK_ROW_SIZE)

  const fallbackRecommended =
    recommended.length >= FALLBACK_ROW_SIZE
      ? recommended.slice(0, FALLBACK_ROW_SIZE)
      : SEARCH_RESULTS_CATALOG.slice(0, FALLBACK_ROW_SIZE)

  return {
    recentlyViewed: fallbackRecently,
    recommended: fallbackRecommended,
  }
}
