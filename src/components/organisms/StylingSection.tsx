import { useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { ProductEditorialThumbnail } from '../molecules/ProductEditorialThumbnail'
import { HomeProductDetailLink } from '../molecules/HomeProductDetailLink'
import { useHorizontalMouseDragScroll } from '../../hooks/useHorizontalMouseDragScroll'
import { useStyleBannerContent } from '../../hooks/useStyleBannerContent'
import type { ResolvedStyleBannerCard, ResolvedStyleBannerProduct } from '../../lib/homeMainContentResolver'
import { getProductHeartIconDataUri } from '../../lib/productHeartIcon'
import { navigateSpa } from '../../lib/spaNavigation'

import 'swiper/css'

/** Product strip: leading gutter once on the strip wrapper; every slide same width for aligned snap */
const STYLING_PRODUCT_SLIDE_WIDTH_PX = 240
const STYLING_PRODUCT_SLIDE_GAP_PX = 0
const STYLING_PRODUCT_STRIP_LEADING_PX = 10

function buildInitialLikes(cards: ResolvedStyleBannerCard[]): Record<string, boolean[]> {
  const initial: Record<string, boolean[]> = {}
  for (const card of cards) {
    initial[card.id] = card.products.map(() => false)
  }
  return initial
}

interface StylingCardProductSliderProps {
  products: ResolvedStyleBannerProduct[]
}

/** 60px column like mobile strip; inner frame 4:5 on #f6f6f6 (`bg-light`) with multiply blend */
function StylingProductThumb({
  product,
  rounded,
}: {
  product: ResolvedStyleBannerProduct
  rounded?: boolean
}) {
  return (
    <div
      className={`flex h-[75px] w-[60px] shrink-0 items-center justify-center overflow-hidden bg-light ${rounded ? 'rounded-[5px]' : ''}`}
    >
      <ProductEditorialThumbnail
        candidates={product.thumbCandidates.length ? product.thumbCandidates : [product.thumb]}
        className="relative h-[75px] aspect-[4/5] overflow-hidden bg-light"
        imageClassName="pointer-events-none absolute inset-0 size-full object-contain object-center mix-blend-multiply"
      />
    </div>
  )
}

function StylingCardProductSlider({ products }: StylingCardProductSliderProps) {
  return (
    <div
      className="absolute bottom-[10px] box-border w-full"
      style={{ paddingLeft: STYLING_PRODUCT_STRIP_LEADING_PX }}
    >
      <Swiper
        centeredSlides={false}
        freeMode={false}
        grabCursor
        resistanceRatio={0}
        slidesPerView="auto"
        snapToSlideEdge
        spaceBetween={STYLING_PRODUCT_SLIDE_GAP_PX}
        speed={320}
        touchRatio={1}
        watchOverflow
        className="styling-card-product-swiper !m-0 h-[75px] w-full max-w-none"
      >
        {products.map((product, productIndex) => (
          <SwiperSlide
            key={`${product.productId ?? product.name}-${productIndex}`}
            className="!box-border shrink-0"
            style={{ width: STYLING_PRODUCT_SLIDE_WIDTH_PX }}
          >
            <HomeProductDetailLink
              productId={product.productId}
              href={product.detailHref}
              className="box-border block h-[75px] w-full"
            >
              <div className="box-border flex h-[75px] w-full gap-[10px] pr-[10px]">
                <StylingProductThumb product={product} rounded />
                <div className="min-w-0 flex-1 pt-[8px] text-white">
                  <p className="line-clamp-2 w-full max-w-[172px] text-[13px] text-bodySmall">{product.name}</p>
                  <p className="pt-[2px] text-bodyBold2">
                    <span className="text-[15px] font-bold text-primary">{product.discountRate}</span>
                    <span className="pl-[6px] text-[15px] font-bold text-white">{product.price}</span>
                  </p>
                </div>
              </div>
            </HomeProductDetailLink>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

interface StylingBannerImageProps {
  card: ResolvedStyleBannerCard
  className?: string
  imageClassName?: string
}

function StylingBannerImage({ card, className, imageClassName }: StylingBannerImageProps) {
  const image = (
    <img
      src={card.imageUrl}
      alt={card.products[0]?.name ?? ''}
      className={imageClassName}
      draggable={false}
    />
  )

  if (!card.bannerHref) {
    return <div className={className}>{image}</div>
  }

  return (
    <a
      href={card.bannerHref}
      className={className}
      onClick={(event) => {
        event.preventDefault()
        navigateSpa(card.bannerHref)
      }}
    >
      {image}
    </a>
  )
}

interface StylingDesktopProductRowProps {
  cardId: string
  product: ResolvedStyleBannerProduct
  productIndex: number
  liked: boolean
  onToggleLike: (cardId: string, productIndex: number) => void
}

function StylingDesktopProductRow({
  cardId,
  product,
  productIndex,
  liked,
  onToggleLike,
}: StylingDesktopProductRowProps) {
  return (
    <div className="flex min-h-[75px] w-full items-center gap-2 pr-[5px]">
      <HomeProductDetailLink
        productId={product.productId}
        href={product.detailHref}
        className="flex min-w-0 flex-1 items-center gap-2"
      >
        <StylingProductThumb product={product} />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-[5px]">
          <p className="line-clamp-2 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault">
            {product.name}
          </p>
          <div className="flex items-center gap-2.5">
            <span className="text-[15px] font-bold leading-[1.4] tracking-[-0.02em] text-primary">
              {product.discountRate}
            </span>
            <span className="text-[15px] font-bold leading-[1.4] tracking-[-0.02em] text-black">{product.price}</span>
          </div>
        </div>
      </HomeProductDetailLink>
      <button
        type="button"
        aria-label={liked ? '찜 해제' : '찜하기'}
        className="flex size-6 shrink-0 items-center justify-center border-0 bg-transparent p-0"
        onClick={() => onToggleLike(cardId, productIndex)}
      >
        <span
          className="block h-4 w-[17px] bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: getProductHeartIconDataUri(liked) }}
        />
      </button>
    </div>
  )
}

interface StylingDesktopColumnProps {
  card: ResolvedStyleBannerCard
  likedByProduct: boolean[]
  onToggleLike: (cardId: string, productIndex: number) => void
}

function StylingDesktopColumn({ card, likedByProduct, onToggleLike }: StylingDesktopColumnProps) {
  return (
    <div className="flex w-[335px] shrink-0 flex-col gap-1.5">
      <div className="relative w-full shrink-0 overflow-hidden">
        <div className="relative aspect-[320/400] w-full overflow-hidden">
          <StylingBannerImage
            card={card}
            className="absolute inset-0 block size-full"
            imageClassName="size-full object-cover"
          />
          {card.badge ? (
            <div className="pointer-events-none absolute left-0 top-0 z-[1] box-border flex h-fit w-fit flex-col items-center justify-center bg-black px-[10px] py-2">
              <span className="text-[10px] font-semibold leading-[1.1] text-white">{card.badge}</span>
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex w-full flex-col gap-1">
        {card.products.map((product, productIndex) => (
          <StylingDesktopProductRow
            key={`${card.id}-${productIndex}`}
            cardId={card.id}
            product={product}
            productIndex={productIndex}
            liked={likedByProduct[productIndex] ?? false}
            onToggleLike={onToggleLike}
          />
        ))}
      </div>
    </div>
  )
}

export function StylingSection() {
  const { section } = useStyleBannerContent()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [likedByCard, setLikedByCard] = useState<Record<string, boolean[]>>(() =>
    buildInitialLikes(section.cards),
  )
  useHorizontalMouseDragScroll(scrollerRef)

  const toggleDesktopLike = (cardId: string, productIndex: number) => {
    setLikedByCard((prev) => ({
      ...prev,
      [cardId]: prev[cardId]!.map((v, i) => (i === productIndex ? !v : v)),
    }))
  }

  return (
    <section className="w-full bg-white">
      {/* Mobile — horizontal cards + bottom product swiper */}
      <div className="pt-10 lg:hidden">
        <div
          ref={scrollerRef}
          className="cursor-grab overflow-x-auto overscroll-x-contain scroll-smooth scroll-pl-[15px] scroll-pr-[15px] snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden active:cursor-grabbing"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex w-max snap-x snap-mandatory gap-1">
            <div className="block w-[11px] shrink-0" aria-hidden />
            {section.cards.map((card) => (
              <article
                key={card.id}
                className="relative h-[480px] w-[335px] shrink-0 snap-start overflow-hidden"
              >
                <StylingBannerImage
                  card={card}
                  className="block h-full w-full"
                  imageClassName="h-full w-full bg-[var(--otz-color-surface-subtle)] object-cover"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0)] from-[57.083%] to-[rgba(0,0,0,0.4)] to-[86.875%] mix-blend-darken"
                  aria-hidden
                />
                {card.badge ? (
                  <div className="pointer-events-none absolute left-0 top-0 z-[2] box-border flex h-fit w-fit flex-col items-center justify-center bg-black px-[10px] py-2">
                    <span className="text-[10px] font-semibold leading-[1.1] text-white">{card.badge}</span>
                  </div>
                ) : null}
                <StylingCardProductSlider products={card.products} />
              </article>
            ))}
            <div className="block w-[11px] shrink-0" aria-hidden />
          </div>
        </div>
      </div>

      {/* PC — Figma 2601:23377 */}
      <div className="hidden w-full py-[64px] lg:block">
        <div className="mx-auto min-w-0 max-w-[1400px]">
          <div className="flex w-full min-w-0 items-start gap-[75px]">
            <div className="flex w-[300px] shrink-0 flex-col gap-5 pt-5">
              <div className="shrink-0">
                <span className="inline-flex rounded-full bg-black px-3 py-1.5 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-white">
                  {section.badge}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <h2 className="m-0 text-[30px] font-extrabold leading-[1.2] tracking-[-0.02em] text-dark">
                  {section.titleLines.map((line, index) => (
                    <span key={index} className="block whitespace-pre">
                      {line}
                    </span>
                  ))}
                </h2>
                <div className="text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault">
                  {section.bodyLines.map((line, index) => (
                    <p key={index} className="m-0">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 items-start justify-end gap-[10px]">
              {section.cards.map((card) => (
                <StylingDesktopColumn
                  key={card.id}
                  card={card}
                  likedByProduct={likedByCard[card.id] ?? card.products.map(() => false)}
                  onToggleLike={toggleDesktopLike}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
