import type { MyPageUserSummary } from '../../data/myPageContent'
import { MyPageStatValue } from './MyPageStatValue'

interface MyPageStatsPanelProps {
  user: MyPageUserSummary
  className?: string
}

function PcStatColumn({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-between self-stretch border-r border-[#e5e5e5] py-2.5 last:border-r-0">
      <p className="m-0 text-titleMedium text-subtleText">{label}</p>
      <MyPageStatValue value={value} suffix={suffix} variant="pc" />
    </div>
  )
}

/** Figma 3169:11072 — PC horizontal stat panel. */
export function MyPageStatsPanel({ user, className }: MyPageStatsPanelProps) {
  return (
    <section className={`flex min-w-0 flex-1 rounded-[15px] bg-light px-6 py-[70px] ${className ?? ''}`}>
      <div className="flex w-full items-center">
        <PcStatColumn label="나의 보유 쿠폰" value={user.couponCount} suffix="개" />
        <PcStatColumn label="상품 리뷰" value={user.reviewCount} suffix="개" />
        <PcStatColumn label="나의 적립금" value={user.pointBalance} suffix="P" />
      </div>
    </section>
  )
}
