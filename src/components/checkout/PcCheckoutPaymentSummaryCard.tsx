import { CheckoutExpandableRow, CheckoutSubRow } from './CheckoutCollapsibleSection'

function formatPrice(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

export interface PcCheckoutPaymentSummaryCardProps {
  productAmountOpen: boolean
  onToggleProductAmount: () => void
  couponDiscountOpen: boolean
  onToggleCouponDiscount: () => void
  shippingOpen: boolean
  onToggleShipping: () => void
  pointsEarnOpen: boolean
  onTogglePointsEarn: () => void
  productTotal: number
  couponDiscount: number
  cartCouponDiscount: number
  pointUsed: number
  shippingTotal: number
  baseShippingFee: number
  regionalShippingFee: number
  paymentTotal: number
  earnPoints: number
  reviewPointsLabel: string
}

/** Figma 58:4194 — PC checkout sticky payment summary card. */
export function PcCheckoutPaymentSummaryCard({
  productAmountOpen,
  onToggleProductAmount,
  couponDiscountOpen,
  onToggleCouponDiscount,
  shippingOpen,
  onToggleShipping,
  pointsEarnOpen,
  onTogglePointsEarn,
  productTotal,
  couponDiscount,
  cartCouponDiscount,
  pointUsed,
  shippingTotal,
  baseShippingFee,
  regionalShippingFee,
  paymentTotal,
  earnPoints,
  reviewPointsLabel,
}: PcCheckoutPaymentSummaryCardProps) {
  return (
    <section className="w-full rounded-lg border border-lightGray bg-white py-6">
      <div className="flex flex-col gap-6 px-6">
        <div className="border-b border-lightGray pb-4">
          <h2 className="m-0 text-bodyBold1 text-dark">결제금액</h2>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <CheckoutExpandableRow
              label="상품 금액"
              amount={formatPrice(productTotal)}
              expanded={productAmountOpen}
              onToggle={onToggleProductAmount}
            >
              <CheckoutSubRow label="ㄴ 즉시할인쿠폰" amount={formatPrice(0)} />
            </CheckoutExpandableRow>

            <CheckoutExpandableRow
              label="쿠폰 할인 금액"
              amount={formatPrice(couponDiscount)}
              expanded={couponDiscountOpen}
              onToggle={onToggleCouponDiscount}
            >
              <CheckoutSubRow label="ㄴ 더블할인쿠폰" amount={formatPrice(0)} />
              <CheckoutSubRow label="ㄴ 장바구니쿠폰" amount={`-${cartCouponDiscount.toLocaleString('ko-KR')}원`} />
            </CheckoutExpandableRow>

            <div className="flex items-center justify-between text-bodyRegular1 text-dark">
              <span>포인트 사용</span>
              <span>{formatPrice(pointUsed)}</span>
            </div>

            <CheckoutExpandableRow
              label="배송비"
              amount={formatPrice(shippingTotal)}
              expanded={shippingOpen}
              onToggle={onToggleShipping}
            >
              <CheckoutSubRow label="ㄴ 기본 배송비" amount={formatPrice(baseShippingFee)} />
              <CheckoutSubRow label="ㄴ 추가 배송비" amount={formatPrice(regionalShippingFee)} />
            </CheckoutExpandableRow>
          </div>

          <div className="flex flex-col gap-6 border-t border-lightGray pt-6">
            <div className="flex items-center justify-between">
              <span className="text-bodyBold1 text-dark">최종 결제 금액</span>
              <span className="text-bodyBold1 text-dark">{formatPrice(paymentTotal)}</span>
            </div>

            <div className="border-t border-lightGray pt-6">
              <CheckoutExpandableRow
                label="적립예정 포인트"
                amount={formatPrice(earnPoints)}
                expanded={pointsEarnOpen}
                onToggle={onTogglePointsEarn}
              >
                <CheckoutSubRow label="ㄴ 상품구매 포인트" amount={formatPrice(Math.round(earnPoints * 0.38))} />
                <CheckoutSubRow label="ㄴ 리뷰후기 적립금" amount={reviewPointsLabel} />
              </CheckoutExpandableRow>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
