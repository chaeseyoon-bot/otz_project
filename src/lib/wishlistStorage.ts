const STORAGE_KEY = 'otz-wishlist-product-ids'
export const WISHLIST_CHANGED_EVENT = 'otz-wishlist-changed'

function notifyWishlistChanged() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(WISHLIST_CHANGED_EVENT))
}

export function readWishlistProductIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id): id is string => typeof id === 'string' && id.length > 0)
  } catch {
    return []
  }
}

export function writeWishlistProductIds(ids: string[]) {
  const unique = ids.filter((id, index) => ids.indexOf(id) === index)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unique))
  notifyWishlistChanged()
}
