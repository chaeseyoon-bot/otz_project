import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'

export interface CartAddedPopupProps {
  open: boolean
  onClose: () => void
  onGoToCart: () => void
  /** Desktop overlays keep page scroll to avoid scrollbar layout shift. */
  lockBodyScroll?: boolean
}

/** Figma 2824:24171 — cart add confirmation layer popup. */
export function CartAddedPopup({
  open,
  onClose,
  onGoToCart,
  lockBodyScroll = true,
}: CartAddedPopupProps) {
  useLockBodyScroll(open && lockBodyScroll)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex touch-none items-center justify-center bg-[var(--otz-color-overlay-strong)] px-[15px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-added-popup-title"
        className="w-full max-w-[343px] rounded-2xl bg-white px-4 pb-5 pt-11"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-[30px]">
          <p id="cart-added-popup-title" className="m-0 text-center text-bodyRegular1 text-dark">
            장바구니에 상품이 담겼습니다.
          </p>
          <div className="flex w-full gap-2">
            <button
              type="button"
              className="flex h-11 min-w-0 flex-1 items-center justify-center rounded border border-gray bg-white text-button text-dark"
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="button"
              className="flex h-11 min-w-0 flex-1 items-center justify-center rounded bg-dark text-button text-white"
              onClick={onGoToCart}
            >
              장바구니 가기
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
