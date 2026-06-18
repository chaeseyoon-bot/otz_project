import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getProductHeartIconDataUri } from '../../lib/productHeartIcon'
import { figmaAsset } from '../../lib/figmaAssetUrl'
import { AdaptiveProductImage } from './AdaptiveProductImage'

const iconListPlus = figmaAsset('icons/list_plus.svg')

/** Figma 2718:38950 — default shoe sizes for PLP quick select (aligned with PDP). */
export const DEFAULT_PRODUCT_SIZES = [
  '220',
  '225',
  '230',
  '235',
  '240',
  '245',
  '250',
  '260',
] as const

export interface ProductBadge {
  id: string
  label: string
}

/** 한 슬라이드 = 카드 전체 너비에 이미지 한 장만(스와이프로 다음 컷). */
export interface ProductMultiCutSlide {
  image: string
  /** Square: width-wise contain + multiply. Editorial: 02 컷; same 4∶5 frame as square slide. */
  variant: 'square' | 'editorial'
}

export interface ProductCardItem {
  id: string
  title: string
  discountRate: string
  price: string
  /** Strikethrough reference price (category PLP). */
  originalPrice?: string
  image: string
  badges?: ProductBadge[]
  /** NEW PLP: full-width slides; swipe between cuts (e.g. square then editorial). */
  multiCutSlides?: ProductMultiCutSlide[]
  /** PC PLP: optional slide order when desktop differs from mobile (e.g. square-first on PC). */
  multiCutSlidesDesktop?: ProductMultiCutSlide[]
  /** Sizes unavailable for purchase (PLP quick select overlay). */
  soldOutSizes?: readonly string[]
  /** PDP / PLP selectable sizes — shoes: 220~260, bag/acc: FREE. */
  sizeOptions?: readonly string[]
}

interface ProductCardUnitProps {
  product: ProductCardItem
  liked: boolean
  onToggleLike: () => void
  articleClassName?: string
  titleClassName?: string
  /** Override inner image wrapper (default: square crop). Use e.g. `aspect-square lg:aspect-[1200/1500]` for desktop PLP. Ignored when `product.multiCutSlides` is set. */
  mediaInnerClassName?: string
  /** PLP (NEW / BEST / category): bottom-right plus toggles size overlay on thumbnail. */
  showSizeQuickSelect?: boolean
  /** Size labels for quick select; defaults to shoe sizes from Figma. */
  sizeOptions?: readonly string[]
  /** Sizes shown at 50% opacity with strikethrough in quick select overlay. */
  soldOutSizes?: readonly string[]
  /** BEST PLP — Figma 2705:29783: black rank badge on thumbnail (1-based). */
  rank?: number
  /** Hide multi-cut dot indicators on thumbnail (e.g. editorial product sections). */
  hideMultiCutDots?: boolean
  /** Override price row wrapper below title. */
  priceRowClassName?: string
  /** Override discount rate text styling in the price row. */
  priceDiscountClassName?: string
  /** Override sale price text styling in the price row. */
  priceSaleClassName?: string
  /** Override original price text styling in the price row. */
  priceOriginalClassName?: string
}

const SWIPE_COMMIT_PX = 48

/** Aligned with ProductDetailImageGallery — 4:5 frame, portrait fills height (cover). */
const PRODUCT_IMAGE_BASE = 'pointer-events-none absolute inset-0 size-full select-none'
const PRODUCT_IMAGE_CONTAIN = 'object-contain object-center mix-blend-multiply'
const PRODUCT_IMAGE_PORTRAIT = 'object-cover object-center mix-blend-multiply'

