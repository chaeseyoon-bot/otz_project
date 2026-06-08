import { figmaAsset } from '../../lib/figmaAssetUrl'
import { CHECKOUT_PATH } from '../../lib/checkoutRoutes'
import { navigateSpa } from '../../lib/spaNavigation'

const iconCoupon = figmaAsset('icons/cart_coupon.svg')

function formatPrice(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

export interface PcCartOrderSidebarProps {
  selectedQuantity: number
  productTotal: number
  shippingTotal: number
  discountTotal: number
  paymentTotal: number
}

/** Figma 51:2455 — PC cart sticky order summary sidebar. */
export function PcCartOrderSidebar({
  selectedQuantity,
  productTotal,
  shippingTotal,
  discountTotal,
  paymentTotal,
}: PcCartOrderSidebarProps) {
  return (
    <aside className="sticky top-[94px] z-10 flex w-[360px] shrink-0 flex-col gap-6 self-start">
      <section className="flex w-full flex-col gap-8 rounded-lg border border-lightGray bg-white p-6">
        <div className="flex h-12 items-center justify-between rounded bg-light px-4">
          <div className="flex items-center gap-2">
            <img src={iconCoupon} alt="" aria-hidden className="size-[18px] shrink-0" draggable={false} />
            <span className="text-bodyRegular2 text-textDefault">받을 수 있는 쿠폰이 있어요!</span>
          </div>
          <button type="button" className="border-0 bg-transparent p-0 text-bodyRegular2 text-dark underline">
            전체받기
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 text-bodyRegular1">
            <div className="flex items-center justify-between text-textDefault">
              <span>총 상품금액</span>
              <span className="font-medium text-dark">{formatPrice(productTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-textDefault">
              <span>총 배송비</span>
              <span className="font-medium text-dark">{formatPrice(shippingTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-textDefault">
              <span>총 할인금액</span>
              <span className="font-medium text-dark">
                {discountTotal > 0
                  ? `-${discountTotal.toLocaleString('ko-KR')}원`
                  : formatPrice(0)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-lightGray pt-6">
            <span className="text-bodyBold1 text-dark">총 {selectedQuantity}개</span>
            <span className="text-bodyBold1 text-dark">{formatPrice(paymentTotal)}</span>
          </div>
        </div>
      </section>

      <button
        type="button"
        className="flex h-14 w-full items-center justify-center rounded bg-dark text-button text-white"
        onClick={() => navigateSpa(CHECKOUT_PATH)}
      >
        주문하기
      </button>
    </aside>
  )
}
