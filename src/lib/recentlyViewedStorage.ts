import type { SearchProductThumb } from '../data/searchContent'
import { ensureWorkingProductImageUrl } from './productImage'

const STORAGE_KEY = 'otz-recently-viewed-products'
const MAX_ITEMS = 12
export const RECENTLY_VIEWED_CHANGED_EVENT = 'otz-recently-viewed-changed'

function notifyRecentlyViewedChanged() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(RECENTLY_VIEWED_CHANGED_EVENT))
}

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
  notifyRecentlyViewedChanged()
}

export function seedRecentlyViewedIfEmpty(items: SearchProductThumb[]) {
  if (readRecentlyViewedProducts().length > 0) return readRecentlyViewedProducts()
  writeRecentlyViewedProducts(items)
  return items
}

export function productToRecentlyViewedThumb(product: {
  id: string
  title: string
  image: string
}): SearchProductThumb {
  return {
    id: product.id,
    title: product.title,
    image: product.image,
  }
}

/** Prepends a PDP visit to local recently-viewed storage (deduped, max 12). */
export function recordRecentlyViewedProduct(product: {
  id: string
  title: string
  image: string
}): void {
  const thumb = productToRecentlyViewedThumb(product)

  void ensureWorkingProductImageUrl(thumb.image).then((image) => {
    const resolvedThumb = { ...thumb, image }
    const current = readRecentlyViewedProducts()
    const next = [resolvedThumb, ...current.filter((item) => item.id !== resolvedThumb.id)]
    writeRecentlyViewedProducts(next)
  })
}
