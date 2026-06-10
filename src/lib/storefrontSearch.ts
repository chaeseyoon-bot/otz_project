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

const SORT_OPTIONS = ['인기상품순', '낮은가격순', '높은가격순', '신상품순'] as const

export function sortSearchProducts(products: readonly MappedProduct[], sortIndex: number): MappedProduct[] {
  const sorted = [...products]
  const option = SORT_OPTIONS[sortIndex] ?? SORT_OPTIONS[0]

  if (option === '낮은가격순') {
    return sorted.sort((a, b) => parseDisplayPrice(a.price) - parseDisplayPrice(b.price))
  }
  if (option === '높은가격순') {
    return sorted.sort((a, b) => parseDisplayPrice(b.price) - parseDisplayPrice(a.price))
  }
  if (option === '신상품순') {
    return sorted.sort((a, b) => Number(b.id) - Number(a.id))
  }
  return sorted.sort((a, b) => Number(a.id) - Number(b.id))
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
