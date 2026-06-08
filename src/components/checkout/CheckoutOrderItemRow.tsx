import { ProductThumbFrame } from '../atoms/ProductThumbFrame'
import { resolveAssetUrl } from '../../lib/figmaAssetUrl'
import type { CartItem } from '../../data/cartContent'

function formatPrice(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

function parseOptionSize(optionLabel: string) {
  const match = optionLabel.match(/:\s*(\d+)\]/)
  return match?.[1] ?? optionLabel.replace(/^\[옵션\s*:\s*/i, '').replace(/\]$/, '')
}

export interface CheckoutOrderItemRowProps {
  item: CartItem
}

/** Figma 56:6295 — checkout order line item. */
export function CheckoutOrderItemRow({ item }: CheckoutOrderItemRowProps) {
  return (
    <div className="flex gap-4">
      <ProductThumbFrame src={resolveAssetUrl(item.image)} alt="" className="w-[88px] shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-col gap-1">
          <p className="m-0 text-bodySmall text-textDefault">{item.productName}</p>
          <div className="flex items-center gap-1.5 text-bodySmall text-subtleText">
            <span>{parseOptionSize(item.optionLabel)}</span>
            <span className="text-lightGray" aria-hidden>
              |
            </span>
            <span>{item.quantity}개</span>
          </div>
          <p className="m-0 text-bodyBold3 text-dark">{formatPrice(item.price)}</p>
        </div>
        {item.deliveryEstimate ? (
          <p className="m-0 text-bodySmall1 text-subtleText">{item.deliveryEstimate}</p>
        ) : null}
      </div>
    </div>
  )
}
