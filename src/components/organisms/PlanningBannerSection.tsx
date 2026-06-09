import { useCallback, useMemo, useRef, useState } from 'react'
import { PlanningBannerMobileSlide } from '../molecules/PlanningBannerMobileSlide'
import { useAdminHomeMainConfig } from '../../hooks/useAdminHomeMainConfig'
import { useHorizontalMouseDragScroll } from '../../hooks/useHorizontalMouseDragScroll'
import { resolvePlanningBanners } from '../../lib/homeMainContentResolver'

export function PlanningBannerSection() {
  const { planningBanners, updatedAt } = useAdminHomeMainConfig()
  const slides = useMemo(
    () => resolvePlanningBanners(planningBanners ?? []),
    [planningBanners, updatedAt],
  )
  const showIndicator = slides.length >= 2

  const scrollerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  useHorizontalMouseDragScroll(scrollerRef)

  const syncIndexFromScroll = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return

    const slideElements = Array.from(el.querySelectorAll<HTMLElement>('[data-planning-slide-index]'))
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

    const targetSlide = el.querySelector<HTMLElement>(`[data-planning-slide-index="${index}"]`)
    if (!targetSlide) return

    el.scrollTo({
      left: targetSlide.offsetLeft,
      behavior: 'smooth',
    })
  }, [])

  if (!slides.length) return null

  return (
    <section key={updatedAt ?? 'planning-default'} className="w-full lg:hidden">
      <div className="bg-white px-[15px] pt-4">
        <div className="relative">
          <div
            ref={scrollerRef}
            onScroll={syncIndexFromScroll}
            className="cursor-grab overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory active:cursor-grabbing"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex w-max gap-0 pr-[15px]">
              {slides.map((slide, index) => (
                <article
                  key={slide.id}
                  data-planning-slide-index={index}
                  className="relative h-[431px] w-[345px] shrink-0 snap-start overflow-hidden"
                >
                  <PlanningBannerMobileSlide
                    imageUrl={slide.imageUrl}
                    badge={slide.badge}
                    title={slide.title}
                    subtitle={slide.subtitle}
                  />
                </article>
              ))}
            </div>
          </div>

          {showIndicator ? (
            <div className="absolute bottom-[3px] left-1/2 z-20 flex w-[345px] max-w-full -translate-x-1/2 gap-[3px] px-[3px]">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`${index + 1}번 기획전 배너로 이동`}
                  aria-current={index === activeIndex}
                  className={`h-[2px] flex-1 border-0 p-0 ${index === activeIndex ? 'bg-white' : 'bg-white/50'}`}
                  onClick={() => scrollToSlide(index)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
