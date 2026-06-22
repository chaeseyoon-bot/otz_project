import { useRef, useState } from 'react'
import type { EditorialShowcaseGalleryImage } from '../../data/editorialEventDetails'
import type { ProductCardItem } from '../molecules/ProductCardUnit'
import { ProductCardPriceRow } from '../molecules/ProductCardUnit'
import { AdaptiveProductImage } from '../molecules/AdaptiveProductImage'
import { useHorizontalMouseDragScroll } from '../../hooks/useHorizontalMouseDragScroll'
import { PRODUCT_CUT_CONTAIN_CLASS, PRODUCT_CUT_PORTRAIT_CLASS, swapImageExtension } from '../../lib/productImage'
import { getProductDetailPath } from '../../lib/productRoutes'
import { navigateSpa } from '../../lib/spaNavigation'

export interface EditorialProductShowcaseSectionProps {
  title: string
  subtitle: string
  product: ProductCardItem
  gallery: EditorialShowcaseGalleryImage[]
  /** Figma 170:4230 — collection MO layout (no extra horizontal padding). */
  layout?: 'default' | 'collection'
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
  collectionLayout,
}: {
  slide: EditorialShowcaseGalleryImage
  productImage: string
  collectionLayout?: boolean
}) {
  const [hidden, setHidden] = useState(false)
  const [src, setSrc] = useState(slide.src || productImage)

  if (hidden || !src) return null

  const handleFinalError = () => {
    const alternate = slide.fallbackSrc ?? swapImageExtension(src)
    if (alternate && alternate !== src) {
      setSrc(alternate)
      return
    }
    setHidden(true)
  }

  return (
    <div
      className={`relative flex shrink-0 snap-start items-center justify-center bg-light ${
        collectionLayout
          ? 'h-[340px] w-[271px] lg:h-[475px] lg:w-[380px]'
          : 'h-[220px] w-[176px] lg:h-[475px] lg:w-[380px]'
      }`}
    >
      <div className="relative h-full w-full overflow-hidden">
        <AdaptiveProductImage
          src={src}
          alt=""
          orientation={slide.variant === 'editorial' ? 'portrait' : undefined}
          baseClassName="pointer-events-none absolute inset-0 size-full"
          containClassName={PRODUCT_CUT_CONTAIN_CLASS}
          portraitClassName={PRODUCT_CUT_PORTRAIT_CLASS}
          loading="lazy"
          draggable={false}
          onFinalError={handleFinalError}
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
  layout = 'default',
}: EditorialProductShowcaseSectionProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const slides = resolveGallerySlides(gallery, product)
  const isCollection = layout === 'collection'

  useHorizontalMouseDragScroll(scrollerRef, { enabled: slides.length > 1 })

  const productPath = getProductDetailPath(product.id)

  if (!slides.length) return null

  return (
    <section
      className={`mx-auto flex w-full max-w-[1400px] flex-col border-b border-dark bg-white py-10 lg:py-16 ${
        isCollection ? 'gap-6 lg:gap-6 lg:px-0' : 'gap-6 px-[15px] lg:gap-6 lg:px-0'
      }`}
    >
      <div className={`flex w-full flex-col ${isCollection ? 'gap-2 lg:gap-4' : 'gap-4'}`}>
        {title ? (
          <h2
            className={`m-0 font-bold leading-[1.4] tracking-[-0.04em] text-dark ${
              isCollection ? 'text-[24px] lg:text-[34px]' : 'text-[28px] lg:text-[34px]'
            }`}
          >
            {title}
          </h2>
        ) : null}
        {subtitle ? (
          <p
            className={`m-0 font-normal leading-[1.4] tracking-[-0.04em] text-dark ${
              isCollection ? 'text-[13px] lg:text-[16px]' : 'text-[14px] lg:text-[16px]'
            }`}
          >
            {subtitle}
          </p>
        ) : null}
      </div>

      <div className="flex w-full flex-col">
        <div
          ref={scrollerRef}
          className={`flex overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
            isCollection ? 'h-[340px] gap-2 lg:h-[476px] lg:gap-2' : 'h-[220px] gap-2 lg:h-[476px]'
          }`}
        >
          {slides.map((slide, index) => (
            <ShowcaseGallerySlide
              key={`${slide.src}-${index}`}
              slide={slide}
              productImage={product.image}
              collectionLayout={isCollection}
            />
          ))}
        </div>

        <div className="pt-3">
          <p
            className={`m-0 pt-3 font-normal leading-[1.4] tracking-[-0.02em] text-textDefault ${
              isCollection ? 'text-[13px] lg:text-[15px]' : 'text-[14px] lg:text-[15px]'
            }`}
          >
            {product.title}
          </p>
          <ProductCardPriceRow
            product={product}
            className="flex flex-wrap items-center gap-x-1.5 gap-y-0 pt-1"
            discountClassName={
              isCollection
                ? 'text-[15px] font-bold leading-[1.4] tracking-[-0.02em] text-primary lg:text-[18px]'
                : 'text-[16px] font-bold leading-[1.4] tracking-[-0.02em] text-primary lg:text-[18px]'
            }
            priceClassName={
              isCollection
                ? 'text-[15px] font-bold leading-[1.4] tracking-[-0.02em] text-dark lg:text-[18px]'
                : 'text-[16px] font-bold leading-[1.4] tracking-[-0.02em] text-dark lg:text-[18px]'
            }
            originalPriceClassName="text-[14px] font-normal leading-[1.4] tracking-[-0.02em] text-subtleText line-through lg:text-[15px]"
          />
        </div>

        <div className={isCollection ? 'pt-6 lg:pt-8' : 'pt-8'}>
          <button
            type="button"
            className={`inline-flex items-center gap-3 bg-dark font-normal leading-[1.4] tracking-[-0.04em] text-white hover:opacity-90 ${
              isCollection
                ? 'rounded-sm px-4 py-2 text-[13px] lg:h-[54px] lg:rounded-[4px] lg:px-6 lg:text-[16px]'
                : 'h-[48px] rounded-[4px] px-6 text-[14px] lg:h-[54px] lg:text-[16px]'
            }`}
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
