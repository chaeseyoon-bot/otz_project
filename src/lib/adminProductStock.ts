import { supabase } from './supabase'

/** Per-size stock map stored in Supabase `products.stock` JSONB — e.g. `{ "240": 30 }`. */
export type ProductSizeStock = Record<string, number>

export type AdminStockStatus = 'on_sale' | 'low_stock' | 'partial_sold_out' | 'sold_out'

/** Admin shoe sizes — 220 through 260 in steps of 5. */
export const ADMIN_STOCK_SIZES = [
  '220',
  '225',
  '230',
  '235',
  '240',
  '245',
  '250',
  '255',
  '260',
] as const

/** Single size key for bag / accessory products. */
export const ADMIN_FREE_SIZE = 'FREE' as const

const LOW_STOCK_THRESHOLD = 15
export const DEFAULT_PRODUCT_STOCK_QTY = 100

export function isShoesProductCategory(category: string): boolean {
  const normalized = category.trim().toLowerCase()
  return normalized === 'shoes01' || normalized === 'shoes02' || normalized === 'shoes'
}

export function getAdminStockSizeKeys(category: string): readonly string[] {
  return isShoesProductCategory(category) ? ADMIN_STOCK_SIZES : [ADMIN_FREE_SIZE]
}

export function buildDefaultProductStock(): ProductSizeStock {
  return Object.fromEntries(ADMIN_STOCK_SIZES.map((size) => [size, DEFAULT_PRODUCT_STOCK_QTY]))
}

export function buildDefaultProductStockForCategory(category: string): ProductSizeStock {
  if (isShoesProductCategory(category)) {
    return buildDefaultProductStock()
  }
  return { [ADMIN_FREE_SIZE]: DEFAULT_PRODUCT_STOCK_QTY }
}

export function parseProductStock(raw: unknown): ProductSizeStock {
  if (raw == null) return {}

  let value: unknown = raw
  if (typeof raw === 'number') {
    return {}
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed) return {}
    try {
      value = JSON.parse(trimmed)
    } catch {
      return {}
    }
  }

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {}
  }

  const out: ProductSizeStock = {}
  for (const [key, qty] of Object.entries(value)) {
    const numeric = Number(qty)
    if (Number.isFinite(numeric) && numeric >= 0) {
      out[key] = Math.round(numeric)
    }
  }
  return out
}

/** Merges parsed stock with shoe size keys (missing sizes → 100). */
export function normalizeProductStock(raw: unknown): ProductSizeStock {
  return normalizeProductStockForCategory(raw, 'shoes01')
}

/** Merges parsed stock with category-appropriate size keys (missing → 100). */
export function normalizeProductStockForCategory(raw: unknown, category: string): ProductSizeStock {
  const parsed = parseProductStock(raw)
  return Object.fromEntries(
    getAdminStockSizeKeys(category).map((size) => [size, parsed[size] ?? DEFAULT_PRODUCT_STOCK_QTY]),
  )
}

export function getTotalProductStock(stock: ProductSizeStock): number {
  return Object.values(stock).reduce((sum, qty) => sum + qty, 0)
}

export function deriveAdminStockStatus(stock: ProductSizeStock): AdminStockStatus {
  const entries = Object.values(stock)
  if (entries.length === 0) return 'on_sale'

  const total = getTotalProductStock(stock)
  if (total === 0) return 'sold_out'

  const zeroCount = entries.filter((qty) => qty === 0).length
  if (zeroCount > 0 && zeroCount < entries.length) return 'partial_sold_out'
  if (total <= LOW_STOCK_THRESHOLD) return 'low_stock'
  return 'on_sale'
}

export function adminStockStatusLabel(status: AdminStockStatus): string {
  switch (status) {
    case 'sold_out':
      return '품절'
    case 'low_stock':
      return '재고부족'
    case 'partial_sold_out':
      return '일부 품절'
    default:
      return '판매중'
  }
}

export function adminStockStatusClass(status: AdminStockStatus): string {
  switch (status) {
    case 'sold_out':
      return 'border-subtleText bg-light text-subtleText'
    case 'low_stock':
      return 'border-primaryText/30 bg-white text-primaryText'
    case 'partial_sold_out':
      return 'border-gray bg-light2 text-dark'
    default:
      return 'border-dark/20 bg-white text-dark'
  }
}

/** Persists category-appropriate stock JSONB to Supabase `products.stock`. */
export async function updateAdminProductStock(
  id: number,
  stock: ProductSizeStock,
  category: string,
): Promise<void> {
  const payload = normalizeProductStockForCategory(stock, category)
  const { error } = await supabase.from('products').update({ stock: payload }).eq('id', id)
  if (error) throw new Error(error.message)
}

/** Sets every product's size-level stock to the default (100 each). */
export async function bulkUpdateAllProductStock(): Promise<number> {
  const stock = buildDefaultProductStock()
  const { data, error } = await supabase
    .from('products')
    .update({ stock })
    .not('id', 'is', null)
    .select('id')

  if (error) throw new Error(error.message)
  return data?.length ?? 0
}
