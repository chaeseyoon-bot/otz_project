import { MobileHeaderBackButton } from '../atoms/MobileHeaderBackButton'
import { MobileHeaderUtilityIcons } from '../molecules/MobileHeaderUtilityIcons'
import { navigateSpa } from '../../lib/spaNavigation'

/** Figma 2985:26202 — GNB MO Empty: back + utility icons. */
export function ArchiveMobileDetailHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-[52px] shrink-0 items-center gap-[10px] bg-white px-3 lg:hidden">
      <MobileHeaderBackButton ariaLabel="아카이브 목록으로" onClick={() => navigateSpa('/archive')} />
      <div className="min-w-0 flex-1" aria-hidden />
      <MobileHeaderUtilityIcons />
    </header>
  )
}
