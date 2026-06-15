import type { ArchiveDetailIntro, ArchiveLookbookDetailImage } from '../../data/archiveLookbookDetails'
import { ArchiveDetailIntroText } from './ArchiveDetailIntroText'

export interface ArchiveDetailImageStackProps {
  images: ArchiveLookbookDetailImage[]
  intro?: ArchiveDetailIntro | null
  /** Insert intro after this many images (first row). */
  introAfterIndex?: number
  className?: string
}

function DetailImage({ image, index }: { image: ArchiveLookbookDetailImage; index: number }) {
  return (
    <div className="w-full overflow-hidden">
      <img
        src={image.src}
        alt={image.alt ?? ''}
        className="block h-auto w-full"
        loading={index === 0 ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
      />
    </div>
  )
}

/** Figma 2679:10361 — full-width images, natural height, vertical stack (gap 8px). */
export function ArchiveDetailImageStack({
  images,
  intro,
  introAfterIndex = 0,
  className = '',
}: ArchiveDetailImageStackProps) {
  const hasIntro = Boolean(intro && (intro.heading.trim() || intro.body.trim()))
  const splitIndex =
    hasIntro && introAfterIndex > 0 && introAfterIndex < images.length
      ? introAfterIndex
      : hasIntro && introAfterIndex > 0
        ? introAfterIndex
        : 0

  if (!hasIntro || splitIndex <= 0) {
    return (
      <div className={`flex w-full flex-col gap-2 ${className}`}>
        {images.map((image, index) => (
          <DetailImage key={`${image.src}-${index}`} image={image} index={index} />
        ))}
      </div>
    )
  }

  const before = images.slice(0, splitIndex)
  const after = images.slice(splitIndex)

  return (
    <div className={`flex w-full flex-col gap-2 ${className}`}>
      {before.map((image, index) => (
        <DetailImage key={`${image.src}-${index}`} image={image} index={index} />
      ))}
      <ArchiveDetailIntroText intro={intro!} className="px-[5px] py-10 lg:py-16" />
      {after.map((image, index) => (
        <DetailImage
          key={`${image.src}-${splitIndex + index}`}
          image={image}
          index={splitIndex + index}
        />
      ))}
    </div>
  )
}
