import { useMemo, useState } from 'react'
import { CartCheckbox } from '../components/cart/CartItemCard'
import { PcCheckoutOrderItemRow } from '../components/checkout/PcCheckoutOrderItemRow'
import { PcCheckoutSidebar } from '../components/checkout/PcCheckoutSidebar'
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
import { figmaAsset } from '../lib/figmaAssetUrl'
import { saveLastCompletedOrder } from '../lib/lastOrderStorage'
import { ORDER_COMPLETE_PATH } from '../lib/orderRoutes'
import { navigateSpa } from '../lib/spaNavigation'

const iconChevron = figmaAsset('icons/list_chevron.svg')

function formatDiscount(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

function CheckoutPaymentRadio({
  selected,
  onSelect,
  label,
}: {
  selected: boolean
  onSelect: () => void
  label: string
}) {
  return (
    <button type="button" className="flex items-center gap-2 border-0 bg-transparent p-0" onClick={onSelect}>
      <span
        className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
          selected ? 'border-primary' : 'border-gray'
        }`}
        aria-hidden
      >
        <span className={`size-3 rounded-full ${selected ? 'bg-primary' : 'bg-light2'}`} />
      </span>
      <span className="text-bodyMedium1 text-dark">{label}</span>
    </button>
  )
}

/** Figma 58:4194 — PC order/checkout page. */
export function PcCheckoutPage() {
  const { items } = useCart()
  const orderItems = useMemo(() => items.filter((item) => item.selected), [items])

  const [productAmountOpen, setProductAmountOpen] = useState(false)
  const [couponDiscountOpen, setCouponDiscountOpen] = useState(false)
  const [shippingOpen, setShippingOpen] = useState(false)
  const [pointsEarnOpen, setPointsEarnOpen] = useState(false)
  const [termsOpen, setTermsOpen] = useState(true)

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
    <main className="hidden bg-white lg:block">
      <div className="mx-auto max-w-[1400px] px-0 pb-20 pt-16">
        <h1 className="m-0 text-center text-h1 text-black">주문/결제</h1>

        <div className="mt-16 flex items-start gap-[60px]">
          <div className="flex min-w-0 flex-1 flex-col gap-16">
            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-dark pb-4">
                <h2 className="m-0 text-bodyBold1 text-dark">배송지 정보</h2>
                <button
                  type="button"
                  className="rounded border border-gray bg-white px-4 py-2 text-bodyRegular1 font-medium text-dark"
                >
                  배송지 변경
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-primary/10 px-2.5 py-[3px] text-bodySmall text-primary">
                      기본
                    </span>
                    <p className="m-0 text-bodyMedium1 font-bold text-dark">{DEMO_CHECKOUT_SHIPPING.name}</p>
                  </div>
                  <p className="m-0 text-bodyRegular1 text-dark">
                    [{DEMO_CHECKOUT_SHIPPING.postalCode}] {DEMO_CHECKOUT_SHIPPING.address}
                  </p>
                  <p className="m-0 text-bodyRegular1 text-dark">{DEMO_CHECKOUT_SHIPPING.phone}</p>
                </div>

                <label className="relative block">
                  <select
                    className="h-12 w-full appearance-none rounded border border-gray bg-white px-3 pr-10 text-bodyRegular2 text-subtleText"
                    value={deliveryRequest}
                    onChange={(event) =>
                      setDeliveryRequest(event.target.value as (typeof CHECKOUT_DELIVERY_REQUESTS)[number])
                    }
                  >
                    {CHECKOUT_DELIVERY_REQUESTS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
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
            </section>

            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-dark pb-6">
                <h2 className="m-0 text-bodyBold1 text-dark">주문상품</h2>
                <span className="text-bodyMedium1 text-dark">{orderItems.length}건</span>
              </div>

              <div className="flex flex-col gap-6">
                {orderItems.map((item) => (
                  <PcCheckoutOrderItemRow key={item.id} item={item} />
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <div className="border-b border-dark pb-4">
                <h2 className="m-0 text-bodyBold1 text-dark">할인혜택</h2>
              </div>

              <div className="flex max-w-[600px] flex-col gap-6">
                <div className="flex items-center justify-between gap-6">
                  <p className="m-0 shrink-0 text-bodyRegular2 text-dark">할인쿠폰(2개 보유)</p>
                  <div className="flex min-w-0 flex-1 max-w-[373px] gap-2">
                    <div className="flex h-12 min-w-0 flex-1 items-center rounded border border-gray bg-white px-4">
                      <span className="text-bodyRegular2 font-medium text-primaryText">
                        {formatDiscount(6_150)}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 rounded border border-dark bg-white px-6 text-bodyRegular1 font-medium text-dark"
                    >
                      쿠폰선택
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6">
                  <p className="m-0 shrink-0 text-bodyRegular2 text-dark">포인트사용(보유 : 1,000)</p>
                  <div className="flex min-w-0 flex-1 max-w-[375px] gap-2">
                    <div className="flex h-12 min-w-0 flex-1 items-center rounded border border-gray bg-white px-4">
                      <span className="text-bodyRegular2 font-medium text-primaryText">
                        {formatDiscount(1_000)}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 rounded border border-dark bg-white px-6 text-bodyRegular1 font-medium text-dark"
                    >
                      모두사용
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <div className="border-b border-dark pb-4">
                <h2 className="m-0 text-bodyBold1 text-dark">결제수단</h2>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-6 border-b border-lightGray pb-6">
                  {CHECKOUT_PAYMENT_METHODS.map((method) => {
                    const selected = paymentMethod === method.id
                    return (
                      <div key={method.id} className="flex flex-col gap-4">
                        <CheckoutPaymentRadio
                          selected={selected}
                          onSelect={() => setPaymentMethod(method.id)}
                          label={method.label}
                        />

                        {selected && method.id === 'card' ? (
                          <div className="flex gap-6">
                            <label className="relative block w-[300px]">
                              <select className="h-12 w-full appearance-none rounded border border-gray bg-white px-4 pr-10 text-bodyRegular2 text-dark">
                                <option value="">카드 선택</option>
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
                            <label className="relative block w-[300px]">
                              <select className="h-12 w-full appearance-none rounded border border-gray bg-white px-4 pr-10 text-bodyRegular2 text-dark">
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
                      </div>
                    )
                  })}
                </div>

                <label className="flex items-center gap-2">
                  <CartCheckbox
                    checked={savePaymentMethod}
                    onChange={() => setSavePaymentMethod((value) => !value)}
                    ariaLabel="결제수단과 입력정보를 다음에도 사용"
                    size="lg"
                  />
                  <span className="text-bodyRegular2 text-dark">결제수단과 입력정보를 다음에도 사용</span>
                </label>
              </div>
            </section>
          </div>

          <PcCheckoutSidebar
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
            discountTotal={totals.discountTotal}
            termsExpanded={termsOpen}
            onToggleTerms={() => setTermsOpen((open) => !open)}
            allAgreed={allAgreed}
            onToggleAllTerms={toggleAllTerms}
            agreedIds={agreedIds}
            onToggleTermItem={toggleTermItem}
            onPay={handleCompleteOrder}
          />
        </div>
      </div>
    </main>
  )
}
