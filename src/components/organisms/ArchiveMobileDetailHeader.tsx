import { figmaAsset } from '../../lib/figmaAssetUrl'
import { navigateSpa } from '../../lib/spaNavigation'
import { MobileHeaderBackButton } from '../atoms/MobileHeaderBackButton'
import { MobileHeaderUtilityIcons } from '../molecules/MobileHeaderUtilityIcons'

const iconHome = figmaAsset('icons/tab_home.svg')

/** Figma 2985:26202 — archive detail MO GNB (back + home + utility). */
export function ArchiveMobileDetailHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-[52px] shrink-0 items-center gap-[10px] bg-white px-3 lg:hidden">
      <div className="flex items-center gap-[10px]">
        <MobileHeaderBackButton ariaLabel="아카이브 목록으로" onClick={() => navigateSpa('/archive')} />
        <button
          type="button"
          className="flex size-6 shrink-0 items-center justify-center border-0 bg-transparent p-0"
          aria-label="홈"
          onClick={() => navigateSpa('/')}
        >
          <img src={iconHome} alt="" aria-hidden className="size-6 object-contain" draggable={false} />
        </button>
      </div>
      <div className="min-w-0 flex-1" aria-hidden />
      <MobileHeaderUtilityIcons menuTriggerId="mobile-gnb-menu-trigger-archive-detail" />
    </header>
  )
}
