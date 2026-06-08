import type { ProductCardItem, ProductMultiCutSlide } from '../components/molecules/ProductCardUnit'
import {
  buildDefaultProductStockForCategory,
  getTotalProductStock,
  normalizeProductStockForCategory,
  parseProductStock,
} from './adminProductStock'
import { deriveSoldOutSizesFromStock, getStorefrontSizeOptions } from './productSizeOptions'
import {
  PRODUCT_CARD_CUTS,
  PRODUCT_PDP_CUTS,
  productCutUrl,
  productImageUrl,
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
  /** Size-level stock JSONB — Supabase `products.stock`. */
  stock?: Record<string, number> | string | null
  /** SHOES / ACC subcategory label (GNB mega menu). */
  subcategory?: string | null
  /** Collection line (로미타, 로마리, 3300…) — auto-detected from product name. */
  collection?: string | null
  [key: string]: unknown
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
export function productCardSlides(folder: string, id: number | string): ProductMultiCutSlide[] {
  return [
    { image: productCutUrl(folder, id, PRODUCT_CARD_CUTS.square), variant: 'square' },
    { image: productCutUrl(folder, id, PRODUCT_CARD_CUTS.editorial), variant: 'editorial' },
  ]
}

/** PDP gallery slides — cuts 01 … 08 (03 square, others editorial). */
export function productPdpSlides(folder: string, id: number | string): ProductMultiCutSlide[] {
  return PRODUCT_PDP_CUTS.map((cut) => ({
    image: productCutUrl(folder, id, cut),
    variant: cut === '03' ? 'square' : 'editorial',
  }))
}

/** UI product model with taxonomy fields used for PLP filtering. */
export type MappedProduct = ProductCardItem & {
  category: ProductCategory
  subcategory?: string | null
  collection?: string | null
}

/** Maps a DB row to the UI card model, applying id-based cut image mapping (03/07). */
export function mapProductRow(row: ProductRow): MappedProduct {
  const dbCategory = resolveDbCategoryLabel(row)
  const slides = productCardSlides(resolveStorageFolder(row), row.id)
  return {
    id: String(row.id),
    title: rowTitle(row),
    ...resolvePricing(row),
    image: slides[0].image,
    multiCutSlides: slides,
    category: resolveProductCategory(row),
    sizeOptions: getStorefrontSizeOptions(dbCategory),
    soldOutSizes: deriveSoldOutSizesFromStock(row.stock, dbCategory),
    subcategory: row.subcategory ?? null,
    collection: row.collection ?? null,
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
  }
}

let productsCache: Promise<ProductRow[]> | null = null

async function loadProductRowsFromSupabase(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .order('id', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as ProductRow[]
}

/** Loads and caches all product rows — Supabase when configured, else local CSV. */
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
  'id, category, name, price, discount_rate, is_new, is_foru, stock, subcategory, collection' as const

const ADMIN_PRODUCT_SELECT = PRODUCT_SELECT

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

/** Updates storefront exposure flags (`is_new`, `is_foru`). */
export async function updateAdminProductExposure(
  id: number,
  patch: AdminProductExposurePatch,
): Promise<void> {
  const payload: Record<string, boolean> = {}
  if (patch.is_new !== undefined) payload.is_new = patch.is_new
  if (patch.is_foru !== undefined) payload.is_foru = patch.is_foru

  if (Object.keys(payload).length === 0) return

  const { error } = await supabase.from('products').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
}

export interface AdminProductInput {
  id: number
  category: string
  name: string
  price: number
  discount_rate?: number
  is_new?: boolean
  is_foru?: boolean
  stock?: Record<string, number>
  subcategory?: string | null
  collection?: string | null
}

export interface AdminProductUpdateInput {
  category: string
  name: string
  price: number
  discount_rate?: number
  is_new?: boolean
  is_foru?: boolean
  stock?: Record<string, number>
  subcategory?: string | null
  collection?: string | null
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
  return {
    category: input.category.trim(),
    name: input.name.trim(),
    price: Math.max(0, Math.round(Number(input.price) || 0)),
    discount_rate: Math.max(0, Math.min(100, Math.round(Number(input.discount_rate) || 0))),
    is_new: input.is_new ?? false,
    is_foru: input.is_foru ?? false,
    subcategory: input.subcategory?.trim() || null,
    collection: input.collection?.trim() || null,
    stock: normalizeProductStockForCategory(
      input.stock ?? buildDefaultProductStockForCategory(input.category),
      input.category,
    ),
  }
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
  const payload = {
    id: input.id,
    ...buildAdminProductPayload(input),
  }

  const { error } = await supabase.from('products').insert(payload)
  if (error) throw new Error(error.message)
}

/** Updates an existing product row (excluding primary key). */
export async function updateAdminProduct(id: number, input: AdminProductUpdateInput): Promise<void> {
  const payload = buildAdminProductPayload(input)
  const { error } = await supabase.from('products').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
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
      push(productCutUrl(folder, row.id, cut, 'png'))
      push(productCutUrl(folder, row.id, cut, 'webp'))
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
  return match ? mapProductRow(match) : null
}

export interface ProductDetailResult {
  product: MappedProduct
  /** Storage subfolder holding this product's cut images. */
  folder: string
  numericId: number
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
  }
}
