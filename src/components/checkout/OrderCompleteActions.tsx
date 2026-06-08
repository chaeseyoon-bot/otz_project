import { navigateSpa } from '../../lib/spaNavigation'
import { getOrderDetailPath } from '../../lib/orderRoutes'

export interface OrderCompleteActionsProps {
  orderNumber: string
  layout?: 'stacked' | 'inline'
}

/** Figma 70:4337 / 71:5580 — continue shopping / view order CTAs. */
export function OrderCompleteActions({ orderNumber, layout = 'stacked' }: OrderCompleteActionsProps) {
  const isInline = layout === 'inline'

  return (
    <div className={`flex w-full ${isInline ? 'flex-row gap-2' : 'flex-col gap-2'}`}>
      <button
        type="button"
        className={`flex h-14 items-center justify-center rounded bg-dark text-button text-white ${
          isInline ? 'min-w-0 flex-1' : 'w-full'
        }`}
        onClick={() => navigateSpa('/')}
      >
        쇼핑 계속하기
      </button>
      <button
        type="button"
        className={`flex h-14 items-center justify-center rounded border border-lightGray bg-white text-button text-dark ${
          isInline ? 'min-w-0 flex-1' : 'w-full'
        }`}
        onClick={() => navigateSpa(getOrderDetailPath(orderNumber))}
      >
        주문 확인하기
      </button>
    </div>
  )
}
