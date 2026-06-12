import type { ProductCardItem } from '../components/molecules/ProductCardUnit'
import type { CartItem } from '../data/cartContent'

export function parseProductPrice(price: string): number {
  return Number(price.replace(/,/g, '')) || 0
}

function resolveCartThumbnailImage(product: ProductCardItem): string {
  const squareSlide = product.multiCutSlides?.find((slide) => slide.variant === 'square')
  return squareSlide?.image ?? product.image
}

export function buildCartItemFromProduct(
  product: ProductCardItem,
  options: {
    size: string
    productName?: string
    price?: string
  },
): CartItem {
  const price = parseProductPrice(options.price ?? product.price)
  const shippingFee = price >= 50_000 ? 0 : 2_500

  return {
    id: `${product.id}-${options.size}`,
    productName: options.productName ?? product.title,
    price,
    quantity: 1,
    optionLabel: `[옵션 : ${options.size}]`,
    image: resolveCartThumbnailImage(product),
    shippingLabel: shippingFee === 0 ? '배송 : [무료] / 기본배송' : '배송 : [유료] / 기본배송',
    selected: true,
    shippingBreakdown: {
      label: '[개별배송]',
      productAmount: price,
      shippingFee,
      regionalShippingFee: 0,
      total: price + shippingFee,
    },
  }
}
