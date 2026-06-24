import {
  ADMIN_FREE_SIZE,
  isShoesProductCategory,
  normalizeProductStockForCategory,
} from './adminProductStock'

/** Storefront PDP / PLP shoe sizes — 220 through 260 in steps of 5 (aligned with admin stock). */
export const STOREFRONT_SHOE_SIZES = [
  '220',
  '225',
  '230',
  '235',
  '240',
  '245',
  '250',
  '255',
  '260',
] as const

export function getStorefrontSizeOptions(dbCategoryLabel: string): readonly string[] {
  return isShoesProductCategory(dbCategoryLabel) ? STOREFRONT_SHOE_SIZES : [ADMIN_FREE_SIZE]
}

export function deriveSoldOutSizesFromStock(stock: unknown, dbCategoryLabel: string): string[] {
  const normalized = normalizeProductStockForCategory(stock, dbCategoryLabel)
  return Object.entries(normalized)
    .filter(([, qty]) => qty <= 0)
    .map(([size]) => size)
}

/** Fallback when only the numeric product id is known (e.g. legacy catalog / cart). */
export function getStorefrontSizeOptionsForProductId(productId: string): readonly string[] {
  const numericId = Number(productId)
  if (!Number.isFinite(numericId)) return STOREFRONT_SHOE_SIZES
  if (numericId >= 2000) return [ADMIN_FREE_SIZE]
  return STOREFRONT_SHOE_SIZES
}

export function isStorefrontShoesProduct(dbCategoryLabel: string): boolean {
  return isShoesProductCategory(dbCategoryLabel)
}

export function parseCartProductId(cartItemId: string): string {
  if (cartItemId.endsWith(`-${ADMIN_FREE_SIZE}`)) {
    return cartItemId.slice(0, -(ADMIN_FREE_SIZE.length + 1))
  }
  const match = cartItemId.match(/^(.+)-(\d{3})$/)
  return match?.[1] ?? cartItemId
}

export function parseOptionLabelSize(optionLabel: string, productId: string): string {
  const match = optionLabel.match(/:\s*([^\]]+)\]?/)
  const parsed = match?.[1]?.trim()
  if (parsed) return parsed
  const options = getStorefrontSizeOptionsForProductId(productId)
  return options[0] ?? STOREFRONT_SHOE_SIZES[0]
}
