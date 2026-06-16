import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  getUnclaimedLimitedCoupons,
  isCouponDownloadComplete,
  PRODUCT_DETAIL_COUPONS,
  type ProductCouponItem,
} from '../../data/productCouponContent'
import { SCROLL_LOCK_ALLOW_ATTR, useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { figmaAsset } from '../../lib/figmaAssetUrl'

const iconClose = figmaAsset('icons/search_close.svg')
const iconCouponDownload = figmaAsset('icons/coupon_download.svg')

export interface ProductCouponBenefitsSheetProps {
  open: boolean
  claimedIds: Set<string>
  onClose: () => void
  onClaimOne: (couponId: string) => void
  onClaimAll: () => void
}

export function CouponDownloadCompleteLabel() {
  return (
    <div
      aria-label="다운완료"
      className="flex shrink-0 flex-col text-center text-bodySmall1 font-medium leading-[1.2] tracking-[-0.48px] text-subtleText"
    >
      <span>다운</span>
      <span>완료</span>
    </div>
  )
}

export function ProductCouponCard({
  coupon,
  claimedIds,
  onClaimOne,
}: {
  coupon: ProductCouponItem
  claimedIds: Set<string>
  onClaimOne: (couponId: string) => void
}) {
  const downloadComplete = isCouponDownloadComplete(coupon, claimedIds)

  return (
    <div className="flex items-center gap-[11px] rounded border border-[#cacaca] bg-white px-[18px] py-[22px]">
      <div className="flex min-w-0 flex-1 flex-col gap-[11px]">
        <span className="text-titleSemibold text-primaryText">{coupon.discountLabel}</span>
        <div className="flex flex-col gap-[3px]">
          <span className="text-bodySmall font-medium text-dark">{coupon.title}</span>
          <span className="text-bodySmall text-textDefault">{coupon.validity}</span>
        </div>
      </div>

      {downloadComplete ? (
        <CouponDownloadCompleteLabel />
      ) : (
        <button
          type="button"
          className="flex size-6 shrink-0 items-center justify-center border-0 bg-transparent p-0"
          aria-label={`${coupon.title} 받기`}
          onClick={() => onClaimOne(coupon.id)}
        >
          <img
            src={iconCouponDownload}
            alt=""
            aria-hidden
            className="size-6 object-contain"
            draggable={false}
          />
        </button>
      )}
    </div>
  )
}

/** Figma g60Jix8lxQjYRzn3l7MNWf node 66:3317 / 66:3345 — mobile PDP coupon benefits bottom sheet. */
export function ProductCouponBenefitsSheet({
  open,
  claimedIds,
  onClose,
  onClaimOne,
  onClaimAll,
}: ProductCouponBenefitsSheetProps) {
  const [entered, setEntered] = useState(false)

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
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const unclaimedLimitedCount = useMemo(
    () => getUnclaimedLimitedCoupons(claimedIds).length,
    [claimedIds],
  )

  if (!open) return null

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
        aria-labelledby="product-coupon-benefits-sheet-title"
        className={`flex max-h-[min(640px,85vh)] w-full flex-col rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom,0px)] transition-transform duration-300 ease-out motion-reduce:transition-none ${
          entered ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-center gap-5 px-4 pb-4 pt-5">
          <h2 id="product-coupon-benefits-sheet-title" className="m-0 flex-1 text-bodyMedium1 text-dark">
            사용 가능 쿠폰
          </h2>
          <button
            type="button"
            className="flex size-6 shrink-0 items-center justify-center border-0 bg-transparent p-0"
            aria-label="사용 가능 쿠폰 닫기"
            onClick={onClose}
          >
            <img src={iconClose} alt="" aria-hidden className="size-6 object-contain" draggable={false} />
          </button>
        </header>

        <p className="m-0 shrink-0 px-5 pb-4 text-bodySmall text-textDefault">
          쿠폰 사용 기간 및 조건은 쿠폰 받기 후{' '}
          <span className="text-dark underline">마이페이지 &gt; 쿠폰</span>에서 확인 가능합니다.
        </p>

        <div
          {...{ [SCROLL_LOCK_ALLOW_ATTR]: true }}
          className="flex min-h-0 flex-1 flex-col gap-[14px] overflow-y-auto px-4 pb-4"
        >
          {PRODUCT_DETAIL_COUPONS.map((coupon) => (
            <ProductCouponCard
              key={coupon.id}
              coupon={coupon}
              claimedIds={claimedIds}
              onClaimOne={onClaimOne}
            />
          ))}
        </div>

        <div className="shrink-0 p-4">
          <button
            type="button"
            className="flex h-12 w-full items-center justify-center rounded bg-dark text-button text-white disabled:opacity-40"
            disabled={unclaimedLimitedCount === 0}
            onClick={onClaimAll}
          >
            쿠폰 한번에 받기
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
