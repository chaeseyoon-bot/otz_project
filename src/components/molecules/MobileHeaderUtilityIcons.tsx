import { useMobileGnb } from '../../contexts/MobileGnbContext'
import { useCart } from '../../contexts/CartContext'
import { ShoppingBagIconButton } from '../atoms/ShoppingBagIconButton'
import { figmaAsset } from '../../lib/figmaAssetUrl'
import { CART_PATH } from '../../lib/cartRoutes'
import { navigateSpa } from '../../lib/spaNavigation'

const iconCategory = figmaAsset('icons/gnb_category.svg')
const iconSearch = figmaAsset('icons/gnb_search.svg')

export interface MobileHeaderUtilityIconsProps {
  /** Icon size class for main header (`h-icon w-icon`) vs category header (`size-6`). */
  iconClassName?: string
  menuTriggerId?: string
}

/** Shared GNB utility cluster — menu / search / cart behave the same on every mobile header. */
export function MobileHeaderUtilityIcons({
  iconClassName = 'size-6 object-contain',
  menuTriggerId = 'mobile-gnb-menu-trigger',
}: MobileHeaderUtilityIconsProps) {
  const { isOpen, toggle, close } = useMobileGnb()
  const { itemCount } = useCart()

  return (
    <div className="flex shrink-0 items-center justify-center gap-[14px]">
      <button
        type="button"
        id={menuTriggerId}
        className="border-0 bg-transparent p-0"
        aria-label="메뉴"
        aria-expanded={isOpen}
        aria-controls="mobile-gnb-drawer"
        onClick={toggle}
      >
        <img src={iconCategory} alt="" aria-hidden className={iconClassName} draggable={false} />
      </button>
      <button
        type="button"
        className="border-0 bg-transparent p-0"
        aria-label="검색"
        onClick={() => {
          close()
          navigateSpa('/search')
        }}
      >
        <img src={iconSearch} alt="" aria-hidden className={iconClassName} draggable={false} />
      </button>
      <ShoppingBagIconButton
        count={itemCount}
        iconClassName={iconClassName}
        onClick={() => {
          close()
          navigateSpa(CART_PATH)
        }}
      />
    </div>
  )
}
