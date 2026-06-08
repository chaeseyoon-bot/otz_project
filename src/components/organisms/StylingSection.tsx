import { useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { useHorizontalMouseDragScroll } from '../../hooks/useHorizontalMouseDragScroll'
import { mainImageAsset } from '../../lib/mainImagesAssetUrl'
import { getProductHeartIconDataUri } from '../../lib/productHeartIcon'

import 'swiper/css'

/** Product strip: leading gutter once on the strip wrapper; every slide same width for aligned snap */
const STYLING_PRODUCT_SLIDE_WIDTH_PX = 240
const STYLING_PRODUCT_SLIDE_GAP_PX = 0
const STYLING_PRODUCT_STRIP_LEADING_PX = 10

interface StylingProduct {
  thumb: string
  name: string
  discountRate: string
  price: string
}

interface StylingCard {
  id: string
  image: string
  /** Figma 2601:23377 — optional top-left flag on banner */
  badge: string | null
  products: StylingProduct[]
}

/** Figma 2601:23377 — PC shows 3 columns; mobile uses same cards in horizontal strip format */
const STYLING_CARDS: StylingCard[] = [
  {
    id: 'styling-limited',
    image: mainImageAsset('style_01.png'),
    badge: 'LIMITED EDITION',
    products: [
      {
        thumb: mainImageAsset('style_02.png'),
        name: '스웨이드 숄더백 코코아모브 브라운 FLOTFA3B07',
        discountRate: '10%',
        price: '53,910',
      },
      {
        thumb: mainImageAsset('style_03.png'),
        name: '[오찌x우무] 벌루니 플랫폼 밴딩 슬라이드 FLOTFF4W21',
        discountRate: '20%',
        price: '53,910',
      },
    ],
  },
  {
    id: 'styling-editorial',
    image: mainImageAsset('style_04.png'),
    badge: null,
    products: [
      {
        thumb: mainImageAsset('style_05.png'),
        name: '시스루 테일러드 자켓 MIWJKF1029B',
        discountRate: '10%',
        price: '53,910',
      },
      {
        thumb: mainImageAsset('style_06.png'),
        name: '시스루 테일러드 자켓 MIWJKF1029B',
        discountRate: '10%',
        price: '53,910',
      },
    ],
  },
  {
    id: 'styling-ss26',
    image: mainImageAsset('style_07.jpg'),
    badge: '26SS COLLECTION',
    products: [
      {
        thumb: mainImageAsset('style_08.jpg'),
        name: '스웨이드 숄더백 코코아모브 브라운 FLOTFA3B07',
        discountRate: '10%',
        price: '53,910',
      },
      {
        thumb: mainImageAsset('style_09.jpg'),
        name: '스웨이드 숄더백 코코아모브 브라운 FLOTFA3B07',
        discountRate: '10%',
        price: '53,910',
      },
    ],
  },
]

const STYLE_LOG_DESCRIPTION = [
  '오찌가 전하는 편안함 위에 당신만의 색깔을 더해보세요.',
  '매일의 걸음이 즐거워지는 감각적인 스타일링 가이드를',
  '제안합니다.',
] as const

function buildInitialLikes(): Record<string, boolean[]> {
  const initial: Record<string, boolean[]> = {}
  for (const card of STYLING_CARDS) {
    initial[card.id] = card.products.map(() => false)
  }
  return initial
}

interface StylingCardProductSliderProps {
  products: StylingProduct[]
}

/** 60px column like mobile strip; inner frame 4:5 on #f6f6f6 (`bg-light`) with multiply blend */
function StylingProductThumb({ src, rounded }: { src: string; rounded?: boolean }) {
  return (
    <div
      className={`flex h-[75px] w-[60px] shrink-0 items-center justify-center overflow-hidden bg-light ${rounded ? 'rounded-[5px]' : ''}`}
    >
      <div className="relative h-[75px] aspect-[4/5] overflow-hidden bg-light">
        <img
          src={src}
          alt=""
          className="pointer-events-none absolute inset-0 size-full object-contain object-center mix-blend-multiply"
          draggable={false}
        />
      </div>
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
        className="styling-card-product-swiper !m-0 h-[75px] w-full max-w-none touch-pan-x"
      >
        {products.map((product, productIndex) => (
          <SwiperSlide
            key={`${product.name}-${productIndex}`}
            className="!box-border shrink-0"
            style={{ width: STYLING_PRODUCT_SLIDE_WIDTH_PX }}
          >
            <div className="box-border flex h-[75px] w-full gap-[10px] pr-[10px]">
              <StylingProductThumb src={product.thumb} rounded />
              <div className="min-w-0 flex-1 pt-[8px] text-white">
                <p className="line-clamp-2 w-full max-w-[172px] text-[13px] text-bodySmall">{product.name}</p>
                <p className="pt-[2px] text-bodyBold2">
                  <span className="text-[15px] font-bold text-primary">{product.discountRate}</span>
                  <span className="pl-[6px] text-[15px] font-bold text-white">{product.price}</span>
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

interface StylingDesktopProductRowProps {
  cardId: string
  product: StylingProduct
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
      <StylingProductThumb src={product.thumb} />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-[5px]">
        <p className="line-clamp-2 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault">
          {product.name}
        </p>
        <div className="flex items-center gap-2.5">
          <span className="text-[15px] font-bold leading-[1.4] tracking-[-0.02em] text-primary">
            {product.discountRate}
          </span>
          <span className="text-[15px] font-bold leading-[1.4] tracking-[-0.02em] text-black">
            {product.price}
          </span>
        </div>
      </div>
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
  card: StylingCard
  likedByProduct: boolean[]
  onToggleLike: (cardId: string, productIndex: number) => void
}

function StylingDesktopColumn({ card, likedByProduct, onToggleLike }: StylingDesktopColumnProps) {
  return (
    <div className="flex w-[335px] shrink-0 flex-col gap-1.5">
      <div className="relative w-full shrink-0 overflow-hidden">
        <div className="relative aspect-[320/400] w-full overflow-hidden">
          <img
            src={card.image}
            alt=""
            className="absolute inset-0 size-full object-cover"
            draggable={false}
          />
          {card.badge ? (
            <div className="absolute left-0 top-0 z-[1] box-border flex h-[28px] flex-col items-center justify-center bg-black px-[10px]">
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
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [likedByCard, setLikedByCard] = useState<Record<string, boolean[]>>(buildInitialLikes)
  useHorizontalMouseDragScroll(scrollerRef)

  const toggleDesktopLike = (cardId: string, productIndex: number) => {
    setLikedByCard((prev) => ({
      ...prev,
      [cardId]: prev[cardId]!.map((v, i) => (i === productIndex ? !v : v)),
    }))
  }

  return (
    <section className="w-full bg-white">
      {/* Mobile — horizontal cards + bottom product swiper (Figma mobile strip pattern) */}
      <div className="pt-10 lg:hidden">
        <div
          ref={scrollerRef}
          className="cursor-grab overflow-x-auto overscroll-x-contain scroll-smooth scroll-pl-[15px] scroll-pr-[15px] touch-pan-x snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden active:cursor-grabbing"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex w-max snap-x snap-mandatory gap-1">
            <div className="block w-[11px] shrink-0" aria-hidden />
            {STYLING_CARDS.map((card) => (
              <article
                key={card.id}
                className="relative h-[480px] w-[335px] shrink-0 snap-start overflow-hidden"
              >
                <img
                  src={card.image}
                  alt={card.products[0]?.name ?? ''}
                  className="h-full w-full bg-[var(--otz-color-surface-subtle)] object-cover"
                  draggable={false}
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0)] from-[57.083%] to-[rgba(0,0,0,0.4)] to-[86.875%] mix-blend-darken"
                  aria-hidden
                />
                {card.badge ? (
                  <div className="absolute left-0 top-0 z-[2] box-border flex h-[28px] flex-col items-center justify-center bg-black px-[10px]">
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

      {/* Figma 2601:23377 — PC: CORDINATION + OTZ'S STYLE LOG + 3 columns */}
      <div className="hidden w-full py-[64px] lg:block">
        <div className="mx-auto min-w-0 max-w-[1400px]">
          <div className="flex w-full min-w-0 items-start gap-[75px]">
            <div className="flex w-[300px] shrink-0 flex-col gap-5 pt-5">
              <div className="shrink-0">
                <span className="inline-flex rounded-full bg-black px-3 py-1.5 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-white">
                  CORDINATION
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <h2 className="m-0 text-[34px] font-extrabold leading-[1.2] tracking-[-0.02em] text-dark">
                  <span className="block whitespace-pre">{`OTZ'S `}</span>
                  <span className="block whitespace-pre">STYLE LOG</span>
                </h2>
                <div className="text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault">
                  {STYLE_LOG_DESCRIPTION.map((line, i) => (
                    <p key={i} className="m-0">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 items-start justify-end gap-[10px]">
              {STYLING_CARDS.map((card) => (
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
