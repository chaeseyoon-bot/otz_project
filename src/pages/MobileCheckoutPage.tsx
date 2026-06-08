import { useMemo, useState } from 'react'
import { CartCheckbox } from '../components/cart/CartItemCard'
import { CheckoutCollapsibleSection } from '../components/checkout/CheckoutCollapsibleSection'
import { CheckoutMobileBottomBar } from '../components/checkout/CheckoutMobileBottomBar'
import { CheckoutMobileHeader } from '../components/checkout/CheckoutMobileHeader'
import { CheckoutOrderItemRow } from '../components/checkout/CheckoutOrderItemRow'
import { CheckoutPaymentSummaryCard } from '../components/checkout/CheckoutPaymentSummaryCard'
import { CheckoutTermsSection } from '../components/checkout/CheckoutTermsSection'
import {
  CHECKOUT_CARD_OPTIONS,
  CHECKOUT_DELIVERY_REQUESTS,
  CHECKOUT_INSTALLMENT_OPTIONS,
  CHECKOUT_PAYMENT_METHODS,
  CHECKOUT_TERMS_ITEMS,
  DEMO_CHECKOUT_SHIPPING,
  type CheckoutPaymentMethodId,
} from '../data/checkoutContent'
import { buildCompletedOrder } from '../data/orderCompleteContent'
import { useCart } from '../contexts/CartContext'
import { CheckoutDeliveryRequestSelect } from '../components/checkout/CheckoutDeliveryRequestSelect'
import { figmaAsset } from '../lib/figmaAssetUrl'
import { saveLastCompletedOrder } from '../lib/lastOrderStorage'
import { ORDER_COMPLETE_PATH } from '../lib/orderRoutes'
import { navigateSpa } from '../lib/spaNavigation'

const iconChevron = figmaAsset('icons/list_chevron.svg')

