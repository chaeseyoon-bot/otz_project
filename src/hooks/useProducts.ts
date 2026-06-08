import { useEffect, useState } from 'react'
import {
  fetchBestProducts,
  fetchProducts,
  type FetchProductsParams,
  type MappedProduct,
} from '../lib/productsApi'

export type UiProduct = MappedProduct

interface UseProductsState {
  products: UiProduct[]
  isLoading: boolean
  error: string | null
}

/**
 * Fetches products from the local CSV on mount and whenever the serialized params change.
 */
export function useProducts(params: FetchProductsParams = {}): UseProductsState {
  const [state, setState] = useState<UseProductsState>({
    products: [],
    isLoading: true,
    error: null,
  })

  const paramsKey = JSON.stringify(params)

  useEffect(() => {
    let cancelled = false
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    fetchProducts(JSON.parse(paramsKey) as FetchProductsParams)
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
  }, [paramsKey])

  return state
}

/** BEST PLP — sales-volume ranking will replace the placeholder sort later. */
export function useBestProducts(): UseProductsState {
  const [state, setState] = useState<UseProductsState>({
    products: [],
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    fetchBestProducts()
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
  }, [])

  return state
}
