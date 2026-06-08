import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { tokens } from '../../design-system/tokens'
import { useHorizontalMouseDragScroll } from '../../hooks/useHorizontalMouseDragScroll'
import { useProducts } from '../../hooks/useProducts'
import { getProductDetailPath } from '../../lib/productRoutes'
import { navigateSpa } from '../../lib/spaNavigation'
import { ProductCardUnit, type ProductCardItem } from '../molecules/ProductCardUnit'

/** MO FOR U — black gutter beside the panel at scroll rest (Figma). */
const FOR_U_GUTTER_PX = 15

/** PC FOR U — Figma 2601:22727 row; pager when count exceeds this. */
const FOR_U_PC_PAGE_SIZE = 5

/** PC track — Figma 2601:22727 product tile width. */
const FOR_U_PC_TILE_WIDTH_PX = 210
const FOR_U_PC_TRACK_PAD_MAX_PX = 40
const FOR_U_PC_TRACK_PAD_MIN_PX = 24
const FOR_U_PC_GAP_MIN_PX = 16

function measureForYouPcPad(viewportWidth: number): number {
  return Math.round(
    Math.min(
      FOR_U_PC_TRACK_PAD_MAX_PX,
      Math.max(FOR_U_PC_TRACK_PAD_MIN_PX, viewportWidth * 0.03),
    ),
  )
}

/** Distribute clip width across 5 tiles + 4 gaps (tile width never exceeds Figma 210px). */
function measureForYouPcRow(clipWidth: number): { gap: number; tileWidth: number } {
  const gaps = FOR_U_PC_PAGE_SIZE - 1
  if (clipWidth <= 0) {
    return { gap: FOR_U_PC_GAP_MIN_PX, tileWidth: FOR_U_PC_TILE_WIDTH_PX }
  }

  let tileWidth = Math.min(
    FOR_U_PC_TILE_WIDTH_PX,
    Math.floor((clipWidth - FOR_U_PC_GAP_MIN_PX * gaps) / FOR_U_PC_PAGE_SIZE),
  )
  tileWidth = Math.max(120, tileWidth)
  let gap = Math.floor((clipWidth - tileWidth * FOR_U_PC_PAGE_SIZE) / gaps)
  gap = Math.max(FOR_U_PC_GAP_MIN_PX, gap)
  tileWidth = Math.floor((clipWidth - gap * gaps) / FOR_U_PC_PAGE_SIZE)
  return { gap, tileWidth }
}

/** Figma 2601:23298 — pager chevrons (6×13, 2px stroke). */
function ForYouPagerChevron({ direction, className }: { direction: 'left' | 'right'; className?: string }) {
  const d = direction === 'left' ? 'M4.5 3L1.75 6L4.5 9' : 'M1.5 3L4.25 6L1.5 9'
  return (
    <svg
      className={className}
      width={6}
      height={13}
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

interface ForYouPagerArrowProps {
  direction: 'left' | 'right'
  disabled: boolean
  onClick: () => void
}

/** Figma FOR U PC — side pager on the product panel. */
function ForYouPagerArrow({ direction, disabled, onClick }: ForYouPagerArrowProps) {
  const isLeft = direction === 'left'
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={isLeft ? '이전 상품 목록' : '다음 상품 목록'}
      onClick={onClick}
      className={`absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-[8px] border-0 p-0 text-white transition-opacity disabled:cursor-default disabled:opacity-40 ${
        isLeft ? 'left-6 bg-black/25 hover:enabled:bg-black/35' : 'right-6 bg-black/55 hover:enabled:bg-black/65'
      }`}
    >
      <ForYouPagerChevron direction={direction} className="block h-[13px] w-1.5 shrink-0" />
    </button>
  )
}

function ForYouProductTile({
  product,
  liked,
  onToggleLike,
  className,
  style,
}: {
  product: ProductCardItem
  liked: boolean
  onToggleLike: () => void
  className?: string
  style?: CSSProperties
}) {
  return (
    <div
      className={`flex shrink-0 cursor-pointer ${className ?? ''}`}
      style={style}
      role="link"
      tabIndex={0}
      onClick={() => navigateSpa(getProductDetailPath(product.id))}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          navigateSpa(getProductDetailPath(product.id))
        }
      }}
    >
      <ProductCardUnit
        product={product}
        liked={liked}
        onToggleLike={onToggleLike}
        articleClassName="flex w-full min-w-0 flex-col self-stretch"
        titleClassName="w-full min-w-0 truncate pt-3 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault"
      />
    </div>
  )
}

