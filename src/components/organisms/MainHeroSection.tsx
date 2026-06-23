import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useAdminHomeMainConfig } from '../../hooks/useAdminHomeMainConfig'
import { resolveHeroSlides } from '../../lib/homeMainContentResolver'
import { figmaAsset } from '../../lib/figmaAssetUrl'
import { CtaLink } from '../molecules/CtaLink'

const iconPause = figmaAsset('icons/pause.svg')
const iconPlay = figmaAsset('icons/play.svg')

const AUTOPLAY_MS = 5000
const LOOP_REPEAT = 3
const SWIPE_COMMIT_PX = 48
const AXIS_LOCK_THRESHOLD_PX = 10
/** Figma BigBanner slide gap (550 − 530) */
const HERO_SLIDE_GAP_LG_PX = 20
const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)'

/** Figma 2601:22615 — 1st/3rd/… banners: top 30px; 2nd/4th/…: bottom 30px. */
function getHeroSlideRadiusClass(slidePosition: number): string {
  return slidePosition % 2 === 0 ? 'lg:rounded-t-[30px]' : 'lg:rounded-b-[30px]'
}

function measureSlideStep(viewport: HTMLDivElement | null): number {
  if (!viewport) return 376
  const art = viewport.querySelector('article')
  const w = art?.getBoundingClientRect().width ?? viewport.clientWidth
  const gap =
    typeof window !== 'undefined' && window.matchMedia(DESKTOP_MEDIA_QUERY).matches ? HERO_SLIDE_GAP_LG_PX : 0
  return Math.max(1, w) + gap
}

