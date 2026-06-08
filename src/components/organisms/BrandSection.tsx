import type { CSSProperties, MouseEvent } from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useAdminHomeMainConfig } from '../../hooks/useAdminHomeMainConfig'
import { useHorizontalMouseDragScroll } from '../../hooks/useHorizontalMouseDragScroll'
import {
  resolveBrandIntro,
  resolveBrandSeriesSlides,
  type ResolvedBrandSeriesSlide,
} from '../../lib/homeMainContentResolver'
import { isSpaPath, navigateSpa, type SpaPath } from '../../lib/spaNavigation'

/** Product slides overlay (Figma node 2425:14942) */
const BRAND_IMAGE_DIM_OVERLAY =
  'linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%), linear-gradient(rgba(0, 0, 0, 0) 47.5%, rgba(0, 0, 0, 0.2) 83%)'
/** public/assets/figma/icons/button_arrow.svg — underline + arrow (90×9) */
const BUTTON_ARROW = '/assets/figma/icons/button_arrow.svg'

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
function brandIntroSubtractStyleDesktop(): CSSProperties {
  const scale = 2
  const r = BRAND_INTRO_HOLE_RADIUS_PX * scale
  const rInner = r - 1
  const centerY = BRAND_INTRO_HOLE_TOP_OFFSET_PX * scale + r
  const dim = `rgba(0,0,0,${BRAND_INTRO_DIM_OPACITY})`
  return {
    background: `radial-gradient(circle ${r}px at 50% ${centerY}px, transparent ${rInner}px, ${dim} ${r}px, ${dim} 100%)`,
  }
}

function BrandIntroSubtractOverlay({ layout = 'mobile' }: { layout?: 'mobile' | 'desktop' }) {
  const style = layout === 'desktop' ? brandIntroSubtractStyleDesktop() : brandIntroSubtractStyle()
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      style={style}
      aria-hidden
    />
  )
}

type BrandIntroSlide = {
  id: string
  variant: 'intro'
  body: string
  image: string
}

type BrandProductSlide = {
  id: string
  variant: 'product'
  title: string
  body: string
  image: string
  ctaLabel: string
  ctaHref: string
}

type BrandSlide = BrandIntroSlide | BrandProductSlide

function navigateBrandHref(href: string, event?: MouseEvent<HTMLAnchorElement>) {
  const trimmed = href.trim()
  if (!trimmed || trimmed === '#') return

  event?.preventDefault()
  if (isSpaPath(trimmed)) {
    navigateSpa(trimmed as SpaPath)
    return
  }
  window.location.assign(trimmed)
}

function BrandSeriesCta({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href.trim() || '#'}
      className="pointer-events-auto inline-flex flex-col items-start gap-0 pr-0 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-[rgba(255,255,255,0.8)]"
      onClick={(event) => navigateBrandHref(href, event)}
    >
      <span className="block">{label}</span>
      <img
        src={BUTTON_ARROW}
        alt=""
        aria-hidden
        width={90}
        height={9}
        className="block h-[9px] w-[90px] shrink-0"
      />
    </a>
  )
}

interface BrandSeriesGridCardProps {
  slide: ResolvedBrandSeriesSlide
}

function BrandSeriesGridCard({ slide }: BrandSeriesGridCardProps) {
  if (!slide.title) return null

  return (
    <article
      tabIndex={0}
      className="group relative aspect-[338/423] w-full shrink-0 overflow-hidden rounded-[20px] outline-none focus-visible:ring-2 focus-visible:ring-black/25 focus-visible:ring-offset-2"
    >
      <img src={slide.imageUrl} alt={slide.title} className="absolute inset-0 h-full w-full object-cover" />

      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-transparent from-[47.5%] to-black/20 to-[83%]"
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex justify-center px-5 pb-[30px] transition-opacity duration-300 ease-out group-hover:opacity-0 group-focus-within:opacity-0">
        <h3 className="text-center text-h3 text-white">{slide.title}</h3>
      </div>

      <div className="pointer-events-none absolute inset-0 z-[3] flex flex-col justify-between px-5 pb-[30px] pt-[30px] text-white opacity-0 transition-opacity duration-300 ease-out group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{ backgroundImage: BRAND_IMAGE_DIM_OVERLAY }}
          aria-hidden
        />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-3.5">
          <h3 className="text-center text-h3">{slide.title}</h3>
          <p className="w-full max-w-[335px] whitespace-pre-line px-2 pb-2.5 text-center text-[13px] font-normal leading-[1.4] tracking-[-0.02em]">
            {slide.body}
          </p>
        </div>
        <div className="relative z-10 mt-3.5 flex w-full justify-end">
          <BrandSeriesCta label={slide.ctaLabel} href={slide.ctaHref} />
        </div>
      </div>
    </article>
  )
}

