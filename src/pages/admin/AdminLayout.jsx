import { navigateSpa } from '../../lib/spaNavigation'
import {
  ADMIN_ARCHIVE_PATH,
  ADMIN_EDITORIAL_PATH,
  ADMIN_MAIN_PATH,
  ADMIN_PRODUCT_NEW_PATH,
  ADMIN_PRODUCTS_PATH,
} from '../../lib/adminRoutes'

const ADMIN_MENU_ITEMS = [
  { id: 'products-list', label: '상품 목록', path: ADMIN_PRODUCTS_PATH },
  { id: 'products-new', label: '상품 등록', path: ADMIN_PRODUCT_NEW_PATH },
  { id: 'main', label: '홈메인관리', path: ADMIN_MAIN_PATH },
  { id: 'editorial', label: '에디토리얼', path: ADMIN_EDITORIAL_PATH },
  { id: 'archive', label: '아카이브', path: ADMIN_ARCHIVE_PATH },
  { id: 'orders', label: '주문 관리', path: '/admin/orders', disabled: true },
  { id: 'members', label: '회원 관리', path: '/admin/members', disabled: true },
  { id: 'settings', label: '설정', path: '/admin/settings', disabled: true },
]

/**
 * Admin shell — left sidebar navigation + main content area.
 * @param {{ activeMenu: string, children: import('react').ReactNode }} props
 */
export function AdminLayout({ activeMenu, children }) {
  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-light font-pretendard">
      <aside
        className="flex w-[240px] shrink-0 flex-col border-r border-lightGray bg-white"
        aria-label="어드민 메뉴"
      >
        <div className="border-b border-lightGray px-6 py-5">
          <p className="m-0 text-bodySmall text-subtleText">오찌 어드민</p>
          <h1 className="m-0 mt-1 text-h4 text-dark">관리자</h1>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {ADMIN_MENU_ITEMS.map((item) => {
            const isActive = item.id === activeMenu

            return (
              <button
                key={item.id}
                type="button"
                disabled={item.disabled}
                className={`flex w-full items-center rounded-sm border-0 px-3 py-3 text-left text-bodyRegular2 transition-colors ${
                  item.disabled
                    ? 'cursor-not-allowed text-subtleText'
                    : isActive
                      ? 'bg-dark text-white'
                      : 'bg-transparent text-textDefault hover:bg-light hover:text-dark'
                }`}
                onClick={() => {
                  if (!item.disabled) {
                    navigateSpa(item.path)
                  }
                }}
              >
                {item.label}
                {item.disabled ? (
                  <span className="ml-auto text-bodySmall text-subtleText">준비중</span>
                ) : null}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-lightGray px-6 py-4">
          <button
            type="button"
            className="border-0 bg-transparent p-0 text-bodySmall text-subtleText hover:text-dark"
            onClick={() => navigateSpa('/')}
          >
            쇼핑몰로 돌아가기
          </button>
        </div>
      </aside>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">{children}</main>
    </div>
  )
}
