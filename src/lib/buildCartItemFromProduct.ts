import type { ProductCardItem } from '../components/molecules/ProductCardUnit'
import type { CartItem } from '../data/cartContent'

export function parseProductPrice(price: string): number {
  return Number(price.replace(/,/g, '')) || 0
}

/** Resolve catalog id from cart line (supports legacy rows without `productId`). */
export function getProductIdFromCartItem(item: CartItem): string | null {
  if (item.productId) return item.productId

  const sizeMatch = item.optionLabel.match(/:\s*([^\]]+)\]/)
  const size = sizeMatch?.[1]?.trim()
  if (!size) return null

  const suffix = `-${size}`
  if (!item.id.endsWith(suffix)) return null

  const productId = item.id.slice(0, -suffix.length)
  return productId || null
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
    productId: product.id,
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

/** Select only the buy-now line for checkout while keeping other cart rows. */
export function applyBuyNowSelection(current: CartItem[], buyNowItem: CartItem): CartItem[] {
  const deselected = current.map((entry) => ({ ...entry, selected: false }))
  const existingIndex = deselected.findIndex((entry) => entry.id === buyNowItem.id)

  if (existingIndex >= 0) {
    return deselected.map((entry, index) =>
      index === existingIndex ? { ...buyNowItem, selected: true } : entry,
    )
  }

  return [...deselected, buyNowItem]
}
