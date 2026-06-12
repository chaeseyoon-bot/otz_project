import type { ProductCardItem, ProductMultiCutSlide } from '../components/molecules/ProductCardUnit'
import { FILTER_COLOR_OPTIONS } from '../data/categoryFilterOptions'
import { normalizeColorHex } from './productColor'
import {
  buildDefaultProductStockForCategory,
  getTotalProductStock,
  normalizeProductStockForCategory,
  parseProductStock,
} from './adminProductStock'
import { deriveSoldOutSizesFromStock, getStorefrontSizeOptions } from './productSizeOptions'
import {
  imageUrlCacheVersion,
  PRODUCT_CARD_CUTS,
  PRODUCT_PDP_CUTS,
  productCutUrl,
  productImageUrl,
  withProductImageCacheBust,
} from './productImage'
import { parseCsvToObjects } from './csv'
import { supabase, isSupabaseConfigured } from './supabase'

/** Logical category derived from the id range (Shoes: 1000s, Bag/Acc: 2000–3999). */
export type ProductCategory = 'shoes' | 'bagacc'

/**
 * Raw `public.products` row. Extra/unknown columns are tolerated via the index
 * signature so the mapper stays resilient to schema additions.
 */
export interface ProductRow {
  id: number
  /** DB category label, e.g. `shoes01`, `shoes02`, `bag`, `acc`. */
  category?: string | null
  name?: string | null
  title?: string | null
  product_name?: string | null
  price?: number | null
  discount_rate?: number | null
  is_new?: boolean | null
  is_foru?: boolean | null
  /** For You main section manual order — lower appears first. */
  foru_sort_order?: number | null
  /** Size-level stock JSONB — Supabase `products.stock`. */
  stock?: Record<string, number> | string | null
  /** SHOES / ACC subcategory label (GNB mega menu). */
  subcategory?: string | null
  /** Collection line (로미타, 로마리, 3300…) — auto-detected from product name. */
  collection?: string | null
  /** Primary public image URL — Supabase Storage after admin upload. */
  image_url?: string | null
  /** Admin registration time — NEW PLP sorts newest first. */
  created_at?: string | null
  /** Comma-separated search keywords — storefront search matches name + tags. */
  tags?: string | null
  /** Display color label for PLP chips (e.g. Black, 크림). */
  color_name?: string | null
  /** PLP filter chip fill — `#RRGGBB`. */
  color_hex?: string | null
  /** Optional texture swatch image for filter chips. */
  color_swatch_url?: string | null
  /** @deprecated Legacy preset color ids — use color_hex. */
  filter_colors?: string[] | string | null
  /** PLP "무료배송" filter — defaults to true when unset. */
  free_shipping?: boolean | null
  [key: string]: unknown
}

const VALID_FILTER_COLOR_IDS = new Set(FILTER_COLOR_OPTIONS.map((option) => option.id))

/** Normalizes `products.filter_colors` from Supabase text[] / JSON / CSV. */
export function parseProductFilterColors(value: unknown): string[] {
  let tokens: string[] = []

  if (Array.isArray(value)) {
    tokens = value.map((item) => String(item).trim()).filter(Boolean)
  } else if (typeof value === 'string' && value.trim()) {
    const raw = value.trim()
    if (raw.startsWith('[')) {
      try {
        const parsed = JSON.parse(raw) as unknown
        if (Array.isArray(parsed)) {
          tokens = parsed.map((item) => String(item).trim()).filter(Boolean)
        }
      } catch {
        tokens = raw.split(/[,，]/).map((item) => item.trim()).filter(Boolean)
      }
    } else {
      tokens = raw.split(/[,，]/).map((item) => item.trim()).filter(Boolean)
    }
  }

  return tokens.filter((id) => VALID_FILTER_COLOR_IDS.has(id))
}

/** Local source of truth for product data (served from `public/`). */
const PRODUCTS_CSV_URL = '/assets/figma/products/otz_products_info.csv'

/** 1000–1999 → shoes, otherwise bag/acc. */
export function categoryForId(id: number): ProductCategory {
  return id >= 1000 && id < 2000 ? 'shoes' : 'bagacc'
}

/** Prefer the DB `category` label (`shoes*` → shoes); fall back to the id range. */
export function resolveProductCategory(row: ProductRow): ProductCategory {
  const label = (row.category ?? '').toString().toLowerCase()
  if (label.startsWith('shoes')) return 'shoes'
  if (label.startsWith('bag') || label.startsWith('acc')) return 'bagacc'
  return categoryForId(row.id)
}

