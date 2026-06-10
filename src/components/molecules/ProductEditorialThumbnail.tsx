import { useEffect, useMemo, useState } from 'react'
import { swapImageExtension } from '../../lib/productImage'

export interface ProductEditorialThumbnailProps {
  candidates: string[]
  alt?: string
  className?: string
  imageClassName?: string
  emptyLabel?: string
}

/** Product thumbnail — prefers 07 editorial cut with png/webp and square fallback chain. */
export function ProductEditorialThumbnail({
  candidates,
  alt = '',
  className = '',
  imageClassName = 'size-full object-contain object-center mix-blend-multiply',
  emptyLabel = 'No img',
}: ProductEditorialThumbnailProps) {
  const chain = useMemo(() => candidates.filter(Boolean), [candidates])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [chain])

  const src = chain[index]
  const hasImage = Boolean(src)

  if (!hasImage) {
    return (
      <div className={`flex items-center justify-center bg-light text-[10px] text-subtleText ${className}`}>
        {emptyLabel}
      </div>
    )
  }

  return (
    <div className={className}>
      <img
        key={`${src}-${index}`}
        src={src}
        alt={alt}
        className={imageClassName}
        draggable={false}
        loading="lazy"
        onError={() => {
          const swapped = swapImageExtension(src)
          if (swapped && !chain.includes(swapped)) {
            setIndex((prev) => prev + 1)
            return
          }
          setIndex((prev) => Math.min(prev + 1, chain.length))
        }}
      />
    </div>
  )
}
