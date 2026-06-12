export const ADMIN_PATH = '/admin' as const
export const ADMIN_PRODUCTS_PATH = '/admin/products' as const
export const ADMIN_PRODUCT_NEW_PATH = '/admin/products/new' as const
export const ADMIN_MAIN_PATH = '/admin/main' as const
export const ADMIN_ARCHIVE_PATH = '/admin/archive' as const
export const ADMIN_EDITORIAL_PATH = '/admin/editorial' as const

export function isAdminPath(pathname: string) {
  return pathname === ADMIN_PATH || pathname.startsWith('/admin/')
}

export function isAdminProductFormPath(pathname: string) {
  return pathname === ADMIN_PRODUCT_NEW_PATH || parseAdminProductEditId(pathname) != null
}

export function parseAdminProductEditId(pathname: string): number | null {
  const match = pathname.match(/^\/admin\/products\/(\d+)\/edit$/)
  if (!match) return null
  const id = Number(match[1])
  return Number.isFinite(id) ? id : null
}

export function getAdminProductEditPath(id: number) {
  return `/admin/products/${id}/edit` as const
}

export function isAdminProductsPath(pathname: string) {
  return (
    pathname === ADMIN_PRODUCTS_PATH ||
    pathname === ADMIN_PATH ||
    isAdminProductFormPath(pathname)
  )
}

export function isAdminMainPath(pathname: string) {
  return pathname === ADMIN_MAIN_PATH
}

export function isAdminArchivePath(pathname: string) {
  return pathname === ADMIN_ARCHIVE_PATH
}

export function isAdminEditorialPath(pathname: string) {
  return pathname === ADMIN_EDITORIAL_PATH
}

export function getAdminActiveMenu(
  pathname: string,
): 'products-list' | 'products-new' | 'main' | 'archive' | 'editorial' {
  if (isAdminEditorialPath(pathname)) return 'editorial'
  if (isAdminArchivePath(pathname)) return 'archive'
  if (isAdminMainPath(pathname)) return 'main'
  if (pathname === ADMIN_PRODUCT_NEW_PATH) return 'products-new'
  return 'products-list'
}