/** Highest id that lives in the `shoes01` folder; ids above it fall into `shoes02`. */
export const SHOES01_MAX_ID = 1026

/** Admin product registration category options. */
export const ADMIN_PRODUCT_CATEGORY_OPTIONS = [
  { value: 'shoes01', label: 'Shoes 01', hint: 'ID 1001 ~ 1026' },
  { value: 'shoes02', label: 'Shoes 02', hint: 'ID 1027 ~ 1999' },
  { value: 'bag', label: 'Bag', hint: 'ID 2001 ~ 2999' },
  { value: 'acc', label: 'Acc', hint: 'ID 3001 ~ 3999' },
] as const

const CATEGORY_ID_RANGES: Record<string, [number, number]> = {
  shoes01: [1001, 1026],
  shoes02: [1027, 1999],
  bag: [2001, 2999],
  acc: [3001, 3999],
}

/** Splits shoes into their two storage folders by id (folders differ; category is one). */
function shoesFolderForId(id: number): 'shoes01' | 'shoes02' {
  return id <= SHOES01_MAX_ID ? 'shoes01' : 'shoes02'
}

/**
 * Maps a row to the storage subfolder that holds its images.
 * - `shoes01` / `shoes02`: explicit label wins, else split by id range.
 * - `bag` (2001+) and `acc` (3001+) share the single `bag&acc` folder.
 */
export function resolveStorageFolder(row: ProductRow): string {
  const label = (row.category ?? '').toString().trim().toLowerCase()
  if (label === 'shoes01' || label === 'shoes02') return label
  if (label === 'bag' || label === 'acc' || label === 'bag&acc') return 'bag&acc'
  if (label.startsWith('shoes')) return shoesFolderForId(row.id)
  // Fallback purely by id range when the label is missing/unexpected.
  return categoryForId(row.id) === 'shoes' ? shoesFolderForId(row.id) : 'bag&acc'
}

/** DB/admin category label used for stock buckets and storefront size options. */
export function resolveDbCategoryLabel(row: ProductRow): string {
  const label = (row.category ?? '').toString().trim().toLowerCase()
  if (label === 'shoes01' || label === 'shoes02' || label === 'bag' || label === 'acc') return label
  if (label.startsWith('shoes')) return shoesFolderForId(row.id)
  if (row.id >= 3001) return 'acc'
  if (row.id >= 2001) return 'bag'
  return shoesFolderForId(row.id)
}

function rowTitle(row: ProductRow): string {
  return (row.name || row.title || row.product_name || `상품 ${row.id}`).trim()
}

/** Splits comma-separated `products.tags` into trimmed tokens. */
export function parseProductTags(tags: unknown): string[] {
  if (tags == null) return []
  const raw = String(tags).trim()
  if (!raw) return []
  return raw
    .split(/[,，]/)
    .map((token) => token.trim())
    .filter(Boolean)
}

function productRowSearchHaystack(row: ProductRow): string {
  const parts = [rowTitle(row), row.subcategory, row.collection, ...parseProductTags(row.tags)]
  return parts
    .filter((part): part is string => Boolean(part && String(part).trim()))
    .join(' ')
    .toLowerCase()
}

/** Matches storefront search queries against name, tags, taxonomy labels, and id. */
export function productMatchesSearchQuery(row: ProductRow, query: string): boolean {
  const trimmed = query.trim()
  if (!trimmed) return false

  const numericQuery = trimmed.replace(/\s/g, '')
  if (numericQuery && String(row.id) === numericQuery) return true

  const haystack = productRowSearchHaystack(row)
  const tokens = trimmed.toLowerCase().split(/\s+/).filter(Boolean)
  return tokens.every((token) => haystack.includes(token))
}

function formatKrw(value: number): string {
  return Math.round(value).toLocaleString('ko-KR')
}

/**
 * Computes display pricing. When `discount_rate > 0` we surface the rate plus the
 * discounted price, keeping the original as a strikethrough reference.
 */
function resolvePricing(row: ProductRow): Pick<ProductCardItem, 'discountRate' | 'price' | 'originalPrice'> {
  const base = Number(row.price ?? 0)
  const rate = Number(row.discount_rate ?? 0)

  if (rate > 0) {
    const discounted = base * (1 - rate / 100)
    return {
      discountRate: `${rate}%`,
      price: formatKrw(discounted),
      originalPrice: formatKrw(base),
    }
  }

  return { discountRate: '', price: formatKrw(base) }
}

