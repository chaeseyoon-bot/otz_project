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

function parseOptionSize(optionLabel: string, productId: string) {
  return parseOptionLabelSize(optionLabel, productId)
}

export interface CartOptionChangeSheetProps {
  open: boolean
  item: CartItem | null
  onClose: () => void
  onConfirm: (optionSize: string, quantity: number) => void
}

/** Figma 49:1808 — mobile cart option/quantity bottom sheet over order summary. */
export function CartOptionChangeSheet({ open, item, onClose, onConfirm }: CartOptionChangeSheetProps) {
  const [entered, setEntered] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string>('240')
  const [quantity, setQuantity] = useState(1)

  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) {
      setEntered(false)
      return
    }
    const frame = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => {
    if (!open || !item) return
    const productId = parseCartProductId(item.id)
    setSelectedSize(parseOptionSize(item.optionLabel, productId))
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
      className={`fixed inset-0 z-[60] flex touch-none flex-col justify-end bg-[var(--otz-color-overlay-strong)] transition-opacity duration-300 ease-out lg:hidden ${
        entered ? 'opacity-100' : 'opacity-0'
      }`}
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-option-change-sheet-title"
        className={`w-full rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom,0px)] transition-transform duration-300 ease-out motion-reduce:transition-none ${
          entered ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center gap-5 px-4 pb-4 pt-5">
          <h2 id="cart-option-change-sheet-title" className="m-0 flex-1 text-bodyMedium1 text-dark">
            옵션/수량
          </h2>
          <button
            type="button"
            className="flex size-6 shrink-0 items-center justify-center border-0 bg-transparent p-0"
            aria-label="옵션 변경 닫기"
            onClick={onClose}
          >
            <img src={iconClose} alt="" aria-hidden className="size-6 object-contain" draggable={false} />
          </button>
        </header>

        <div className="flex flex-col gap-2.5 px-4">
          <div className="relative">
            <select
              value={selectedSize}
              aria-label="사이즈 선택"
              className="h-[42px] w-full appearance-none border border-gray bg-white px-4 text-bodyRegular2 text-dark"
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
              className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 object-contain"
              draggable={false}
            />
          </div>

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

        <div className="mt-4 bg-gradient-to-b from-transparent to-white px-[15px] py-4">
          <div className="flex gap-2">
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