export function MainHeroSection() {
  const { mainBanners, updatedAt } = useAdminHomeMainConfig()
  const heroSlides = useMemo(() => resolveHeroSlides(mainBanners), [mainBanners, updatedAt])
  const slideCount = heroSlides.length
  const loopSlides = Array.from({ length: LOOP_REPEAT }, () => heroSlides).flat()
  const middleCycleStart = slideCount
  const [virtualIndex, setVirtualIndex] = useState(middleCycleStart)
  const [activeIndex, setActiveIndex] = useState(0)
  const [slideStep, setSlideStep] = useState(376)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [transitionEnabled, setTransitionEnabled] = useState(true)
  const [isAutoplay, setIsAutoplay] = useState(true)
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_MEDIA_QUERY).matches,
  )
  const viewportRef = useRef<HTMLDivElement>(null)
  const virtualIndexRef = useRef(middleCycleStart)
  const isDraggingRef = useRef(false)
  const dragStartXRef = useRef<number | null>(null)
  const dragStartVirtualIndexRef = useRef(middleCycleStart)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const axisLockRef = useRef<'x' | 'y' | null>(null)

  const goToVirtualIndex = useCallback((index: number) => {
    const maxIndex = loopSlides.length - 1
    setVirtualIndex(Math.min(Math.max(index, 0), maxIndex))
    setDragOffset(0)
    setIsDragging(false)
    isDraggingRef.current = false
  }, [loopSlides.length])

  const jumpWithoutAnimation = useCallback((targetIndex: number) => {
    setTransitionEnabled(false)
    setVirtualIndex(targetIndex)
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setTransitionEnabled(true))
    })
  }, [])

  const normalizeIfEdge = useCallback(
    (index: number) => {
      if (index < slideCount) {
        jumpWithoutAnimation(index + slideCount)
      } else if (index >= slideCount * 2) {
        jumpWithoutAnimation(index - slideCount)
      }
    },
    [jumpWithoutAnimation, slideCount],
  )

  const finishDrag = useCallback(
    (clientX: number) => {
      if (dragStartXRef.current == null) return

      const dx = clientX - dragStartXRef.current
      dragStartXRef.current = null
      pointerStartRef.current = null
      axisLockRef.current = null
      setIsDragging(false)
      isDraggingRef.current = false

      const threshold = slideStep > 0 ? Math.min(SWIPE_COMMIT_PX, slideStep * 0.2) : SWIPE_COMMIT_PX
      let next = dragStartVirtualIndexRef.current
      if (dx < -threshold) next += 1
      else if (dx > threshold) next -= 1
      goToVirtualIndex(next)
    },
    [goToVirtualIndex, slideStep],
  )

  useLayoutEffect(() => {
    setVirtualIndex(middleCycleStart)
    virtualIndexRef.current = middleCycleStart
    setActiveIndex(0)
    dragStartVirtualIndexRef.current = middleCycleStart
  }, [slideCount, middleCycleStart])

  useEffect(() => {
    virtualIndexRef.current = virtualIndex
    setActiveIndex(virtualIndex % slideCount)
  }, [virtualIndex, slideCount])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const updateSlideStep = () => setSlideStep(measureSlideStep(viewport))
    updateSlideStep()

    const resizeObserver = new ResizeObserver(updateSlideStep)
    resizeObserver.observe(viewport)

    const desktopQuery = window.matchMedia(DESKTOP_MEDIA_QUERY)
    const onDesktopChange = () => {
      setIsDesktop(desktopQuery.matches)
      updateSlideStep()
    }
    desktopQuery.addEventListener('change', onDesktopChange)

    return () => {
      resizeObserver.disconnect()
      desktopQuery.removeEventListener('change', onDesktopChange)
    }
  }, [slideCount])

  useEffect(() => {
    if (!isAutoplay) return
    const id = window.setInterval(() => {
      if (isDraggingRef.current) return
      setVirtualIndex((prev) => prev + 1)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [isAutoplay])

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return

    pointerStartRef.current = { x: event.clientX, y: event.clientY }
    axisLockRef.current = null
    dragStartXRef.current = event.clientX
    dragStartVirtualIndexRef.current = virtualIndex
    setIsDragging(true)
    setDragOffset(0)
    isDraggingRef.current = true
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartXRef.current == null || pointerStartRef.current == null) return

    const dx = event.clientX - pointerStartRef.current.x
    const dy = event.clientY - pointerStartRef.current.y

    if (!isDesktop && axisLockRef.current == null) {
      if (Math.abs(dx) < AXIS_LOCK_THRESHOLD_PX && Math.abs(dy) < AXIS_LOCK_THRESHOLD_PX) return

      axisLockRef.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      if (axisLockRef.current === 'y') {
        dragStartXRef.current = null
        pointerStartRef.current = null
        setIsDragging(false)
        setDragOffset(0)
        isDraggingRef.current = false
        return
      }
    }

    if (isDesktop || axisLockRef.current === 'x') {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.setPointerCapture(event.pointerId)
      }
      setDragOffset(event.clientX - dragStartXRef.current)
    }
  }

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    finishDrag(event.clientX)
  }

  const trackTransform = `translate3d(calc(-${virtualIndex * slideStep}px + ${dragOffset}px), 0, 0)`

  return (
    <section
      key={updatedAt ?? 'home-main-default'}
      className="relative h-[540px] w-full overflow-hidden bg-white lg:flex lg:h-[747px] lg:flex-col"
      aria-roledescription="carousel"
    >
      <div
        ref={viewportRef}
        className={`h-full w-full touch-pan-y overflow-hidden lg:h-[663px] lg:shrink-0 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div
          className={`flex h-full w-full lg:gap-5 ${
            transitionEnabled && !isDragging
              ? 'transition-transform duration-300 ease-out motion-reduce:transition-none'
              : ''
          }`}
          style={{ transform: trackTransform }}
          onTransitionEnd={() => normalizeIfEdge(virtualIndexRef.current)}
        >
          {loopSlides.map((slide, index) => {
            const slidePosition = index % slideCount
            return (
              <article
                key={`${slide.id}-${index}`}
                className={`relative h-[540px] w-full shrink-0 overflow-hidden lg:h-[663px] lg:w-[530px] lg:max-w-[min(530px,100%)] ${getHeroSlideRadiusClass(slidePosition)}`}
              >
                <img src={slide.imageUrl} alt={slide.title} className="block h-full w-full object-cover" draggable={false} />
                <div
                  className="pointer-events-none absolute inset-0 rounded-none"
                  style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)' }}
                  aria-hidden
                />
                <div className="pointer-events-none absolute bottom-10 left-5 right-5 text-center text-white lg:pointer-events-auto lg:bottom-14 lg:left-8 lg:right-8">
                  <h1 className="m-0 whitespace-pre-line text-[28px] font-extrabold leading-[1.2] tracking-[-0.02em] lg:text-h3">
                    {slide.title}
                  </h1>
                  <p className="mb-3 mt-2 text-bodySmall lg:text-bodyRegular1">{slide.subtitle}</p>
                  <span className="pointer-events-auto inline-block">
                    <CtaLink label={slide.ctaLabel} href={slide.ctaHref} />
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      </div>
      <div
        className="pointer-events-auto absolute bottom-1 left-1 right-1 flex gap-[2px] lg:hidden"
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
