import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useAdminHomeMainConfig } from '../../hooks/useAdminHomeMainConfig'
import { useHorizontalMouseDragScroll } from '../../hooks/useHorizontalMouseDragScroll'
import { resolveHeroSlides } from '../../lib/homeMainContentResolver'
import { figmaAsset } from '../../lib/figmaAssetUrl'
import { CtaLink } from '../molecules/CtaLink'

const iconPause = figmaAsset('icons/pause.svg')
const iconPlay = figmaAsset('icons/play.svg')

const AUTOPLAY_MS = 5000
const LOOP_REPEAT = 3
/** Figma BigBanner slide gap (550 − 530) */
const HERO_SLIDE_GAP_LG_PX = 20

function getHeroSlideRadiusClass(slidePosition: number): string {
  if (slidePosition === 0) return 'lg:rounded-t-[30px]'
  if (slidePosition === 1) return 'lg:rounded-b-[30px]'
  if (slidePosition === 2) return 'lg:rounded-tr-[30px]'
  return ''
}

function getHeroSlideStep(el: HTMLDivElement | null): number {
  if (!el) return 376
  const art = el.querySelector('article')
  const w = art?.getBoundingClientRect().width ?? el.clientWidth
  const gap =
    typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches ? HERO_SLIDE_GAP_LG_PX : 0
  return Math.max(1, w) + gap
}

