import type { ProductCardItem, ProductMultiCutSlide } from '../components/molecules/ProductCardUnit'
import { shoesProductSlides } from '../lib/shoesAssetUrl'

const BEST_TITLES = [
  '[울블렌드] 베이직 코위찬 니트 집업_MIWCKFV29T',
  '[오찌] 베이직 코워칸 스웨이드 스니커즈',
  '[오찌트립] 베이직 벨벳 스니커즈',
  '로마리 스웨이드 밴딩플랫 메리제인',
  '[토피] 스웨이드 클로그',
  '[3300] 캔버스 스니커즈',
  '[툴레아] 스웨이드 레이스업',
  '[필그림] 첼시 부츠',
] as const

const BEST_PRODUCT_NUMS = [1, 2, 3, 4, 5, 6, 7, 8] as const

function slidesForProduct(productNum: number): ProductMultiCutSlide[] {
  const { primary, secondary } = shoesProductSlides(productNum)
  return [
    { image: primary, variant: 'square' },
    { image: secondary, variant: 'editorial' },
  ]
}

/** Figma 2627:40242 — BEST PLP mock catalog (rank order = array order). */
export function buildBestProducts(): ProductCardItem[] {
  return BEST_PRODUCT_NUMS.map((num, index) => {
    const slides = slidesForProduct(num)
    return {
      id: `best-${num}`,
      title: BEST_TITLES[index % BEST_TITLES.length],
      discountRate: '20%',
      price: '55,900',
      image: slides[0].image,
      multiCutSlides: slides,
      soldOutSizes: num === 4 ? ['225'] : undefined,
    }
  })
}
