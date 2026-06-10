import { PLANNING_COLLECTION_PRODUCT_SLOTS } from '../../lib/adminHomeMainConfig'

/** Figma 2354:4592 — mobile planning collection card (335px wide). */
export const PLANNING_COLLECTION_CARD_WIDTH = 335
export const PLANNING_COLLECTION_BANNER_HEIGHT = 419

export interface PlanningCollectionMobileSlideProps {
  bannerImage: string | null
  tagLabel: string
  title: string
  /** Thumbnail URLs — 1–4 registered products at fixed 4-column tile size. */
  productImages: string[]
  emptyLabel?: string
}

export function PlanningCollectionMobileSlide({
  bannerImage,
  tagLabel,
  title,
  productImages,
  emptyLabel = '이미지 없음',
}: PlanningCollectionMobileSlideProps) {
  const displayTag = tagLabel.trim() || 'COLLECTION'
  const displayTitle = title.trim() || '기획전 타이틀'
  const thumbs = productImages.slice(0, PLANNING_COLLECTION_PRODUCT_SLOTS)

  return (
    <div className="w-full" data-figma-node="2354:4592">
      <div className="relative h-[419px] overflow-hidden">
        {bannerImage ? (
          <img src={bannerImage} alt="" className="h-full w-full object-cover" draggable={false} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-light text-[13px] text-subtleText">
            {emptyLabel}
          </div>
        )}
        {bannerImage ? (
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent from-[47.5%] to-black/25 to-[83%]"
            aria-hidden
          />
        ) : null}
        <div className="absolute left-0 top-0 h-fit bg-black px-[10px] py-[6px]">
          <span className="text-[10px] font-semibold leading-[1.1] text-white">{displayTag}</span>
        </div>
        <h3 className="absolute bottom-[30px] left-[30px] right-[30px] m-0 whitespace-pre-line text-center text-[24px] font-extrabold leading-[1.2] tracking-[-0.02em] text-white">
          {displayTitle}
        </h3>
      </div>

      {thumbs.length > 0 ? (
        <div className="mt-[2px] grid grid-cols-4 gap-[2px]">
          {thumbs.map((image, index) => (
            <div
              key={index}
              className="aspect-[4/5] overflow-hidden bg-[var(--otz-color-surface-subtle)]"
            >
              <div className="flex h-full w-full items-center justify-center bg-[var(--otz-color-surface-subtle)]">
                <div className="aspect-square w-full">
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-contain object-center mix-blend-multiply"
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
