import { useRef, useState } from 'react'
import type { EditorialShowcaseGalleryImage } from '../../data/editorialEventDetails'
import type { ProductCardItem } from '../molecules/ProductCardUnit'
import { ProductCardPriceRow } from '../molecules/ProductCardUnit'
import { useHorizontalMouseDragScroll } from '../../hooks/useHorizontalMouseDragScroll'
import { swapImageExtension } from '../../lib/productImage'
import { getProductDetailPath } from '../../lib/productRoutes'
import { navigateSpa } from '../../lib/spaNavigation'

export interface EditorialProductShowcaseSectionProps {
  title: string
  subtitle: string
  product: ProductCardItem
  gallery: EditorialShowcaseGalleryImage[]
}

function ShowcaseLinkChevron() {
  return (
    <svg width={4} height={8} viewBox="0 0 4 8" fill="none" aria-hidden className="text-white">
      <path
        d="M0.75 1.25L3.25 4L0.75 6.75"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function resolveGallerySlides(
  gallery: EditorialShowcaseGalleryImage[],
  product: ProductCardItem,
): EditorialShowcaseGalleryImage[] {
  const fromGallery = gallery.filter((item) => item.src.trim().length > 0)
  if (fromGallery.length) return fromGallery

  return product.multiCutSlides?.length
    ? product.multiCutSlides.map((slide) => ({
        src: slide.image,
        fallbackSrc: swapImageExtension(slide.image) ?? undefined,
        variant: slide.variant === 'editorial' ? ('editorial' as const) : ('cutout' as const),
      }))
    : product.image.trim()
      ? [{ src: product.image, variant: 'cutout' as const }]
      : []
}

function ShowcaseGallerySlide({
  slide,
  productImage,
}: {
  slide: EditorialShowcaseGalleryImage
  productImage: string
}) {
  const [hidden, setHidden] = useState(false)
  const [src, setSrc] = useState(slide.src || productImage)

  if (hidden || !src) return null

  const handleError = () => {
    const alternate = slide.fallbackSrc ?? swapImageExtension(src)
    if (alternate && alternate !== src) {
      setSrc(alternate)
      return
    }
    setHidden(true)
  }

  if (slide.variant === 'editorial') {
    return (
      <div className="relative flex h-[220px] w-[176px] shrink-0 snap-start items-center bg-light lg:h-[475px] lg:w-[380px]">
        <div className="relative aspect-[1200/1500] min-w-0 flex-1">
          <img
            src={src}
            alt=""
            className="pointer-events-none absolute inset-0 size-full object-cover"
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={handleError}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-[220px] w-[176px] shrink-0 snap-start items-center bg-light lg:h-[475px] lg:w-[380px]">
      <div className="relative aspect-square min-w-0 flex-1 mix-blend-multiply">
        <img
          src={src}
          alt=""
          className="pointer-events-none absolute inset-0 size-full object-cover"
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={handleError}
        />
      </div>
    </div>
  )
}

/** Figma 144:4223 — standalone product carousel below hero gallery. */
export function EditorialProductShowcaseSection({
  title,
  subtitle,
  product,
  gallery,
}: EditorialProductShowcaseSectionProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const slides = resolveGallerySlides(gallery, product)

  useHorizontalMouseDragScroll(scrollerRef, { enabled: slides.length > 1 })

  const productPath = getProductDetailPath(product.id)

  if (!slides.length) return null

  return (
    <section className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 border-b border-dark bg-white px-[15px] py-10 lg:gap-6 lg:px-0 lg:py-16">
      <div className="flex w-full flex-col gap-4">
        {title ? (
          <h2 className="m-0 text-[28px] font-bold leading-[1.4] tracking-[-0.4px] text-dark lg:text-[34px]">
            {title}
          </h2>
        ) : null}
        {subtitle ? (
          <p className="m-0 text-[14px] font-normal leading-[1.4] tracking-[-0.04em] text-dark lg:text-[16px]">
            {subtitle}
          </p>
        ) : null}
      </div>

      <div className="flex w-full flex-col">
        <div
          ref={scrollerRef}
          className="flex h-[220px] gap-2 overflow-x-auto scroll-smooth lg:h-[476px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((slide, index) => (
            <ShowcaseGallerySlide key={`${slide.src}-${index}`} slide={slide} productImage={product.image} />
          ))}
        </div>

        <div className="pt-3">
          <p className="m-0 pt-3 text-[14px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault lg:text-[15px]">
            {product.title}
          </p>
          <ProductCardPriceRow
            product={product}
            className="flex flex-wrap items-center gap-x-1.5 gap-y-0 pt-1"
            discountClassName="text-[16px] font-bold leading-[1.4] tracking-[-0.02em] text-primary lg:text-[18px]"
            priceClassName="text-[16px] font-bold leading-[1.4] tracking-[-0.02em] text-dark lg:text-[18px]"
            originalPriceClassName="text-[14px] font-normal leading-[1.4] tracking-[-0.02em] text-subtleText line-through lg:text-[15px]"
          />
        </div>

        <div className="pt-8">
          <button
            type="button"
            className="inline-flex h-[48px] items-center gap-3 rounded-[4px] bg-dark px-6 text-[14px] font-medium leading-[1.4] tracking-[-0.04em] text-white hover:opacity-90 lg:h-[54px] lg:text-[16px]"
            onClick={() => navigateSpa(productPath)}
          >
            상품 바로가기
            <ShowcaseLinkChevron />
          </button>
        </div>
      </div>
    </section>
  )
}
