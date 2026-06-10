import { PRODUCT_CARD_CUTS, productCutUrl } from '../lib/productImage'
import { parseShoesProductNum } from '../lib/productRoutes'

/** Figma g60Jix8lxQjYRzn3l7MNWf node 38:1632 — PDP color chip row. */
export interface PdpColorVariant {
  productId: string
  colorLabel: string
  thumbnailUrl: string
}

interface PdpColorVariantGroupSeed {
  /** Any member product id resolves the full variant list. */
  productIds: string[]
  labels: string[]
}

/**
 * Sample colorway groups until API-backed sibling SKUs exist.
 * Each entry maps to a separate catalog product (`shoes-N`) for PDP navigation demo.
 */
const PDP_COLOR_VARIANT_GROUP_SEEDS: PdpColorVariantGroupSeed[] = [
  {
    productIds: ['shoes-1', 'shoes-2', 'shoes-16', 'shoes-17', 'shoes-18'],
    labels: ['베이지', '화이트', '오렌지', '그린', '옐로우'],
  },
  {
    productIds: ['shoes-8', 'shoes-9', 'shoes-10'],
    labels: ['핑크', '옐로우', '스트라이프'],
  },
  {
    productIds: ['shoes-3', 'shoes-4', 'shoes-5', 'shoes-6', 'shoes-7'],
    labels: ['코코아모브', '블랙', '네이비', '그린', '다크브라운'],
  },
  {
    productIds: ['shoes-11', 'shoes-12', 'shoes-13', 'shoes-14', 'shoes-15'],
    labels: ['다크브라운', '그레이', '블랙', '아이보리', '브라운'],
  },
]

function catalogThumbnail(productId: string): string | undefined {
  const num = parseShoesProductNum(productId)
  if (!num) return undefined
  const folder = num <= 1026 ? 'shoes01' : 'shoes02'
  return productCutUrl(folder, num, PRODUCT_CARD_CUTS.square, 'png')
}

function buildGroup(seed: PdpColorVariantGroupSeed): PdpColorVariant[] {
  return seed.productIds.flatMap((productId, index) => {
    const thumbnailUrl = catalogThumbnail(productId)
    const colorLabel = seed.labels[index]
    if (!thumbnailUrl || !colorLabel) return []
    return [{ productId, colorLabel, thumbnailUrl }]
  })
}

const PDP_COLOR_VARIANT_GROUPS = PDP_COLOR_VARIANT_GROUP_SEEDS.map(buildGroup).filter(
  (group) => group.length > 0,
)

const productIdToVariants = new Map<string, PdpColorVariant[]>()

for (const group of PDP_COLOR_VARIANT_GROUPS) {
  for (const variant of group) {
    productIdToVariants.set(variant.productId, group)
  }
}

/** Returns sibling color variants when `productId` belongs to a sample group. */
export function getPdpColorVariantsForProduct(productId: string): PdpColorVariant[] | null {
  return productIdToVariants.get(productId) ?? null
}
