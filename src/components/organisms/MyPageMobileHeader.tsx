import { MobileHeaderBackButton } from '../atoms/MobileHeaderBackButton'
import { MobileHeaderUtilityIcons } from '../molecules/MobileHeaderUtilityIcons'
import { navigateSpa } from '../../lib/spaNavigation'

/** Figma 3223:26539 — 마이페이지 MO action bar. */
export function MyPageMobileHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-[52px] shrink-0 items-center gap-1.5 bg-white px-3 lg:hidden">
      <MobileHeaderBackButton ariaLabel="뒤로 가기" onClick={() => navigateSpa('/')} />
      <h1 className="m-0 min-w-0 flex-1 truncate pl-1.5 text-titleMedium text-black">마이페이지</h1>
      <MobileHeaderUtilityIcons iconClassName="size-6 object-contain" />
    </header>
  )
}
