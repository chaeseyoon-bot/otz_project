import type { MyPageGrade } from './types'

export interface MyPageGradeConfig {
  label: MyPageGrade
  badgeClassName: string
}

export const MY_PAGE_GRADE_CONFIG: Record<MyPageGrade, MyPageGradeConfig> = {
  HELLO: { label: 'HELLO', badgeClassName: 'bg-dark' },
  FRIEND: { label: 'FRIEND', badgeClassName: 'bg-dark' },
  FAN: { label: 'FAN', badgeClassName: 'bg-secondary' },
  MUSE: { label: 'MUSE', badgeClassName: 'bg-flamingo' },
}

export function resolveMyPageGrade(gradeLabel: string): MyPageGrade {
  const normalized = gradeLabel.toUpperCase()
  if (normalized in MY_PAGE_GRADE_CONFIG) {
    return normalized as MyPageGrade
  }
  return 'HELLO'
}
