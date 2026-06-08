import { figmaAsset } from '../../lib/figmaAssetUrl'
import { MY_PAGE_GRADE_CONFIG } from './gradeConfig'
import type { MyPageGradeBadgeProps } from './types'

const iconGradeMark = figmaAsset('icons/mypage_grade_01.svg')

/** Figma 3169:10892 — membership grade badge (HELLO / FRIEND / FAN / MUSE). */
export function MyPageGradeBadge({ grade, className }: MyPageGradeBadgeProps) {
  const { badgeClassName } = MY_PAGE_GRADE_CONFIG[grade]

  return (
    <div
      className={`flex size-10 shrink-0 items-center justify-center rounded-full ${badgeClassName} ${className ?? ''}`}
      aria-hidden
    >
      <img src={iconGradeMark} alt="" className="size-[22px] object-contain" draggable={false} />
    </div>
  )
}
