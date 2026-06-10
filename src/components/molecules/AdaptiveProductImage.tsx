import { useEffect, useRef, useState, type SyntheticEvent } from 'react'
import { swapImageExtension } from '../../lib/productImage'

interface AdaptiveProductImageProps {
  src: string
  alt: string
  /** Classes always applied (positioning/blend/etc.). */
  baseClassName?: string
  /** Classes when the image is square-ish or landscape (contained). */
  containClassName: string
  /** Classes when the image is portrait — fills the frame (typically object-cover, no letterboxing). */
  portraitClassName: string
  /**
   * Known orientation of the cut. When provided it is authoritative and skips the
   * async pixel measurement entirely (deterministic, no first-paint flicker):
   * `square` (누끼) is contained, `portrait` (화보) fills height. Omit to auto-detect.
   */
  orientation?: 'square' | 'portrait'
  loading?: 'eager' | 'lazy'
  draggable?: boolean
  /** Fires when both png/webp extension fallbacks fail to load. */
  onFinalError?: () => void
}

/** Portrait detection tolerance: only clearly-taller-than-wide images fill height. */
const PORTRAIT_RATIO = 1.02

/**
 * Renders a product cut image and picks its fit strategy: portrait images fill the
 * frame (cover), while square/landscape images are contained. When the caller
 * knows the cut orientation it is passed via `orientation` (authoritative);
 * otherwise the choice is measured from the *actual* image dimensions. Also retries
 * the opposite file extension on error (storage mixes png/webp).
 */
export function AdaptiveProductImage({
  src,
  alt,
  baseClassName = '',
  containClassName,
  portraitClassName,
  orientation,
  loading,
  draggable = false,
  onFinalError,
}: AdaptiveProductImageProps) {
  const [measuredPortrait, setMeasuredPortrait] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const isPortrait = orientation ? orientation === 'portrait' : measuredPortrait

  const measure = (img: HTMLImageElement | null) => {
    if (orientation) return
    if (img && img.naturalWidth > 0) {
      setMeasuredPortrait(img.naturalHeight > img.naturalWidth * PORTRAIT_RATIO)
    }
  }

  // Cached images may have already fired `load` before the handler attaches,
  // so measure synchronously on mount / src change when the image is complete.
  useEffect(() => {
    if (orientation) return
    const img = imgRef.current
    if (img && img.complete) measure(img)
  }, [src, orientation])

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    measure(event.currentTarget)
  }

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget
    if (img.dataset.extFallbackTried === '1') {
      onFinalError?.()
      return
    }
    const swapped = swapImageExtension(img.src)
    if (!swapped) {
      onFinalError?.()
      return
    }
    img.dataset.extFallbackTried = '1'
    img.src = swapped
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={`${baseClassName} ${isPortrait ? portraitClassName : containClassName}`.trim()}
      loading={loading}
      draggable={draggable}
      onLoad={handleLoad}
      onError={handleError}
    />
  )
}
