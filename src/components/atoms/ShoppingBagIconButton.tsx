import { figmaAsset } from '../../lib/figmaAssetUrl'

const iconShoppingBag = figmaAsset('icons/gnb_shopping-bag.svg')

export interface ShoppingBagIconButtonProps {
  count: number
  iconClassName?: string
  ariaLabel?: string
  onClick?: () => void
}

/** Figma icons/shopping-bag2 — bag icon with centered count (0 when empty). */
export function ShoppingBagIconButton({
  count,
  iconClassName = 'size-6 object-contain',
  ariaLabel,
  onClick,
}: ShoppingBagIconButtonProps) {
  const label = ariaLabel ?? `장바구니, ${count}개 상품`

  const normalizedIconClassName = `${iconClassName.replace(/\bblock\b/g, '').trim()} flex flex-col items-center justify-start object-contain`.trim()

  return (
    <button
      type="button"
      className="relative flex flex-col items-center justify-center border-0 bg-transparent p-0"
      aria-label={label}
      onClick={onClick}
    >
      <span className="relative inline-flex shrink-0 flex-col items-center justify-start">
        <img src={iconShoppingBag} alt="" aria-hidden className={normalizedIconClassName} draggable={false} />
        <span className="pointer-events-none absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 text-[9px] font-medium leading-none text-dark">
          {count}
        </span>
      </span>
    </button>
  )
}
