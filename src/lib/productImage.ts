/**
 * ID-based product image mapping.
 *
 * Storage layout: every product image lives in the public `products` bucket and
 * is named after its row id (e.g. `1001.png`).
 *
 * NOTE on WebP: Supabase Image Transformation (the `/render/image/` endpoint
 * with `?format=webp`) is a paid (Pro+) feature. This project is on the Free
 * plan, so we serve the original file via the public `object` endpoint. The
 * `format`/`quality` params are kept for forward-compat (ignored on Free) and to
 * match the agreed URL shape; flip `USE_IMAGE_TRANSFORM` to true after upgrading.
 *
 * Resulting URL shape (Free plan):
 *   https://<ref>.supabase.co/storage/v1/object/public/products/<id>.png?format=webp&quality=80
 */
import { probeImageUrl } from './probeImageUrl'

const PRODUCTS_BUCKET = 'products'

/** Source extension stored on the bucket. */
const SOURCE_EXTENSION = 'png'

/** WebP transform quality (1–100) — only effective on Pro+ with transforms on. */
const DEFAULT_QUALITY = 80

/** Set to true only after enabling Supabase Image Transformation (Pro+). */
const USE_IMAGE_TRANSFORM = false

function storageBaseUrl(): string | null {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)
    ?.trim()
    .replace(/\/$/, '')
  return url || null
}

export interface ProductImageOptions {
  /** WebP quality, defaults to 80. */
  quality?: number
  /** Optional resize width (px) — only used when image transforms are enabled. */
  width?: number
  /** Optional resize height (px). */
  height?: number
}

/**
 * Builds the public URL for a product id's image.
 * Falls back to a relative placeholder path when the Supabase URL is unset.
 */
export function productImageUrl(
  id: number | string,
  options: ProductImageOptions = {},
): string {
  const base = storageBaseUrl()
  const objectName = `${id}.${SOURCE_EXTENSION}`
  if (!base) {
    return `/assets/figma/products/${objectName}`
  }

  const params = new URLSearchParams({
    format: 'webp',
    quality: String(options.quality ?? DEFAULT_QUALITY),
  })
  if (options.width) params.set('width', String(options.width))
  if (options.height) params.set('height', String(options.height))

  const endpoint = USE_IMAGE_TRANSFORM ? 'render/image/public' : 'object/public'
  return `${base}/storage/v1/${endpoint}/${PRODUCTS_BUCKET}/${objectName}?${params.toString()}`
}

/* -------------------------------------------------------------------------- */
/* Per-id multi-cut images: `{id}_{cut}_big.{png|webp}`                        */
/* -------------------------------------------------------------------------- */

/** Card slides — 03 = square (누끼), 07 = editorial (화보), like the legacy shoes cards. */
export const PRODUCT_CARD_CUTS = { square: '03', editorial: '07' } as const

/** PDP gallery cuts — 01 … 08. */
export const PRODUCT_PDP_CUTS = ['01', '02', '03', '04', '05', '06', '07', '08'] as const

/** Default extension to request first; the UI falls back to the other on error. */
const PRIMARY_CUT_EXTENSION = 'png'

/** Reads `?v=` from a stored `products.image_url` (set after admin image uploads). */
export function imageUrlCacheVersion(imageUrl?: string | null): string | null {
  if (!imageUrl?.trim()) return null
  const trimmed = imageUrl.trim()
  if (!trimmed.startsWith('http')) return null
  try {
    return new URL(trimmed).searchParams.get('v')
  } catch {
    const match = /[?&]v=([^&]+)/.exec(trimmed)
    return match?.[1] ?? null
  }
}

/** Appends or replaces `?v=` so browsers fetch a fresh object after Storage overwrite. */
export function withProductImageCacheBust(url: string, version?: string | null): string {
  if (!version || !url.startsWith('http')) return url
  try {
    const parsed = new URL(url)
    parsed.searchParams.set('v', version)
    return parsed.toString()
  } catch {
    const sep = url.includes('?') ? '&' : '?'
    return `${url}${sep}v=${encodeURIComponent(version)}`
  }
}

/**
 * Builds the public URL for a specific cut of a product. Files live in per-category
 * subfolders as `{folder}/detail_{id}_{cut}_big.{ext}` (e.g. `shoes01/detail_1001_03_big.png`).
 */
export function productCutUrl(
  folder: string,
  id: number | string,
  cut: string,
  ext: 'png' | 'webp' = PRIMARY_CUT_EXTENSION,
  cacheVersion?: string | null,
): string {
  const base = storageBaseUrl()
  const fileName = `detail_${id}_${cut}_big.${ext}`
  if (!base) return `/assets/figma/products/${folder}/${fileName}`
  // Encode each path segment so folder names like `bag&acc` survive intact.
  const objectPath = `${encodeURIComponent(folder)}/${encodeURIComponent(fileName)}`
  const endpoint = USE_IMAGE_TRANSFORM ? 'render/image/public' : 'object/public'
  const suffix = USE_IMAGE_TRANSFORM ? '?format=webp&quality=80' : ''
  return withProductImageCacheBust(
    `${base}/storage/v1/${endpoint}/${PRODUCTS_BUCKET}/${objectPath}${suffix}`,
    cacheVersion,
  )
}

/**
 * Given a cut image URL, returns the same URL with the opposite extension.
 * Used as an `<img onError>` fallback because the bucket mixes png/webp.
 */
export function swapImageExtension(url: string): string | null {
  if (/\.png(\?|$)/i.test(url)) return url.replace(/\.png(\?|$)/i, '.webp$1')
  if (/\.webp(\?|$)/i.test(url)) return url.replace(/\.webp(\?|$)/i, '.png$1')
  return null
}

/**
 * Returns a loadable product image URL, trying the opposite extension when the
 * bucket stores only png or webp for a given cut.
 */
export async function ensureWorkingProductImageUrl(url: string): Promise<string> {
  const trimmed = url?.trim()
  if (!trimmed) return url

  if (await probeImageUrl(trimmed)) return trimmed

  const swapped = swapImageExtension(trimmed)
  if (swapped && (await probeImageUrl(swapped))) return swapped

  return swapped ?? trimmed
}

/** Square / 누끼 cuts — fit inside the frame. */
export const PRODUCT_CUT_CONTAIN_CLASS = 'h-full w-full object-contain object-center mix-blend-multiply'

/** Portrait / 화보 cuts — fill frame height, crop sides (no top/bottom letterboxing). */
export const PRODUCT_CUT_PORTRAIT_CLASS = 'h-full w-full object-cover object-center mix-blend-multiply'
