import { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  getUnclaimedLimitedCoupons,
  PRODUCT_DETAIL_COUPONS,
} from '../../data/productCouponContent'
import { figmaAsset } from '../../lib/figmaAssetUrl'
import { ProductCouponCard } from './ProductCouponBenefitsSheet'

const iconClose = figmaAsset('icons/search_close.svg')

export interface ProductCouponBenefitsModalProps {
  open: boolean
  claimedIds: Set<string>
  onClose: () => void
  onClaimOne: (couponId: string) => void
  onClaimAll: () => void
}

/** Figma g60Jix8lxQjYRzn3l7MNWf node 60:2670 — desktop PDP coupon benefits modal. */
export function ProductCouponBenefitsModal({
  open,
  claimedIds,
  onClose,
  onClaimOne,
  onClaimAll,
}: ProductCouponBenefitsModalProps) {
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
      className="fixed inset-0 z-[70] hidden items-center justify-center bg-black/40 px-4 lg:flex"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-coupon-benefits-modal-title"
        className="relative flex w-full max-w-[500px] flex-col rounded-2xl bg-white px-6 pb-6 pt-12"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-5 top-5 flex size-6 items-center justify-center border-0 bg-transparent p-0"
          aria-label="쿠폰 혜택 받기 닫기"
          onClick={onClose}
        >
          <img src={iconClose} alt="" aria-hidden className="size-6 object-contain" draggable={false} />
        </button>

        <div className="flex flex-col gap-4">
          <h2
            id="product-coupon-benefits-modal-title"
            className="m-0 text-center text-titleMedium text-dark"
          >
            쿠폰 혜택 받기
          </h2>

          <p className="m-0 px-5 text-bodySmall text-textDefault">
            쿠폰 사용 기간 및 조건은 쿠폰 받기 후{' '}
            <span className="text-dark underline">마이페이지 &gt; 쿠폰</span>에서 확인 가능합니다.
          </p>

          <div className="flex max-h-[min(360px,50vh)] flex-col gap-[14px] overflow-y-auto pr-1">
            {PRODUCT_DETAIL_COUPONS.map((coupon) => (
              <ProductCouponCard
                key={coupon.id}
                coupon={coupon}
                claimedIds={claimedIds}
                onClaimOne={onClaimOne}
              />
            ))}
          </div>

          <button
            type="button"
            className="flex h-12 w-full items-center justify-center rounded bg-dark text-bodyMedium1 text-white disabled:opacity-40"
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
