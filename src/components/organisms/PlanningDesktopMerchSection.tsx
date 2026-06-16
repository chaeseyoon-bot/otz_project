import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PLANNING_BANNER_DIM_OVERLAY } from '../molecules/PlanningBannerMobileSlide'
import { useAdminHomeMainConfig } from '../../hooks/useAdminHomeMainConfig'
import { useHorizontalMouseDragScroll } from '../../hooks/useHorizontalMouseDragScroll'
import { usePlanningCollectionsContent } from '../../hooks/usePlanningCollectionsContent'
import { resolvePlanningBanners } from '../../lib/homeMainContentResolver'
import { getProductHeartIconDataUri } from '../../lib/productHeartIcon'
import { HomeProductDetailLink } from '../molecules/HomeProductDetailLink'

/** Link row chevron — 6×12px. */
function CollectionLinkChevron({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={6}
      height={12}
      viewBox="0 0 6 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M1.25 2.75L4.25 6L1.25 9.25"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/** Figma 2601:23298 / 2601:23300 — pager chevrons, 6×12 graphic, 2px stroke. */
function PagerChevron({ direction, className }: { direction: 'left' | 'right'; className?: string }) {
  const d = direction === 'left' ? 'M4.5 3L1.75 6L4.5 9' : 'M1.5 3L4.25 6L1.5 9'
  return (
    <svg
      className={className}
      width={6}
      height={12}
      viewBox="0 0 6 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d={d}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/** Figma 2601:23237 — PC: planning banner + collection rail merged */
export function PlanningDesktopMerchSection() {
  const { planningBanners, updatedAt } = useAdminHomeMainConfig()
  const { collections } = usePlanningCollectionsContent()
  const planningSlides = useMemo(
    () => resolvePlanningBanners(planningBanners),
    [planningBanners, updatedAt],
  )
  const planningScrollerRef = useRef<HTMLDivElement>(null)
  const [planningActiveIndex, setPlanningActiveIndex] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [likedByCollection, setLikedByCollection] = useState<Record<string, boolean[]>>({})

  const syncPlanningIndexFromScroll = useCallback(() => {
    const el = planningScrollerRef.current
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

    setPlanningActiveIndex(nearestIndex)
  }, [])

  const snapPlanningToNearestSlide = useCallback(() => {
    const el = planningScrollerRef.current
    if (!el) return

    const slideWidth = el.clientWidth
    if (slideWidth <= 0) return

    const maxScrollLeft = slideWidth * Math.max(0, planningSlides.length - 1)
    const slideIndex = Math.round(el.scrollLeft / slideWidth)
    const targetLeft = Math.min(maxScrollLeft, Math.max(0, slideIndex * slideWidth))

    if (Math.abs(el.scrollLeft - targetLeft) < 1) {
      syncPlanningIndexFromScroll()
      return
    }

    el.scrollTo({ left: targetLeft, behavior: 'smooth' })
  }, [planningSlides.length, syncPlanningIndexFromScroll])

  const scrollToPlanningSlide = useCallback((index: number) => {
    const el = planningScrollerRef.current
    if (!el) return

    const targetSlide = el.querySelector<HTMLElement>(`[data-planning-slide-index="${index}"]`)
    if (!targetSlide) return

    el.scrollTo({
      left: targetSlide.offsetLeft,
      behavior: 'smooth',
    })
  }, [])

  useHorizontalMouseDragScroll(planningScrollerRef, {
    enabled: planningSlides.length >= 2,
    onDragEnd: snapPlanningToNearestSlide,
  })

  useEffect(() => {
    setLikedByCollection((prev) => {
      const next: Record<string, boolean[]> = {}
      for (const collection of collections) {
        next[collection.id] = prev[collection.id] ?? collection.products.map(() => false)
      }
      return next
    })
    setActiveIndex((prev) => Math.min(prev, Math.max(0, collections.length - 1)))
  }, [collections])

  const total = collections.length
  const card = collections[activeIndex]
  const isFirst = activeIndex <= 0
  const isLast = activeIndex >= total - 1
  const safePlanningIndex = Math.min(planningActiveIndex, Math.max(0, planningSlides.length - 1))
  const showPlanningIndicator = planningSlides.length >= 2

  const goPrev = () => setActiveIndex((i) => Math.max(0, i - 1))
  const goNext = () => setActiveIndex((i) => Math.min(total - 1, i + 1))

  const toggleLike = (collectionId: string, productIndex: number) => {
    setLikedByCollection((prev) => ({
      ...prev,
      [collectionId]: prev[collectionId]!.map((liked, i) => (i === productIndex ? !liked : liked)),
    }))
  }

  if (!planningSlides.length || !card) return null

  const collectionLikes = likedByCollection[card.id] ?? card.products.map(() => false)

  return (
    <section className="hidden lg:mx-auto lg:block lg:max-w-[1400px] lg:py-[64px]">
      <div className="flex items-stretch gap-5">
        {/* CONTENTS01 — 420×524 */}
        <div className="relative h-[524px] w-[420px] shrink-0">
          <div
            ref={planningScrollerRef}
            onScroll={syncPlanningIndexFromScroll}
            className={`h-full w-full overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory ${
              showPlanningIndicator ? 'cursor-grab active:cursor-grabbing' : ''
            }`}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex h-full w-max">
              {planningSlides.map((slide, index) => (
                <article
                  key={slide.id}
                  data-planning-slide-index={index}
                  className="relative h-[524px] w-[420px] shrink-0 snap-start overflow-hidden"
                >
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 mix-blend-darken"
                    style={{ backgroundImage: PLANNING_BANNER_DIM_OVERLAY }}
                    aria-hidden
                  />
                  <div className="absolute inset-x-[30px] bottom-10 flex flex-col items-center gap-4 text-center text-white">
                    <span className="rounded-[5px] bg-black px-[18px] py-[6px] text-[15px] font-bold leading-[1.4] tracking-[-0.02em]">
                      {slide.badge}
                    </span>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="m-0 text-[24px] font-bold leading-[1.2] tracking-[-0.02em]">{slide.title}</h3>
                      <p className="m-0 text-[14px] font-normal leading-[1.4] tracking-[-0.02em]">{slide.subtitle}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {showPlanningIndicator ? (
            <div className="pointer-events-none absolute bottom-0 left-1/2 z-20 flex w-full max-w-[420px] -translate-x-1/2 gap-[3px] p-[3px]">
              {planningSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`${index + 1}번 기획전 배너로 이동`}
                  aria-current={index === safePlanningIndex}
                  className={`pointer-events-auto h-[2px] flex-1 border-0 p-0 ${index === safePlanningIndex ? 'bg-white' : 'bg-white/50'}`}
                  onClick={() => scrollToPlanningSlide(index)}
                />
              ))}
            </div>
          ) : null}
        </div>

        {/* Figma 2601:23257 CONTENTS02 — h matches left 524; inner row 419; justify-between → Control-Bar */}
        <div className="flex h-[524px] min-h-0 min-w-0 flex-1 flex-col justify-between rounded-[20px] bg-light px-[30px] pb-0 pt-[30px]">
          <div className="flex h-[419px] w-full shrink-0 items-center justify-between gap-0 overflow-visible">
            <div className="relative w-[335px] shrink-0 self-start overflow-hidden">
              <div className="relative aspect-[320/400] w-full overflow-hidden">
                <img src={card.bannerImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[47.5%] to-black/25 to-[83%]" aria-hidden />
                <div className="absolute left-0 top-0 h-fit w-fit bg-black px-[10px] py-2 leading-normal">
                  <span className="h-fit w-fit text-[10px] font-semibold leading-[1.1] text-white">{card.tagLabel}</span>
                </div>
              </div>
            </div>

            <div className="flex h-[419px] min-w-0 flex-1 flex-col justify-between">
              <div className="shrink-0 pl-5 pt-2.5">
                <div className="flex flex-col gap-2.5">
                  <h3 className="m-0 whitespace-pre-line text-h3 text-black">{card.title}</h3>
                  <a
                    href={card.linkHref || '#'}
                    className="inline-flex items-center gap-1.5 text-link2 leading-none text-textDefault underline decoration-solid underline-offset-2 hover:text-dark"
                  >
                    <span className="shrink-0">{card.linkLabel}</span>
                    <span className="flex h-3 w-1.5 shrink-0 items-center justify-center" aria-hidden>
                      <CollectionLinkChevron className="block h-3 w-1.5 shrink-0" />
                    </span>
                  </a>
                </div>
              </div>

              <div className="grid w-full shrink-0 grid-cols-4 gap-1 pl-5">
                {card.products.map((product, index) => {
                  const liked = collectionLikes[index] ?? false
                  return (
                    <HomeProductDetailLink
                      key={`${card.id}-${product.productId ?? index}`}
                      productId={product.productId}
                      className="flex min-w-0 flex-col self-stretch"
                    >
                      <article className="flex min-w-0 flex-col self-stretch">
                        {/* Same tile as ForYouSection (PC) — Figma 2601:22727 */}
                        <div className="relative w-full shrink-0 overflow-hidden">
                          <div className="relative flex w-full shrink-0 items-center gap-[10px] bg-light aspect-[4/5]">
                            <div className="relative aspect-square min-h-0 min-w-0 flex-1 mix-blend-multiply">
                              <img
                                src={product.image}
                                alt={`${product.name} 누끼컷`}
                                className="pointer-events-none absolute inset-0 size-full max-w-none object-cover"
                                draggable={false}
                              />
                            </div>
                          </div>
                          <div className="absolute right-0 top-0 z-10 flex flex-col items-end p-[6px]">
                            <button
                              type="button"
                              aria-label={liked ? '찜 해제' : '찜하기'}
                              onClick={(event) => {
                                event.stopPropagation()
                                toggleLike(card.id, index)
                              }}
                            >
                              <span
                                className="block h-4 w-[17px] bg-contain bg-center bg-no-repeat"
                                style={{ backgroundImage: getProductHeartIconDataUri(liked) }}
                              />
                            </button>
                          </div>
                        </div>
                        <p className="truncate pt-3 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault">
                          {product.name}
                        </p>
                        <div className="flex items-center pt-1">
                          <span className="text-[15px] font-bold text-primary">{product.discount}</span>
                          <span className="pl-[6px] text-[15px] font-bold text-black">{product.price}</span>
                        </div>
                      </article>
                    </HomeProductDetailLink>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Figma 2601:23293 Control-Bar */}
          <div className="flex w-full shrink-0 items-center justify-center pb-[30px]">
            <div className="flex h-5 shrink-0 items-center justify-center gap-[30px]">
              <button
                type="button"
                disabled={isFirst}
                aria-label="이전 기획전"
                onClick={goPrev}
                className="flex h-5 w-3 shrink-0 items-center justify-center border-0 bg-transparent p-0 text-black disabled:cursor-default disabled:opacity-40"
              >
                <PagerChevron direction="left" className="block h-[12px] w-[6px] shrink-0" />
              </button>
              <span className="shrink-0 whitespace-nowrap text-center text-[14px] font-bold leading-[1.4] tracking-[-0.28px] text-black tabular-nums">
                {activeIndex + 1} / {total}
              </span>
              <button
                type="button"
                disabled={isLast}
                aria-label="다음 기획전"
                onClick={goNext}
                className="flex h-5 w-3 shrink-0 items-center justify-center border-0 bg-transparent p-0 text-black disabled:cursor-default disabled:opacity-40"
              >
                <PagerChevron direction="right" className="block h-[12px] w-[6px] shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
