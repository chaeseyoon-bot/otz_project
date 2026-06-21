import { type SyntheticEvent } from 'react'
import { swapImageExtension } from '../../lib/productImage'

export interface ProductThumbFrameProps {
  src: string
  alt?: string
  className?: string
  draggable?: boolean
}

/** 4:5 product frame (#f6f6f6) with a width-fit square image centered inside. */
export function ProductThumbFrame({
  src,
  alt = '',
  className = '',
  draggable = false,
}: ProductThumbFrameProps) {
  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget
    if (img.dataset.extFallbackTried === '1') return

    const swapped = swapImageExtension(img.src)
    if (!swapped) return

    img.dataset.extFallbackTried = '1'
    img.src = swapped
  }

  return (
    <div className={`aspect-[4/5] overflow-hidden bg-light ${className}`}>
      <div className="flex h-full w-full items-center justify-center bg-light">
        <div className="aspect-square w-full">
          <img
            key={src}
            src={src}
            alt={alt}
            className="h-full w-full object-contain object-center mix-blend-multiply"
            draggable={draggable}
            onError={handleError}
          />
        </div>
      </div>
    </div>
  )
}
