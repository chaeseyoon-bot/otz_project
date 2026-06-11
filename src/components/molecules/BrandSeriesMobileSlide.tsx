import {
  BRAND_INTRO_MOBILE_HEIGHT,
  BRAND_INTRO_MOBILE_WIDTH,
} from './BrandIntroMobileSlide'
import { navigateBrandSeriesHref } from '../../lib/categoryRoutes'

/** Figma 2425:14942 / 102:3498 — product slide dim overlay */
export const BRAND_SERIES_DIM_OVERLAY =
  'linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%), linear-gradient(rgba(0, 0, 0, 0) 47.5%, rgba(0, 0, 0, 0.2) 83%)'

const BUTTON_ARROW = '/assets/figma/icons/button_arrow.svg'

export { BRAND_INTRO_MOBILE_HEIGHT, BRAND_INTRO_MOBILE_WIDTH }

function BrandSeriesCtaPreview({ label, href }: { label: string; href?: string }) {
  const className =
    'inline-flex flex-col items-start gap-0 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-[rgba(255,255,255,0.8)]'

  const content = (
    <>
      <span className="block">{label}</span>
      <img
        src={BUTTON_ARROW}
        alt=""
        aria-hidden
        width={90}
        height={9}
        className="block h-[9px] w-[90px] shrink-0"
      />
    </>
  )

  if (href?.trim()) {
    const trimmedHref = href.trim()
    return (
      <a
        href={trimmedHref}
        className={`pointer-events-auto ${className}`}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          navigateBrandSeriesHref(trimmedHref)
        }}
      >
        {content}
      </a>
    )
  }

  return <div className={className}>{content}</div>
}

export interface BrandSeriesMobileSlideProps {
  imageUrl: string | null
  title: string
  body: string
  ctaLabel: string
  ctaHref?: string
  /** Figma 102:3511 — carousel indicator bar (admin preview only). */
  showIndicator?: boolean
  indicatorCount?: number
  activeIndicatorIndex?: number
  emptyLabel?: string
}

/** Figma 102:3495 — mobile brand series slide content (345×431). */
export function BrandSeriesMobileSlide({
  imageUrl,
  title,
  body,
  ctaLabel,
  ctaHref,
  showIndicator = false,
  indicatorCount = 5,
  activeIndicatorIndex = 1,
  emptyLabel = '이미지 없음',
}: BrandSeriesMobileSlideProps) {
  if (!imageUrl) {
    return (
      <div className="flex size-full items-center justify-center bg-light text-[13px] text-subtleText">
        {emptyLabel}
      </div>
    )
  }

  const displayTitle = title.trim() || '시리즈명'
  const displayBody = body.trim() || '시리즈 설명'
  const displayCta = ctaLabel.trim() || '상품 보러 가기'

  return (
    <div className="relative size-full overflow-hidden" data-figma-node="102:3495">
      <img src={imageUrl} alt="" className="h-full w-full object-cover" draggable={false} />

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{ backgroundImage: BRAND_SERIES_DIM_OVERLAY }}
        aria-hidden
      />

      <div className="absolute inset-0 z-10 flex w-full flex-col justify-between px-5 pb-[30px] pt-[30px] text-white">
        <div className="flex flex-col items-center gap-2">
          <h3 className="m-0 text-center text-h3">{displayTitle}</h3>
          <p className="m-0 w-full whitespace-pre-line px-0 pb-[10px] text-center text-[13px] font-normal leading-[1.4] tracking-[-0.02em] [word-break:break-word]">
            {displayBody}
          </p>
        </div>
        <div className="mt-[14px] flex w-full justify-end">
          <BrandSeriesCtaPreview label={displayCta} href={ctaHref} />
        </div>
      </div>

      {showIndicator ? (
        <div
          className="absolute bottom-[3px] left-1/2 z-20 flex w-full max-w-[345px] -translate-x-1/2 gap-[2px] p-[3px]"
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
