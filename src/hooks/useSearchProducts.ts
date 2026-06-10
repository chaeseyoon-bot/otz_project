import { useEffect, useState } from 'react'
import type { MappedProduct } from '../lib/productsApi'
import { searchStorefrontProducts } from '../lib/storefrontSearch'

interface UseSearchProductsState {
  products: MappedProduct[]
  isLoading: boolean
  error: string | null
}

/** Resolves storefront search hits from the live Supabase/CSV catalog. */
export function useSearchProducts(query: string): UseSearchProductsState {
  const [state, setState] = useState<UseSearchProductsState>({
    products: [],
    isLoading: true,
    error: null,
  })

  const trimmed = query.trim()

  useEffect(() => {
    let cancelled = false

    if (!trimmed) {
      setState({ products: [], isLoading: false, error: null })
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    searchStorefrontProducts(trimmed)
      .then((products) => {
        if (cancelled) return
        setState({ products, isLoading: false, error: null })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : String(err)
        setState({ products: [], isLoading: false, error: message })
      })

    return () => {
      cancelled = true
    }
  }, [trimmed])

  return state
}
