export const WISHLIST_PATH = '/wishlist' as const

export function isWishlistPath(pathname: string) {
  return pathname === WISHLIST_PATH || pathname.startsWith(`${WISHLIST_PATH}/`)
}
