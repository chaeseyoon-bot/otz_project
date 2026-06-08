import { useMemo, useState } from 'react'
import { StarRatingIcon } from '../atoms/StarRatingIcon'
import {
  DEMO_PRODUCT_REVIEWS,
  DEMO_PRODUCT_REVIEW_SUMMARY,
  REVIEW_FILTER_OPTIONS,
  REVIEW_SORT_OPTIONS,
  type ProductReviewItem,
} from '../../data/productReviews'
import { figmaAsset } from '../../lib/figmaAssetUrl'

const iconChevronDown = figmaAsset('icons/list_chevron.svg')
const iconSearch = figmaAsset('icons/gnb_search.svg')

interface ProductDetailPcReviewSectionProps {
  photoUrls?: string[]
  reviewCount?: number
}

function RatingDistributionBar({ count, maxCount }: { count: number; maxCount: number }) {
  const widthPercent = maxCount > 0 ? (count / maxCount) * 100 : 0

  return (
    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-lightGray">
      <div
        className="h-full rounded-full bg-dark transition-[width] duration-200"
        style={{ width: `${widthPercent}%` }}
      />
    </div>
  )
}

function ReviewStars({ rating, className = 'size-3' }: { rating: number; className?: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`별점 ${rating}점`}>
      {Array.from({ length: 5 }, (_, index) => (
        <StarRatingIcon
          key={index}
          className={`${className} shrink-0 ${index < rating ? 'text-dark' : 'text-lightGray'}`}
        />
      ))}
    </div>
  )
}

function ReviewFilterChip({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex shrink-0 items-center gap-1 rounded-sm border border-lightGray bg-white px-3 py-2 text-bodySmall text-dark"
    >
      {label}
      <img src={iconChevronDown} alt="" aria-hidden className="size-3 object-contain opacity-60" draggable={false} />
    </button>
  )
}

