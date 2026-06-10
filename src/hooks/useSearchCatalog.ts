import { useEffect, useMemo, useState } from 'react'
import {
  loadProductRowsForSearch,
  mapProductRow,
  type MappedProduct,
  type ProductRow,
} from '../lib/productsApi'
import { buildSearchAutocompleteSuggestions } from '../lib/storefrontSearch'

interface UseSearchCatalogState {
  rows: ProductRow[]
  products: MappedProduct[]
  isLoading: boolean
  error: string | null
}

/** Loads the full catalog once for search overlay autocomplete and recommended rows. */
export function useSearchCatalog(): UseSearchCatalogState {
  const [state, setState] = useState<UseSearchCatalogState>({
    rows: [],
    products: [],
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    loadProductRowsForSearch()
      .then((rows) => {
        if (cancelled) return
        setState({
          rows,
          products: rows.map(mapProductRow),
          isLoading: false,
          error: null,
        })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : String(err)
        setState({ rows: [], products: [], isLoading: false, error: message })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}

export function useSearchAutocomplete(query: string, rows: readonly ProductRow[]): string[] {
  return useMemo(() => buildSearchAutocompleteSuggestions(rows, query), [query, rows])
}
