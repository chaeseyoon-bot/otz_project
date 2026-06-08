import type { MyPageUserSummary } from '../../data/myPageContent'

export type MyPageGrade = 'HELLO' | 'FRIEND' | 'FAN' | 'MUSE'

export type MyPageTopVariant = 'mobile' | 'pc'

export interface MyPageTopSummaryProps {
  user: MyPageUserSummary
  variant: MyPageTopVariant
  onBenefitsClick?: () => void
  className?: string
}

export interface MyPageGradeBadgeProps {
  grade: MyPageGrade
  className?: string
}
