export interface ProductCouponItem {
  id: string
  discountLabel: string
  title: string
  validity: string
  /** When true, the coupon can be downloaded repeatedly and keeps the download icon. */
  unlimited?: boolean
}

/** Figma g60Jix8lxQjYRzn3l7MNWf node 66:3317 — PDP coupon benefits sheet. */
export const PRODUCT_DETAIL_COUPONS: ProductCouponItem[] = [
  {
    id: 'new-year-20',
    discountLabel: '20% 할인',
    title: '신년맞이 회원 혜택 20% 할인 쿠폰',
    validity: '사용기간 : 2026-02-01 23:59 까지 사용 가능',
  },
  {
    id: 'new-year-5000',
    discountLabel: '5,000원 할인',
    title: '신년맞이 회원 혜택 5,000원 할인 쿠폰',
    validity: '사용기간 : 2026-02-01 23:59 까지 사용 가능',
  },
  {
    id: 'jan-online-10',
    discountLabel: '추가 10% 할인',
    title: '1월 온라인단독 추가 10% 할인 쿠폰',
    validity: '사용기간 : 2026-02-01 23:59 까지 사용 가능',
    unlimited: true,
  },
]

export function isCouponDownloadComplete(coupon: ProductCouponItem, claimedIds: Set<string>): boolean {
  return !coupon.unlimited && claimedIds.has(coupon.id)
}

export function getUnclaimedLimitedCoupons(claimedIds: Set<string>): ProductCouponItem[] {
  return PRODUCT_DETAIL_COUPONS.filter((coupon) => !coupon.unlimited && !claimedIds.has(coupon.id))
}

export function areAllLimitedCouponsClaimed(claimedIds: Set<string>): boolean {
  return PRODUCT_DETAIL_COUPONS.filter((coupon) => !coupon.unlimited).every((coupon) =>
    claimedIds.has(coupon.id),
  )
}
