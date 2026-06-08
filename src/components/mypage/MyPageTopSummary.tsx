import type { MyPageTopSummaryProps } from './types'
import { MyPageMembershipPanel } from './MyPageMembershipPanel'
import { MyPageStatsGrid } from './MyPageStatsGrid'
import { MyPageStatsPanel } from './MyPageStatsPanel'

/** Figma 3169:10893 (MO) · 3169:11072 (PC) — membership top summary. */
export function MyPageTopSummary({ user, variant, onBenefitsClick, className }: MyPageTopSummaryProps) {
  if (variant === 'mobile') {
    return (
      <section className={`rounded-[15px] bg-light px-4 py-6 ${className ?? ''}`}>
        <MyPageMembershipPanel user={user} variant="mobile" onBenefitsClick={onBenefitsClick} />
        <div className="mt-4">
          <MyPageStatsGrid user={user} />
        </div>
      </section>
    )
  }

  return (
    <div className={`flex w-full gap-5 ${className ?? ''}`}>
      <section className="w-[396px] shrink-0 rounded-[15px] bg-light p-8">
        <MyPageMembershipPanel user={user} variant="pc" onBenefitsClick={onBenefitsClick} />
      </section>
      <MyPageStatsPanel user={user} />
    </div>
  )
}
