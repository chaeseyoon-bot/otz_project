import { figmaAsset } from '../../lib/figmaAssetUrl'

const iconChevronLeft = figmaAsset('icons/chevron-left.svg')

interface MyPageChevronLinkProps {
  label: string
  onClick?: () => void
  /** MO: centered bar button · PC: text link aligned end */
  variant: 'mobile' | 'pc'
  className?: string
}

/** Figma 3169:10892 — chevron text link (등급별 혜택 보기, 상세보기). */
export function MyPageChevronLink({ label, onClick, variant, className }: MyPageChevronLinkProps) {
  const chevron = (
    <img
      src={iconChevronLeft}
      alt=""
      aria-hidden
      className="size-4 rotate-180 object-contain"
      draggable={false}
    />
  )

  if (variant === 'mobile') {
    return (
      <button
        type="button"
        className={`mt-4 flex w-full items-center justify-center gap-1 rounded bg-lightGray px-2 py-3 ${className ?? ''}`}
        onClick={onClick}
      >
        <span className="text-bodyMedium2 text-dark">{label}</span>
        {chevron}
      </button>
    )
  }

  return (
    <button
      type="button"
      className={`flex items-center gap-1 border-0 bg-transparent p-0 ${className ?? ''}`}
      onClick={onClick}
    >
      <span className="text-bodyMedium2 text-textDefault">{label}</span>
      {chevron}
    </button>
  )
}