function ReviewActionButton({
  label,
  icon,
}: {
  label: string
  icon: 'report' | 'helpful' | 'not-helpful'
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 border-0 bg-transparent p-0 text-bodySmall text-subtleText"
    >
      {icon === 'report' ? (
        <svg viewBox="0 0 16 16" aria-hidden className="size-4 shrink-0">
          <path
            d="M8 1.5 2 4v4.5c0 3.1 2.6 5.5 6 6.5 3.4-1 6-3.4 6-6.5V4L8 1.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path d="M8 5.5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ) : icon === 'helpful' ? (
        <svg viewBox="0 0 16 16" aria-hidden className="size-4 shrink-0">
          <path
            d="M4.5 7.5V14h-2V7.5h2Zm3 0 2.2-4.1c.3-.6 1-.9 1.7-.7.8.2 1.3 1 1.1 1.8l-.7 2.5h2.7c1 0 1.7.9 1.5 1.9l-.8 3.9c-.1.6-.7 1.1-1.3 1.1H7.5V7.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" aria-hidden className="size-4 shrink-0">
          <path
            d="M11.5 8.5V2h2v6.5h-2Zm-3 0-2.2 4.1c-.3.6-1 .9-1.7.7-.8-.2-1.3-1-1.1-1.8l.7-2.5H2.5c-1 0-1.7-.9-1.5-1.9l.8-3.9c.1-.6.7-1.1 1.3-1.1H8.5v6.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {label}
    </button>
  )
}

function ProductReviewCard({ review }: { review: ProductReviewItem }) {
  return (
    <article className="border-b border-lightGray py-8">
      <div className="flex items-start justify-between gap-4">
        <span className="text-bodyBold3 text-dark">{review.author}</span>
        <time className="shrink-0 text-bodySmall text-subtleText">{review.date}</time>
      </div>

      <p className="mt-2 m-0 inline-flex rounded-sm bg-light px-2 py-1 text-bodySmall text-textDefault">
        {review.optionLabel}
      </p>

      <div className="mt-3">
        <ReviewStars rating={review.rating} />
      </div>

      <p className="mt-3 m-0 whitespace-pre-line text-bodyRegular2 text-dark">{review.content}</p>

      {review.photoUrls?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {review.photoUrls.map((url) => (
            <div key={url} className="size-20 overflow-hidden rounded-sm bg-light">
              <img src={url} alt="" className="size-full object-cover" draggable={false} loading="lazy" />
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <ReviewActionButton label="신고 및 차단" icon="report" />
        <ReviewActionButton label="도움돼요" icon="helpful" />
        <ReviewActionButton label="도움안돼요" icon="not-helpful" />
      </div>
    </article>
  )
}

/** EQL-style PC product review tab — rating summary, media gallery, filters, review list. */
export function ProductDetailPcReviewSection({
  photoUrls = [],
  reviewCount = DEMO_PRODUCT_REVIEW_SUMMARY.totalCount,
}: ProductDetailPcReviewSectionProps) {
  const [sortOpen, setSortOpen] = useState(false)
  const [selectedSort, setSelectedSort] = useState<(typeof REVIEW_SORT_OPTIONS)[number]>('최신순')
  const [photoFirst, setPhotoFirst] = useState(false)

  const summary = DEMO_PRODUCT_REVIEW_SUMMARY
  const maxDistributionCount = useMemo(
    () => Math.max(...summary.distribution.map((item) => item.count), 1),
    [summary.distribution],
  )

  const galleryPhotos = photoUrls.slice(0, 6)
  const reviews = DEMO_PRODUCT_REVIEWS

  return (
    <section className="mt-10">
      <h2 className="m-0 text-bodyBold1 text-dark">리뷰</h2>

      <div className="mt-4 flex overflow-hidden rounded-sm border border-lightGray">
        <div className="flex w-[220px] shrink-0 flex-col items-center justify-center gap-2 border-r border-lightGray px-6 py-10">
          <div className="flex items-center gap-1.5">
            <StarRatingIcon className="size-7 text-dark" />
            <span className="text-[32px] font-bold leading-none tracking-[-0.02em] text-dark">
              {summary.averageRating.toFixed(1)}
            </span>
          </div>
          <p className="m-0 text-bodySmall text-subtleText">리뷰 {reviewCount.toLocaleString('ko-KR')}개</p>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 px-8 py-8">
          {summary.distribution.map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <span className="w-16 shrink-0 text-bodySmall text-textDefault">{item.label}</span>
              <RatingDistributionBar count={item.count} maxCount={maxDistributionCount} />
              <span className="w-6 shrink-0 text-right text-bodySmall text-subtleText">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {galleryPhotos.length > 0 ? (
        <div className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <h3 className="m-0 text-bodyBold3 text-dark">포토&amp;동영상</h3>
            <button
              type="button"
              className="border-0 bg-transparent p-0 text-bodySmall text-subtleText underline decoration-solid underline-offset-2"
            >
              전체보기 &gt;
            </button>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {galleryPhotos.map((url) => (
              <div key={url} className="size-[88px] shrink-0 overflow-hidden rounded-sm bg-light">
                <img src={url} alt="" className="size-full object-cover mix-blend-multiply" draggable={false} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-8 border-t border-lightGray pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-1 border-0 bg-transparent p-0 text-bodyRegular2 text-dark"
              aria-expanded={sortOpen}
              onClick={() => setSortOpen((open) => !open)}
            >
              {selectedSort}
              <img
                src={iconChevronDown}
                alt=""
                aria-hidden
                className={`size-4 object-contain transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`}
                draggable={false}
              />
            </button>
            {sortOpen ? (
              <div className="absolute left-0 top-full z-10 mt-2 min-w-[120px] overflow-hidden rounded-sm border border-lightGray bg-white py-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                {REVIEW_SORT_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`flex w-full border-0 bg-transparent px-4 py-2 text-left text-bodySmall ${
                      option === selectedSort ? 'font-medium text-dark' : 'text-textDefault'
                    }`}
                    onClick={() => {
                      setSelectedSort(option)
                      setSortOpen(false)
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="sr-only"
                checked={photoFirst}
                onChange={(event) => setPhotoFirst(event.target.checked)}
              />
              <span
                className={`inline-flex size-4 items-center justify-center rounded-full border ${
                  photoFirst ? 'border-dark bg-dark' : 'border-lightGray bg-white'
                }`}
                aria-hidden
              >
                {photoFirst ? <span className="size-1.5 rounded-full bg-white" /> : null}
              </span>
              <span className="text-bodySmall text-dark">포토/동영상 먼저 보기</span>
            </label>
            <button
              type="button"
              className="inline-flex items-center gap-1 border-0 bg-transparent p-0 text-bodySmall text-dark"
              aria-label="리뷰 검색"
            >
              <img src={iconSearch} alt="" aria-hidden className="size-4 object-contain" draggable={false} />
              검색
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {REVIEW_FILTER_OPTIONS.map((label) => (
            <ReviewFilterChip key={label} label={label} />
          ))}
        </div>
      </div>

      <div className="mt-2">
        {reviews.map((review) => (
          <ProductReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  )
}