/** Card slides — 03 (square/누끼) then 07 (editorial/화보), swipeable like legacy shoes cards. */
export function productCardSlides(
  folder: string,
  id: number | string,
  cacheVersion?: string | null,
): ProductMultiCutSlide[] {
  return [
    {
      image: productCutUrl(folder, id, PRODUCT_CARD_CUTS.square, 'png', cacheVersion),
      variant: 'square',
    },
    {
      image: productCutUrl(folder, id, PRODUCT_CARD_CUTS.editorial, 'png', cacheVersion),
      variant: 'editorial',
    },
  ]
}

/** PDP gallery slides — cuts 01 … 08 (03 square, others editorial). */
export function productPdpSlides(
  folder: string,
  id: number | string,
  cacheVersion?: string | null,
): ProductMultiCutSlide[] {
  return PRODUCT_PDP_CUTS.map((cut) => ({
    image: productCutUrl(folder, id, cut, 'png', cacheVersion),
    variant: cut === '03' ? 'square' : 'editorial',
  }))
}

/** UI product model with taxonomy fields used for PLP filtering. */
export type MappedProduct = ProductCardItem & {
  category: ProductCategory
  subcategory?: string | null
  collection?: string | null
  tags?: string | null
  colorName?: string | null
  colorHex?: string | null
  colorSwatchUrl?: string | null
  /** @deprecated Legacy preset ids until all rows use color_hex. */
  filterColors: string[]
  freeShipping: boolean
}

/** Maps a DB row to the UI card model, applying id-based cut image mapping (03/07). */
export function mapProductRow(row: ProductRow): MappedProduct {
  const dbCategory = resolveDbCategoryLabel(row)
  const cacheVersion = imageUrlCacheVersion(row.image_url)
  const slides = productCardSlides(resolveStorageFolder(row), row.id, cacheVersion)
  const storedImage = row.image_url?.trim()
  return {
    id: String(row.id),
    title: rowTitle(row),
    ...resolvePricing(row),
    image: storedImage || slides[0].image,
    multiCutSlides: slides,
    category: resolveProductCategory(row),
    sizeOptions: getStorefrontSizeOptions(dbCategory),
    soldOutSizes: deriveSoldOutSizesFromStock(row.stock, dbCategory),
    subcategory: row.subcategory ?? null,
    collection: row.collection ?? null,
    tags: row.tags ?? null,
    colorName: row.color_name?.trim() || null,
    colorHex: normalizeColorHex(row.color_hex),
    colorSwatchUrl: row.color_swatch_url?.trim() || null,
    filterColors: parseProductFilterColors(row.filter_colors),
    freeShipping: row.free_shipping == null ? true : coerceProductFlag(row.free_shipping),
    badges:
      getTotalProductStock(parseProductStock(row.stock)) === 0 && row.stock != null
        ? [{ id: 'sold-out', label: '품절' }]
        : undefined,
  }
}

export type ProductFlag = 'is_new' | 'is_foru'

export interface FetchProductsParams {
  /** Filter by a boolean flag column being true. */
  flag?: ProductFlag
  /** Filter by derived category. */
  category?: ProductCategory
  /** Max rows to return. */
  limit?: number
}

function toBool(value: string | undefined): boolean {
  return (value ?? '').trim().toUpperCase() === 'TRUE'
}

function toNumberOrNull(value: string | undefined): number | null {
  const trimmed = (value ?? '').trim()
  if (trimmed === '') return null
  const n = Number(trimmed)
  return Number.isNaN(n) ? null : n
}

/** Converts a parsed CSV record into a typed product row. */
function csvRecordToRow(record: Record<string, string>): ProductRow {
  return {
    id: Number(record.id),
    category: record.category ?? null,
    name: record.name ?? null,
    price: toNumberOrNull(record.price),
    discount_rate: toNumberOrNull(record.discount_rate),
    is_new: toBool(record.is_new),
    is_foru: toBool(record.is_foru),
    tags: record.tags ?? null,
    subcategory: record.subcategory?.trim() || null,
    collection: record.collection?.trim() || null,
    image_url: record.image_url?.trim() || null,
    created_at: record.created_at?.trim() || null,
  }
}

function productRegisteredAtMs(row: ProductRow): number {
  const raw = row.created_at
  if (typeof raw === 'string' && raw.trim()) {
    const parsed = Date.parse(raw)
    if (Number.isFinite(parsed)) return parsed
  }
  return row.id
}

