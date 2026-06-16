import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'

export interface ProductOptionRequiredPopupProps {
  open: boolean
  onClose: () => void
  lockBodyScroll?: boolean
}

/** Figma 2824:23951 — required option alert layer popup. */
export function ProductOptionRequiredPopup({
  open,
  onClose,
  lockBodyScroll = true,
}: ProductOptionRequiredPopupProps) {
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
        aria-labelledby="product-option-required-popup-title"
        className="w-full max-w-[343px] rounded-2xl bg-white px-4 pb-5 pt-[50px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-[30px]">
          <p id="product-option-required-popup-title" className="m-0 text-center text-bodyRegular1 text-dark">
            필수 옵션을 선택해주세요.
          </p>
          <button
            type="button"
            className="flex h-11 w-full items-center justify-center rounded bg-dark text-button text-white"
            onClick={onClose}
          >
            확인
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
