import { CheckoutTermsSection } from './CheckoutTermsSection'
import { PcCheckoutPaymentSummaryCard, type PcCheckoutPaymentSummaryCardProps } from './PcCheckoutPaymentSummaryCard'

function formatPrice(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

export interface PcCheckoutSidebarProps extends PcCheckoutPaymentSummaryCardProps {
  discountTotal: number
  termsExpanded: boolean
  onToggleTerms: () => void
  allAgreed: boolean
  onToggleAllTerms: () => void
  agreedIds: Set<string>
  onToggleTermItem: (id: string) => void
  onPay: () => void
}

/** Figma 58:4194 — PC checkout sticky sidebar (summary, terms, CTA). */
export function PcCheckoutSidebar({
  discountTotal,
  paymentTotal,
  termsExpanded,
  onToggleTerms,
  allAgreed,
  onToggleAllTerms,
  agreedIds,
  onToggleTermItem,
  onPay,
  ...summaryProps
}: PcCheckoutSidebarProps) {
  return (
    <aside className="sticky top-[94px] z-10 flex w-[360px] shrink-0 flex-col gap-6 self-start">
      <PcCheckoutPaymentSummaryCard {...summaryProps} paymentTotal={paymentTotal} />

      <CheckoutTermsSection
        expanded={termsExpanded}
        onToggle={onToggleTerms}
        allAgreed={allAgreed}
        onToggleAll={onToggleAllTerms}
        agreedIds={agreedIds}
        onToggleItem={onToggleTermItem}
      />

      <div className="flex flex-col gap-2">
        <div className="rounded bg-light px-4 py-4">
          <p className="m-0 text-center text-bodyRegular1 font-medium text-dark">
            {discountTotal > 0 ? (
              <>
                이번 주문으로{' '}
                <span className="text-primaryText">총 {formatPrice(discountTotal)}</span>
                을 할인 받았어요.
              </>
            ) : (
              '할인 혜택이 적용되지 않았습니다.'
            )}
          </p>
        </div>

        <button
          type="button"
          className="flex h-14 w-full items-center justify-center rounded bg-dark text-bodyBold1 text-white"
          onClick={onPay}
        >
          {formatPrice(paymentTotal)} 결제하기
        </button>
      </div>
    </aside>
  )
}