/** Newest admin registration first — used by the NEW PLP. */
export function compareProductsByRegistrationDesc(a: ProductRow, b: ProductRow): number {
  const aMs = productRegisteredAtMs(a)
  const bMs = productRegisteredAtMs(b)
  if (aMs !== bMs) return bMs - aMs
  return b.id - a.id
}

/** Parses `foru_sort_order` from Supabase — positive integers only. */
export function parseForuSortOrder(value: unknown): number | null {
  if (value == null || value === '') return null
  const numeric = Math.round(Number(value))
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null
}

/** For You main section — lower `foru_sort_order` first; ties fall back to id. */
export function compareProductsByForuSortAsc(a: ProductRow, b: ProductRow): number {
  const aOrder = parseForuSortOrder(a.foru_sort_order)
  const bOrder = parseForuSortOrder(b.foru_sort_order)
  if (aOrder != null && bOrder != null) return aOrder - bOrder || a.id - b.id
  if (aOrder != null) return -1
  if (bOrder != null) return 1
  return a.id - b.id
}

/** Maximum For You products allowed on the home main section. */
export const FOR_YOU_MAX_PRODUCTS = 10

/** Counts current For You rows, optionally excluding one product id. */
export function countForYouProducts(
  rows: readonly ProductRow[],
  excludeId?: number,
): number {
  return rows.filter(
    (row) => row.id !== excludeId && coerceProductFlag(row.is_foru),
  ).length
}

/** Whether another product can be added to For You. */
export function canRegisterMoreForYouProducts(
  rows: readonly ProductRow[],
  excludeId?: number,
): boolean {
  return countForYouProducts(rows, excludeId) < FOR_YOU_MAX_PRODUCTS
}

export function forYouRegistrationBlockedMessage(): string {
  return `For You 상품은 최대 ${FOR_YOU_MAX_PRODUCTS}개까지 등록할 수 있습니다.`
}

/** Next slot when registering a new For You product. */
export function suggestNextForuSortOrder(rows: readonly ProductRow[]): number {
  const orders = rows
    .filter((row) => coerceProductFlag(row.is_foru))
    .map((row) => parseForuSortOrder(row.foru_sort_order))
    .filter((order): order is number => order != null)
  return orders.length > 0 ? Math.max(...orders) + 1 : 1
}

function sortForYouProductRows(rows: ProductRow[]): ProductRow[] {
  return [...rows].sort(compareProductsByForuSortAsc)
}

let productsCache: Promise<ProductRow[]> | null = null

/** Clears the in-memory product list cache after admin writes. */
export function invalidateProductsCache(): void {
  productsCache = null
}

