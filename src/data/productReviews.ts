export interface ProductReviewRatingDistribution {
  label: string
  count: number
}

export type ReviewSizeEvaluation = '적당해요' | '커요' | '작아요'

export type ReviewColorEvaluation = '화면과 같아요' | '화면보다 어두워요' | '화면보다 밝아요'

export interface ProductReviewItem {
  id: string
  author: string
  date: string
  /** e.g. "230", "XS" */
  usualSize?: string
  optionLabel: string
  rating: number
  content: string
  sizeEvaluation?: ReviewSizeEvaluation
  colorEvaluation?: ReviewColorEvaluation
  photoUrls?: string[]
  helpfulCount?: number
  notHelpfulCount?: number
}

export interface ProductReviewSummary {
  averageRating: number
  totalCount: number
  distribution: ProductReviewRatingDistribution[]
}

export const DEMO_PRODUCT_REVIEW_SUMMARY: ProductReviewSummary = {
  averageRating: 5.0,
  totalCount: 39,
  distribution: [
    { label: '아주 좋아요', count: 38 },
    { label: '맘에 들어요', count: 1 },
    { label: '보통이에요', count: 0 },
    { label: '그냥 그래요', count: 0 },
    { label: '별로예요', count: 0 },
  ],
}

export const DEMO_PRODUCT_REVIEWS: ProductReviewItem[] = [
  {
    id: 'review-1',
    author: '김*수',
    date: '2026. 5. 5.',
    usualSize: '230',
    optionLabel: '상품 옵션 230',
    rating: 5,
    content:
      '발볼이 넓어서 편하고, 디자인도 깔끔해서 데일리로 신기 좋아요. 사이즈는 평소 신는 사이즈 그대로 주문했어요.',
    sizeEvaluation: '적당해요',
    colorEvaluation: '화면과 같아요',
    helpfulCount: 2,
    notHelpfulCount: 0,
  },
  {
    id: 'review-2',
    author: '이*영',
    date: '2026. 4. 28.',
    usualSize: '235',
    optionLabel: '상품 옵션 235',
    rating: 5,
    content: '색감이 사진과 동일하고 착화감이 부드러워요. 배송도 빨랐습니다.',
    sizeEvaluation: '적당해요',
    colorEvaluation: '화면과 같아요',
    helpfulCount: 1,
    notHelpfulCount: 0,
  },
  {
    id: 'review-3',
    author: '박*민',
    date: '2026. 4. 12.',
    usualSize: '240',
    optionLabel: '상품 옵션 240',
    rating: 4,
    content: '전반적으로 만족하지만 처음 신을 때 약간 뻣뻣한 느낌이 있었어요. 며칠 신으니 괜찮아졌습니다.',
    sizeEvaluation: '커요',
    colorEvaluation: '화면보다 어두워요',
    helpfulCount: 0,
    notHelpfulCount: 0,
  },
  {
    id: 'review-4',
    author: '최*진',
    date: '2026. 4. 2.',
    usualSize: '230',
    optionLabel: '상품 옵션 230',
    rating: 5,
    content: '데일리로 신기 좋고 발이 편안해요. 재구매 의사 있습니다.',
    sizeEvaluation: '적당해요',
    colorEvaluation: '화면과 같아요',
  },
  {
    id: 'review-5',
    author: '정*아',
    date: '2026. 3. 20.',
    usualSize: '235',
    optionLabel: '상품 옵션 235',
    rating: 5,
    content: '가격 대비 만족스럽습니다. 사이즈는 평소와 동일하게 주문했어요.',
    sizeEvaluation: '적당해요',
    colorEvaluation: '화면과 같아요',
  },
  {
    id: 'review-6',
    author: '한*우',
    date: '2026. 3. 8.',
    usualSize: '240',
    optionLabel: '상품 옵션 240',
    rating: 5,
    content: '디자인이 깔끔하고 어떤 옷이랑도 잘 어울려요.',
    colorEvaluation: '화면과 같아요',
  },
  {
    id: 'review-7',
    author: '윤*서',
    date: '2026. 2. 25.',
    usualSize: '225',
    optionLabel: '상품 옵션 225',
    rating: 4,
    content: '착화감은 좋은데 처음에는 조금 빡빡한 느낌이 있었습니다.',
    sizeEvaluation: '작아요',
    colorEvaluation: '화면과 같아요',
  },
  {
    id: 'review-8',
    author: '강*훈',
    date: '2026. 2. 10.',
    usualSize: '245',
    optionLabel: '상품 옵션 245',
    rating: 5,
    content: '배송 빠르고 포장도 깔끔했어요. 상품 상태도 좋습니다.',
    sizeEvaluation: '적당해요',
  },
  {
    id: 'review-9',
    author: '조*현',
    date: '2026. 1. 28.',
    usualSize: '230',
    optionLabel: '상품 옵션 230',
    rating: 5,
    content: '오래 신어도 편하고 품질이 좋아 보여요.',
    sizeEvaluation: '적당해요',
    colorEvaluation: '화면과 같아요',
  },
  {
    id: 'review-10',
    author: '임*나',
    date: '2026. 1. 15.',
    usualSize: '235',
    optionLabel: '상품 옵션 235',
    rating: 5,
    content: '선물용으로 구매했는데 받는 분도 만족하셨어요.',
    colorEvaluation: '화면과 같아요',
  },
  {
    id: 'review-11',
    author: '서*연',
    date: '2025. 12. 30.',
    usualSize: '240',
    optionLabel: '상품 옵션 240',
    rating: 4,
    content: '전체적으로 만족합니다. 다음에도 구매할 예정이에요.',
    sizeEvaluation: '적당해요',
    colorEvaluation: '화면보다 밝아요',
  },
]

