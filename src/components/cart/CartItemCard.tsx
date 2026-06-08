import { useState } from 'react'
import { ProductThumbFrame } from '../atoms/ProductThumbFrame'
import { figmaAsset, resolveAssetUrl } from '../../lib/figmaAssetUrl'
import type { CartItem } from '../../data/cartContent'

const iconClose = figmaAsset('icons/search_close.svg')
const iconMinus = figmaAsset('icons/list_minus.svg')
const iconPlus = figmaAsset('icons/list_plus.svg')
const iconOptionModify = figmaAsset('icons/ico_option_modify.svg')

function formatPrice(value: number) {
  return value.toLocaleString('ko-KR')
}

function CartCheckbox({
  checked,
  onChange,
  ariaLabel,
  size = 'sm',
}: {
  checked: boolean
  onChange: () => void
  ariaLabel: string
  size?: 'sm' | 'lg'
}) {
  const sizeClass = 'size-5'

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={`flex ${sizeClass} shrink-0 items-center justify-center rounded border ${
        checked ? 'border-dark bg-dark' : 'border-gray bg-white'
      }`}
      onClick={onChange}
    >
      {checked ? (
        <span className="text-[12px] font-bold leading-none text-white" aria-hidden>
          ✓
        </span>
      ) : null}
    </button>
  )
}

function QuantityStepper({
  quantity,
  onDecrease,
  onIncrease,
}: {
  quantity: number
  onDecrease: () => void
  onIncrease: () => void
}) {
  return (
    <div className="flex items-center">
      <button
        type="button"
        aria-label="수량 줄이기"
        className="flex size-10 items-center justify-center rounded-l border border-r-0 border-gray bg-white"
        onClick={onDecrease}
      >
        <img src={iconMinus} alt="" aria-hidden className="size-4 object-contain" draggable={false} />
      </button>
      <div className="flex size-10 items-center justify-center border-y border-gray bg-white text-bodyRegular2 text-dark">
        {quantity}
      </div>
      <button
        type="button"
        aria-label="수량 늘리기"
        className="flex size-10 items-center justify-center rounded-r border border-l-0 border-gray bg-white"
        onClick={onIncrease}
      >
        <img src={iconPlus} alt="" aria-hidden className="size-4 object-contain" draggable={false} />
      </button>
    </div>
  )
}

export { CartCheckbox, QuantityStepper }

export interface CartItemCardProps {
  item: CartItem
  onToggleSelected: () => void
  onRemove: () => void
  onQuantityChange: (quantity: number) => void
}

/** Figma 3354:16344 — cart line item card. */
export function CartItemCard({ item, onToggleSelected, onRemove, onQuantityChange }: CartItemCardProps) {
  const [draftQuantity, setDraftQuantity] = useState(item.quantity)
  const lineTotal = item.price * item.quantity

  return (
    <article className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-2.5">
          <CartCheckbox
            checked={item.selected}
            onChange={onToggleSelected}
            ariaLabel={`${item.productName} 선택`}
          />
          <ProductThumbFrame src={resolveAssetUrl(item.image)} alt="" className="w-[88px] shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="m-0 text-bodyMedium2 text-textDefault">{item.productName}</p>
            <p className="mt-1 m-0 text-bodyBold3 text-dark">{formatPrice(item.price)}</p>
            <p className="mt-2 m-0 text-bodySmall1 text-subtleText">{item.shippingLabel}</p>
          </div>
        </div>
        <button type="button" className="border-0 bg-transparent p-0" aria-label="상품 삭제" onClick={onRemove}>
          <img src={iconClose} alt="" aria-hidden className="size-6 object-contain" draggable={false} />
        </button>
      </div>

      <div className="bg-light3 p-4">
        <div className="flex items-center gap-2">
          <img
            src={iconOptionModify}
            alt=""
            aria-hidden
            className="size-1.5 shrink-0 object-contain"
            draggable={false}
          />
          <div className="flex items-center gap-3 text-bodySmall text-textDefault">
            <span>{item.optionLabel}</span>
            <button type="button" className="border-0 bg-transparent p-0 text-dark underline">
              옵션변경
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-bodyRegular2 text-dark">수량</span>
          <div className="flex items-center gap-2">
            <QuantityStepper
              quantity={draftQuantity}
              onDecrease={() => setDraftQuantity((value) => Math.max(1, value - 1))}
              onIncrease={() => setDraftQuantity((value) => value + 1)}
            />
            <button
              type="button"
              className="flex h-10 w-16 items-center justify-center rounded border border-gray bg-white text-bodyMedium2 text-dark"
              onClick={() => onQuantityChange(draftQuantity)}
            >
              변경
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-lightGray py-6 text-bodyRegular2 text-dark">
          <span>주문금액</span>
          <span className="text-bodyBold3">{formatPrice(lineTotal)}</span>
        </div>
      </div>

      <div className="border-y border-lightGray bg-light3 px-4 py-6">
        <p className="m-0 text-bodyMedium2 text-dark">{item.shippingBreakdown.label}</p>
        <p className="mt-2 m-0 text-bodyMedium2 text-textDefault">
          {`상품구매금액 ${formatPrice(item.shippingBreakdown.productAmount)} + 배송비 ${formatPrice(item.shippingBreakdown.shippingFee)} + 지역별배송비 ${formatPrice(item.shippingBreakdown.regionalShippingFee)}`}
        </p>
        <p className="mt-2 m-0 text-bodyRegular2 text-dark">
          합계 : <span className="text-bodyBold3">{formatPrice(item.shippingBreakdown.total)}</span>
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="flex h-12 flex-1 items-center justify-center rounded border border-gray bg-white text-bodyRegular1 text-dark"
        >
          관심상품
        </button>
        <button
          type="button"
          className="flex h-12 flex-1 items-center justify-center rounded border border-dark bg-dark text-button text-white"
        >
          주문하기
        </button>
      </div>
    </article>
  )
}
