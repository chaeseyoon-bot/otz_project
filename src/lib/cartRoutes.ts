export const CART_PATH = '/cart' as const

export function isCartPath(pathname: string) {
  return pathname === CART_PATH || pathname === `${CART_PATH}/`
}
