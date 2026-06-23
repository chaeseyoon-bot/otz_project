import { useEffect, useState, type ImgHTMLAttributes, type SyntheticEvent } from 'react'
import { swapImageExtension } from '../../lib/productImage'

export interface ProductThumbImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'onError'> {
  src: string
  alt: string
}

/**
 * Product thumbnail with png/webp extension fallback (storage mixes both).
 * Hides the broken-image icon when neither variant loads.
 */
export function ProductThumbImage({ src, alt, className, ...rest }: ProductThumbImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setCurrentSrc(src)
    setFailed(false)
  }, [src])

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget
    if (img.dataset.extFallbackTried !== '1') {
      const swapped = swapImageExtension(img.src)
      if (swapped) {
        img.dataset.extFallbackTried = '1'
        setCurrentSrc(swapped)
        return
      }
    }
    setFailed(true)
  }

  if (failed) return null

  return (
    <img
      key={currentSrc}
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...rest}
    />
  )
}
