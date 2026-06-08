import type { ProductMultiCutSlide } from '../components/molecules/ProductCardUnit'

/** PDP gallery + detail stack — `detail_XX_01_big` … `detail_XX_08_big`. */
export const SHOES_PDP_STILL_NUMBERS = ['01', '02', '03', '04', '05', '06', '07', '08'] as const

const PRODUCT_IMAGES_BUCKET = 'product_images'

/** Stills stored as PNG on Storage — delivered as WebP via Image Transform. */
const SHOES_PNG_ONLY_STILLS = new Set(['08'])

function productImagesStorageBase(): string {
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '')
  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}`
  }
  if (import.meta.env.DEV) {
    console.warn(
      '[shoesAssetUrl] VITE_SUPABASE_URL is unset — falling back to /assets/figma/shoes (local placeholders).',
    )
  }
  return '/assets/figma/shoes'
}

/**
 * Public product stills on Supabase Storage
 * (e.g. `…/product_images/detail_01_02_big.webp`).
 */
export function shoesAsset(filename: string): string {
  const name = filename.replace(/^\//, '').replace(/^shoes\//, '')
  const base = productImagesStorageBase()
  if (base.startsWith('http')) {
    return `${base}/${encodeURIComponent(name)}`
  }
  return `${base}/${name}`
}

/** PNG on Storage → WebP response via Supabase Image Transform. */
function shoesPngAsWebpUrl(pngFilename: string): string {
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '')
  const name = pngFilename.replace(/^\//, '').replace(/^shoes\//, '')
  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/render/image/public/${PRODUCT_IMAGES_BUCKET}/${encodeURIComponent(name)}?format=webp&quality=85`
  }
  return `${productImagesStorageBase()}/${name}`
}

/** First slide: `*_03_big`, second slide: `*_07_big`. */
export function shoesProductSlides(productNum: number) {
  const pad = String(productNum).padStart(2, '0')
  return {
    primary: shoesAsset(`detail_${pad}_03_big.webp`),
    secondary: shoesAsset(`detail_${pad}_07_big.webp`),
  }
}

export function shoesProductStillUrl(productNum: number, stillNum: string): string {
  const pad = String(productNum).padStart(2, '0')
  const baseName = `detail_${pad}_${stillNum}_big`
  if (SHOES_PNG_ONLY_STILLS.has(stillNum)) {
    return shoesPngAsWebpUrl(`${baseName}.png`)
  }
  return shoesAsset(`${baseName}.webp`)
}

function shoesStillVariant(stillNum: string): ProductMultiCutSlide['variant'] {
  return stillNum === '03' ? 'square' : 'editorial'
}

/** MO PDP hero — `_01` … `_08` horizontal swipe. */
export function shoesProductPdpGallerySlides(productNum: number): ProductMultiCutSlide[] {
  return SHOES_PDP_STILL_NUMBERS.map((still) => ({
    image: shoesProductStillUrl(productNum, still),
    variant: shoesStillVariant(still),
  }))
}

/** MO PDP 상세정보 tab — same cuts stacked vertically. */
export function shoesProductPdpDetailImages(productNum: number): ProductMultiCutSlide[] {
  return shoesProductPdpGallerySlides(productNum)
}
