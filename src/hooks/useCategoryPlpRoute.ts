import { useEffect, useMemo, useState } from 'react'
import { parseCategoryPlpSearch, type CategoryPlpMainId } from '../lib/categoryRoutes'
import { getSpaPathname, subscribeSpaPathname } from '../lib/spaNavigation'

/** Reads `main` / `sub` query params for the category PLP (GNB → PLP deep links). */
export function useCategoryPlpRoute() {
  const [routeKey, setRouteKey] = useState(
    () => `${getSpaPathname()}${window.location.search}`,
  )

  useEffect(() => {
    const sync = () => setRouteKey(`${getSpaPathname()}${window.location.search}`)
    window.addEventListener('popstate', sync)
    const unsubscribe = subscribeSpaPathname(sync)
    return () => {
      window.removeEventListener('popstate', sync)
      unsubscribe()
    }
  }, [])

  return useMemo(() => {
    const pathname = getSpaPathname()
    if (!pathname.startsWith('/category/shoes')) {
      return { mainId: 'shoes' as CategoryPlpMainId, subIndex: 0 }
    }
    return parseCategoryPlpSearch(window.location.search)
  }, [routeKey])
}
