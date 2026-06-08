import { MobileHeaderBackButton } from '../atoms/MobileHeaderBackButton'
import { MobileHeaderUtilityIcons } from '../molecules/MobileHeaderUtilityIcons'
import { figmaAsset } from '../../lib/figmaAssetUrl'
import { navigateSpa } from '../../lib/spaNavigation'

const iconListChevron = figmaAsset('icons/list_chevron.svg')

interface CategoryMobileHeaderProps {
  title: string
  menuOpen: boolean
  onTitleToggle: () => void
}

/** Figma GNB MO (Category) — back + category title + utility icons. */
export function CategoryMobileHeader({ title, menuOpen, onTitleToggle }: CategoryMobileHeaderProps) {
  return (
    <header className="relative z-50 flex h-[52px] shrink-0 items-center gap-[10px] bg-white px-3 lg:hidden">
      <MobileHeaderBackButton ariaLabel="뒤로 가기" onClick={() => navigateSpa('/')} />
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-1 border-0 bg-transparent p-0 pl-1.5"
        aria-label={`${title} 카테고리`}
        aria-expanded={menuOpen}
        aria-haspopup="listbox"
        onClick={onTitleToggle}
      >
        <span className="truncate text-[18px] font-medium leading-[1.2] tracking-[-0.02em] text-dark">{title}</span>
        <img
          src={iconListChevron}
          alt=""
          aria-hidden
          className={`size-[16px] shrink-0 object-contain transition-transform ${menuOpen ? 'rotate-180' : ''}`}
          draggable={false}
        />
      </button>
      <MobileHeaderUtilityIcons />
    </header>
  )
}
