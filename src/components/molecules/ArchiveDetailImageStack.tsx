import type { ArchiveLookbookDetailImage } from '../../data/archiveLookbookDetails'

export interface ArchiveDetailImageStackProps {
  images: ArchiveLookbookDetailImage[]
  className?: string
}

/** Figma 2679:10361 — full-width images, natural height, vertical stack (gap 8px). */
export function ArchiveDetailImageStack({ images, className = '' }: ArchiveDetailImageStackProps) {
  return (
    <div className={`flex w-full flex-col gap-2 ${className}`}>
      {images.map((image, index) => (
        <div key={`${image.src}-${index}`} className="w-full overflow-hidden">
          <img
            src={image.src}
            alt={image.alt ?? ''}
            className="block h-auto w-full"
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
          />
        </div>
      ))}
    </div>
  )
}
