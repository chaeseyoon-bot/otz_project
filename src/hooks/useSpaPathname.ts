import { useEffect, useState } from 'react'
import { getSpaPathname, subscribeSpaPathname } from '../lib/spaNavigation'

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
