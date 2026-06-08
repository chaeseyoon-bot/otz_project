import type { CartItem } from './cartContent'
import { DEMO_CART_ITEMS } from './cartContent'
import {
  CHECKOUT_CARD_OPTIONS,
  DEMO_CHECKOUT_SHIPPING,
  type CheckoutPaymentMethodId,
  type CheckoutShippingAddress,
} from './checkoutContent'

export interface CompletedOrderTotals {
  productTotal: number
  couponDiscount: number
  cartCouponDiscount: number
  pointUsed: number
  shippingTotal: number
  baseShippingFee: number
  regionalShippingFee: number
  paymentTotal: number
  earnPoints: number
}

export interface CompletedOrder {
  orderNumber: string
  items: CartItem[]
  shipping: CheckoutShippingAddress
  deliveryRequest: string
  paymentMethodId: CheckoutPaymentMethodId
  cardName: string
  pointUsed: number
  totals: CompletedOrderTotals
  reviewPointsLabel: string
}

export function createOrderNumber(now = new Date()) {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const suffix = String(Math.floor(Math.random() * 900_000) + 100_000)
  return `${y}${m}${d}-${suffix}`
}

export interface BuildCompletedOrderInput {
  items: CartItem[]
  shipping?: CheckoutShippingAddress
  deliveryRequest: string
  paymentMethodId: CheckoutPaymentMethodId
  cardName?: string
  totals: CompletedOrderTotals
  reviewPointsLabel?: string
}

export function buildCompletedOrder({
  items,
  shipping = DEMO_CHECKOUT_SHIPPING,
  deliveryRequest,
  paymentMethodId,
  cardName = CHECKOUT_CARD_OPTIONS[0],
  totals,
  reviewPointsLabel = '최대 4,500원',
}: BuildCompletedOrderInput): CompletedOrder {
  return {
    orderNumber: createOrderNumber(),
    items,
    shipping,
    deliveryRequest,
    paymentMethodId,
    cardName,
    pointUsed: totals.pointUsed,
    totals,
    reviewPointsLabel,
  }
}

export const DEMO_COMPLETED_ORDER: CompletedOrder = buildCompletedOrder({
  items: DEMO_CART_ITEMS.filter((item) => item.selected),
  deliveryRequest: '문앞에 놔주세요.',
  paymentMethodId: 'card',
  totals: {
    productTotal: 67_150,
    couponDiscount: 7_150,
    cartCouponDiscount: 7_150,
    pointUsed: 1_000,
    shippingTotal: 2_500,
    baseShippingFee: 2_500,
    regionalShippingFee: 0,
    paymentTotal: 62_500,
    earnPoints: 6_500,
  },
})
