import type { ProductCardItem } from '../components/molecules/ProductCardUnit'
import { buildShoesCategoryProducts } from '../data/categoryShoesProducts'

const DEMO_PDP_CATALOG = buildShoesCategoryProducts()

/** Resolve legacy demo PDP cards by id (e.g. `shoes-3`). Real ids use `useProductDetail`. */
export function getProductById(productId: string): ProductCardItem | undefined {
  return DEMO_PDP_CATALOG.find((product) => product.id === productId)
}