function NewMultiCutMedia({
  productTitle,
  slides,
  hideDots = false,
}: {
  productTitle: string
  slides: ProductMultiCutSlide[]
  hideDots?: boolean
}) {
  const [active, setActive] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const dragStartXRef = useRef<number | null>(null)
  const dragStartIndexRef = useRef(0)

  const canSwipe = slides.length > 1

  const goToIndex = useCallback(
    (index: number) => {
      setActive(Math.max(0, Math.min(slides.length - 1, index)))
      setDragOffset(0)
    },
    [slides.length],
  )

  useEffect(() => {
    setActive(0)
    setDragOffset(0)
  }, [slides])

  const finishDrag = useCallback(
    (clientX: number) => {
      if (dragStartXRef.current == null) return

      const dx = clientX - dragStartXRef.current
      dragStartXRef.current = null
      setIsDragging(false)
      setDragOffset(0)

      const slideWidth = viewportRef.current?.clientWidth ?? 0
      const threshold = slideWidth > 0 ? Math.min(SWIPE_COMMIT_PX, slideWidth * 0.2) : SWIPE_COMMIT_PX
      let next = dragStartIndexRef.current
      if (dx < -threshold) next += 1
      else if (dx > threshold) next -= 1
      goToIndex(next)
    },
    [goToIndex],
  )

  const slideShare = slides.length > 0 ? 100 / slides.length : 100
  const slideIndex = isDragging ? dragStartIndexRef.current : active
  const translateX = isDragging
    ? `calc(-${slideIndex * slideShare}% + ${dragOffset}px)`
    : `-${slideIndex * slideShare}%`

  return (
    <div className="relative h-full w-full overflow-hidden bg-light">
      <div
        ref={viewportRef}
        className={`product-multicut-viewport relative h-full w-full touch-pan-y overflow-hidden ${
          canSwipe ? 'cursor-grab' : ''
        } ${isDragging ? 'cursor-grabbing' : ''}`}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${productTitle} 상품 이미지`}
        onPointerDown={
          canSwipe
            ? (event) => {
                if (event.button !== 0) return
                dragStartXRef.current = event.clientX
                dragStartIndexRef.current = active
                setIsDragging(true)
                setDragOffset(0)
                event.currentTarget.setPointerCapture(event.pointerId)
              }
            : undefined
        }
        onPointerMove={
          canSwipe
            ? (event) => {
                if (dragStartXRef.current == null) return
                setDragOffset(event.clientX - dragStartXRef.current)
              }
            : undefined
        }
        onPointerUp={
          canSwipe
            ? (event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId)
                }
                finishDrag(event.clientX)
              }
            : undefined
        }
        onPointerCancel={
          canSwipe
            ? (event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId)
                }
                finishDrag(event.clientX)
              }
            : undefined
        }
      >
        <div
          className={`flex h-full flex-nowrap ${isDragging ? '' : 'transition-transform duration-300 ease-out motion-reduce:transition-none'}`}
          style={{
            width: `${slides.length * 100}%`,
            transform: `translate3d(${translateX}, 0, 0)`,
          }}
        >
          {slides.map((slide, slideIndex) => (
            <div
              key={slideIndex}
              className="relative box-border h-full shrink-0 overflow-hidden bg-light"
              style={{ width: `${slideShare}%` }}
              aria-hidden={slideIndex !== active && !isDragging}
            >
              <AdaptiveProductImage
                src={slide.image}
                alt={slide.variant === 'square' ? `${productTitle} 누끼컷` : `${productTitle} 화보컷`}
                baseClassName={PRODUCT_IMAGE_BASE}
                containClassName={PRODUCT_IMAGE_CONTAIN}
                portraitClassName={PRODUCT_IMAGE_PORTRAIT}
                draggable={false}
                loading={slideIndex === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>
      </div>
      {canSwipe && !hideDots ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex items-center justify-center gap-[6px]"
          role="tablist"
          aria-label="멀티컷 슬라이드"
        >
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`컷 ${i + 1} 보기`}
              className={`pointer-events-auto size-[6px] shrink-0 rounded-full transition-colors ${
                i === active ? 'bg-[#1a1a1a]' : 'bg-[#d0d0d0]'
              }`}
              onClick={() => goToIndex(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function ProductSizeQuickSelect({
  sizes,
  soldOutSizes,
  open,
  onToggle,
}: {
  sizes: readonly string[]
  soldOutSizes: ReadonlySet<string>
  open: boolean
  onToggle: () => void
}) {
  return (
    <>
      <div
        className={`absolute inset-0 z-20 flex w-full flex-col justify-end transition-opacity duration-200 ease-out motion-reduce:transition-none ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!open}
      >
        <div
          className={`grid h-fit w-full grid-cols-5 grid-rows-[repeat(2,fit-content)] px-[10px] py-[7px] lg:grid-cols-7 lg:grid-rows-[repeat(2,fit-content)] ${
            open ? 'bg-[rgba(26,26,26,0.4)]' : ''
          }`}
        >
          {sizes.map((size) => {
            const soldOut = soldOutSizes.has(size)
            return (
              <button
                key={size}
                type="button"
                disabled={soldOut}
                aria-disabled={soldOut}
                className={`flex h-[20px] w-[30px] items-center justify-center self-start border-0 bg-transparent px-0 py-[3px] text-bodySmall2 text-white disabled:cursor-default ${
                  soldOut ? 'opacity-50 line-through' : ''
                }`}
                onClick={(event) => event.stopPropagation()}
              >
                {size}
              </button>
            )
          })}
        </div>
      </div>
      <button
        type="button"
        className={`absolute bottom-[1px] right-0 z-30 flex size-[23px] items-center justify-center border-0 p-0 shadow-none ${
          open ? 'bg-[rgba(255,255,255,0.3)]' : 'bg-[rgba(255,255,255,0.4)]'
        }`}
        aria-expanded={open}
        aria-label={open ? '사이즈 옵션 닫기' : '사이즈 옵션 열기'}
        onClick={(event) => {
          event.stopPropagation()
          onToggle()
        }}
      >
        {open ? (
          <span className="block h-px w-[13px] bg-dark" aria-hidden />
        ) : (
          <img src={iconListPlus} alt="" aria-hidden className="size-[17px] object-contain" draggable={false} />
        )}
      </button>
    </>
  )
}

