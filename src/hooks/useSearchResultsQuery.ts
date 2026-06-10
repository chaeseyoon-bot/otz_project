import { useEffect, useState } from 'react'
import { readSearchQueryFromLocation } from '../lib/searchRoutes'
import { subscribeSpaPathname } from '../lib/spaNavigation'

/** Keeps search results query in sync when only `?q=` changes on `/search/results`. */
export function useSearchResultsQuery() {
  const [query, setQuery] = useState(() => readSearchQueryFromLocation())

  useEffect(() => {
    const syncFromLocation = () => setQuery(readSearchQueryFromLocation())
    window.addEventListener('popstate', syncFromLocation)
    const unsubscribe = subscribeSpaPathname(syncFromLocation)
    return () => {
      window.removeEventListener('popstate', syncFromLocation)
      unsubscribe()
    }
  }, [])

  return [query, setQuery] as const
}
