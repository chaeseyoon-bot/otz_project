import { MobileHeaderBackButton } from '../atoms/MobileHeaderBackButton'
import { MobileHeaderUtilityIcons } from '../molecules/MobileHeaderUtilityIcons'
import { BRAND_STORY_PAGE_COPY } from '../../data/brandStoryContent'
import { navigateSpa } from '../../lib/spaNavigation'

/** Figma 2898:6093 — GNB MO action bar (52px, title BRAND STORY). */
export function BrandStoryMobileHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-[52px] shrink-0 items-center gap-1.5 bg-white px-3 lg:hidden">
      <MobileHeaderBackButton ariaLabel="뒤로 가기" onClick={() => navigateSpa('/')} />
      <h1 className="m-0 min-w-0 flex-1 truncate pl-1.5 text-[18px] font-medium leading-[1.2] tracking-[-0.02em] text-dark">
        {BRAND_STORY_PAGE_COPY.pageTitle}
      </h1>
      <MobileHeaderUtilityIcons iconClassName="size-6 object-contain" />
    </header>
  )
}
