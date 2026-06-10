import type {
  FilterPcShoeSize,
  FilterProductInfoId,
} from '../data/categoryFilterOptions'

export interface CategoryPcFilters {
  sizes: Set<FilterPcShoeSize>
  colors: Set<string>
  productInfo: Set<FilterProductInfoId>
}

import { resolveProductColorFilterKey } from './productColor'

export interface CategoryFilterableProduct {
  id: string
  /** Product display name — used to infer color when DB color fields are missing. */
  productName?: string | null
  filterSizes: readonly FilterPcShoeSize[]
  /** @deprecated Legacy preset ids — prefer productColorHex. */
  filterColors: readonly string[]
  productColorHex?: string | null
  productColorName?: string | null
  productColorSwatchUrl?: string | null
  freeShipping: boolean
  soldOut: boolean
}

export const EMPTY_PC_FILTERS: CategoryPcFilters = {
  sizes: new Set(),
  colors: new Set(),
  productInfo: new Set(),
}

export function clonePcFilters(filters: CategoryPcFilters): CategoryPcFilters {
  return {
    sizes: new Set(filters.sizes),
    colors: new Set(filters.colors),
    productInfo: new Set(filters.productInfo),
  }
}

export function pcFilterSelectionCount(filters: CategoryPcFilters, key: keyof CategoryPcFilters): number {
  return filters[key].size
}

export function hasActivePcFilters(filters: CategoryPcFilters): boolean {
  return filters.sizes.size > 0 || filters.colors.size > 0 || filters.productInfo.size > 0
}

export function filterCategoryProducts<T extends CategoryFilterableProduct>(
  products: readonly T[],
  filters: CategoryPcFilters,
): T[] {
  return products.filter((product) => {
    if (filters.sizes.size > 0) {
      const matchesSize = product.filterSizes.some((size) => filters.sizes.has(size))
      if (!matchesSize) return false
    }

    if (filters.colors.size > 0) {
      const productHex = resolveProductColorFilterKey(product)
      if (!productHex || !filters.colors.has(productHex)) return false
    }

    if (filters.productInfo.has('excludeSoldOut') && product.soldOut) {
      return false
    }

    if (filters.productInfo.has('freeShipping') && !product.freeShipping) {
      return false
    }

    return true
  })
}
