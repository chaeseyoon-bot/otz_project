import { MobileHeaderBackButton } from '../atoms/MobileHeaderBackButton'
import { MobileHeaderUtilityIcons } from '../molecules/MobileHeaderUtilityIcons'
import { navigateSpa } from '../../lib/spaNavigation'

/** Figma 2680:17738 — editorial detail MO GNB (back + utility). */
export function EditorialMobileDetailHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-[52px] shrink-0 items-center gap-[10px] bg-white px-3 lg:hidden">
      <MobileHeaderBackButton ariaLabel="에디토리얼 목록으로" onClick={() => navigateSpa('/editorial')} />
      <div className="min-w-0 flex-1" aria-hidden />
      <MobileHeaderUtilityIcons />
    </header>
  )
}
