import type { CSSProperties } from 'react'

/** Figma 102:3477 — mobile brand intro slide (345×431). */
export const BRAND_INTRO_MOBILE_WIDTH = 345
export const BRAND_INTRO_MOBILE_HEIGHT = 431

/** Figma 2371:6664 Subtract — 315px circle @ top 18.5px on 345×431 card */
const BRAND_INTRO_HOLE_DIAMETER_PX = 315
const BRAND_INTRO_HOLE_RADIUS_PX = BRAND_INTRO_HOLE_DIAMETER_PX / 2
const BRAND_INTRO_HOLE_TOP_OFFSET_PX = 18.5
const BRAND_INTRO_HOLE_CENTER_Y_PX = BRAND_INTRO_HOLE_TOP_OFFSET_PX + BRAND_INTRO_HOLE_RADIUS_PX
const BRAND_INTRO_DIM_OPACITY = 0.3

function brandIntroSubtractStyle(): CSSProperties {
  const r = BRAND_INTRO_HOLE_RADIUS_PX
  const rInner = r - 1
  const dim = `rgba(0,0,0,${BRAND_INTRO_DIM_OPACITY})`
  return {
    background: `radial-gradient(circle ${r}px at 50% ${BRAND_INTRO_HOLE_CENTER_Y_PX}px, transparent ${rInner}px, ${dim} ${r}px, ${dim} 100%)`,
  }
}

/** Figma 2601:23100 desktop intro — 690×862 (2× mobile) */
export function brandIntroSubtractStyleDesktop(): CSSProperties {
  const scale = 2
  const r = BRAND_INTRO_HOLE_RADIUS_PX * scale
  const rInner = r - 1
  const centerY = BRAND_INTRO_HOLE_TOP_OFFSET_PX * scale + r
  const dim = `rgba(0,0,0,${BRAND_INTRO_DIM_OPACITY})`
  return {
    background: `radial-gradient(circle ${r}px at 50% ${centerY}px, transparent ${rInner}px, ${dim} ${r}px, ${dim} 100%)`,
  }
}

export function BrandIntroSubtractOverlay({ layout = 'mobile' }: { layout?: 'mobile' | 'desktop' }) {
  const style = layout === 'desktop' ? brandIntroSubtractStyleDesktop() : brandIntroSubtractStyle()
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      style={style}
      aria-hidden
    />
  )
}

export interface BrandIntroMobileSlideProps {
  imageUrl: string | null
  body: string
  /** Figma 102:3488 — carousel indicator bar (admin preview only). */
  showIndicator?: boolean
  indicatorCount?: number
  activeIndicatorIndex?: number
  emptyLabel?: string
}

/** Figma 102:3477 — mobile brand intro slide content. */
export function BrandIntroMobileSlide({
  imageUrl,
  body,
  showIndicator = false,
  indicatorCount = 5,
  activeIndicatorIndex = 0,
  emptyLabel = '이미지 없음',
}: BrandIntroMobileSlideProps) {
  if (!imageUrl) {
    return (
      <div className="flex size-full items-center justify-center bg-light text-[13px] text-subtleText">
        {emptyLabel}
      </div>
    )
  }

  const copy = body.trim() || '브랜드 카피'

  return (
    <div className="relative size-full overflow-hidden" data-figma-node="102:3477">
      <img src={imageUrl} alt="" className="h-full w-full object-cover" draggable={false} />
      <BrandIntroSubtractOverlay />
      <div className="absolute inset-x-0 bottom-0 z-10 flex h-[431px] flex-col items-center justify-end px-5 pb-[25px] text-center text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-white">
        {copy.split('\n').map((line, lineIndex) => (
          <p key={`${line}-${lineIndex}`} className="mb-0 [word-break:break-word] last:mb-0">
            {line}
          </p>
        ))}
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
