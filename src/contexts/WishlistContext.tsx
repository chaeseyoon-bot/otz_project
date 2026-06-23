import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  readWishlistProductIds,
  writeWishlistProductIds,
  WISHLIST_CHANGED_EVENT,
} from '../lib/wishlistStorage'

interface WishlistContextValue {
  likedIds: readonly string[]
  isLiked: (productId: string) => boolean
  toggleLike: (productId: string) => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [likedIds, setLikedIds] = useState<string[]>(() => readWishlistProductIds())

  useEffect(() => {
    const refresh = () => setLikedIds(readWishlistProductIds())
    window.addEventListener(WISHLIST_CHANGED_EVENT, refresh)
    return () => window.removeEventListener(WISHLIST_CHANGED_EVENT, refresh)
  }, [])

  const isLiked = useCallback((productId: string) => likedIds.includes(productId), [likedIds])

  const toggleLike = useCallback((productId: string) => {
    setLikedIds((current) => {
      const next = current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [productId, ...current]
      writeWishlistProductIds(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      likedIds,
      isLiked,
      toggleLike,
    }),
    [likedIds, isLiked, toggleLike],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider')
  }
  return context
}
