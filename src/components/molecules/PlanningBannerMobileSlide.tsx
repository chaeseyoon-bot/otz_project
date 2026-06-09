/** Figma 2354:4360 — mobile planning exhibition banner (345×431). */
export const PLANNING_BANNER_MOBILE_WIDTH = 345
export const PLANNING_BANNER_MOBILE_HEIGHT = 431

/** Figma 2384:7103 — bottom dim gradient */
export const PLANNING_BANNER_DIM_OVERLAY =
  'linear-gradient(180deg, rgba(0, 0, 0, 0) 56.713%, rgba(0, 0, 0, 0.2) 82.639%)'

export interface PlanningBannerMobileSlideProps {
  imageUrl: string | null
  badge: string
  title: string
  subtitle: string
  /** Carousel indicator (admin preview / home). Hidden when indicatorCount < 2. */
  showIndicator?: boolean
  indicatorCount?: number
  activeIndicatorIndex?: number
  emptyLabel?: string
}

export function PlanningBannerMobileSlide({
  imageUrl,
  badge,
  title,
  subtitle,
  showIndicator = false,
  indicatorCount = 1,
  activeIndicatorIndex = 0,
  emptyLabel = '이미지 없음',
}: PlanningBannerMobileSlideProps) {
  if (!imageUrl) {
    return (
      <div className="flex size-full items-center justify-center bg-light text-[13px] text-subtleText">
        {emptyLabel}
      </div>
    )
  }

  const displayBadge = badge.trim() || '26SS'
  const displayTitle = title.trim() || '기획전 타이틀'
  const displaySubtitle = subtitle.trim() || '기획전 서브 카피'
  const shouldShowIndicator = showIndicator && indicatorCount >= 2

  return (
    <div className="relative size-full overflow-hidden" data-figma-node="2354:4360">
      <img src={imageUrl} alt="" className="h-full w-full object-cover" draggable={false} />

      <div
        className="pointer-events-none absolute inset-0 z-[1] mix-blend-darken"
        style={{ backgroundImage: PLANNING_BANNER_DIM_OVERLAY }}
        aria-hidden
      />

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-[14px] px-5 pb-8">
        <div className="flex flex-col items-center gap-1.5">
          <span className="rounded-[4px] bg-black px-[15px] py-1.5 text-[13px] font-bold leading-none text-white">
            {displayBadge}
          </span>
          <div className="flex flex-col items-center gap-1 text-center text-white">
            <h3 className="m-0 text-[20px] font-semibold leading-[1.2] tracking-[-0.4px]">
              {displayTitle}
            </h3>
            <p className="m-0 text-[13px] font-normal leading-[1.4] tracking-[-0.26px] [word-break:break-word]">
              {displaySubtitle}
            </p>
          </div>
        </div>
      </div>

      {shouldShowIndicator ? (
        <div
          className="absolute bottom-0 left-1/2 z-20 flex w-full max-w-[345px] -translate-x-1/2 gap-[3px] p-[3px]"
          aria-hidden
        >
          {Array.from({ length: indicatorCount }, (_, index) => (
            <div
              key={index}
              className={`h-[2px] min-w-0 flex-1 ${index === activeIndicatorIndex ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
