import {
  CATEGORY_MOBILE_MAIN_ITEMS,
  type CategoryMobileMainId,
} from '../../data/categoryMobileMain'

interface CategoryMobileMainDropdownProps {
  activeMainId: CategoryMobileMainId
  onSelect: (mainId: CategoryMobileMainId) => void
}

/** Figma 2497:14138 Dropdown/Focus — main category list under mobile GNB title. */
export function CategoryMobileMainDropdown({ activeMainId, onSelect }: CategoryMobileMainDropdownProps) {
  return (
    <nav
      className="absolute left-0 right-0 top-full z-50 overflow-hidden rounded-b-[16px] bg-white pb-[5px] lg:hidden"
      aria-label="대카테고리"
    >
      {CATEGORY_MOBILE_MAIN_ITEMS.map((item) => {
        const isActive = item.id === activeMainId
        return (
          <button
            key={item.id}
            type="button"
            className="flex h-[50px] w-full items-center border-0 border-t border-solid border-light2 bg-white px-4 py-[13px] first:border-t-0"
            aria-current={isActive ? 'true' : undefined}
            onClick={() => onSelect(item.id)}
          >
            <span
              className={`w-full text-center text-[15px] leading-[1.4] tracking-[-0.02em] ${
                isActive ? 'font-bold text-dark' : 'font-normal text-textDefault'
              }`}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
