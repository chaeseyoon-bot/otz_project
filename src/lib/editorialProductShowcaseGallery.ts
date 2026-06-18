import type { EditorialShowcaseGalleryImage } from '../data/editorialEventDetails'
import type { ProductCardItem } from '../components/molecules/ProductCardUnit'
import { imageUrlCacheVersion, productCutUrl, swapImageExtension } from './productImage'
import { storageFolderForProduct } from './productsApi'

/** Figma 144:4223 — standalone product gallery cuts (08 omitted when missing). */
export const PRODUCT_SHOWCASE_AUTO_CUTS = ['03', '04', '05', '07', '08'] as const

const CUTOUT_CUTS = new Set<string>(['03', '04', '05'])

function variantForCut(cut: string): EditorialShowcaseGalleryImage['variant'] {
  return CUTOUT_CUTS.has(cut) ? 'cutout' : 'editorial'
}

function fallbackGallery(product: ProductCardItem): EditorialShowcaseGalleryImage[] {
  if (product.multiCutSlides?.length) {
    return product.multiCutSlides.map((slide) => ({
      src: slide.image,
      fallbackSrc: swapImageExtension(slide.image) ?? undefined,
      variant: slide.variant === 'editorial' ? 'editorial' : 'cutout',
    }))
  }

  if (product.image.trim()) {
    const src = product.image
    return [{ src, fallbackSrc: swapImageExtension(src) ?? undefined, variant: 'cutout' }]
  }

  return []
}

/** Builds showcase slide URLs from product storage cuts 03/04/05/07/08 (08 may 404 — hidden in UI). */
export function buildProductShowcaseGalleryFromCuts(
  product: ProductCardItem & { category?: string },
): EditorialShowcaseGalleryImage[] {
  const numericId = Number(product.id)
  if (!Number.isFinite(numericId) || !product.category?.trim()) {
    return fallbackGallery(product)
  }

  const folder = storageFolderForProduct(product.category, numericId)
  const cacheVersion = imageUrlCacheVersion(product.image)

  const slides = PRODUCT_SHOWCASE_AUTO_CUTS.map((cut) => {
    const src = productCutUrl(folder, numericId, cut, 'png', cacheVersion)
    return {
      src,
      fallbackSrc: swapImageExtension(src) ?? undefined,
      variant: variantForCut(cut),
    }
  })

  return slides.length ? slides : fallbackGallery(product)
}

/** Admin-uploaded gallery wins when any slot is filled; otherwise auto cuts are used. */
export function pickShowcaseGallery(
  adminGallery: EditorialShowcaseGalleryImage[],
  autoGallery: EditorialShowcaseGalleryImage[],
): EditorialShowcaseGalleryImage[] {
  return adminGallery.length ? adminGallery : autoGallery
}
