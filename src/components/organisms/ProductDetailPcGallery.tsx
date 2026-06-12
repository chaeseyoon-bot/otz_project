import { useCallback, useLayoutEffect, useState } from 'react'
import { figmaAsset } from '../../lib/figmaAssetUrl'
import { PRODUCT_CUT_CONTAIN_CLASS, PRODUCT_CUT_PORTRAIT_CLASS } from '../../lib/productImage'
import type { ProductMultiCutSlide } from '../molecules/ProductCardUnit'
import { AdaptiveProductImage } from '../molecules/AdaptiveProductImage'

const iconChevronLeft = figmaAsset('icons/chevron-left.svg')

export interface ProductDetailPcGalleryProps {
  productTitle: string
  slides: ProductMultiCutSlide[]
  isResolving?: boolean
}

/** Figma g60Jix8lxQjYRzn3l7MNWf node 22:6860 — PC PDP thumbnail rail + hero image. */
export function ProductDetailPcGallery({
  productTitle,
  slides,
  isResolving = false,
}: ProductDetailPcGalleryProps) {
  const [active, setActive] = useState(0)

  useLayoutEffect(() => {
    setActive((index) => Math.min(index, Math.max(0, slides.length - 1)))
  }, [slides.length])

  const goToIndex = useCallback(
    (index: number) => {
      setActive(Math.max(0, Math.min(slides.length - 1, index)))
    },
    [slides.length],
  )

  const goPrev = useCallback(() => goToIndex(active - 1), [active, goToIndex])
  const goNext = useCallback(() => goToIndex(active + 1), [active, goToIndex])

  if (isResolving || slides.length === 0) {
    return (
      <div className="flex w-[776px] shrink-0 gap-4">
        <div className="h-[800px] w-[120px] shrink-0 bg-light" />
        <div className="flex h-[800px] w-[640px] shrink-0 items-center justify-center bg-light">
          {isResolving ? null : (
            <p className="m-0 text-bodyRegular2 text-subtleText">상품 이미지 없음</p>
          )}
        </div>
      </div>
    )
  }

  const activeSlide = slides[active]
  const canNavigate = slides.length > 1

  return (
    <div className="flex w-[776px] shrink-0 gap-4">
      <div
        className="flex h-[800px] w-[120px] shrink-0 flex-col gap-4 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="상품 썸네일"
      >
        {slides.map((slide, index) => {
          const selected = index === active
          return (
            <button
              key={slide.image}
              type="button"
              className={`flex aspect-[4/5] w-full shrink-0 items-center justify-center overflow-hidden bg-light ${
                selected ? 'border-2 border-dark' : 'border-2 border-transparent'
              }`}
              aria-label={`${productTitle} 이미지 ${index + 1}`}
              aria-current={selected ? 'true' : undefined}
              onClick={() => goToIndex(index)}
            >
              <AdaptiveProductImage
                src={slide.image}
                alt={slide.variant === 'square' ? `${productTitle} 누끼컷` : `${productTitle} 화보컷`}
                orientation={slide.variant === 'square' ? 'square' : 'portrait'}
                baseClassName="block"
                containClassName={PRODUCT_CUT_CONTAIN_CLASS}
                portraitClassName={PRODUCT_CUT_PORTRAIT_CLASS}
                draggable={false}
                loading={index < 3 ? 'eager' : 'lazy'}
              />
            </button>
          )
        })}
      </div>

      <div className="relative h-[800px] w-[640px] shrink-0 overflow-hidden bg-light">
        <AdaptiveProductImage
          key={activeSlide.image}
          src={activeSlide.image}
          alt={activeSlide.variant === 'square' ? `${productTitle} 누끼컷` : `${productTitle} 화보컷`}
          orientation={activeSlide.variant === 'square' ? 'square' : 'portrait'}
          containClassName="size-full object-contain object-center mix-blend-multiply"
          portraitClassName={PRODUCT_CUT_PORTRAIT_CLASS}
          draggable={false}
          loading="eager"
        />

        {canNavigate ? (
          <>
            <div
              className="pointer-events-none absolute inset-x-0 bottom-10 z-10 flex items-center justify-center gap-1.5"
              role="tablist"
              aria-label="상품 이미지 슬라이드"
            >
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={index === active}
                  aria-label={`이미지 ${index + 1}`}
                  className={`pointer-events-auto size-1.5 shrink-0 rounded-full transition-colors ${
                    index === active ? 'bg-dark' : 'bg-gray'
                  }`}
                  onClick={() => goToIndex(index)}
                />
              ))}
            </div>

            <div className="absolute inset-x-5 bottom-10 z-20 flex items-center justify-between">
              <button
                type="button"
                className="flex size-10 items-center justify-center rounded-full border border-lightGray bg-white/90 disabled:cursor-default disabled:opacity-40"
                aria-label="이전 이미지"
                disabled={active === 0}
                onClick={goPrev}
              >
                <img src={iconChevronLeft} alt="" aria-hidden className="size-4 object-contain" draggable={false} />
              </button>
              <button
                type="button"
                className="flex size-10 items-center justify-center rounded-full border border-lightGray bg-white/90 disabled:cursor-default disabled:opacity-40"
                aria-label="다음 이미지"
                disabled={active === slides.length - 1}
                onClick={goNext}
              >
                <img
                  src={iconChevronLeft}
                  alt=""
                  aria-hidden
                  className="size-4 rotate-180 object-contain"
                  draggable={false}
                />
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