export const REVIEW_FILTER_OPTIONS = ['별점', '사이즈', '색상 (밝기)', '평소사이즈'] as const

export const REVIEW_SORT_OPTIONS = ['최신순', '별점 높은순', '별점 낮은순'] as const

export type ReviewSortOption = (typeof REVIEW_SORT_OPTIONS)[number]

export function parseReviewDate(value: string): number {
  const parts = value.match(/(\d+)\.\s*(\d+)\.\s*(\d+)/)
  if (!parts) return 0
  const year = Number(parts[1])
  const month = Number(parts[2])
  const day = Number(parts[3])
  return new Date(year, month - 1, day).getTime()
}

export function sortProductReviews(
  reviews: ProductReviewItem[],
  sort: ReviewSortOption,
): ProductReviewItem[] {
  const sorted = [...reviews]

  if (sort === '별점 높은순') {
    sorted.sort(
      (a, b) => b.rating - a.rating || parseReviewDate(b.date) - parseReviewDate(a.date),
    )
  } else if (sort === '별점 낮은순') {
    sorted.sort(
      (a, b) => a.rating - b.rating || parseReviewDate(b.date) - parseReviewDate(a.date),
    )
  } else {
    sorted.sort((a, b) => parseReviewDate(b.date) - parseReviewDate(a.date))
  }

  return sorted
}

export function assignReviewRepresentativePhotos(
  reviews: ProductReviewItem[],
  fallbackPhotoUrls: string[],
): Array<ProductReviewItem & { representativePhotoUrl?: string }> {
  return reviews.map((review, index) => ({
    ...review,
    representativePhotoUrl: review.photoUrls?.[0] ?? fallbackPhotoUrls[index],
  }))
}

export function prioritizeReviewsWithPhotos<T extends { representativePhotoUrl?: string }>(
  reviews: T[],
): T[] {
  const withPhoto = reviews.filter((review) => review.representativePhotoUrl)
  const withoutPhoto = reviews.filter((review) => !review.representativePhotoUrl)
  return [...withPhoto, ...withoutPhoto]
}

export interface ProductReviewAttributeOption {
  label: string
  percent: number
}

export interface ProductReviewAttributeEvaluation {
  id: string
  title: string
  options: ProductReviewAttributeOption[]
}

export const MOBILE_REVIEW_SIZE_FILTERS = [
  '전체',
  '200',
  '205',
  '210',
  '215',
  '220',
  '225',
  '230',
  '235',
  '240',
  '245',
  '250',
  '255',
  '260',
  '265',
  '270',
  '275',
  '280',
  '285',
  '290',
  '295',
  '300',
] as const

export const DEMO_BUYER_ATTRIBUTE_EVALUATIONS: ProductReviewAttributeEvaluation[] = [
  {
    id: 'size',
    title: '사이즈',
    options: [
      { label: '작아요', percent: 0 },
      { label: '적당해요', percent: 33 },
      { label: '커요', percent: 67 },
    ],
  },
  {
    id: 'color',
    title: '색상 (밝기)',
    options: [
      { label: '마음에 들어요', percent: 100 },
      { label: '보통이에요', percent: 0 },
      { label: '기대와 달라요', percent: 0 },
    ],
  },
]
