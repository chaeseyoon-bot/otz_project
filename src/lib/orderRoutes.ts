export const ORDER_COMPLETE_PATH = '/checkout/complete' as const
export const ORDER_DETAIL_PATH_PREFIX = '/mypage/orders/' as const

export function isOrderCompletePath(pathname: string) {
  return pathname === ORDER_COMPLETE_PATH || pathname === `${ORDER_COMPLETE_PATH}/`
}

export function parseOrderDetailId(pathname: string): string | null {
  if (!pathname.startsWith(ORDER_DETAIL_PATH_PREFIX)) return null
  const id = pathname.slice(ORDER_DETAIL_PATH_PREFIX.length).replace(/\/$/, '')
  return id.length > 0 ? decodeURIComponent(id) : null
}

export function isOrderDetailPath(pathname: string) {
  return parseOrderDetailId(pathname) != null
}

export function getOrderDetailPath(orderId: string) {
  return `${ORDER_DETAIL_PATH_PREFIX}${encodeURIComponent(orderId)}`
}
