import { isAdminPath } from './adminRoutes'
import { isArchiveDetailPath } from './archiveRoutes'
import { isCartPath } from './cartRoutes'
import { isCheckoutPath } from './checkoutRoutes'
import { isOrderCompletePath, isOrderDetailPath } from './orderRoutes'
import { isMyPagePath } from './myPageRoutes'
import { isProductDetailPath } from './productRoutes'
import { isSearchResultsPath } from './searchRoutes'

export type SpaPath =
  | '/'
  | '/new'
  | '/best'
  | '/archive'
  | '/editorial'
  | '/brand-story'
  | '/category/shoes'
  | '/mypage'
  | '/cart'
  | '/checkout'
  | '/checkout/complete'
  | '/search'
  | `/search/results${string}`
  | `/archive/${string}`
  | `/product/${string}`
  | `/mypage/orders/${string}`
  | '/admin'
  | '/admin/products'
  | '/admin/products/new'
  | `/admin/products/${string}/edit`
  | '/admin/main'

type PathListener = (pathname: string) => void

const pathnameListeners = new Set<PathListener>()

export function getSpaPathname(): string {
  return window.location.pathname || '/'
}

export function getSpaHref(): string {
  const pathname = getSpaPathname()
  const search = window.location.search
  return `${pathname}${search}`
}

function notifyPathnameListeners() {
  const pathname = getSpaPathname()
  pathnameListeners.forEach((listener) => listener(pathname))
}

/** Notifies SPA listeners after `pushState` / `replaceState` (pathname or query). */
export function notifySpaNavigation() {
  notifyPathnameListeners()
  window.dispatchEvent(new PopStateEvent('popstate'))
}

/** Subscribe to SPA path changes (pushState, popstate, navigateSpa). */
export function subscribeSpaPathname(listener: PathListener): () => void {
  pathnameListeners.add(listener)
  return () => pathnameListeners.delete(listener)
}

export function isSpaPath(path: string): path is SpaPath {
  if (path === '/' || path === '') return true
  if (path.startsWith('/new')) return true
  if (path.startsWith('/best')) return true
  if (path === '/archive') return true
  if (isArchiveDetailPath(path)) return true
  if (path.startsWith('/editorial')) return true
  if (path.startsWith('/brand-story')) return true
  if (path.startsWith('/category/shoes')) return true
  if (isMyPagePath(path)) return true
  if (isCartPath(path)) return true
  if (isCheckoutPath(path)) return true
  if (isOrderCompletePath(path)) return true
  if (isOrderDetailPath(path)) return true
  if (path === '/search' || path === '/search/') return true
  if (isSearchResultsPath(path)) return true
  if (isProductDetailPath(path)) return true
  if (isAdminPath(path)) return true
  return false
}

export function isAlreadyOnSpaPath(path: SpaPath) {
  const p = getSpaPathname()
  if (path === '/') return p === '/' || p === ''
  if (path === '/archive') return p === '/archive'
  return p === path
}

export function navigateSpa(path: SpaPath) {
  if (getSpaHref() !== path) {
    window.history.pushState({}, '', path)
  }
  notifySpaNavigation()
  if (path === '/' || path === '/brand-story') {
    window.scrollTo(0, 0)
  }
}

export { getArchiveDetailPath } from './archiveRoutes'
