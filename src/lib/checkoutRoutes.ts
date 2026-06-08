export const CHECKOUT_PATH = '/checkout' as const

export function isCheckoutPath(pathname: string) {
  return pathname === CHECKOUT_PATH || pathname === `${CHECKOUT_PATH}/`
}
