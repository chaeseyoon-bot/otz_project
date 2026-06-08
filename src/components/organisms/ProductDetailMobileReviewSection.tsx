import { useEffect, useMemo, useState } from 'react'
import { StarRatingIcon } from '../atoms/StarRatingIcon'
import {
  DEMO_BUYER_ATTRIBUTE_EVALUATIONS,
  DEMO_PRODUCT_REVIEWS,
  DEMO_PRODUCT_REVIEW_SUMMARY,
  MOBILE_REVIEW_SIZE_FILTERS,
  REVIEW_FILTER_OPTIONS,
  REVIEW_SORT_OPTIONS,
  assignReviewRepresentativePhotos,
  prioritizeReviewsWithPhotos,
  sortProductReviews,
  type ProductReviewAttributeEvaluation,
  type ProductReviewItem,
} from '../../data/productReviews'
import { figmaAsset } from '../../lib/figmaAssetUrl'
import { ProductReviewPhotoViewer } from './ProductReviewPhotoViewer'

const iconChevronDown = figmaAsset('icons/list_chevron.svg')
const iconSearch = figmaAsset('icons/gnb_search.svg')

/** Figma 2978:20399 — MO PDP review list page size. */
const MO_PDP_REVIEW_PAGE_SIZE = 5

interface ProductDetailMobileReviewSectionProps {
  photoUrls?: string[]
  reviewCount?: number
  productTitle?: string
  productThumbnailUrl?: string
  averageRating?: number
  /** Shoes show size filter tabs; bag/acc (FREE only) hide them. */
  isShoesProduct?: boolean
}

