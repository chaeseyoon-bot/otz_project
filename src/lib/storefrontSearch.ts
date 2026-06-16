import type { CategoryShoeProduct } from '../data/categoryShoesProducts'
import {
  loadProductRowsForSearch,
  mapProductRow,
  parseProductTags,
  productMatchesSearchQuery,
  type MappedProduct,
  type ProductRow,
} from './productsApi'

export function parseDisplayPrice(price: string): number {
  return Number(price.replace(/[^0-9]/g, '')) || 0
}

/** Adapts catalog cards for PC facet filters on search PLP. */
export function toSearchFilterableProduct(item: MappedProduct): CategoryShoeProduct {
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

export const STOREFRONT_SORT_OPTIONS = [
  '인기상품순',
  '낮은가격순',
  '높은가격순',
  '최근등록순',
] as const

export type StorefrontSortOption = (typeof STOREFRONT_SORT_OPTIONS)[number]

/** Default PLP sort — 최근등록순. */
export const DEFAULT_STOREFRONT_SORT_INDEX = STOREFRONT_SORT_OPTIONS.indexOf('최근등록순')

export interface StorefrontSortableProduct {
  id: string
  price: string
  createdAt?: string | null
}

function storefrontProductRegisteredAtMs(product: StorefrontSortableProduct): number {
  const raw = product.createdAt
  if (typeof raw === 'string' && raw.trim()) {
    const parsed = Date.parse(raw)
    if (Number.isFinite(parsed)) return parsed
  }
  return Number(product.id) || 0
}

export function sortStorefrontProducts<T extends StorefrontSortableProduct>(
  products: readonly T[],
  sortIndex: number,
): T[] {
  const sorted = [...products]
  const option = STOREFRONT_SORT_OPTIONS[sortIndex] ?? STOREFRONT_SORT_OPTIONS[DEFAULT_STOREFRONT_SORT_INDEX]

  if (option === '낮은가격순') {
    return sorted.sort((a, b) => parseDisplayPrice(a.price) - parseDisplayPrice(b.price))
  }
  if (option === '높은가격순') {
    return sorted.sort((a, b) => parseDisplayPrice(b.price) - parseDisplayPrice(a.price))
  }
  if (option === '최근등록순') {
    return sorted.sort((a, b) => {
      const aMs = storefrontProductRegisteredAtMs(a)
      const bMs = storefrontProductRegisteredAtMs(b)
      if (aMs !== bMs) return bMs - aMs
      return Number(b.id) - Number(a.id)
    })
  }
  return sorted.sort((a, b) => Number(a.id) - Number(b.id))
}

/** @deprecated Use `sortStorefrontProducts`. */
export function sortSearchProducts(products: readonly MappedProduct[], sortIndex: number): MappedProduct[] {
  return sortStorefrontProducts(products, sortIndex)
}

/** Filters the live catalog by name, tags, subcategory, collection, and id. */
export async function searchStorefrontProducts(query: string): Promise<MappedProduct[]> {
  const rows = await loadProductRowsForSearch()
  const matched = rows.filter((row) => productMatchesSearchQuery(row, query))
  return matched.map(mapProductRow)
}

export function buildSearchAutocompleteSuggestions(
  rows: readonly ProductRow[],
  query: string,
  limit = 8,
): string[] {
  const trimmed = query.trim()
  if (!trimmed) return []

  const lower = trimmed.toLowerCase()
  const results: string[] = []
  const seen = new Set<string>()

  const add = (value: string) => {
    const normalized = value.trim()
    if (!normalized || seen.has(normalized)) return
    if (!normalized.toLowerCase().includes(lower)) return
    seen.add(normalized)
    results.push(normalized)
  }

  for (const row of rows) {
    const title = (row.name || row.title || row.product_name || '').trim()
    if (title) add(title)
    for (const tag of parseProductTags(row.tags)) add(tag)
    if (row.subcategory) add(String(row.subcategory))
    if (row.collection) add(String(row.collection))
    if (results.length >= limit) return results
  }

  return results.slice(0, limit)
}
