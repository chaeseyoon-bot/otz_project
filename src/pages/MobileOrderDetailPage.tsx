import { MobileHeaderBackButton } from '../components/atoms/MobileHeaderBackButton'
import { figmaAsset } from '../lib/figmaAssetUrl'
import { navigateSpa } from '../lib/spaNavigation'

const iconHome = figmaAsset('icons/tab_home.svg')

/** Placeholder until order detail page is implemented. */
export function MobileOrderDetailPage({ orderId }: { orderId: string }) {
  return (
    <main className="bg-white lg:hidden">
      <header className="sticky top-0 z-50 flex h-[52px] shrink-0 items-center gap-1 bg-white px-3">
        <MobileHeaderBackButton ariaLabel="뒤로 가기" onClick={() => window.history.back()} />
        <h1 className="m-0 min-w-0 flex-1 truncate pl-1.5 text-titleMedium text-black">주문 상세</h1>
        <button
          type="button"
          className="flex size-6 shrink-0 items-center justify-center border-0 bg-transparent p-0"
          aria-label="홈"
          onClick={() => navigateSpa('/')}
        >
          <img src={iconHome} alt="" aria-hidden className="size-6 object-contain" draggable={false} />
        </button>
      </header>

      <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
        <p className="m-0 text-bodyBold2 text-dark">주문번호 {orderId}</p>
        <p className="m-0 text-bodyRegular2 text-textDefault">주문 상세 페이지는 준비 중입니다.</p>
      </div>
    </main>
  )
}
