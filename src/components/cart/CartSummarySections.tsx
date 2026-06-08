import { CART_GUIDE_SECTIONS } from '../../data/cartContent'

function formatPrice(value: number) {
  return value.toLocaleString('ko-KR')
}

export function CartOrderSummaryCard({
  productTotal,
  shippingTotal,
  paymentTotal,
  variant = 'mobile',
}: {
  productTotal: number
  shippingTotal: number
  paymentTotal: number
  variant?: 'mobile' | 'pc'
}) {
  if (variant === 'pc') {
    return (
      <section className="w-full rounded-lg border border-lightGray bg-white py-6">
        <div className="flex flex-col gap-4 px-6 text-bodyRegular1">
          <div className="flex items-center justify-between text-textDefault">
            <span>총 상품금액</span>
            <span className="text-bodyBold2 text-dark">{formatPrice(productTotal)}</span>
          </div>
          <div className="flex items-center justify-between text-textDefault">
            <span>총 배송비</span>
            <span className="text-bodyBold2 text-dark">{formatPrice(shippingTotal)}</span>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-lightGray px-6 pt-6">
          <span className="text-bodyBold1 text-dark">결제예정금액</span>
          <span className="text-bodyBold1 text-dark">{formatPrice(paymentTotal)}</span>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-lightGray bg-white px-6 py-6">
      <div className="flex flex-col gap-4 text-bodyRegular1">
        <div className="flex items-center justify-between text-textDefault">
          <span>총 상품금액</span>
          <span className="text-bodyBold2 text-dark">{formatPrice(productTotal)}</span>
        </div>
        <div className="flex items-center justify-between text-textDefault">
          <span>총 배송비</span>
          <span className="text-bodyBold2 text-dark">{formatPrice(shippingTotal)}</span>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-lightGray pt-6">
        <span className="text-bodyBold1 text-dark">결제예정금액</span>
        <span className="text-bodyBold1 text-dark">{formatPrice(paymentTotal)}</span>
      </div>
    </section>
  )
}

export function CartBulkActions({
  onSelectAll,
  onRemoveSelected,
  onRemoveAll,
  variant = 'mobile',
}: {
  onSelectAll?: () => void
  onRemoveSelected: () => void
  onRemoveAll?: () => void
  variant?: 'mobile' | 'pc'
}) {
  if (variant === 'pc') {
    return (
      <div className="flex w-full items-center justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            className="flex h-14 w-36 items-center justify-center rounded border border-gray bg-white text-bodyRegular1 text-dark"
            onClick={onRemoveAll}
          >
            전체삭제
          </button>
          <button
            type="button"
            className="flex h-14 w-36 items-center justify-center rounded border border-gray bg-white text-bodyRegular1 text-dark"
            onClick={onRemoveSelected}
          >
            선택삭제
          </button>
        </div>
        <button
          type="button"
          className="flex h-14 w-36 items-center justify-center rounded border border-gray bg-white text-bodyRegular1 text-dark"
        >
          견적서 출력
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          type="button"
          className="flex h-12 flex-1 items-center justify-center rounded border border-gray bg-white text-bodyRegular2 text-dark"
          onClick={onSelectAll}
        >
          전체선택
        </button>
        <button
          type="button"
          className="flex h-12 flex-1 items-center justify-center rounded border border-gray bg-white text-bodyRegular2 text-dark"
          onClick={onRemoveSelected}
        >
          선택삭제
        </button>
      </div>
      <button
        type="button"
        className="flex h-12 w-full items-center justify-center rounded border border-gray bg-white text-bodyRegular2 text-dark"
      >
        견적서출력
      </button>
    </div>
  )
}

export function CartOrderButtons({ variant = 'mobile' }: { variant?: 'mobile' | 'pc' }) {
  if (variant === 'pc') {
    return (
      <div className="flex w-full gap-2">
        <button
          type="button"
          className="flex h-14 min-w-0 flex-1 items-center justify-center rounded bg-dark text-button text-white"
        >
          전체상품주문
        </button>
        <button
          type="button"
          className="flex h-14 min-w-0 flex-1 items-center justify-center rounded border border-lightGray bg-white text-button text-dark"
        >
          선택상품주문
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className="flex h-14 w-full items-center justify-center rounded bg-dark text-button text-white"
      >
        전체상품주문
      </button>
      <button
        type="button"
        className="flex h-14 w-full items-center justify-center rounded border border-lightGray bg-white text-button text-dark"
      >
        선택상품주문
      </button>
    </div>
  )
}

export function CartGuideSection() {
  return (
    <section>
      <div className="border-b border-lightGray pb-4">
        <h2 className="m-0 text-bodyBold2 text-dark">이용안내</h2>
      </div>
      <div className="mt-6 flex flex-col gap-6">
        {CART_GUIDE_SECTIONS.map((section) => (
          <div key={section.id}>
            <h3 className="m-0 text-bodyMedium2 text-dark">{section.title}</h3>
            <ul className="mt-2 mb-0 flex list-none flex-col gap-2 p-0">
              {section.lines.map((line) => (
                <li key={line} className="text-bodySmall1 text-textDefault">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
