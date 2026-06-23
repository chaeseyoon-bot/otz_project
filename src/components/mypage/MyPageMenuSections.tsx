import { MY_PAGE_MENU_SECTIONS } from '../../data/myPageContent'
import { figmaAsset } from '../../lib/figmaAssetUrl'
import { navigateSpa } from '../../lib/spaNavigation'
import { WISHLIST_PATH } from '../../lib/wishlistRoutes'

const iconListChevron = figmaAsset('icons/list_chevron.svg')

function MyPageMenuRow({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between border-0 border-b border-lightGray bg-transparent py-4 text-left last:border-b-0"
      onClick={onClick}
    >
      <span className="text-bodyRegular2 text-textDefault">{label}</span>
      <img
        src={iconListChevron}
        alt=""
        aria-hidden
        className="size-4 -rotate-90 object-contain opacity-60"
        draggable={false}
      />
    </button>
  )
}

/** Figma mobile my page — accordion-style menu list (MO only). */
export function MyPageMenuSections({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col gap-10 ${className ?? ''}`}>
      {MY_PAGE_MENU_SECTIONS.map((section) => (
        <section key={section.id}>
          <h2 className="m-0 border-b border-lightGray pb-4 text-bodyBold2 text-dark">{section.title}</h2>
          <div className="flex flex-col">
            {section.items.map((item) => (
              <MyPageMenuRow
                key={item.id}
                label={item.label}
                onClick={
                  item.id === 'wishlist'
                    ? () => navigateSpa(WISHLIST_PATH)
                    : item.id === 'recent'
                      ? () => navigateSpa('/search')
                      : undefined
                }
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