function formatDiscount(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

/** Figma 53:5770 — mobile order/checkout page. */
export function MobileCheckoutPage() {
  const { items } = useCart()
  const orderItems = useMemo(() => items.filter((item) => item.selected), [items])

  const [orderItemsOpen, setOrderItemsOpen] = useState(false)
  const [productAmountOpen, setProductAmountOpen] = useState(false)
  const [couponDiscountOpen, setCouponDiscountOpen] = useState(false)
  const [shippingOpen, setShippingOpen] = useState(false)
  const [pointsEarnOpen, setPointsEarnOpen] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)

  const [savePaymentMethod, setSavePaymentMethod] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethodId>('card')
  const [deliveryRequest, setDeliveryRequest] = useState<(typeof CHECKOUT_DELIVERY_REQUESTS)[number]>(
    CHECKOUT_DELIVERY_REQUESTS[0],
  )
  const [agreedIds, setAgreedIds] = useState<Set<string>>(() => new Set())

  const totals = useMemo(() => {
    const productTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const baseShippingFee = orderItems.reduce((sum, item) => sum + item.shippingBreakdown.shippingFee, 0)
    const regionalShippingFee = orderItems.reduce(
      (sum, item) => sum + item.shippingBreakdown.regionalShippingFee,
      0,
    )
    const shippingTotal = baseShippingFee + regionalShippingFee
    const cartCouponDiscount = 7_150
    const pointUsed = 1_000
    const couponDiscount = cartCouponDiscount
    const discountTotal = cartCouponDiscount + pointUsed
    const paymentTotal = productTotal + shippingTotal - discountTotal
    const earnPoints = Math.max(Math.round(paymentTotal * 0.01), 0)

    return {
      productTotal,
      baseShippingFee,
      regionalShippingFee,
      shippingTotal,
      cartCouponDiscount,
      couponDiscount,
      pointUsed,
      discountTotal,
      paymentTotal,
      earnPoints,
    }
  }, [orderItems])

  const allAgreed =
    agreedIds.size === CHECKOUT_TERMS_ITEMS.length &&
    CHECKOUT_TERMS_ITEMS.every((item) => agreedIds.has(item.id))

  const toggleAllTerms = () => {
    if (allAgreed) {
      setAgreedIds(new Set())
      return
    }
    setAgreedIds(new Set(CHECKOUT_TERMS_ITEMS.map((item) => item.id)))
  }

  const toggleTermItem = (id: string) => {
    setAgreedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCompleteOrder = () => {
    const deliveryLabel =
      deliveryRequest === CHECKOUT_DELIVERY_REQUESTS[0] ? '문앞에 놔주세요.' : deliveryRequest

    const order = buildCompletedOrder({
      items: orderItems,
      deliveryRequest: deliveryLabel,
      paymentMethodId: paymentMethod,
      cardName: CHECKOUT_CARD_OPTIONS[0],
      totals: {
        productTotal: totals.productTotal,
        couponDiscount: totals.couponDiscount,
        cartCouponDiscount: totals.cartCouponDiscount,
        pointUsed: totals.pointUsed,
        shippingTotal: totals.shippingTotal,
        baseShippingFee: totals.baseShippingFee,
        regionalShippingFee: totals.regionalShippingFee,
        paymentTotal: totals.paymentTotal,
        earnPoints: totals.earnPoints,
      },
      reviewPointsLabel: '최대 4,500원',
    })

    saveLastCompletedOrder(order)
    navigateSpa(ORDER_COMPLETE_PATH)
  }

  return (
    <main className="bg-white lg:hidden">
      <CheckoutMobileHeader />

      <div className="flex flex-col gap-12 px-4 py-6 pb-[150px]">
        <section className="flex flex-col gap-6">
          <div className="flex h-[43px] items-center justify-between border-b border-dark pb-2">
            <h2 className="m-0 text-bodyMedium1 font-bold text-dark">배송지 정보</h2>
            <button
              type="button"
              className="rounded border border-gray bg-white px-3 py-2 text-bodyMedium2 text-dark"
            >
              배송지 변경
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 text-bodyRegular2 text-dark">
              <p className="m-0">{DEMO_CHECKOUT_SHIPPING.name}</p>
              <p className="m-0">
                [{DEMO_CHECKOUT_SHIPPING.postalCode}] {DEMO_CHECKOUT_SHIPPING.address}
              </p>
              <p className="m-0">{DEMO_CHECKOUT_SHIPPING.phone}</p>
            </div>

            <CheckoutDeliveryRequestSelect value={deliveryRequest} onChange={setDeliveryRequest} />
          </div>
        </section>

        <CheckoutCollapsibleSection
          title="주문 상품 정보"
          expanded={orderItemsOpen}
          onToggle={() => setOrderItemsOpen((open) => !open)}
          trailing={<span className="text-bodyMedium1 text-dark">{orderItems.length}건</span>}
        >
          <div className="flex flex-col gap-4">
            {orderItems.map((item) => (
              <CheckoutOrderItemRow key={item.id} item={item} />
            ))}
          </div>
        </CheckoutCollapsibleSection>

        <section className="flex flex-col gap-6">
          <div className="border-b border-dark pb-4">
            <h2 className="m-0 text-bodyMedium1 font-bold text-dark">할인혜택</h2>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="m-0 text-bodyRegular2 text-dark">할인쿠폰(2개 보유)</p>
              <div className="flex gap-2">
                <div className="flex h-[42px] min-w-0 flex-1 items-center rounded border border-gray bg-white px-3">
                  <span className="text-bodyRegular2 font-medium text-primaryText">
                    {formatDiscount(6_150)}
                  </span>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded border border-dark bg-white px-4 py-[11px] text-bodyRegular2 font-medium text-dark"
                >
                  쿠폰선택
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="m-0 text-bodyRegular2 text-dark">포인트사용 (보유:1,000원)</p>
              <div className="flex gap-2">
                <div className="flex h-[42px] min-w-0 flex-1 items-center rounded border border-gray bg-white px-3">
                  <span className="text-bodyRegular2 font-medium text-primaryText">
                    {formatDiscount(1_000)}
                  </span>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded border border-dark bg-white px-4 py-[11px] text-bodyRegular2 font-medium text-dark"
                >
                  모두사용
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="border-b border-dark pb-4">
            <h2 className="m-0 text-bodyMedium1 font-bold text-dark">결제수단</h2>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              {CHECKOUT_PAYMENT_METHODS.map((method) => {
                const selected = paymentMethod === method.id
                return (
                  <button
                    key={method.id}
                    type="button"
                    className={`flex h-[42px] min-w-0 flex-1 items-center justify-center rounded border text-bodyRegular2 font-medium text-dark ${
                      selected ? 'border-dark' : 'border-gray'
                    }`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    {method.label}
                  </button>
                )
              })}
            </div>

            {paymentMethod === 'card' ? (
              <div className="flex flex-col gap-2">
                <label className="relative block">
                  <select className="h-[42px] w-full appearance-none rounded border border-gray bg-white px-3 pr-10 text-bodyRegular2 text-dark">
                    {CHECKOUT_CARD_OPTIONS.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                  <img
                    src={iconChevron}
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 object-contain"
                    draggable={false}
                  />
                </label>
                <label className="relative block">
                  <select className="h-[42px] w-full appearance-none rounded border border-gray bg-white px-3 pr-10 text-bodyRegular2 text-subtleText">
                    {CHECKOUT_INSTALLMENT_OPTIONS.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                  <img
                    src={iconChevron}
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 object-contain"
                    draggable={false}
                  />
                </label>
              </div>
            ) : null}

            <label className="flex items-center gap-2">
              <CartCheckbox
                checked={savePaymentMethod}
                onChange={() => setSavePaymentMethod((value) => !value)}
                ariaLabel="결제수단 다음에도 사용"
              />
              <span className="text-bodySmall text-dark">결제수단 다음에도 사용</span>
            </label>
          </div>
        </section>

        <CheckoutPaymentSummaryCard
          productAmountOpen={productAmountOpen}
          onToggleProductAmount={() => setProductAmountOpen((open) => !open)}
          couponDiscountOpen={couponDiscountOpen}
          onToggleCouponDiscount={() => setCouponDiscountOpen((open) => !open)}
          shippingOpen={shippingOpen}
          onToggleShipping={() => setShippingOpen((open) => !open)}
          pointsEarnOpen={pointsEarnOpen}
          onTogglePointsEarn={() => setPointsEarnOpen((open) => !open)}
          productTotal={totals.productTotal}
          couponDiscount={totals.couponDiscount}
          cartCouponDiscount={totals.cartCouponDiscount}
          pointUsed={totals.pointUsed}
          shippingTotal={totals.shippingTotal}
          baseShippingFee={totals.baseShippingFee}
          regionalShippingFee={totals.regionalShippingFee}
          paymentTotal={totals.paymentTotal}
          earnPoints={totals.earnPoints}
          reviewPointsLabel="최대 4,500원"
        />

        <CheckoutTermsSection
          className="-mt-6"
          expanded={termsOpen}
          onToggle={() => setTermsOpen((open) => !open)}
          allAgreed={allAgreed}
          onToggleAll={toggleAllTerms}
          agreedIds={agreedIds}
          onToggleItem={toggleTermItem}
        />
      </div>

      <CheckoutMobileBottomBar
        discountTotal={totals.discountTotal}
        paymentTotal={totals.paymentTotal}
        onPay={handleCompleteOrder}
      />
    </main>
  )
}
