import { useEffect, useState } from 'react'
import type { ProductMultiCutSlide } from '../components/molecules/ProductCardUnit'
import { probeImageUrl } from '../lib/probeImageUrl'

interface UseAvailableProductSlidesOptions {
  /** When false, returns `slides` as-is (no network probes). */
  enabled?: boolean
}

/**
 * Filters PDP slides to those that exist on storage (e.g. optional `_08`).
 */
export function useAvailableProductSlides(
  slides: ProductMultiCutSlide[],
  options: UseAvailableProductSlidesOptions = {},
) {
  const { enabled = true } = options
  const slideKey = slides.map((slide) => slide.image).join('|')
  const [availableSlides, setAvailableSlides] = useState<ProductMultiCutSlide[]>(enabled ? [] : slides)
  const [isResolving, setIsResolving] = useState(enabled && slides.length > 0)

  useEffect(() => {
    if (!enabled) {
      setAvailableSlides(slides)
      setIsResolving(false)
      return
    }

    if (slides.length === 0) {
      setAvailableSlides([])
      setIsResolving(false)
      return
    }

    let cancelled = false
    setIsResolving(true)

    void (async () => {
      const checked = await Promise.all(
        slides.map(async (slide) => ({
          slide,
          ok: await probeImageUrl(slide.image),
        })),
      )

      if (cancelled) return
      setAvailableSlides(checked.filter((entry) => entry.ok).map((entry) => entry.slide))
      setIsResolving(false)
    })()

    return () => {
      cancelled = true
    }
  }, [enabled, slideKey, slides])

  return { slides: availableSlides, isResolving }
}
