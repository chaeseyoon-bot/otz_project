import type { ProductCardItem } from '../components/molecules/ProductCardUnit'
import type { SearchProductThumb } from '../data/searchContent'
import { fetchProducts, type MappedProduct } from './productsApi'
import { readRecentlyViewedProducts } from './recentlyViewedStorage'
import { searchStorefrontProducts } from './storefrontSearch'

const FALLBACK_ROW_SIZE = 5

/** @deprecated Demo catalog — prefer `useSearchProducts` / `searchStorefrontProducts`. */
export const SEARCH_RESULTS_CATALOG: ProductCardItem[] = []

export function filterSearchResultsByQuery(query: string) {
  const trimmed = query.trim()
  if (!trimmed) return []
  void searchStorefrontProducts(trimmed)
  return []
}

export function resolveSearchResultCount(_query: string, filteredLength: number) {
  return filteredLength
}

function mapThumbToProduct(
  thumb: SearchProductThumb,
  catalog: readonly MappedProduct[],
): ProductCardItem | undefined {
  return catalog.find((product) => product.id === thumb.id)
}

export async function getSearchResultsFallbackProducts(): Promise<{
  recentlyViewed: ProductCardItem[]
  recommended: ProductCardItem[]
}> {
  const [catalog, forYou] = await Promise.all([
    fetchProducts(),
    fetchProducts({ flag: 'is_foru', limit: FALLBACK_ROW_SIZE }),
  ])

  const recentlyViewedThumbs = readRecentlyViewedProducts()
  const recentlyViewed = recentlyViewedThumbs
    .map((thumb) => mapThumbToProduct(thumb, catalog))
    .filter((product): product is ProductCardItem => product !== undefined)

  const recommendedSource =
    forYou.length >= FALLBACK_ROW_SIZE
      ? forYou
      : [...forYou, ...catalog.filter((item) => !forYou.some((pick) => pick.id === item.id))].slice(
          0,
          FALLBACK_ROW_SIZE,
        )

  const fallbackRecently =
    recentlyViewed.length >= FALLBACK_ROW_SIZE
      ? recentlyViewed.slice(0, FALLBACK_ROW_SIZE)
      : [...recentlyViewed, ...catalog].slice(0, FALLBACK_ROW_SIZE)

  const fallbackRecommended =
    recommendedSource.length >= FALLBACK_ROW_SIZE
      ? recommendedSource.slice(0, FALLBACK_ROW_SIZE)
      : catalog.slice(0, FALLBACK_ROW_SIZE)

  return {
    recentlyViewed: fallbackRecently,
    recommended: fallbackRecommended,
  }
}

export function mappedProductsToThumbs(products: readonly MappedProduct[]): SearchProductThumb[] {
  return products.map((product) => ({
    id: product.id,
    title: product.title,
    image: product.image,
  }))
}
