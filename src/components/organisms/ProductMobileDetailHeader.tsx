import { figmaAsset } from '../../lib/figmaAssetUrl'
import { navigateSpa } from '../../lib/spaNavigation'
import { MobileHeaderBackButton } from '../atoms/MobileHeaderBackButton'
import { MobileHeaderUtilityIcons } from '../molecules/MobileHeaderUtilityIcons'

const iconHome = figmaAsset('icons/tab_home.svg')

/** Figma 2985:25575 — PDP MO: back + home (no bottom tab bar). */
export function ProductMobileDetailHeader() {
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back()
      return
    }
    navigateSpa('/category/shoes')
  }

  return (
    <header className="sticky top-0 z-50 flex h-[52px] shrink-0 items-center justify-between bg-white px-3 lg:hidden">
      <div className="flex items-center gap-2.5">
        <MobileHeaderBackButton ariaLabel="뒤로 가기" onClick={handleBack} />
        <button
          type="button"
          className="flex size-6 shrink-0 items-center justify-center border-0 bg-transparent p-0"
          aria-label="홈"
          onClick={() => navigateSpa('/')}
        >
          <img src={iconHome} alt="" aria-hidden className="size-6 object-contain" draggable={false} />
        </button>
      </div>
      <MobileHeaderUtilityIcons menuTriggerId="mobile-gnb-menu-trigger-pdp" />
    </header>
  )
}
