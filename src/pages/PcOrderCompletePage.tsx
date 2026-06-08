import { useMemo, useState } from 'react'
import { OrderCompleteActions } from '../components/checkout/OrderCompleteActions'
import { PcCheckoutOrderItemRow } from '../components/checkout/PcCheckoutOrderItemRow'
import { PcCheckoutPaymentSummaryCard } from '../components/checkout/PcCheckoutPaymentSummaryCard'
import { PcOrderCompleteInfoTable } from '../components/checkout/PcOrderCompleteInfoTable'
import { CHECKOUT_PAYMENT_METHODS } from '../data/checkoutContent'
import { DEMO_COMPLETED_ORDER, type CompletedOrder } from '../data/orderCompleteContent'
import { loadLastCompletedOrder } from '../lib/lastOrderStorage'
import { figmaAsset } from '../lib/figmaAssetUrl'

const iconChevron = figmaAsset('icons/list_chevron.svg')

function formatAmount(value: number) {
  return value.toLocaleString('ko-KR')
}

/** Figma 71:4871 — PC order complete page. */
export function PcOrderCompletePage() {
  const order = useMemo<CompletedOrder>(() => loadLastCompletedOrder() ?? DEMO_COMPLETED_ORDER, [])

  const [orderItemsOpen, setOrderItemsOpen] = useState(true)
  const [productAmountOpen, setProductAmountOpen] = useState(false)
  const [couponDiscountOpen, setCouponDiscountOpen] = useState(false)
  const [shippingFeeOpen, setShippingFeeOpen] = useState(false)
  const [pointsEarnOpen, setPointsEarnOpen] = useState(false)

  const paymentMethodLabel =
    CHECKOUT_PAYMENT_METHODS.find((method) => method.id === order.paymentMethodId)?.label ?? '신용카드'

  const shippingAddress = `[${order.shipping.postalCode}] ${order.shipping.address}`

  return (
    <main className="hidden bg-white lg:block">
      <div className="mx-auto max-w-[1400px] px-0 pb-20 pt-16">
        <h1 className="m-0 text-center text-h1 text-black">주문완료</h1>

        <div className="mt-16 flex flex-col gap-16">
          <section className="flex items-end gap-10 border-b-2 border-black pb-6">
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <p className="m-0 text-bodyMedium text-dark">
                고객님의 주문이
                <br />
                정상적으로 완료되었습니다.
              </p>
              <p className="m-0 text-bodyRegular1 text-subtleText">주문번호 : {order.orderNumber}</p>
            </div>
            <p className="m-0 shrink-0 text-bodyBold1 text-dark">
              총 결제 금액 : {formatAmount(order.totals.paymentTotal)}
            </p>
          </section>

          <div className="flex items-start gap-[60px]">
            <div className="flex min-w-0 flex-1 flex-col gap-16">
              <section className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-dark pb-6">
                  <h2 className="m-0 text-bodyBold1 text-dark">주문상품</h2>
                  <button
                    type="button"
                    className="flex items-center gap-2 border-0 bg-transparent p-0"
                    aria-expanded={orderItemsOpen}
                    aria-label={orderItemsOpen ? '주문상품 접기' : '주문상품 펼치기'}
                    onClick={() => setOrderItemsOpen((open) => !open)}
                  >
                    <span className="text-bodyMedium1 text-dark">{order.items.length}건</span>
                    <img
                      src={iconChevron}
                      alt=""
                      aria-hidden
                      className={`size-5 object-contain transition-transform duration-200 ${orderItemsOpen ? 'rotate-180' : ''}`}
                      draggable={false}
                    />
                  </button>
                </div>

                {orderItemsOpen ? (
                  <div className="flex flex-col gap-6">
                    {order.items.map((item) => (
                      <PcCheckoutOrderItemRow key={item.id} item={item} />
                    ))}
                  </div>
                ) : null}
              </section>

              <section className="flex flex-col">
                <div className="border-b border-dark pb-4">
                  <h2 className="m-0 text-bodyBold1 text-dark">배송지 정보</h2>
                </div>
                <PcOrderCompleteInfoTable
                  rows={[
                    { label: '받는사람', value: order.shipping.name },
                    { label: '주소', value: shippingAddress },
                    { label: '연락처', value: order.shipping.phone },
                    { label: '배송요청', value: order.deliveryRequest },
                  ]}
                />
              </section>

              <section className="flex flex-col">
                <div className="border-b border-dark pb-4">
                  <h2 className="m-0 text-bodyBold1 text-dark">결제정보</h2>
                </div>
                <PcOrderCompleteInfoTable
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
                      label: '사용 포인트',
                      value: `${formatAmount(order.pointUsed)}P 사용`,
                    },
                  ]}
                />
              </section>
            </div>

            <aside className="sticky top-[94px] z-10 flex w-[360px] shrink-0 flex-col gap-6 self-start">
              <PcCheckoutPaymentSummaryCard
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

              <OrderCompleteActions orderNumber={order.orderNumber} layout="inline" />
            </aside>
          </div>
        </div>
      </div>
    </main>
  )
}