async function loadProductRowsFromSupabase(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .order('id', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as ProductRow[]
}

/** Loads and caches all product rows — Supabase when configured, else local CSV. */
/** Loads the full cached catalog — exported for storefront search/autocomplete. */
export async function loadProductRowsForSearch(): Promise<ProductRow[]> {
  return loadProductRows()
}

async function loadProductRows(): Promise<ProductRow[]> {
  if (!productsCache) {
    productsCache = (async () => {
      if (isSupabaseConfigured) {
        try {
          const rows = await loadProductRowsFromSupabase()
          if (rows.length > 0) return rows
        } catch (err) {
          console.warn('[products] Supabase fetch failed, falling back to CSV.', err)
        }
      }

      const res = await fetch(PRODUCTS_CSV_URL)
      if (!res.ok) throw new Error(`상품 CSV를 불러오지 못했습니다 (${res.status})`)
      const text = await res.text()
      return parseCsvToObjects(text)
        .map(csvRecordToRow)
        .filter((row) => Number.isFinite(row.id))
        .sort((a, b) => a.id - b.id)
    })()
  }
  return productsCache
}

const PRODUCT_SELECT =
  'id, category, name, price, discount_rate, is_new, is_foru, foru_sort_order, stock, subcategory, collection, image_url, created_at, tags, color_name, color_hex, color_swatch_url, filter_colors, free_shipping' as const

const ADMIN_PRODUCT_SELECT = PRODUCT_SELECT

/** Slim columns for admin home-main product pickers (curation, etc.). */
const ADMIN_PICKER_SELECT = 'id, category, name, price, discount_rate' as const

export type AdminPickerCategoryFilter = 'all' | ProductCategory

export interface SearchAdminProductsParams {
  query?: string
  category?: AdminPickerCategoryFilter
  /** Max rows returned — defaults to 50. */
  limit?: number
}

function filterRowsForPicker(
  rows: ProductRow[],
  params: SearchAdminProductsParams,
): ProductRow[] {
  const limit = params.limit ?? 50
  const q = (params.query ?? '').trim().toLowerCase()
  const category = params.category ?? 'all'

  let filtered = rows
  if (category !== 'all') {
    filtered = filtered.filter((row) => resolveProductCategory(row) === category)
  }

  if (q) {
    const numericId = Number(q)
    if (!Number.isNaN(numericId) && String(numericId) === q.replace(/\s/g, '')) {
      filtered = filtered.filter((row) => row.id === numericId)
    } else {
      filtered = filtered.filter((row) => productMatchesSearchQuery(row, q))
    }
  }

  return filtered
    .sort((a, b) => b.id - a.id)
    .slice(0, limit)
    .sort((a, b) => a.id - b.id)
}

/**
 * Fetches a small product slice for admin pickers — avoids loading the full catalog.
 * Supabase: server-side filter + limit; CSV fallback: in-memory filter on cached rows.
 */
export async function searchAdminProductsForPicker(
  params: SearchAdminProductsParams = {},
): Promise<ProductRow[]> {
  const limit = params.limit ?? 50
  const q = (params.query ?? '').trim()
  const category = params.category ?? 'all'

  if (isSupabaseConfigured) {
    try {
      let request = supabase
        .from('products')
        .select(ADMIN_PICKER_SELECT)
        .order('id', { ascending: false })
        .limit(limit)

      if (category === 'shoes') {
        request = request.ilike('category', 'shoes%')
      } else if (category === 'bagacc') {
        request = request.or('category.eq.bag,category.eq.acc,category.ilike.bag%,category.ilike.acc%')
      }

      if (q) {
        const numericId = Number(q)
        if (!Number.isNaN(numericId) && String(numericId) === q.replace(/\s/g, '')) {
          request = request.eq('id', numericId)
        } else {
          request = request.ilike('name', `%${q}%`)
        }
      }

      const { data, error } = await request
      if (error) throw new Error(error.message)
      const rows = (data ?? []) as ProductRow[]
      if (rows.length > 0) {
        return rows.sort((a, b) => a.id - b.id)
      }
    } catch (err) {
      console.warn('[products] Picker Supabase search failed, falling back to CSV.', err)
    }
  }

  const rows = await loadProductRows()
  return filterRowsForPicker(rows, { ...params, limit })
}

/** Fetches every row from `public.products` for the admin product table. */
export async function fetchAllProductsFromSupabase(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from('products')
    .select(ADMIN_PRODUCT_SELECT)
    .order('id', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as ProductRow[]
}

export interface AdminProductExposurePatch {
  is_new?: boolean
  is_foru?: boolean
  foru_sort_order?: number | null
}

/** Normalizes Supabase/CSV boolean flags for admin checkboxes. */
export function coerceProductFlag(value: unknown): boolean {
  if (value === true || value === 1) return true
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized === 'true' || normalized === 't' || normalized === '1'
  }
  return false
}

/** Updates storefront exposure flags (`is_new`, `is_foru`, `foru_sort_order`). */
export async function updateAdminProductExposure(
  id: number,
  patch: AdminProductExposurePatch,
): Promise<void> {
  const payload: Record<string, boolean | number | null> = {}
  if (patch.is_new !== undefined) payload.is_new = patch.is_new
  if (patch.is_foru !== undefined) payload.is_foru = patch.is_foru
  if (patch.foru_sort_order !== undefined) payload.foru_sort_order = patch.foru_sort_order

  if (Object.keys(payload).length === 0) return

  const { error } = await supabase.from('products').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
  invalidateProductsCache()
}

/** Persists For You display order (1 = first). */
export async function updateAdminForuSortOrders(
  entries: readonly { id: number; foru_sort_order: number }[],
): Promise<void> {
  if (entries.length === 0) return

  await Promise.all(
    entries.map(async (entry) => {
      const { error } = await supabase
        .from('products')
        .update({ foru_sort_order: entry.foru_sort_order })
        .eq('id', entry.id)
      if (error) throw new Error(error.message)
    }),
  )
  invalidateProductsCache()
}

export interface AdminProductInput {
  id: number
  category: string
  name: string
  price: number
  discount_rate?: number
  is_new?: boolean
  is_foru?: boolean
  foru_sort_order?: number | null
  stock?: Record<string, number>
  subcategory?: string | null
  collection?: string | null
  tags?: string | null
  color_name?: string | null
  color_hex?: string | null
  color_swatch_url?: string | null
  free_shipping?: boolean
  image_url: string
}

export interface AdminProductUpdateInput {
  category: string
  name: string
  price: number
  discount_rate?: number
  is_new?: boolean
  is_foru?: boolean
  foru_sort_order?: number | null
  stock?: Record<string, number>
  subcategory?: string | null
  collection?: string | null
  tags?: string | null
  color_name?: string | null
  color_hex?: string | null
  color_swatch_url?: string | null
  free_shipping?: boolean
  image_url?: string
}

/** Suggests the next available product id for a category bucket (first gap in range). */
export function suggestNextProductId(category: string, existingIds: readonly number[]): number | null {
  const range = CATEGORY_ID_RANGES[category]
  if (!range) {
    const max = existingIds.length ? Math.max(...existingIds) : 1000
    return max + 1
  }

  const [min, max] = range
  const used = new Set(existingIds.filter((id) => id >= min && id <= max))
  for (let id = min; id <= max; id += 1) {
    if (!used.has(id)) return id
  }
  return null
}

/** Picks the first category bucket that still has an available product id. */
export function suggestRegistrationCategoryAndId(existingIds: readonly number[]): {
  category: string
  id: number | null
} {
  for (const option of ADMIN_PRODUCT_CATEGORY_OPTIONS) {
    const id = suggestNextProductId(option.value, existingIds)
    if (id != null) return { category: option.value, id }
  }
  return {
    category: ADMIN_PRODUCT_CATEGORY_OPTIONS[0]?.value ?? 'shoes01',
    id: null,
  }
}

export function storageFolderForProduct(category: string, id: number): string {
  return resolveStorageFolder({ id, category })
}

export function isProductIdInCategoryRange(id: number, category: string): boolean {
  const range = CATEGORY_ID_RANGES[category]
  if (!range) return Number.isFinite(id) && id > 0
  return id >= range[0] && id <= range[1]
}

function buildAdminProductPayload(input: AdminProductUpdateInput) {
  const payload: Record<string, unknown> = {
    category: input.category.trim(),
    name: input.name.trim(),
    price: Math.max(0, Math.round(Number(input.price) || 0)),
    discount_rate: Math.max(0, Math.min(100, Math.round(Number(input.discount_rate) || 0))),
    is_new: input.is_new ?? false,
    is_foru: input.is_foru ?? false,
    foru_sort_order: input.is_foru ? (parseForuSortOrder(input.foru_sort_order) ?? null) : null,
    free_shipping: input.free_shipping ?? true,
    subcategory: input.subcategory?.trim() || null,
    collection: input.collection?.trim() || null,
    tags: input.tags?.trim() || null,
    color_name: input.color_name?.trim() || null,
    color_hex: normalizeColorHex(input.color_hex),
    color_swatch_url: input.color_swatch_url?.trim() || null,
    stock: normalizeProductStockForCategory(
      input.stock ?? buildDefaultProductStockForCategory(input.category),
      input.category,
    ),
  }

  const imageUrl = input.image_url?.trim()
  if (imageUrl) payload.image_url = imageUrl

  return payload
}

/** Fetches a single product row for the admin edit form. */
export async function fetchAdminProductById(id: number): Promise<ProductRow | null> {
  const { data, error } = await supabase
    .from('products')
    .select(ADMIN_PRODUCT_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return (data as ProductRow | null) ?? null
}

/** Inserts a new product into Supabase `products`. */
export async function insertAdminProduct(input: AdminProductInput): Promise<void> {
  const imageUrl = input.image_url?.trim()
  if (!imageUrl) {
    throw new Error('상품 대표 이미지 URL이 없습니다. 이미지를 업로드한 뒤 다시 시도해 주세요.')
  }

  const payload = {
    id: input.id,
    ...buildAdminProductPayload({ ...input, image_url: imageUrl }),
  }

  const { error } = await supabase.from('products').insert(payload)
  if (error) {
    if (/row-level security/i.test(error.message)) {
      throw new Error(
        `${error.message} — Supabase SQL Editor에서 scripts/sql/products-rls-admin.sql 을 실행해 주세요.`,
      )
    }
    if (/image_url/i.test(error.message) && /null/i.test(error.message)) {
      throw new Error(
        'image_url이 비어 있습니다. 이미지 파일을 선택한 뒤 다시 등록해 주세요. ' +
          '(Storage 업로드가 먼저 성공해야 합니다.)',
      )
    }
    throw new Error(error.message)
  }
  invalidateProductsCache()
}

/** Updates an existing product row (excluding primary key). */
export async function updateAdminProduct(id: number, input: AdminProductUpdateInput): Promise<void> {
  const payload = buildAdminProductPayload(input)
  const { error } = await supabase.from('products').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
  invalidateProductsCache()
}

/** Permanently removes a product row from Supabase `products`. */
export async function deleteAdminProduct(id: number): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) {
    if (/row-level security/i.test(error.message)) {
      throw new Error(
        `${error.message} — Supabase SQL Editor에서 scripts/sql/products-rls-admin.sql 을 다시 실행해 주세요. (DELETE 정책 필요)`,
      )
    }
    throw new Error(error.message)
  }
  invalidateProductsCache()
}

