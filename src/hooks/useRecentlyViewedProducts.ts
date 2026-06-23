import { useEffect, useState } from 'react'
import type { SearchProductThumb } from '../data/searchContent'
import {
  readRecentlyViewedProducts,
  RECENTLY_VIEWED_CHANGED_EVENT,
} from '../lib/recentlyViewedStorage'

export function useRecentlyViewedProducts(limit?: number): SearchProductThumb[] {
  const [items, setItems] = useState<SearchProductThumb[]>(() => readRecentlyViewedProducts())

  useEffect(() => {
    const refresh = () => setItems(readRecentlyViewedProducts())
    refresh()
    window.addEventListener(RECENTLY_VIEWED_CHANGED_EVENT, refresh)
    return () => window.removeEventListener(RECENTLY_VIEWED_CHANGED_EVENT, refresh)
  }, [])

  return limit != null ? items.slice(0, limit) : items
}
