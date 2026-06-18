export interface EditorialLookbookMasonrySectionProps {
  images: string[]
  /** Figma 143:4669 — directly below catalog hero info */
  variant?: 'default' | 'hero-follow'
}

function splitMasonryColumns(images: string[]): [string[], string[]] {
  const left: string[] = []
  const right: string[] = []
  images.forEach((image, index) => {
    if (index % 2 === 0) left.push(image)
    else right.push(image)
  })
  return [left, right]
}

function MasonryColumn({ images }: { images: string[] }) {
  if (!images.length) return null

  return (
    <div className="flex w-[calc(50%-4px)] flex-col gap-2">
      {images.map((image, index) => (
        <img
          key={`${image}-${index}`}
          src={image}
          alt=""
          className="block h-auto w-full"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      ))}
    </div>
  )
}

/** Figma 143:4669 — two-column editorial lookbook masonry. */
export function EditorialLookbookMasonrySection({
  images,
  variant = 'default',
}: EditorialLookbookMasonrySectionProps) {
  if (!images.length) return null

  const [leftColumn, rightColumn] = splitMasonryColumns(images)
  const isHeroFollow = variant === 'hero-follow'

  return (
    <section
      className={`bg-white ${
        isHeroFollow
          ? 'mx-auto w-full max-w-[1400px] border-b border-dark pt-16 pb-16'
          : 'w-full py-16'
      }`}
    >
      <div className={`mx-auto flex w-full max-w-[1000px] gap-2 ${isHeroFollow ? '' : 'px-10'}`}>
        <MasonryColumn images={leftColumn} />
        <MasonryColumn images={rightColumn} />
      </div>
    </section>
  )
}