/** Ordered thumbnail URL candidates — primary folder/cut first, then alternates. */
export function getAdminProductThumbnailCandidates(row: ProductRow): string[] {
  const urls: string[] = []
  const seen = new Set<string>()
  const push = (url: string) => {
    if (!url || seen.has(url)) return
    seen.add(url)
    urls.push(url)
  }

  const cacheVersion = imageUrlCacheVersion(row.image_url)
  push(row.image_url?.trim() || '')

  const primaryFolder = resolveStorageFolder(row)
  const folders = [primaryFolder]
  if (primaryFolder === 'shoes01') folders.push('shoes02')
  if (primaryFolder === 'shoes02') folders.push('shoes01')

  const cuts = [
    PRODUCT_CARD_CUTS.square,
    PRODUCT_CARD_CUTS.editorial,
    ...PRODUCT_PDP_CUTS.filter(
      (cut) => cut !== PRODUCT_CARD_CUTS.square && cut !== PRODUCT_CARD_CUTS.editorial,
    ),
  ]

  for (const folder of folders) {
    for (const cut of cuts) {
      push(productCutUrl(folder, row.id, cut, 'png', cacheVersion))
      push(productCutUrl(folder, row.id, cut, 'webp', cacheVersion))
    }
  }

  push(productImageUrl(row.id, { width: 50, quality: 80 }))
  push(productImageUrl(row.id))

  return urls
}

