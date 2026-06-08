import { MobileHeaderBackButton } from '../atoms/MobileHeaderBackButton'
import { figmaAsset } from '../../lib/figmaAssetUrl'
import { navigateSpa } from '../../lib/spaNavigation'

const iconHome = figmaAsset('icons/tab_home.svg')

/** Figma 3354:16289 — MO cart action bar (back + title + home). */
export function CartMobileHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-[52px] shrink-0 items-center gap-1 bg-white px-3 lg:hidden">
      <MobileHeaderBackButton ariaLabel="뒤로 가기" onClick={() => window.history.back()} />
      <h1 className="m-0 min-w-0 flex-1 truncate pl-1.5 text-titleMedium text-black">장바구니</h1>
      <button
        type="button"
        className="flex size-6 shrink-0 items-center justify-center border-0 bg-transparent p-0"
        aria-label="홈"
        onClick={() => navigateSpa('/')}
      >
        <img src={iconHome} alt="" aria-hidden className="size-6 object-contain" draggable={false} />
      </button>
    </header>
  )
}