function AttributePercentBar({ percent }: { percent: number }) {
  return (
    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-lightGray">
      <div
        className="h-full rounded-full bg-dark transition-[width] duration-200"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

function BuyerAttributeCard({ evaluation }: { evaluation: ProductReviewAttributeEvaluation }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="overflow-hidden rounded-sm border border-lightGray bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between border-0 bg-white px-4 py-4"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="text-bodyBold3 text-dark">{evaluation.title}</span>
        <img
          src={iconChevronDown}
          alt=""
          aria-hidden
          className={`size-4 object-contain transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          draggable={false}
        />
      </button>
      {open ? (
        <div className="flex flex-col gap-3 border-t border-lightGray px-4 pb-4 pt-3">
          {evaluation.options.map((option) => (
            <div key={option.label} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-bodySmall text-textDefault">{option.label}</span>
              <AttributePercentBar percent={option.percent} />
              <span className="w-9 shrink-0 text-right text-bodySmall text-subtleText">{option.percent}%</span>
            </div>
          ))}
        </div>
      ) : null}
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

function ReviewAttributeTag({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-light px-2.5 py-1.5 text-bodySmall text-subtleText">
      <span>{label}</span>
      <span className="font-medium text-dark">{value}</span>
    </span>
  )
}

function ProductReviewCard({
  review,
  representativePhotoUrl,
  onPhotoClick,
}: {
  review: ProductReviewItem
  representativePhotoUrl?: string
  onPhotoClick?: (reviewId: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const hasAttributeEvaluations =
    review.sizeEvaluation != null || review.colorEvaluation != null

  return (
    <article className="border-b border-lightGray py-6">
      <div className="flex items-start justify-between gap-4">
        <span className="text-bodyBold3 text-dark">{review.author}</span>
        <time className="shrink-0 text-bodySmall text-subtleText">{review.date}</time>
      </div>

      <p className="mt-2 m-0 inline-flex flex-wrap items-center gap-1.5 text-bodySmall text-subtleText">
        {review.usualSize ? (
          <>
            <span>평소사이즈 {review.usualSize}</span>
            <span className="inline-block h-3 w-px shrink-0 bg-lightGray" aria-hidden />
          </>
        ) : null}
        <span>{review.optionLabel}</span>
      </p>

      <div className="mt-3">
        <ReviewStars rating={review.rating} />
      </div>

      <p className="mt-3 m-0 whitespace-pre-line text-bodyRegular2 text-dark">{review.content}</p>

      {hasAttributeEvaluations ? (
        <>
          {expanded ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {review.sizeEvaluation ? (
                <ReviewAttributeTag label="사이즈" value={review.sizeEvaluation} />
              ) : null}
              {review.colorEvaluation ? (
                <ReviewAttributeTag label="색상" value={review.colorEvaluation} />
              ) : null}
            </div>
          ) : null}
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              className="border-0 bg-transparent p-0 text-bodySmall text-subtleText underline underline-offset-2"
              aria-expanded={expanded}
              onClick={() => setExpanded((open) => !open)}
            >
              {expanded ? '리뷰 접기' : '리뷰 더보기'}
            </button>
          </div>
        </>
      ) : null}

      {representativePhotoUrl ? (
        <button
          type="button"
          className="mt-4 block size-[140px] cursor-pointer overflow-hidden rounded-sm border border-lightGray bg-light p-0"
          aria-label="리뷰 사진 크게 보기"
          onClick={() => onPhotoClick?.(review.id)}
        >
          <img
            src={representativePhotoUrl}
            alt=""
            className="size-full object-cover mix-blend-multiply"
            draggable={false}
            loading="lazy"
          />
        </button>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <ReviewActionButton label="신고 및 차단" icon="report" />
        <ReviewActionButton label="도움돼요" icon="helpful" />
        <ReviewActionButton label="도움안돼요" icon="not-helpful" />
      </div>
    </article>
  )
}

/** EQL mobile-style product review tab. */
export function ProductDetailMobileReviewSection({
  photoUrls = [],
  reviewCount = DEMO_PRODUCT_REVIEW_SUMMARY.totalCount,
  productTitle = '',
  productThumbnailUrl = '',
  averageRating = DEMO_PRODUCT_REVIEW_SUMMARY.averageRating,
  isShoesProduct = true,
}: ProductDetailMobileReviewSectionProps) {
  const [selectedSizeFilter, setSelectedSizeFilter] =
    useState<(typeof MOBILE_REVIEW_SIZE_FILTERS)[number]>('전체')
  const [sortOpen, setSortOpen] = useState(false)
  const [selectedSort, setSelectedSort] = useState<(typeof REVIEW_SORT_OPTIONS)[number]>('최신순')
  const [photoFirst, setPhotoFirst] = useState(false)
  const [visibleReviewCount, setVisibleReviewCount] = useState(MO_PDP_REVIEW_PAGE_SIZE)
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false)
  const [photoViewerReviewId, setPhotoViewerReviewId] = useState<string | null>(null)

  const summary = DEMO_PRODUCT_REVIEW_SUMMARY
  const maxDistributionCount = useMemo(
    () => Math.max(...summary.distribution.map((item) => item.count), 1),
    [summary.distribution],
  )

  const galleryPhotos = useMemo(() => {
    const sortedReviews = sortProductReviews(DEMO_PRODUCT_REVIEWS, selectedSort)
    const reviewsWithPhotos = assignReviewRepresentativePhotos(sortedReviews, photoUrls)
    const mappedPhotos = reviewsWithPhotos
      .map((review) => review.representativePhotoUrl)
      .filter((url): url is string => Boolean(url))

    return mappedPhotos.length > 0 ? mappedPhotos.slice(0, 6) : photoUrls.slice(0, 6)
  }, [photoUrls, selectedSort])

  const displayReviews = useMemo(() => {
    const sortedReviews = sortProductReviews(DEMO_PRODUCT_REVIEWS, selectedSort)
    const reviewsWithPhotos = assignReviewRepresentativePhotos(sortedReviews, photoUrls)
    return photoFirst ? prioritizeReviewsWithPhotos(reviewsWithPhotos) : reviewsWithPhotos
  }, [photoFirst, photoUrls, selectedSort])

  const visibleReviews = displayReviews.slice(0, visibleReviewCount)
  const hasMoreReviews = visibleReviewCount < displayReviews.length

  useEffect(() => {
    setVisibleReviewCount(MO_PDP_REVIEW_PAGE_SIZE)
  }, [selectedSort, photoFirst, selectedSizeFilter])

  const photoViewerReviews = useMemo(
    () =>
      displayReviews
        .filter((review) => review.representativePhotoUrl)
        .map((review) => ({
          id: review.id,
          author: review.author,
          content: review.content,
          photoUrl: review.representativePhotoUrl!,
        })),
    [displayReviews],
  )

  const openPhotoViewer = (reviewId: string) => {
    setPhotoViewerReviewId(reviewId)
    setPhotoViewerOpen(true)
  }

  const closePhotoViewer = () => {
    setPhotoViewerOpen(false)
    setPhotoViewerReviewId(null)
  }

  return (
    <section className="px-[15px] pb-10 pt-6">
      <h2 className="m-0 text-bodyBold1 text-dark">상품 리뷰</h2>
      <p className="mt-2 m-0 text-bodySmall text-subtleText">
        나와 같은 구매자들이 이 상품에 대해 어떤 평가를 했는지 알아보세요.
      </p>

      {isShoesProduct ? (
        <div className="mt-5 -mx-[15px] overflow-x-auto border-b border-lightGray px-[15px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max min-w-full gap-5">
            {MOBILE_REVIEW_SIZE_FILTERS.map((size) => {
              const active = size === selectedSizeFilter
              return (
                <button
                  key={size}
                  type="button"
                  className={`shrink-0 border-0 bg-transparent px-0 pb-3 text-bodySmall ${
                    active
                      ? 'border-b-2 border-dark font-medium text-dark'
                      : 'border-b border-transparent text-subtleText'
                  }`}
                  onClick={() => setSelectedSizeFilter(size)}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-8">
        <h3 className="m-0 text-bodyBold3 text-dark">전체 구매자들은 이렇게 평가했어요.</h3>
        <div className="mt-4 flex flex-col gap-3">
          {DEMO_BUYER_ATTRIBUTE_EVALUATIONS.map((evaluation) => (
            <BuyerAttributeCard key={evaluation.id} evaluation={evaluation} />
          ))}
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-bodyBold3 text-dark">
            리뷰 ({reviewCount.toLocaleString('ko-KR')})
          </h3>
          <ReviewStars rating={Math.round(summary.averageRating)} className="size-3.5" />
        </div>

        <div className="mt-4 overflow-hidden rounded-sm border border-lightGray">
          <div className="flex flex-col gap-3 px-4 py-5">
            {summary.distribution.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-bodySmall text-textDefault">{item.label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-lightGray">
                  <div
                    className="h-full rounded-full bg-dark"
                    style={{ width: `${maxDistributionCount > 0 ? (item.count / maxDistributionCount) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-bodySmall text-subtleText">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {galleryPhotos.length > 0 ? (
        <div className="mt-8">
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
              <div key={url} className="size-[88px] shrink-0 overflow-hidden rounded-sm border border-lightGray bg-light">
                <img src={url} alt="" className="size-full object-cover mix-blend-multiply" draggable={false} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-8 border-t border-lightGray pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
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

          <div className="flex flex-wrap items-center gap-3">
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

        <div className="mt-4 flex gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {REVIEW_FILTER_OPTIONS.map((label) => (
            <ReviewFilterChip key={label} label={label} />
          ))}
        </div>
      </div>

      <div className="mt-2">
        {visibleReviews.map((review) => (
          <ProductReviewCard
            key={review.id}
            review={review}
            representativePhotoUrl={review.representativePhotoUrl}
            onPhotoClick={openPhotoViewer}
          />
        ))}
      </div>

      <ProductReviewPhotoViewer
        open={photoViewerOpen}
        onClose={closePhotoViewer}
        reviews={photoViewerReviews}
        initialReviewId={photoViewerReviewId}
        productTitle={productTitle}
        productThumbnailUrl={productThumbnailUrl || photoUrls[0] || ''}
        averageRating={averageRating}
        reviewCount={reviewCount}
        galleryPhotoUrls={galleryPhotos}
      />

      {hasMoreReviews ? (
        <button
          type="button"
          className="mt-8 flex w-full items-center justify-center gap-1 rounded-sm border border-dark bg-white px-6 py-4"
          onClick={() =>
            setVisibleReviewCount((count) => count + MO_PDP_REVIEW_PAGE_SIZE)
          }
        >
          <span className="text-bodyRegular2 text-dark">
            상품 리뷰 전체보기 ({reviewCount.toLocaleString('ko-KR')})
          </span>
          <span className="text-bodyRegular2 text-dark" aria-hidden>
            &gt;
          </span>
        </button>
      ) : null}
    </section>
  )
}
