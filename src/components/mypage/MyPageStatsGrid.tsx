import type { MyPageUserSummary } from '../../data/myPageContent'
import { MyPageStatValue } from './MyPageStatValue'

interface MyPageStatsGridProps {
  user: MyPageUserSummary
  className?: string
}

/** Figma 3169:10893 — MO stat tiles (2+1 grid). */
export function MyPageStatsGrid({ user, className }: MyPageStatsGridProps) {
  return (
    <div className={`flex flex-col gap-2 ${className ?? ''}`}>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded bg-white p-4">
          <p className="m-0 text-bodyMedium2 text-subtleText">나의 보유 쿠폰</p>
          <MyPageStatValue value={user.couponCount} suffix="개" variant="mobile" />
        </div>
        <div className="rounded bg-white p-4">
          <p className="m-0 text-bodyMedium2 text-subtleText">상품 리뷰</p>
          <MyPageStatValue value={user.reviewCount} suffix="개" variant="mobile" />
        </div>
      </div>
      <div className="rounded bg-white p-4">
        <p className="m-0 text-bodyMedium2 text-subtleText">나의 적립금</p>
        <MyPageStatValue value={user.pointBalance} suffix="P" variant="mobile" />
      </div>
    </div>
  )
}