function ProductMediaOverlays({
  badges,
  rank,
  liked,
  onToggleLike,
}: {
  badges?: ProductBadge[]
  rank?: number
  liked: boolean
  onToggleLike: () => void
}) {
  return (
    <>
      {rank != null ? (
        <div
          className="pointer-events-none absolute left-0 top-0 z-10 flex size-6 items-center justify-center bg-black"
          aria-hidden
        >
          <span className="text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-white">{rank}</span>
        </div>
      ) : null}
      {badges && badges.length > 0 ? (
        <div className="pointer-events-none absolute left-0 top-0 z-10 flex items-start gap-1 bg-black p-[6px]">
          {badges.map((badge) => (
            <span
              key={badge.id}
              className="inline-flex h-4 items-center justify-center p-0 text-[9px] font-semibold leading-none tracking-[-0.02em] text-white"
            >
              {badge.label}
            </span>
          ))}
        </div>
      ) : null}
      <div className="pointer-events-none absolute right-0 top-0 z-10 flex flex-col items-end p-[10px]">
        <button
          type="button"
          className="pointer-events-auto border-0 bg-transparent p-0"
          aria-label={liked ? '찜 해제' : '찜하기'}
          onClick={(event) => {
            event.stopPropagation()
            onToggleLike()
          }}
        >
          <span
            className="block h-4 w-[17px] bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: getProductHeartIconDataUri(liked) }}
          />
        </button>
      </div>
    </>
  )
}

export function ProductCardPriceRow({
  product,
  className = 'flex flex-wrap items-center gap-x-[6px] gap-y-0 pt-1',
  discountClassName = 'text-[15px] font-bold text-primary',
  priceClassName = 'text-[15px] font-bold text-dark',
  originalPriceClassName = 'text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-subtleText line-through',
}: {
  product: Pick<ProductCardItem, 'discountRate' | 'price' | 'originalPrice'>
  className?: string
  discountClassName?: string
  priceClassName?: string
  originalPriceClassName?: string
}) {
  const hasDiscount = Boolean(product.discountRate?.trim())

  return (
    <div className={className}>
      {hasDiscount ? <span className={discountClassName}>{product.discountRate}</span> : null}
      <span className={priceClassName}>{product.price}</span>
      {product.originalPrice ? <span className={originalPriceClassName}>{product.originalPrice}</span> : null}
    </div>
  )
}

export function ProductCardUnit({
  product,
  liked,
  onToggleLike,
  articleClassName = 'flex w-32 shrink-0 snap-start flex-col self-stretch',
  titleClassName = 'truncate pt-3 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault',
  mediaInnerClassName = '',
  showSizeQuickSelect = false,
  sizeOptions = product.sizeOptions ?? DEFAULT_PRODUCT_SIZES,
  soldOutSizes = product.soldOutSizes ?? [],
  rank,
  hideMultiCutDots = false,
  priceRowClassName = 'flex flex-wrap items-center gap-x-[6px] gap-y-0 pt-1',
  priceDiscountClassName,
  priceSaleClassName,
  priceOriginalClassName,
}: ProductCardUnitProps) {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches,
  )
  const slides = useMemo(() => {
    if (!product.multiCutSlides?.length) return undefined
    if (isDesktop && product.multiCutSlidesDesktop?.length) return product.multiCutSlidesDesktop
    return product.multiCutSlides
  }, [isDesktop, product.multiCutSlides, product.multiCutSlidesDesktop])
  const [sizePanelOpen, setSizePanelOpen] = useState(false)
  const soldOutSizeSet = new Set(soldOutSizes)

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1024px)')
    const sync = () => setIsDesktop(desktopQuery.matches)
    sync()
    desktopQuery.addEventListener('change', sync)
    return () => desktopQuery.removeEventListener('change', sync)
  }, [])

  return (
    <article className={articleClassName}>
      <div className="relative isolate aspect-[4/5] w-full shrink-0 overflow-hidden bg-light">
        {slides && slides.length > 0 ? (
          <NewMultiCutMedia
            productTitle={product.title}
            slides={slides}
            hideDots={hideMultiCutDots || sizePanelOpen}
          />
        ) : (
          <div className={`relative h-full w-full overflow-hidden ${mediaInnerClassName}`.trim()}>
            <AdaptiveProductImage
              src={product.image}
              alt={`${product.title} 누끼컷`}
              baseClassName={PRODUCT_IMAGE_BASE}
              containClassName={PRODUCT_IMAGE_CONTAIN}
              portraitClassName={PRODUCT_IMAGE_PORTRAIT}
              draggable={false}
            />
          </div>
        )}
        <ProductMediaOverlays badges={product.badges} rank={rank} liked={liked} onToggleLike={onToggleLike} />
        {showSizeQuickSelect ? (
          <ProductSizeQuickSelect
            sizes={sizeOptions}
            soldOutSizes={soldOutSizeSet}
            open={sizePanelOpen}
            onToggle={() => setSizePanelOpen((wasOpen) => !wasOpen)}
          />
        ) : null}
      </div>
      <p className={titleClassName}>{product.title}</p>
      <ProductCardPriceRow
        product={product}
        className={priceRowClassName}
        discountClassName={priceDiscountClassName}
        priceClassName={priceSaleClassName}
        originalPriceClassName={priceOriginalClassName}
      />
    </article>
  )
}