export function BrandSection() {
  const { brandBanner, seriesBanners } = useAdminHomeMainConfig()
  const brandIntro = useMemo(() => resolveBrandIntro(brandBanner), [brandBanner])
  const seriesSlides = useMemo(() => resolveBrandSeriesSlides(seriesBanners), [seriesBanners])
  const mobileSlides = useMemo<BrandSlide[]>(
    () => [
      {
        id: 'brand-intro',
        variant: 'intro',
        body: brandIntro.body,
        image: brandIntro.imageUrl,
      },
      ...seriesSlides.map((series) => ({
        id: series.id,
        variant: 'product' as const,
        title: series.title,
        body: series.body,
        image: series.imageUrl,
        ctaLabel: series.ctaLabel,
        ctaHref: series.ctaHref,
      })),
    ],
    [brandIntro, seriesSlides],
  )

  const scrollerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  useHorizontalMouseDragScroll(scrollerRef)

  const syncIndexFromScroll = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return

    const slideElements = Array.from(el.querySelectorAll<HTMLElement>('[data-brand-slide-index]'))
    if (!slideElements.length) return

    const currentLeft = el.scrollLeft
    let nearestIndex = 0
    let minDistance = Number.POSITIVE_INFINITY

    slideElements.forEach((slideEl, index) => {
      const distance = Math.abs(slideEl.offsetLeft - currentLeft)
      if (distance < minDistance) {
        minDistance = distance
        nearestIndex = index
      }
    })

    setActiveIndex(nearestIndex)
  }, [])

  const scrollToSlide = useCallback((index: number) => {
    const el = scrollerRef.current
    if (!el) return

    const targetSlide = el.querySelector<HTMLElement>(`[data-brand-slide-index="${index}"]`)
    if (!targetSlide) return

    el.scrollTo({
      left: targetSlide.offsetLeft,
      behavior: 'smooth',
    })
  }, [])

  return (
    <section className="w-full">
      <div className="bg-white px-[15px] pt-10 lg:hidden">
        <div className="relative">
          <div
            ref={scrollerRef}
            onScroll={syncIndexFromScroll}
            className="cursor-grab overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory active:cursor-grabbing"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex w-max gap-0 pr-[15px]">
              {mobileSlides.map((slide, index) => (
                <article
                  key={slide.id}
                  data-brand-slide-index={index}
                  className="relative h-[431px] w-[345px] shrink-0 snap-start overflow-hidden"
                >
                  <img
                    src={slide.image}
                    alt={slide.variant === 'intro' ? 'OTZ' : (slide.title ?? 'OTZ')}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />

                  {slide.variant === 'intro' ? (
                    <BrandIntroSubtractOverlay />
                  ) : (
                    <div
                      className="pointer-events-none absolute inset-0 z-[1]"
                      style={{ backgroundImage: BRAND_IMAGE_DIM_OVERLAY }}
                    />
                  )}

                  {slide.variant === 'intro' ? (
                    <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end px-5 pb-[25px] text-center text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-white">
                      {slide.body.split('\n').map((line, lineIndex) => (
                        <p key={lineIndex} className="mb-0 last:mb-0">
                          {line}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div className="absolute inset-y-0 left-0 z-10 flex w-[345px] flex-col justify-between px-5 pb-[30px] pt-[30px] text-white">
                      <div className="flex flex-col items-center gap-2">
                        <h3 className="text-center text-h3">{slide.title}</h3>
                        <p className="w-full whitespace-pre-line px-0 pb-[10px] text-center text-[13px] font-normal leading-[1.4] tracking-[-0.02em]">
                          {slide.body}
                        </p>
                      </div>
                      <div className="mt-[14px] flex w-full justify-end">
                        <BrandSeriesCta label={slide.ctaLabel} href={slide.ctaHref} />
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>

          <div className="absolute bottom-[3px] left-1/2 z-20 flex w-[345px] max-w-full -translate-x-1/2 gap-[2px] px-[3px]">
            {mobileSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`${index + 1}번 슬라이드로 이동`}
                aria-current={index === activeIndex}
                className={`h-[2px] flex-1 border-0 p-0 ${index === activeIndex ? 'bg-white' : 'bg-white/45'}`}
                onClick={() => scrollToSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Figma 2601:23098 — PC: full-width light band + py 64 */}
      <div className="hidden w-full bg-light py-[64px] lg:block">
        <div className="mx-auto min-w-0 max-w-[1400px]">
          {/* Figma 2601:23100 — desktop: intro panel + 2×2 series grid (hover reveals copy like ROMARI slide) */}
          <div className="hidden w-full min-w-0 lg:grid lg:grid-cols-[minmax(0,690px)_minmax(0,1fr)] lg:items-start lg:gap-4">
            <div className="relative isolate aspect-[690/862] w-full max-w-[690px] overflow-hidden justify-self-start">
              <img
                src={brandIntro.imageUrl}
                alt="OTZ"
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
              />
              <BrandIntroSubtractOverlay layout="desktop" />
              <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end px-10 pb-10 text-center text-bodyMedium1 text-white">
                {brandIntro.body.split('\n').map((line, lineIndex) => (
                  <p key={lineIndex} className="mb-0 last:mb-0">
                    {line}
                  </p>
                ))}
              </div>
            </div>

            <div className="grid min-h-0 min-w-0 grid-cols-2 gap-4">
              {seriesSlides.map((slide) => (
                <BrandSeriesGridCard key={slide.id} slide={slide} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
