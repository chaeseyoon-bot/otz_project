import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { ProductMultiCutSlide } from './ProductCardUnit'
import { PRODUCT_CUT_CONTAIN_CLASS, PRODUCT_CUT_PORTRAIT_CLASS } from '../../lib/productImage'
import { AdaptiveProductImage } from './AdaptiveProductImage'

const SWIPE_COMMIT_PX = 48

interface ProductDetailImageGalleryProps {
  productTitle: string
  slides: ProductMultiCutSlide[]
  /** True while optional slides are probed (avoids broken-image flash). */
  isResolving?: boolean
}

/** Figma 2978:16108 — PDP hero gallery with dot indicators. */
export function ProductDetailImageGallery({
  productTitle,
  slides,
  isResolving = false,
}: ProductDetailImageGalleryProps) {
  const [active, setActive] = useState(0)
  const [slideWidth, setSlideWidth] = useState(0)
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

  useLayoutEffect(() => {
    setActive((index) => Math.min(index, Math.max(0, slides.length - 1)))
  }, [slides.length])

  useLayoutEffect(() => {
    const el = viewportRef.current
    if (!el) return

    const measure = () => {
      const width = Math.round(el.getBoundingClientRect().width)
      if (width > 0) setSlideWidth(width)
    }

    measure()
    const rafId = requestAnimationFrame(measure)
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => {
      cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [slides.length])

  const finishDrag = useCallback(
    (clientX: number) => {
      if (dragStartXRef.current == null) return

      const dx = clientX - dragStartXRef.current
      dragStartXRef.current = null
      setIsDragging(false)
      setDragOffset(0)

      const threshold = slideWidth > 0 ? Math.min(SWIPE_COMMIT_PX, slideWidth * 0.2) : SWIPE_COMMIT_PX
      let next = dragStartIndexRef.current
      if (dx < -threshold) next += 1
      else if (dx > threshold) next -= 1
      goToIndex(next)
    },
    [goToIndex, slideWidth],
  )

  const translateX =
    slideWidth > 0
      ? -(isDragging ? dragStartIndexRef.current : active) * slideWidth + (isDragging ? dragOffset : 0)
      : 0

  if (isResolving || slides.length === 0) {
    return (
      <section className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden bg-light">
        {isResolving ? null : (
          <p className="m-0 text-bodyRegular2 text-subtleText">상품 이미지 없음</p>
        )}
      </section>
    )
  }

  return (
    <section className="relative aspect-[4/5] w-full overflow-hidden bg-light">
      <div
        ref={viewportRef}
        className={`product-multicut-viewport relative h-full w-full touch-pan-y overflow-hidden ${
          canSwipe ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
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
          className={`flex h-full ${isDragging ? '' : 'transition-transform duration-300 ease-out motion-reduce:transition-none'}`}
          style={{
            width: slideWidth > 0 ? slideWidth * slides.length : '100%',
            transform: slideWidth > 0 ? `translate3d(${translateX}px, 0, 0)` : undefined,
          }}
        >
          {slides.map((slide, slideIndex) => (
            <article
              key={slide.image}
              className="box-border flex h-full shrink-0 items-center justify-center overflow-hidden bg-light"
              style={{ width: slideWidth > 0 ? slideWidth : '100%' }}
              aria-hidden={slideIndex !== active && !isDragging}
            >
              <AdaptiveProductImage
                src={slide.image}
                alt={slide.variant === 'square' ? `${productTitle} 누끼컷` : `${productTitle} 화보컷`}
                baseClassName="pointer-events-none select-none"
                containClassName={PRODUCT_CUT_CONTAIN_CLASS}
                portraitClassName={PRODUCT_CUT_PORTRAIT_CLASS}
                draggable={false}
                loading={slideIndex === 0 ? 'eager' : 'lazy'}
              />
            </article>
          ))}
        </div>
      </div>

      {canSwipe ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex items-center justify-center gap-1.5"
          role="tablist"
          aria-label="상품 이미지 슬라이드"
        >
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`이미지 ${i + 1}`}
              className={`pointer-events-auto size-1.5 shrink-0 rounded-full transition-colors ${
                i === active ? 'bg-dark' : 'bg-gray'
              }`}
              onClick={() => goToIndex(i)}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
