import type { KeyboardEvent, MouseEvent } from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { BRAND_SERIES_DIM_OVERLAY, BrandSeriesMobileSlide } from '../molecules/BrandSeriesMobileSlide'
import { useAdminHomeMainConfig } from '../../hooks/useAdminHomeMainConfig'
import { useHorizontalMouseDragScroll } from '../../hooks/useHorizontalMouseDragScroll'
import { resolveBrandSeriesSlides, type ResolvedBrandSeriesSlide } from '../../lib/homeMainContentResolver'
import { navigateBrandSeriesHref } from '../../lib/categoryRoutes'

const BRAND_IMAGE_DIM_OVERLAY = BRAND_SERIES_DIM_OVERLAY
const BUTTON_ARROW = '/assets/figma/icons/button_arrow.svg'

function navigateBrandHref(href: string, event?: MouseEvent<HTMLElement>) {
  event?.preventDefault()
  event?.stopPropagation()
  navigateBrandSeriesHref(href)
}

function handleBrandSeriesCardKeyDown(href: string, event: KeyboardEvent<HTMLElement>) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  navigateBrandHref(href)
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

function BrandSeriesGridCard({
  slide,
  className = 'w-full',
}: {
  slide: ResolvedBrandSeriesSlide
  className?: string
}) {
  if (!slide.title) return null

  const targetHref = slide.ctaHref.trim()
  const isNavigable = Boolean(targetHref && targetHref !== '#')

  return (
    <article
      tabIndex={isNavigable ? 0 : undefined}
      role={isNavigable ? 'link' : undefined}
      aria-label={isNavigable ? `${slide.title} 카테고리로 이동` : undefined}
      className={`group relative aspect-[338/423] shrink-0 overflow-hidden rounded-[20px] outline-none focus-visible:ring-2 focus-visible:ring-black/25 focus-visible:ring-offset-2 ${isNavigable ? 'cursor-pointer' : ''} ${className}`}
      onClick={isNavigable ? () => navigateBrandHref(targetHref) : undefined}
      onKeyDown={isNavigable ? (event) => handleBrandSeriesCardKeyDown(targetHref, event) : undefined}
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

/** Brand series banners only (admin tab 4). */
export function BrandSeriesSection() {
  const { seriesBanners } = useAdminHomeMainConfig()
  const seriesSlides = useMemo(() => resolveBrandSeriesSlides(seriesBanners), [seriesBanners])
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  useHorizontalMouseDragScroll(scrollerRef)

  const syncIndexFromScroll = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return

    const slideElements = Array.from(el.querySelectorAll<HTMLElement>('[data-brand-series-slide-index]'))
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
    const targetSlide = el.querySelector<HTMLElement>(`[data-brand-series-slide-index="${index}"]`)
    if (!targetSlide) return
    el.scrollTo({ left: targetSlide.offsetLeft, behavior: 'smooth' })
  }, [])

  if (seriesSlides.length === 0) return null

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
              {seriesSlides.map((slide, index) => (
                <article
                  key={slide.id}
                  data-brand-series-slide-index={index}
                  className={`relative h-[431px] w-[345px] shrink-0 snap-start overflow-hidden ${slide.ctaHref.trim() ? 'cursor-pointer' : ''}`}
                  role={slide.ctaHref.trim() ? 'link' : undefined}
                  tabIndex={slide.ctaHref.trim() ? 0 : undefined}
                  aria-label={slide.ctaHref.trim() ? `${slide.title} 카테고리로 이동` : undefined}
                  onClick={slide.ctaHref.trim() ? () => navigateBrandHref(slide.ctaHref) : undefined}
                  onKeyDown={
                    slide.ctaHref.trim()
                      ? (event) => handleBrandSeriesCardKeyDown(slide.ctaHref, event)
                      : undefined
                  }
                >
                  <BrandSeriesMobileSlide
                    imageUrl={slide.imageUrl}
                    title={slide.title}
                    body={slide.body}
                    ctaLabel={slide.ctaLabel}
                    ctaHref={slide.ctaHref}
                  />
                </article>
              ))}
            </div>
          </div>

          {seriesSlides.length > 1 ? (
            <div className="absolute bottom-[3px] left-1/2 z-20 flex w-[345px] max-w-full -translate-x-1/2 gap-[2px] px-[3px]">
              {seriesSlides.map((slide, index) => (
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
          ) : null}
        </div>
      </div>

      {/* Figma 211:6576 — PC standalone: 338×423 cards in a centered horizontal row (max 1400) */}
      <div className="hidden w-full bg-light py-[64px] lg:block">
        <div className="mx-auto min-w-0 max-w-[1400px]">
          <div className="flex flex-wrap items-start justify-center gap-4">
            {seriesSlides.map((slide) => (
              <BrandSeriesGridCard key={slide.id} slide={slide} className="w-[338px]" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
