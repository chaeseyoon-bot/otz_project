import { useEffect, useState } from 'react'
import type { ProductMultiCutSlide } from '../components/molecules/ProductCardUnit'
import { fetchProductDetailById } from '../lib/productsApi'
import { recordRecentlyViewedProduct } from '../lib/recentlyViewedStorage'
import type { UiProduct } from './useProducts'
import { PRODUCT_PDP_CUTS, productCutUrl } from '../lib/productImage'
import { probeImageSize } from '../lib/probeImageUrl'

/** Taller-than-wide images (e.g. 화보 1200×1500/1440) fill height; squares are contained. */
const PORTRAIT_RATIO = 1.02

/**
 * Resolves a single cut to its working URL (png then webp — bucket mixes both) and
 * derives its `variant` from the *actual* pixel ratio, so square cuts (e.g. 01/03 at
 * 1200×1200) are contained while portrait 화보 cuts fill the frame height.
 */
async function resolveCutSlide(
  folder: string,
  id: number,
  cut: string,
  cacheVersion?: string | null,
): Promise<ProductMultiCutSlide | null> {
  const png = productCutUrl(folder, id, cut, 'png', cacheVersion)
  let size = await probeImageSize(png)
  let image = png
  if (!size) {
    const webp = productCutUrl(folder, id, cut, 'webp', cacheVersion)
    size = await probeImageSize(webp)
    image = webp
  }
  if (!size) return null

  const variant: ProductMultiCutSlide['variant'] =
    size.height > size.width * PORTRAIT_RATIO ? 'editorial' : 'square'
  return { image, variant }
}

export interface UseProductDetailState {
  product: UiProduct | null
  /** Available PDP cut slides (01 … 08), in order, with broken cuts dropped. */
  slides: ProductMultiCutSlide[]
  isLoading: boolean
  isResolving: boolean
  error: string | null
}

/**
 * Loads a CSV-backed product by id and resolves its full PDP gallery
 * (`detail_{id}_01..08_big`), probing each cut's existence/extension in the browser.
 * Returns `product: null` for ids not present in the CSV (caller can fall back).
 */
export function useProductDetail(id: string): UseProductDetailState {
  const [state, setState] = useState<UseProductDetailState>({
    product: null,
    slides: [],
    isLoading: true,
    isResolving: false,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    setState({ product: null, slides: [], isLoading: true, isResolving: false, error: null })

    fetchProductDetailById(id)
      .then(async (detail) => {
        if (cancelled) return
        if (!detail) {
          setState({ product: null, slides: [], isLoading: false, isResolving: false, error: null })
          return
        }

        recordRecentlyViewedProduct(detail.product)
        setState({ product: detail.product, slides: [], isLoading: false, isResolving: true, error: null })

        const resolved = await Promise.all(
          PRODUCT_PDP_CUTS.map((cut) =>
            resolveCutSlide(detail.folder, detail.numericId, cut, detail.imageCacheVersion),
          ),
        )
        if (cancelled) return

        const slides = resolved.filter((slide): slide is ProductMultiCutSlide => slide != null)
        setState({ product: detail.product, slides, isLoading: false, isResolving: false, error: null })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : String(err)
        setState({ product: null, slides: [], isLoading: false, isResolving: false, error: message })
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return state
}
