import type { CartItem } from '../data/cartContent'

const STORAGE_KEY = 'otz-cart-items'
export const CART_RETENTION_DAYS = 30
const CART_RETENTION_MS = CART_RETENTION_DAYS * 24 * 60 * 60 * 1000

export const CART_RETENTION_NOTICE =
  '장바구니에 담긴 상품은 30일 동안 보관됩니다. 더 오래 상품을 보관하시려면 관심 상품에 담아주시기 바랍니다.'

function isValidCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as CartItem
  return (
    typeof item.id === 'string' &&
    typeof item.productName === 'string' &&
    typeof item.price === 'number' &&
    typeof item.quantity === 'number' &&
    typeof item.optionLabel === 'string' &&
    typeof item.image === 'string' &&
    typeof item.shippingLabel === 'string' &&
    typeof item.selected === 'boolean' &&
    typeof item.shippingBreakdown === 'object' &&
    item.shippingBreakdown !== null
  )
}

export function isCartItemExpired(item: CartItem, now = Date.now()): boolean {
  if (item.addedAt == null) return false
  return now - item.addedAt > CART_RETENTION_MS
}

export function pruneExpiredCartItems(items: CartItem[], now = Date.now()): CartItem[] {
  return items.filter((item) => !isCartItemExpired(item, now))
}

export function readCartItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return pruneExpiredCartItems(parsed.filter(isValidCartItem))
  } catch {
    return []
  }
}

export function writeCartItems(items: CartItem[]) {
  const activeItems = pruneExpiredCartItems(items)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activeItems))
}
