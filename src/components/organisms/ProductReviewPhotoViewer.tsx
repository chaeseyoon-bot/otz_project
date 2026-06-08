import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { SCROLL_LOCK_ALLOW_ATTR, useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { StarRatingIcon } from '../atoms/StarRatingIcon'

export interface ProductReviewPhotoViewerReview {
  id: string
  author: string
  content: string
  photoUrl: string
}

export interface ProductReviewPhotoViewerProps {
  open: boolean
  onClose: () => void
  reviews: ProductReviewPhotoViewerReview[]
  initialReviewId: string | null
  productTitle: string
  productThumbnailUrl: string
  averageRating: number
  reviewCount: number
  galleryPhotoUrls: string[]
}

const SWIPE_THRESHOLD_PX = 48

function CloseIcon({ className = 'size-6' }: { className?: string }) {
  return (
    <span className={`relative block ${className}`} aria-hidden>
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 rotate-45 bg-white" />
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 -rotate-45 bg-white" />
    </span>
  )
}

function ZoomIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className="size-5 shrink-0">
      <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13 13l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M8.5 6v5M6 8.5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

/** EQL-style MO PDP review photo fullscreen viewer with swipe-up detail sheet. */
export function ProductReviewPhotoViewer({
  open,
  onClose,
  reviews,
  initialReviewId,
  productTitle,
  productThumbnailUrl,
  averageRating,
  reviewCount,
  galleryPhotoUrls,
}: ProductReviewPhotoViewerProps) {
  const [entered, setEntered] = useState(false)
  const [sheetExpanded, setSheetExpanded] = useState(false)
  const [bodyViewOpen, setBodyViewOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const touchStartYRef = useRef(0)

  useLockBodyScroll(open)

  const safeReviews = useMemo(() => reviews.filter((review) => review.photoUrl), [reviews])

  const activeReview = safeReviews[activeIndex]

  useEffect(() => {
    if (!open) {
      setEntered(false)
      setSheetExpanded(false)
      setBodyViewOpen(false)
      return
    }

    const initialIndex = initialReviewId
      ? safeReviews.findIndex((review) => review.id === initialReviewId)
      : 0
    setActiveIndex(initialIndex >= 0 ? initialIndex : 0)

    const frame = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [open, initialReviewId, safeReviews])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const goToPrevious = useCallback(() => {
    setActiveIndex((index) => Math.max(0, index - 1))
    setBodyViewOpen(false)
  }, [])

  const goToNext = useCallback(() => {
    setActiveIndex((index) => Math.min(safeReviews.length - 1, index + 1))
    setBodyViewOpen(false)
  }, [safeReviews.length])

  const goToReviewByPhoto = useCallback(
    (photoUrl: string) => {
      const index = safeReviews.findIndex((review) => review.photoUrl === photoUrl)
      if (index >= 0) {
        setActiveIndex(index)
        setBodyViewOpen(false)
      }
    },
    [safeReviews],
  )

  const handleSheetTouchStart = (event: React.TouchEvent) => {
    touchStartYRef.current = event.touches[0]?.clientY ?? 0
  }

  const handleSheetTouchEnd = (event: React.TouchEvent) => {
    const endY = event.changedTouches[0]?.clientY ?? touchStartYRef.current
    const deltaY = touchStartYRef.current - endY

    if (deltaY > SWIPE_THRESHOLD_PX) setSheetExpanded(true)
    else if (deltaY < -SWIPE_THRESHOLD_PX) setSheetExpanded(false)
  }

  if (!open || !activeReview) return null

  const hasPrevious = activeIndex > 0
  const hasNext = activeIndex < safeReviews.length - 1

  return createPortal(
    <div
      className={`fixed inset-0 z-[70] flex touch-none flex-col bg-black transition-opacity duration-300 ease-out lg:hidden ${
        entered ? 'opacity-100' : 'opacity-0'
      }`}
      role="presentation"
    >
      <div className="relative flex min-h-0 flex-1 flex-col">
        <img
          src={activeReview.photoUrl}
          alt=""
          className="absolute inset-0 size-full object-contain"
          draggable={false}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/55 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent" />

        <header className="relative z-10 flex items-center justify-between px-4 pb-3 pt-[max(12px,env(safe-area-inset-top,0px))]">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-bodySmall text-white"
            onClick={() => setBodyViewOpen((value) => !value)}
          >
            <ZoomIcon />
            본문보기
          </button>
          <button
            type="button"
            className="flex size-8 items-center justify-center border-0 bg-transparent p-0"
            aria-label="리뷰 사진 닫기"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </header>

        <div className="relative z-10 mt-auto flex items-center justify-between px-4 pb-3">
          <button
            type="button"
            className={`border-0 bg-transparent p-0 text-bodySmall text-white ${hasPrevious ? '' : 'invisible'}`}
            onClick={goToPrevious}
          >
            &lt; 이전 리뷰
          </button>
          <button
            type="button"
            className={`border-0 bg-transparent p-0 text-bodySmall text-white ${hasNext ? '' : 'invisible'}`}
            onClick={goToNext}
          >
            다음 리뷰 &gt;
          </button>
        </div>
      </div>

      <div
        className={`shrink-0 bg-white transition-[max-height] duration-300 ease-out motion-reduce:transition-none ${
          sheetExpanded ? 'max-h-[min(52vh,420px)]' : 'max-h-[108px]'
        }`}
        onTouchStart={handleSheetTouchStart}
        onTouchEnd={handleSheetTouchEnd}
      >
        <button
          type="button"
          className="flex w-full justify-center border-0 bg-transparent px-4 pb-2 pt-3"
          aria-expanded={sheetExpanded}
          aria-label={sheetExpanded ? '리뷰 정보 접기' : '리뷰 정보 펼치기'}
          onClick={() => setSheetExpanded((value) => !value)}
        >
          <span className="h-1 w-10 rounded-full bg-lightGray" aria-hidden />
        </button>

        <div className="flex items-center gap-3 px-4 pb-4">
          <div className="size-12 shrink-0 overflow-hidden rounded-sm border border-lightGray bg-light">
            <img
              src={productThumbnailUrl}
              alt=""
              className="size-full object-cover mix-blend-multiply"
              draggable={false}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-bodySmall text-dark">{productTitle}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <StarRatingIcon className="size-3 shrink-0 text-dark" />
              <span className="text-bodySmall text-dark">{averageRating.toFixed(1)}</span>
              <span className="text-bodySmall text-subtleText">
                리뷰 {reviewCount.toLocaleString('ko-KR')}
              </span>
            </div>
          </div>
        </div>

        {sheetExpanded ? (
          <div
            {...{ [SCROLL_LOCK_ALLOW_ATTR]: true }}
            className="overflow-y-auto border-t border-lightGray px-4 pb-[max(16px,env(safe-area-inset-bottom,0px))] pt-4"
          >
            <h3 className="m-0 text-bodyBold3 text-dark">이 상품의 다른 포토 &amp; 동영상 리뷰</h3>
            <div className="mt-3 flex gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {galleryPhotoUrls.map((url) => {
                const isActive = url === activeReview.photoUrl
                return (
                  <button
                    key={url}
                    type="button"
                    className={`size-[72px] shrink-0 overflow-hidden rounded-sm border bg-light ${
                      isActive ? 'border-dark' : 'border-lightGray'
                    }`}
                    onClick={() => goToReviewByPhoto(url)}
                  >
                    <img
                      src={url}
                      alt=""
                      className="size-full object-cover mix-blend-multiply"
                      draggable={false}
                    />
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>

      {bodyViewOpen ? (
        <div
          className="absolute inset-0 z-20 flex flex-col bg-black/80 px-4 pb-[max(16px,env(safe-area-inset-bottom,0px))] pt-[max(56px,env(safe-area-inset-top,0px))]"
          role="dialog"
          aria-modal="true"
          aria-label="리뷰 본문"
        >
          <div
            {...{ [SCROLL_LOCK_ALLOW_ATTR]: true }}
            className="min-h-0 flex-1 overflow-y-auto"
          >
            <p className="m-0 text-bodyBold3 text-white">{activeReview.author}</p>
            <p className="mt-4 m-0 whitespace-pre-line text-bodyRegular2 text-white/90">
              {activeReview.content}
            </p>
          </div>
          <button
            type="button"
            className="mt-4 shrink-0 border-0 bg-transparent p-0 text-bodySmall text-white underline underline-offset-2"
            onClick={() => setBodyViewOpen(false)}
          >
            사진으로 돌아가기
          </button>
        </div>
      ) : null}
    </div>,
    document.body,
  )
}
