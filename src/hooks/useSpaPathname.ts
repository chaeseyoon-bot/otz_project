import { useEffect, useState } from 'react'
import { getSpaHref, getSpaPathname, subscribeSpaPathname } from '../lib/spaNavigation'

/** Shared pathname for client-side routes (`/`, `/new`, `/best`, …). */
export function useSpaPathname() {
  const [pathname, setPathname] = useState(getSpaPathname)

  useEffect(() => {
    const onPopState = () => setPathname(getSpaPathname())
    window.addEventListener('popstate', onPopState)
    const unsubscribe = subscribeSpaPathname(setPathname)
    return () => {
      window.removeEventListener('popstate', onPopState)
      unsubscribe()
    }
  }, [])

  return pathname
}

/** Pathname + search — use for scroll reset when query-only navigation changes the view. */
export function useSpaRouteKey() {
  const [routeKey, setRouteKey] = useState(getSpaHref)

  useEffect(() => {
    const sync = () => setRouteKey(getSpaHref())
    window.addEventListener('popstate', sync)
    const unsubscribe = subscribeSpaPathname(sync)
    return () => {
      window.removeEventListener('popstate', sync)
      unsubscribe()
    }
  }, [])

  return routeKey
}