/** Admin table thumbnail — first candidate from {@link getAdminProductThumbnailCandidates}. */
export function productAdminThumbnailUrl(row: ProductRow): string {
  return getAdminProductThumbnailCandidates(row)[0] ?? mapProductRow(row).image
}

/** Styling banner product thumbs — 03 square (누끼) first, then fallbacks. */
export function getProductSquareCutCandidates(row: ProductRow): string[] {
  const urls: string[] = []
  const seen = new Set<string>()
  const push = (url: string) => {
    if (!url || seen.has(url)) return
    seen.add(url)
    urls.push(url)
  }

  const cacheVersion = imageUrlCacheVersion(row.image_url)
  push(row.image_url?.trim() || '')

  const primaryFolder = resolveStorageFolder(row)
  const folders = [primaryFolder]
  if (primaryFolder === 'shoes01') folders.push('shoes02')
  if (primaryFolder === 'shoes02') folders.push('shoes01')

  for (const folder of folders) {
    for (const ext of ['png', 'webp'] as const) {
      push(productCutUrl(folder, row.id, PRODUCT_CARD_CUTS.square, ext, cacheVersion))
    }
  }

  for (const folder of folders) {
    for (const ext of ['png', 'webp'] as const) {
      push(productCutUrl(folder, row.id, PRODUCT_CARD_CUTS.editorial, ext, cacheVersion))
    }
  }

  push(productImageUrl(row.id, { width: 50, quality: 80 }))
  push(productImageUrl(row.id))

  return urls.filter(Boolean)
}

export type ProductThumbnailMode = 'admin' | 'square' | 'editorial'

export function getProductThumbnailCandidates(row: ProductRow, mode: ProductThumbnailMode = 'admin'): string[] {
  if (mode === 'square') return getProductSquareCutCandidates(row)
  if (mode === 'editorial') return getProductEditorialCutCandidates(row)
  return getAdminProductThumbnailCandidates(row)
}

/** Loads a product row by numeric id for thumbnail candidate resolution. */
export async function fetchProductRowById(id: number | string): Promise<ProductRow | null> {
  const numericId = Number(id)
  if (Number.isNaN(numericId)) return null
  const rows = await loadProductRows()
  return rows.find((row) => row.id === numericId) ?? null
}