export function MainHeroSection() {
  const { mainBanners, updatedAt } = useAdminHomeMainConfig()
  const heroSlides = useMemo(() => resolveHeroSlides(mainBanners), [mainBanners, updatedAt])
  const slideCount = heroSlides.length
  const loopSlides = Array.from({ length: LOOP_REPEAT }, () => heroSlides).flat()
  const middleCycleStart = slideCount
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoplay, setIsAutoplay] = useState(true)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const virtualIndexRef = useRef(middleCycleStart)
  const scrollEndTimerRef = useRef<number | null>(null)
  const { isDraggingRef } = useHorizontalMouseDragScroll(scrollerRef)

  const goToVirtualIndex = (index: number, behavior: ScrollBehavior = 'smooth') => {
    const el = scrollerRef.current
    if (!el) return
    const step = getHeroSlideStep(el)
    el.scrollTo({
      left: step * index,
      behavior,
    })
  }

  const jumpWithoutAnimation = (targetIndex: number) => {
    const el = scrollerRef.current
    if (!el) return
    const prevBehavior = el.style.scrollBehavior
    el.style.scrollBehavior = 'auto'
    goToVirtualIndex(targetIndex, 'auto')
    el.style.scrollBehavior = prevBehavior
  }

  const normalizeIfEdge = () => {
    const current = virtualIndexRef.current
    if (current < slideCount) {
      const normalized = current + slideCount
      jumpWithoutAnimation(normalized)
      virtualIndexRef.current = normalized
      return
    }
    if (current >= slideCount * 2) {
      const normalized = current - slideCount
      jumpWithoutAnimation(normalized)
      virtualIndexRef.current = normalized
    }
  }

  const syncFromScroll = () => {
    const el = scrollerRef.current
    if (!el) return

    const step = getHeroSlideStep(el)
    const maxIndex = loopSlides.length - 1
    const nextVirtualIndex = Math.min(Math.max(Math.round(el.scrollLeft / step), 0), maxIndex)
    virtualIndexRef.current = nextVirtualIndex
    setActiveIndex(nextVirtualIndex % slideCount)

    if (scrollEndTimerRef.current != null) {
      window.clearTimeout(scrollEndTimerRef.current)
    }
    scrollEndTimerRef.current = window.setTimeout(normalizeIfEdge, 120)
  }

  useLayoutEffect(() => {
    virtualIndexRef.current = middleCycleStart
    const id = window.requestAnimationFrame(() => {
      jumpWithoutAnimation(middleCycleStart)
      setActiveIndex(0)
    })
    return () => window.cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideCount, middleCycleStart])

  useEffect(() => {
    if (!isAutoplay) return
    const id = window.setInterval(() => {
      if (isDraggingRef.current) return
      const next = virtualIndexRef.current + 1
      goToVirtualIndex(next)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [isAutoplay, isDraggingRef])

  useEffect(() => {
    return () => {
      if (scrollEndTimerRef.current != null) {
        window.clearTimeout(scrollEndTimerRef.current)
      }
    }
  }, [])

  return (
    <section
      key={updatedAt ?? 'home-main-default'}
      className="relative h-[540px] w-full overflow-hidden bg-white lg:flex lg:h-[747px] lg:flex-col"
      aria-roledescription="carousel"
    >
      <div
        ref={scrollerRef}
        onScroll={syncFromScroll}
        className="h-full w-full cursor-grab overflow-x-auto scroll-smooth snap-x snap-mandatory touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden active:cursor-grabbing lg:h-[663px] lg:shrink-0"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex h-full w-full lg:gap-5">
          {loopSlides.map((slide, index) => {
            const slidePosition = index % slideCount
            return (
            <article
              key={`${slide.id}-${index}`}
              className={`relative h-[540px] w-full shrink-0 snap-start overflow-hidden lg:h-[663px] lg:w-[530px] lg:max-w-[min(530px,100%)] ${getHeroSlideRadiusClass(slidePosition)}`}
            >
              <img src={slide.imageUrl} alt={slide.title} className="block h-full w-full object-cover" />
              <div
                className="absolute inset-0 rounded-none"
                style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)' }}
                aria-hidden
              />
              <div className="absolute bottom-10 left-5 right-5 text-center text-white lg:bottom-14 lg:left-8 lg:right-8">
                <h1 className="m-0 whitespace-pre-line text-[34px] font-extrabold leading-[1.2] tracking-[-0.02em] lg:text-h3">{slide.title}</h1>
                <p className="mb-3 mt-2 text-bodySmall lg:text-bodyRegular1">{slide.subtitle}</p>
                <CtaLink label={slide.ctaLabel} href={slide.ctaHref} />
              </div>
            </article>
            )
          })}
        </div>
      </div>
      <div
        className="absolute bottom-1 left-1 right-1 flex gap-[2px] lg:hidden"
        role="tablist"
        aria-label="Main banner slides"
      >
        {heroSlides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            className={`h-[2px] flex-1 border-0 p-0 lg:min-w-0 ${index === activeIndex ? 'bg-white' : 'bg-white/45'}`}
            onClick={() => goToVirtualIndex(middleCycleStart + index)}
          />
        ))}
      </div>

      {/* Figma 2601:22661 Control-Bar — PC only; colors Dark #1A1A1A / Light Gray #E6E6E6 */}
      <div className="hidden shrink-0 items-center justify-center bg-white px-6 py-0 lg:flex lg:h-[84px]">
        <div className="flex w-full max-w-[715px] items-center gap-4">
          <div className="h-0.5 min-w-0 flex-1 bg-lightGray" aria-hidden>
            <div
              className="h-full bg-dark transition-[width] duration-300 ease-out"
              style={{ width: `${((activeIndex + 1) / slideCount) * 100}%` }}
            />
          </div>
          <span className="shrink-0 tabular-nums text-bodySmall text-dark">
            {`${String(activeIndex + 1).padStart(2, '0')}/${String(slideCount).padStart(2, '0')}`}
          </span>
          <button
            type="button"
            className="flex size-[42px] shrink-0 items-center justify-center border-0 bg-transparent p-0"
            onClick={() => setIsAutoplay((prev) => !prev)}
            aria-label={isAutoplay ? '메인 배너 자동재생 일시정지' : '메인 배너 자동재생 시작'}
          >
            <img
              src={isAutoplay ? iconPause : iconPlay}
              alt=""
              className="block h-[10px] w-auto max-w-[9px] object-contain"
              draggable={false}
            />
          </button>
        </div>
      </div>
    </section>
  )
}
