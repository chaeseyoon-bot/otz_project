import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'

export interface CouponNoticePopupProps {
  open: boolean
  message: string
  onClose: () => void
}

/** Mobile coupon feedback layer popup — replaces bottom toast for coupon actions. */
export function CouponNoticePopup({ open, message, onClose }: CouponNoticePopupProps) {
  useLockBodyScroll(open)

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
        aria-labelledby="coupon-notice-popup-title"
        className="w-full max-w-[343px] rounded-2xl bg-white px-4 pb-5 pt-[50px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-[30px]">
          <p id="coupon-notice-popup-title" className="m-0 text-center text-bodyRegular1 text-dark">
            {message}
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