/** Curation / styling thumbnails — 07 editorial first, then 03 square fallback. */
export function getProductEditorialCutCandidates(row: ProductRow): string[] {
  const urls: string[] = []
  const seen = new Set<string>()
  const push = (url: string) => {
    if (!url || seen.has(url)) return
    seen.add(url)
    urls.push(url)
  }

  const cacheVersion = imageUrlCacheVersion(row.image_url)
  push(row.image_url?.trim() || '')

  const folder = resolveStorageFolder(row)
  const cuts = [PRODUCT_CARD_CUTS.editorial, PRODUCT_CARD_CUTS.square]
  for (const cut of cuts) {
    push(productCutUrl(folder, row.id, cut, 'png', cacheVersion))
    push(productCutUrl(folder, row.id, cut, 'webp', cacheVersion))
  }
  push(mapProductRow(row).image)

  return urls.filter(Boolean)
}

/** First editorial (07) cut candidate for a product row. */
export function productEditorialThumbnailUrl(row: ProductRow): string {
  return getProductEditorialCutCandidates(row)[0] ?? mapProductRow(row).image
}

export function formatAdminPrice(price: number | null | undefined): string {
  return `${Math.round(Number(price ?? 0)).toLocaleString('ko-KR')}원`
}

export function formatAdminDiscountRate(rate: number | null | undefined): string {
  const numeric = Number(rate ?? 0)
  return numeric > 0 ? `${numeric}%` : '-'
}

export function adminProductTitle(row: ProductRow): string {
  return rowTitle(row)
}

/** Fetches products from the local CSV and maps them to UI card models. */
export async function fetchProducts(
  params: FetchProductsParams = {},
): Promise<MappedProduct[]> {
  const rows = await loadProductRows()

  let filtered = rows
  if (params.flag) {
    filtered = filtered.filter((row) => row[params.flag as ProductFlag] === true)
  }
  if (params.category) {
    filtered = filtered.filter((row) => resolveProductCategory(row) === params.category)
  }
  if (params.flag === 'is_new') {
    filtered = [...filtered].sort(compareProductsByRegistrationDesc)
  }
  if (params.flag === 'is_foru') {
    filtered = sortForYouProductRows(filtered).slice(0, FOR_YOU_MAX_PRODUCTS)
  }
  if (params.limit) {
    filtered = filtered.slice(0, params.limit)
  }

  return filtered.map(mapProductRow)
}

/**
 * BEST PLP listing — placeholder until sales-volume ranking is wired.
 * Currently returns all CSV products in id order.
 */
export async function fetchBestProducts(
  params: Pick<FetchProductsParams, 'category' | 'limit'> = {},
): Promise<MappedProduct[]> {
  const rows = await loadProductRows()

  let filtered = [...rows].sort((a, b) => a.id - b.id)
  if (params.category) {
    filtered = filtered.filter((row) => resolveProductCategory(row) === params.category)
  }
  if (params.limit) {
    filtered = filtered.slice(0, params.limit)
  }

  return filtered.map(mapProductRow)
}

/** Fetches a single product by id and maps it. */
export async function fetchProductById(
  id: number | string,
): Promise<MappedProduct | null> {
  const numericId = Number(id)
  if (Number.isNaN(numericId)) return null

  const rows = await loadProductRows()
  const match = rows.find((row) => row.id === numericId)
  if (match) return mapProductRow(match)

  if (isSupabaseConfigured) {
    try {
      const adminRow = await fetchAdminProductById(numericId)
      if (adminRow) return mapProductRow(adminRow)
    } catch {
      // Fall through to null when Supabase lookup fails.
    }
  }

  return null
}

export interface ProductDetailResult {
  product: MappedProduct
  /** Storage subfolder holding this product's cut images. */
  folder: string
  numericId: number
  /** `?v=` from `products.image_url` — busts browser cache after admin uploads. */
  imageCacheVersion: string | null
}

/**
 * Fetches a product plus the metadata needed to build its full PDP gallery
 * (storage folder + numeric id for `detail_{id}_01..08_big`).
 */
export async function fetchProductDetailById(id: number | string): Promise<ProductDetailResult | null> {
  const numericId = Number(id)
  if (Number.isNaN(numericId)) return null

  const rows = await loadProductRows()
  const match = rows.find((row) => row.id === numericId)
  if (!match) return null

  return {
    product: mapProductRow(match),
    folder: resolveStorageFolder(match),
    numericId: match.id,
    imageCacheVersion: imageUrlCacheVersion(match.image_url),
  }
}

/** Re-applies a fresh `?v=` after any cut upload (even when the primary cut URL is unchanged). */
export function withFreshImageCacheBust(imageUrl: string): string {
  return withProductImageCacheBust(imageUrl, String(Date.now()))
}
