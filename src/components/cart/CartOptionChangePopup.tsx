import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CartItem } from '../../data/cartContent'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { figmaAsset } from '../../lib/figmaAssetUrl'
import {
  getStorefrontSizeOptionsForProductId,
  parseCartProductId,
  parseOptionLabelSize,
} from '../../lib/productSizeOptions'

const iconClose = figmaAsset('icons/search_close.svg')
const iconMinus = figmaAsset('icons/list_minus.svg')
const iconPlus = figmaAsset('icons/list_plus.svg')
const iconChevron = figmaAsset('icons/list_chevron.svg')

export interface CartOptionChangePopupProps {
  open: boolean
  item: CartItem | null
  onClose: () => void
  onConfirm: (optionSize: string, quantity: number) => void
}

/** Figma 60:2797 — PC cart option/quantity centered layer popup. */
export function CartOptionChangePopup({ open, item, onClose, onConfirm }: CartOptionChangePopupProps) {
  const [selectedSize, setSelectedSize] = useState<string>('240')
  const [quantity, setQuantity] = useState(1)

  useLockBodyScroll(open)

  useEffect(() => {
    if (!open || !item) return
    const productId = parseCartProductId(item.id)
    setSelectedSize(parseOptionLabelSize(item.optionLabel, productId))
    setQuantity(item.quantity)
  }, [open, item])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open || !item) return null

  const productId = parseCartProductId(item.id)
  const sizeOptions = getStorefrontSizeOptionsForProductId(productId)

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex touch-none items-center justify-center bg-[var(--otz-color-overlay-strong)] px-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-option-change-popup-title"
        className="relative w-full max-w-[354px] rounded-2xl bg-white px-6 pb-6 pt-12"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-6 top-5 flex size-6 shrink-0 items-center justify-center border-0 bg-transparent p-0"
          aria-label="옵션 변경 닫기"
          onClick={onClose}
        >
          <img src={iconClose} alt="" aria-hidden className="size-6 object-contain" draggable={false} />
        </button>

        <div className="flex flex-col items-center gap-4">
          <h2 id="cart-option-change-popup-title" className="m-0 w-full text-center text-titleMedium text-dark">
            옵션/수량
          </h2>

          <div className="flex w-full flex-col gap-2.5 pt-6">
            <label className="relative block">
              <select
                value={selectedSize}
                aria-label="사이즈 선택"
                className="h-10 w-full appearance-none rounded border border-gray bg-white px-4 text-bodyRegular2 text-dark"
                onChange={(event) => setSelectedSize(event.target.value)}
              >
                {sizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <img
                src={iconChevron}
                alt=""
                aria-hidden
                className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 object-contain"
                draggable={false}
              />
            </label>

            <div className="flex items-center">
              <button
                type="button"
                aria-label="수량 줄이기"
                className="flex size-10 shrink-0 items-center justify-center rounded border border-gray bg-white"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              >
                <img src={iconMinus} alt="" aria-hidden className="size-4 object-contain" draggable={false} />
              </button>
              <div className="flex h-10 min-w-0 flex-1 items-center justify-center bg-white px-4 text-bodyRegular2 text-dark">
                {quantity}
              </div>
              <button
                type="button"
                aria-label="수량 늘리기"
                className="flex size-10 shrink-0 items-center justify-center rounded border border-gray bg-white p-0.5"
                onClick={() => setQuantity((value) => value + 1)}
              >
                <img src={iconPlus} alt="" aria-hidden className="size-4 object-contain" draggable={false} />
              </button>
            </div>
          </div>

          <div className="flex w-full gap-2">
            <button
              type="button"
              className="flex h-12 min-w-0 flex-1 items-center justify-center rounded border border-gray bg-white text-bodyMedium1 text-dark"
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="button"
              className="flex h-12 min-w-0 flex-1 items-center justify-center rounded border border-dark bg-dark text-bodyMedium1 text-white"
              onClick={() => onConfirm(selectedSize, quantity)}
            >
              변경
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
