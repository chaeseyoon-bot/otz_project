import { useMemo, useState } from 'react'
import { CheckoutCollapsibleSection } from '../components/checkout/CheckoutCollapsibleSection'
import { CheckoutOrderItemRow } from '../components/checkout/CheckoutOrderItemRow'
import { CheckoutPaymentSummaryCard } from '../components/checkout/CheckoutPaymentSummaryCard'
import { OrderCompleteActions } from '../components/checkout/OrderCompleteActions'
import { OrderCompleteInfoTable } from '../components/checkout/OrderCompleteInfoTable'
import { OrderCompleteMobileHeader } from '../components/checkout/OrderCompleteMobileHeader'
import { CHECKOUT_PAYMENT_METHODS } from '../data/checkoutContent'
import { DEMO_COMPLETED_ORDER, type CompletedOrder } from '../data/orderCompleteContent'
import { loadLastCompletedOrder } from '../lib/lastOrderStorage'

function formatAmount(value: number) {
  return value.toLocaleString('ko-KR')
}

/** Figma 70:3880 — mobile order complete page. */
export function MobileOrderCompletePage() {
  const order = useMemo<CompletedOrder>(() => loadLastCompletedOrder() ?? DEMO_COMPLETED_ORDER, [])

  const [orderItemsOpen, setOrderItemsOpen] = useState(true)
  const [shippingOpen, setShippingOpen] = useState(true)
  const [productAmountOpen, setProductAmountOpen] = useState(false)
  const [couponDiscountOpen, setCouponDiscountOpen] = useState(false)
  const [shippingFeeOpen, setShippingFeeOpen] = useState(false)
  const [pointsEarnOpen, setPointsEarnOpen] = useState(false)

  const paymentMethodLabel =
    CHECKOUT_PAYMENT_METHODS.find((method) => method.id === order.paymentMethodId)?.label ?? '신용카드'

  const shippingAddress = `[${order.shipping.postalCode}] ${order.shipping.address}`

  return (
    <main className="bg-white lg:hidden">
      <OrderCompleteMobileHeader />

      <div className="flex flex-col gap-8 px-4 pb-14 pt-8">
        <section className="flex flex-col items-center gap-2 border-b-2 border-black pb-8">
          <h2 className="m-0 text-center text-titleSemibold text-dark">
            고객님의 주문이
            <br />
            정상적으로 완료되었습니다.
          </h2>
          <div className="flex flex-col items-center gap-2">
            <p className="m-0 text-bodyRegular1 text-subtleText">주문번호 : {order.orderNumber}</p>
            <p className="m-0 text-bodyBold2 text-dark">
              총 결제 금액 : {formatAmount(order.totals.paymentTotal)}
            </p>
          </div>
        </section>

        <CheckoutCollapsibleSection
          title="배송지"
          expanded={shippingOpen}
          onToggle={() => setShippingOpen((open) => !open)}
          className="gap-0"
        >
          <OrderCompleteInfoTable
            rows={[
              { label: '받는사람', value: order.shipping.name },
              { label: '주소', value: shippingAddress },
              { label: '연락처', value: order.shipping.phone },
              { label: '배송 요청', value: order.deliveryRequest },
            ]}
          />
        </CheckoutCollapsibleSection>

        <CheckoutCollapsibleSection
          title="주문 상품 정보"
          expanded={orderItemsOpen}
          onToggle={() => setOrderItemsOpen((open) => !open)}
          trailing={<span className="text-bodyMedium1 text-dark">{order.items.length}건</span>}
        >
          <div className="flex flex-col gap-6">
            {order.items.map((item) => (
              <CheckoutOrderItemRow key={item.id} item={item} />
            ))}
          </div>
        </CheckoutCollapsibleSection>

        <section className="flex w-full flex-col">
          <div className="border-b border-dark pb-4">
            <h2 className="m-0 text-bodyMedium1 font-bold text-dark">결제정보</h2>
          </div>
          <OrderCompleteInfoTable
            rows={[
              {
                label: '결제수단',
                value: (
                  <span className="flex items-center gap-2">
                    <span>{paymentMethodLabel}</span>
                    {order.paymentMethodId === 'card' ? (
                      <>
                        <span className="h-3 w-px bg-lightGray" aria-hidden />
                        <span>{order.cardName}</span>
                      </>
                    ) : null}
                  </span>
                ),
              },
              {
                label: '사용포인트',
                value: `${formatAmount(order.pointUsed)}P 사용`,
              },
            ]}
          />
        </section>

        <CheckoutPaymentSummaryCard
          title="결제정보"
          productAmountOpen={productAmountOpen}
          onToggleProductAmount={() => setProductAmountOpen((open) => !open)}
          couponDiscountOpen={couponDiscountOpen}
          onToggleCouponDiscount={() => setCouponDiscountOpen((open) => !open)}
          shippingOpen={shippingFeeOpen}
          onToggleShipping={() => setShippingFeeOpen((open) => !open)}
          pointsEarnOpen={pointsEarnOpen}
          onTogglePointsEarn={() => setPointsEarnOpen((open) => !open)}
          productTotal={order.totals.productTotal}
          couponDiscount={order.totals.couponDiscount}
          cartCouponDiscount={order.totals.cartCouponDiscount}
          pointUsed={order.totals.pointUsed}
          shippingTotal={order.totals.shippingTotal}
          baseShippingFee={order.totals.baseShippingFee}
          regionalShippingFee={order.totals.regionalShippingFee}
          paymentTotal={order.totals.paymentTotal}
          earnPoints={order.totals.earnPoints}
          reviewPointsLabel={order.reviewPointsLabel}
        />

        <OrderCompleteActions orderNumber={order.orderNumber} />
      </div>
    </main>
  )
}