export function ForYouSection() {
  const { products, isLoading, error } = useProducts({ flag: 'is_foru' })
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set())
  const mobileScrollerRef = useRef<HTMLDivElement>(null)
  const pcTrackViewportRef = useRef<HTMLDivElement>(null)
  const pcClipRef = useRef<HTMLDivElement>(null)
  const [panelFlushLeft, setPanelFlushLeft] = useState(false)
  const [panelFlushRight, setPanelFlushRight] = useState(true)
  const [pcPage, setPcPage] = useState(0)
  const [pcTrackPadX, setPcTrackPadX] = useState(FOR_U_PC_TRACK_PAD_MAX_PX)
  const [pcClipWidthPx, setPcClipWidthPx] = useState(0)
  const [pcTrackGap, setPcTrackGap] = useState(FOR_U_PC_GAP_MIN_PX)
  const [pcTileWidth, setPcTileWidth] = useState(FOR_U_PC_TILE_WIDTH_PX)
  useHorizontalMouseDragScroll(mobileScrollerRef)

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  useEffect(() => {
    const el = mobileScrollerRef.current
    if (!el) return

    const syncPanelEdges = () => {
      const maxScroll = el.scrollWidth - el.clientWidth
      const threshold = FOR_U_GUTTER_PX * 0.35
      setPanelFlushLeft(el.scrollLeft > threshold)
      setPanelFlushRight(maxScroll <= 0 || el.scrollLeft < maxScroll - threshold)
    }

    syncPanelEdges()
    el.addEventListener('scroll', syncPanelEdges, { passive: true })
    const observer = new ResizeObserver(syncPanelEdges)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', syncPanelEdges)
      observer.disconnect()
    }
  }, [products.length])

  const forYouProducts = products.map((product) => ({
    ...product,
    multiCutSlides: undefined,
    multiCutSlidesDesktop: undefined,
    originalPrice: undefined,
  }))

  const pcPageCount = Math.max(1, Math.ceil(forYouProducts.length / FOR_U_PC_PAGE_SIZE))
  const showPcPager = forYouProducts.length > FOR_U_PC_PAGE_SIZE
  const pcPageClamped = Math.min(pcPage, pcPageCount - 1)

  const pcPages = useMemo(() => {
    const pages: (typeof forYouProducts)[] = []
    for (let i = 0; i < forYouProducts.length; i += FOR_U_PC_PAGE_SIZE) {
      pages.push(forYouProducts.slice(i, i + FOR_U_PC_PAGE_SIZE))
    }
    return pages
  }, [forYouProducts])

  useEffect(() => {
    setPcPage(0)
  }, [forYouProducts.length])

  useEffect(() => {
    setPcPage((page) => Math.min(page, pcPageCount - 1))
  }, [pcPageCount])

  const goPcPrev = useCallback(() => {
    setPcPage((page) => Math.max(0, page - 1))
  }, [])

  const goPcNext = useCallback(() => {
    setPcPage((page) => Math.min(pcPageCount - 1, page + 1))
  }, [pcPageCount])

  useLayoutEffect(() => {
    const viewport = pcTrackViewportRef.current
    const clipEl = pcClipRef.current
    if (!viewport || !clipEl) return

    const syncTrack = () => {
      const viewportWidth = viewport.clientWidth
      const padX = measureForYouPcPad(viewportWidth)
      const clipWidth = clipEl.clientWidth
      const { gap, tileWidth } = measureForYouPcRow(clipWidth)
      setPcTrackPadX(padX)
      setPcClipWidthPx(clipWidth)
      setPcTrackGap(gap)
      setPcTileWidth(tileWidth)
    }

    syncTrack()
    const observer = new ResizeObserver(syncTrack)
    observer.observe(viewport)
    observer.observe(clipEl)
    return () => observer.disconnect()
  }, [forYouProducts.length, showPcPager])

  if (!isLoading && !error && products.length === 0) {
    return null
  }

  const panelRadiusClass = [
    !panelFlushLeft ? 'rounded-l-[20px]' : '',
    !panelFlushRight ? 'rounded-r-[20px]' : '',
    panelFlushLeft && panelFlushRight ? 'rounded-none' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      className="w-full max-w-full overflow-x-hidden py-10 pr-0 lg:pr-0"
      style={{ backgroundColor: tokens.color.black }}
    >
      <div className="w-full min-w-0 max-w-full lg:mx-auto lg:max-w-[1400px] lg:px-0">
        <h2 className="pl-[15px] pr-[15px] text-[24px] font-extrabold text-white lg:px-0 lg:text-[34px] lg:leading-[1.2] lg:tracking-[-0.02em]">
          FOR U
        </h2>

        {/* MO — horizontal swipe with black gutters at rest */}
        <div
          ref={mobileScrollerRef}
          className="mt-[10px] w-full min-w-0 max-w-full cursor-grab overflow-x-auto overscroll-x-contain scroll-smooth touch-pan-x snap-x snap-proximity [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden active:cursor-grabbing lg:hidden"
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div className="flex w-max shrink-0 items-stretch">
            <div className="w-[15px] shrink-0 snap-start snap-always bg-black" aria-hidden />
            <div
              className={`flex w-max shrink-0 snap-x snap-mandatory items-start justify-start gap-[10px] px-4 py-4 ${panelRadiusClass}`}
              style={{
                backgroundColor: tokens.color.surfaceSubtle,
                color: 'rgba(26, 26, 26, 1)',
              }}
            >
              {forYouProducts.map((product) => (
                <ForYouProductTile
                  key={product.id}
                  product={product}
                  liked={likedIds.has(product.id)}
                  onToggleLike={() => toggleLike(product.id)}
                  className="w-32 snap-start self-stretch"
                />
              ))}
            </div>
            <div className="w-[15px] shrink-0 snap-end snap-always bg-black" aria-hidden />
          </div>
        </div>

        {/* PC — Figma 2601:22727; 5 tiles per page + side arrows when > 5 */}
        <div className="relative mt-6 hidden lg:block">
          <div
            className="relative overflow-hidden rounded-[20px] px-6 py-4"
            style={{
              backgroundColor: tokens.color.surfaceSubtle,
              color: 'rgba(26, 26, 26, 1)',
            }}
          >
            {showPcPager ? (
              <>
                <ForYouPagerArrow
                  direction="left"
                  disabled={pcPageClamped === 0}
                  onClick={goPcPrev}
                />
                <ForYouPagerArrow
                  direction="right"
                  disabled={pcPageClamped >= pcPageCount - 1}
                  onClick={goPcNext}
                />
              </>
            ) : null}
            <div ref={pcTrackViewportRef} className="w-full min-w-0 overflow-hidden">
              <div
                className="w-full min-w-0 overflow-hidden"
                style={
                  showPcPager
                    ? {
                        paddingLeft: pcTrackPadX,
                        paddingRight: pcTrackPadX,
                      }
                    : undefined
                }
              >
                <div ref={pcClipRef} className="w-full min-w-0 overflow-hidden">
                  {showPcPager ? (
                    <div
                      className="flex items-start transition-transform duration-300 ease-out motion-reduce:transition-none"
                      style={{
                        width:
                          pcClipWidthPx > 0 ? pcClipWidthPx * pcPageCount : `${pcPageCount * 100}%`,
                        transform:
                          pcClipWidthPx > 0
                            ? `translate3d(-${pcPageClamped * pcClipWidthPx}px, 0, 0)`
                            : undefined,
                      }}
                    >
                      {pcPages.map((pageProducts, pageIndex) => (
                        <div
                          key={pageIndex}
                          className="flex shrink-0 items-start overflow-hidden"
                          style={{
                            width: pcClipWidthPx > 0 ? pcClipWidthPx : '100%',
                            maxWidth: pcClipWidthPx > 0 ? pcClipWidthPx : '100%',
                            gap: pcTrackGap,
                          }}
                        >
                          {pageProducts.slice(0, FOR_U_PC_PAGE_SIZE).map((product) => (
                            <ForYouProductTile
                              key={product.id}
                              product={product}
                              liked={likedIds.has(product.id)}
                              onToggleLike={() => toggleLike(product.id)}
                              className="min-w-0 max-w-full overflow-hidden"
                              style={{
                                width: pcTileWidth,
                                maxWidth: pcTileWidth,
                                flex: `0 0 ${pcTileWidth}px`,
                              }}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="mx-auto flex min-w-0 items-start justify-center overflow-hidden"
                      style={{
                        width: pcClipWidthPx > 0 ? pcClipWidthPx : '100%',
                        maxWidth: '100%',
                        gap: pcTrackGap,
                      }}
                    >
                      {forYouProducts.slice(0, FOR_U_PC_PAGE_SIZE).map((product) => (
                        <ForYouProductTile
                          key={product.id}
                          product={product}
                          liked={likedIds.has(product.id)}
                          onToggleLike={() => toggleLike(product.id)}
                          className="min-w-0 max-w-full overflow-hidden"
                          style={{
                            width: pcTileWidth,
                            maxWidth: pcTileWidth,
                            flex: `0 0 ${pcTileWidth}px`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
