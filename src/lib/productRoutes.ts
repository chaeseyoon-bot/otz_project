/** SPA path: `/product/shoes-3` */
export function parseProductId(pathname: string): string | null {
  const match = pathname.match(/^\/product\/([^/]+)\/?$/)
  return match ? decodeURIComponent(match[1]) : null
}

export function isProductDetailPath(pathname: string): boolean {
  return parseProductId(pathname) != null
}

export function getProductDetailPath(productId: string): `/product/${string}` {
  return `/product/${encodeURIComponent(productId)}`
}

/** Catalog id `shoes-3` → product index `3`. */
export function parseShoesProductNum(productId: string): number | null {
  const match = productId.match(/^shoes-(\d+)$/)
  if (!match) return null
  const num = Number(match[1])
  return Number.isFinite(num) && num > 0 ? num : null
}
