import type { SearchProductThumb } from '../data/searchContent'

const STORAGE_KEY = 'otz-recently-viewed-products'
const MAX_ITEMS = 12

export function readRecentlyViewedProducts(): SearchProductThumb[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is SearchProductThumb =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as SearchProductThumb).id === 'string' &&
        typeof (item as SearchProductThumb).image === 'string' &&
        typeof (item as SearchProductThumb).title === 'string',
    )
  } catch {
    return []
  }
}

export function writeRecentlyViewedProducts(items: SearchProductThumb[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
}

export function seedRecentlyViewedIfEmpty(items: SearchProductThumb[]) {
  if (readRecentlyViewedProducts().length > 0) return readRecentlyViewedProducts()
  writeRecentlyViewedProducts(items)
  return items
}
