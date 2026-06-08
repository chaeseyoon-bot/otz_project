import { resolveMyPageGrade } from './gradeConfig'
import { MyPageChevronLink } from './MyPageChevronLink'
import { MyPageGradeBadge } from './MyPageGradeBadge'
import type { MyPageUserSummary } from '../../data/myPageContent'

interface MyPageMembershipPanelProps {
  user: MyPageUserSummary
  variant: 'mobile' | 'pc'
  onBenefitsClick?: () => void
  className?: string
}

/** Figma 3169:10892 — grade greeting card (MO full / PC left panel). */
export function MyPageMembershipPanel({
  user,
  variant,
  onBenefitsClick,
  className,
}: MyPageMembershipPanelProps) {
  const grade = resolveMyPageGrade(user.gradeLabel)
  const isMobile = variant === 'mobile'

  return (
    <div className={className}>
      <MyPageGradeBadge grade={grade} />
      <div className={isMobile ? 'mt-4' : 'mt-5 flex flex-col gap-8'}>
        <div>
          <p className={`m-0 text-dark ${isMobile ? 'text-bodyRegular2' : 'text-bodyMedium1'}`}>
            “{user.name}” 님의 회원등급은
          </p>
          <p className="mt-1.5 m-0 flex items-baseline gap-1">
            <span className="text-h3 text-dark">{user.gradeLabel}</span>
            <span className={isMobile ? 'text-bodyRegular2 text-dark' : 'text-bodyBold1 text-dark'}>
              입니다
            </span>
          </p>
        </div>
        <MyPageChevronLink
          variant={variant}
          label="등급별 혜택 보기"
          onClick={onBenefitsClick}
          className={isMobile ? undefined : 'w-full justify-end'}
        />
      </div>
    </div>
  )
}
