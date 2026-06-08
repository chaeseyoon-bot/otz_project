import type { ProductCardItem } from '../components/molecules/ProductCardUnit'
import { SEARCH_RESULTS_CATALOG } from './searchResultsCatalog'

/** Resolve PLP / search catalog item by id (e.g. `shoes-3`). */
export function getProductById(productId: string): ProductCardItem | undefined {
  return SEARCH_RESULTS_CATALOG.find((product) => product.id === productId)
}
