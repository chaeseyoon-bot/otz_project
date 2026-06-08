function formatPrice(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

export interface CheckoutMobileBottomBarProps {
  discountTotal: number
  paymentTotal: number
  onPay?: () => void
}

/** Figma 56:6630 — fixed checkout bottom bar above tab bar. */
export function CheckoutMobileBottomBar({ discountTotal, paymentTotal, onPay }: CheckoutMobileBottomBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(50px+env(safe-area-inset-bottom,0px))] z-50 rounded-t-2xl bg-white px-[15px] py-4 shadow-[0_-4px_5px_rgba(0,0,0,0.08)] lg:hidden">
      <div className="flex flex-col gap-4">
        <p className="m-0 text-center text-bodyBold2 text-dark">
          {discountTotal > 0 ? (
            <>
              <span className="font-medium text-primaryText">총 {formatPrice(discountTotal)}</span>
              <span className="font-medium">을 할인 받았어요.</span>
            </>
          ) : (
            '할인 혜택이 적용되지 않았습니다.'
          )}
        </p>
        <button
          type="button"
          className="flex h-12 w-full items-center justify-center rounded bg-dark text-bodyMedium1 text-white"
          onClick={onPay}
        >
          {formatPrice(paymentTotal)} 결제하기
        </button>
      </div>
    </div>
  )
}
