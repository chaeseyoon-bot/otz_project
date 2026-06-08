import { StarRatingIcon } from '../atoms/StarRatingIcon'

export interface ProductDetailReviewSummaryProps {
  reviewCount: number
  maxRating?: number
  onViewReviews?: () => void
  className?: string
}

/** Figma PDP — title / price 사이 별점 + 리뷰 링크. */
export function ProductDetailReviewSummary({
  reviewCount,
  maxRating = 5,
  onViewReviews,
  className = '',
}: ProductDetailReviewSummaryProps) {
  return (
    <div className={`mt-2 flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-0.5" aria-label={`별점 ${maxRating}점`}>
        {Array.from({ length: maxRating }, (_, index) => (
          <StarRatingIcon key={index} className="size-3 shrink-0 text-dark" />
        ))}
      </div>
      <button
        type="button"
        className="border-0 bg-transparent p-0 text-bodySmall text-dark underline decoration-solid underline-offset-2"
        onClick={onViewReviews}
      >
        {reviewCount.toLocaleString('ko-KR')}개 리뷰 보기
      </button>
    </div>
  )
}
