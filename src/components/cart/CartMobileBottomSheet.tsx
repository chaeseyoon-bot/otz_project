import { isCartPath } from '../../lib/cartRoutes'
import { CHECKOUT_PATH } from '../../lib/checkoutRoutes'
import { figmaAsset } from '../../lib/figmaAssetUrl'
import { navigateSpa } from '../../lib/spaNavigation'

const iconCoupon = figmaAsset('icons/cart_coupon.svg')
const iconChevron = figmaAsset('icons/list_chevron.svg')

function formatPrice(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

export interface CartMobileBottomSheetProps {
  selectedQuantity: number
  productTotal: number
  shippingTotal: number
  discountTotal: number
  paymentTotal: number
  expanded: boolean
  onToggleExpanded: () => void
  onClaimAllCoupons: () => void
}

/** Figma 51:2244 / 42:1943 — mobile cart fixed bottom sheet. */
export function CartMobileBottomSheet({
  selectedQuantity,
  productTotal,
  shippingTotal,
  discountTotal,
  paymentTotal,
  expanded,
  onToggleExpanded,
  onClaimAllCoupons,
}: CartMobileBottomSheetProps) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(50px+env(safe-area-inset-bottom,0px))] z-50 rounded-t-2xl bg-white px-[15px] pt-4 pb-4 shadow-[0_-4px_5px_rgba(0,0,0,0.08)] lg:hidden">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex h-12 items-center justify-between rounded bg-light px-4">
            <div className="flex items-center gap-2">
              <img src={iconCoupon} alt="" aria-hidden className="size-[18px] shrink-0" draggable={false} />
              <span className="text-bodyRegular2 text-textDefault">받을 수 있는 쿠폰이 있어요!</span>
            </div>
            <button
              type="button"
              className="border-0 bg-transparent p-0 text-bodyRegular2 text-dark underline"
              onClick={onClaimAllCoupons}
            >
              전체받기
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {expanded ? (
              <div className="flex flex-col gap-4 border-b border-lightGray pb-6 text-bodyRegular1">
                <div className="flex items-center justify-between text-textDefault">
                  <span>총 상품금액</span>
                  <span className="font-normal text-dark">{formatPrice(productTotal)}</span>
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
            ) : null}

            <div className="flex items-center justify-between">
              <p className="m-0 text-bodyBold1 text-dark">총 {selectedQuantity}개</p>
              <button
                type="button"
                className="flex items-center gap-2 border-0 bg-transparent p-0"
                aria-expanded={expanded}
                aria-label={expanded ? '결제 금액 상세 접기' : '결제 금액 상세 펼치기'}
                onClick={onToggleExpanded}
              >
                <span className="text-bodyBold1 text-dark">{formatPrice(paymentTotal)}</span>
                <img
                  src={iconChevron}
                  alt=""
                  aria-hidden
                  className={`size-4 object-contain transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                  draggable={false}
                />
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="flex h-12 w-full items-center justify-center rounded bg-dark text-bodyMedium1 text-white"
          onClick={() => navigateSpa(CHECKOUT_PATH)}
        >
          주문하기
        </button>
      </div>
    </div>
  )
}
