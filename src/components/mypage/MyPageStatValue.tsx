interface MyPageStatValueProps {
  value: number
  suffix: string
  variant: 'mobile' | 'pc'
  align?: 'start' | 'end'
}

function formatStatValue(value: number) {
  return value.toLocaleString('ko-KR')
}

/** Figma 3169:10892 — stat count + unit (쿠폰/리뷰/적립금). */
export function MyPageStatValue({ value, suffix, variant, align = 'end' }: MyPageStatValueProps) {
  if (variant === 'pc') {
    return (
      <div className={`flex items-center gap-0.5 ${align === 'end' ? 'pl-3' : ''}`}>
        <span className="text-h1 leading-[1.2] text-black">{formatStatValue(value)}</span>
        <span className="flex h-[34px] items-end text-bodyBold1 text-[#1b1d1c]">{suffix}</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-0.5 text-[#1b1d1c] ${align === 'end' ? 'justify-end' : ''}`}>
      <span className="text-h4 leading-[1.2]">{formatStatValue(value)}</span>
      <span className="flex h-6 items-end text-bodyRegular2">{suffix}</span>
    </div>
  )
}
