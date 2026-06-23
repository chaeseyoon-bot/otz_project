import type { ProductCardItem, ProductMultiCutSlide } from '../components/molecules/ProductCardUnit'
import type { FilterPcShoeSize } from './categoryFilterOptions'
import type { CategoryFilterableProduct } from '../lib/categoryProductFilter'
import { shoesProductSlides } from '../lib/shoesAssetUrl'

export type CategoryShoeProduct = ProductCardItem & CategoryFilterableProduct

/** Product indices with `detail_XX_03_big` / `07_big` on Supabase `product_images` bucket. */
export const SHOES_PRODUCT_NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] as const

/** Demo filter facets per PLP card (until API-backed catalog). */
const SHOE_FILTER_META: Record<
  (typeof SHOES_PRODUCT_NUMS)[number],
  { filterSizes: FilterPcShoeSize[]; filterColors: string[]; freeShipping: boolean }
> = {
  1: { filterSizes: ['240', '245'], filterColors: ['beige', 'brown'], freeShipping: true },
  2: { filterSizes: ['235', '240'], filterColors: ['white', 'grey'], freeShipping: true },
  3: { filterSizes: ['225', '230', '235'], filterColors: ['brown', 'pink'], freeShipping: false },
  4: { filterSizes: ['250', '255'], filterColors: ['black', 'grey'], freeShipping: false },
  5: { filterSizes: ['240', '245', '250'], filterColors: ['navy', 'blue'], freeShipping: true },
  6: { filterSizes: ['255', '260'], filterColors: ['green', 'brown'], freeShipping: true },
  7: { filterSizes: ['250', '260'], filterColors: ['black', 'brown'], freeShipping: false },
  8: { filterSizes: ['220', '225'], filterColors: ['pink', 'purple'], freeShipping: true },
  9: { filterSizes: ['230', '235', '240'], filterColors: ['yellow', 'orange'], freeShipping: true },
  10: { filterSizes: ['245', '250'], filterColors: ['stripe', 'white'], freeShipping: false },
  11: { filterSizes: ['255', '260'], filterColors: ['grey', 'black'], freeShipping: true },
  12: { filterSizes: ['255', '260'], filterColors: ['blue', 'navy'], freeShipping: false },
  13: { filterSizes: ['260', 'FREE'], filterColors: ['etc', 'green'], freeShipping: true },
  14: { filterSizes: ['240', '250', '260'], filterColors: ['brown', 'green'], freeShipping: true },
  15: { filterSizes: ['235', '245'], filterColors: ['yellow', 'beige'], freeShipping: false },
  16: { filterSizes: ['220', '230', '240'], filterColors: ['orange', 'pink'], freeShipping: true },
  17: { filterSizes: ['250', '255', '260'], filterColors: ['green', 'blue'], freeShipping: true },
  18: { filterSizes: ['245', '255', '260'], filterColors: ['yellow', 'brown'], freeShipping: false },
}

const SAMPLE_TITLES = [
  '[오찌] 베이직 코워칸 스웨이드 스니커즈',
  '[오찌트립] 베이직 벨벳 스니커즈',
  '로마리 스웨이드 밴딩플랫 메리제인',
  '[토피] 스웨이드 클로그',
  '[3300] 캔버스 스니커즈',
  '[툴레아] 스웨이드 레이스업',
  '[필그림] 첼시 부츠',
  '[말리부] 스트랩 샌들',
  '[피스모] 슬라이드',
  '[벌루니] 플랫 로퍼',
  '[머피스] 컴포트 슈즈',
  '[비들] 레인부츠',
  '[콜터빌] 젤리 슈즈',
  '[오찌] 울트라 라이트 러닝화',
  '[오찌x우무] 벨벳 메리제인',
  '[오찌x로파서울] 스웨이드 스니커즈',
  '[오찌] 데일리 스니커즈',
  '[오찌] 클래식 로퍼',
] as const

function slidesForProduct(productNum: number): ProductMultiCutSlide[] {
  const { primary, secondary } = shoesProductSlides(productNum)
  return [
    { image: primary, variant: 'square' },
    { image: secondary, variant: 'editorial' },
  ]
}

export function buildShoesCategoryProducts(): CategoryShoeProduct[] {
  return SHOES_PRODUCT_NUMS.map((num, index) => {
    const slides = slidesForProduct(num)
    const soldOut = num === 4 || num === 8
    const meta = SHOE_FILTER_META[num]

    return {
      id: `shoes-${num}`,
      title: SAMPLE_TITLES[index % SAMPLE_TITLES.length],
      discountRate: '20%',
      price: '55,900',
      originalPrice: '69,900',
      image: slides[0].image,
      multiCutSlides: slides,
      badges: soldOut ? [{ id: 'sold-out', label: '품절' }] : undefined,
      soldOutSizes: soldOut ? undefined : ['225', '240'],
      filterSizes: meta.filterSizes,
      filterColors: meta.filterColors,
      freeShipping: meta.freeShipping,
      soldOut,
    }
  })
}
