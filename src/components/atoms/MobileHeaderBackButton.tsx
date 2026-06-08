import { figmaAsset } from '../../lib/figmaAssetUrl'

const iconChevronLeft = figmaAsset('icons/chevron-left.svg')

export interface MobileHeaderBackButtonProps {
  ariaLabel: string
  onClick: () => void
}

/** Figma icons/chevron-left — shared MO header back control (24×24). */
export function MobileHeaderBackButton({ ariaLabel, onClick }: MobileHeaderBackButtonProps) {
  return (
    <button
      type="button"
      className="flex size-6 shrink-0 items-center justify-center border-0 bg-transparent p-0"
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <img
        src={iconChevronLeft}
        alt=""
        aria-hidden
        className="size-6 object-contain"
        draggable={false}
      />
    </button>
  )
}
