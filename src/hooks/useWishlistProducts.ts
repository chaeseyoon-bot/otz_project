import { useEffect, useState } from 'react'
import { fetchProductById, type MappedProduct } from '../lib/productsApi'

export function useWishlistProducts(likedIds: readonly string[]) {
  const [products, setProducts] = useState<MappedProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const likedIdsKey = likedIds.join(',')

  useEffect(() => {
    let cancelled = false

    if (likedIds.length === 0) {
      setProducts([])
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    void Promise.all(likedIds.map((id) => fetchProductById(id)))
      .then((results) => {
        if (cancelled) return
        const byId = new Map(
          results.filter((product): product is MappedProduct => product != null).map((product) => [product.id, product]),
        )
        setProducts(
          likedIds
            .map((id) => byId.get(id))
            .filter((product): product is MappedProduct => product != null),
        )
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setProducts([])
        setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [likedIds, likedIdsKey])

  return { products, isLoading, error }
}
