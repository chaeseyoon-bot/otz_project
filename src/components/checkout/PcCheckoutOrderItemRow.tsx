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

export interface PcCheckoutOrderItemRowProps {
  item: CartItem
}

/** Figma 58:4194 — PC checkout order line item. */
export function PcCheckoutOrderItemRow({ item }: PcCheckoutOrderItemRowProps) {
  return (
    <div className="flex gap-6">
      <ProductThumbFrame
        src={resolveAssetUrl(item.image)}
        alt=""
        className="w-[120px] shrink-0 [&>div]:h-[150px] [&>div]:bg-light"
      />
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="m-0 text-bodyRegular1 text-textDefault">{item.productName}</p>
          <div className="flex items-center gap-1.5 text-bodyRegular1 text-subtleText">
            <span>{parseOptionSize(item.optionLabel)}</span>
            <span className="text-lightGray" aria-hidden>
              |
            </span>
            <span>{item.quantity}개</span>
          </div>
          <p className="m-0 text-bodyBold1 text-dark">{formatPrice(item.price)}</p>
        </div>
        {item.deliveryEstimate ? (
          <p className="m-0 shrink-0 whitespace-nowrap text-bodyRegular2 text-subtleText">
            {item.deliveryEstimate}
          </p>
        ) : null}
      </div>
    </div>
  )
}
