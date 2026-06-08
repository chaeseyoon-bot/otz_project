import {
  DEMO_MY_PAGE_ORDER_STATUS,
  DEMO_MY_PAGE_USER,
} from '../data/myPageContent'
import { MyPageMobileHeader } from '../components/organisms/MyPageMobileHeader'
import {
  MyPageMenuSections,
  MyPageOrderStatusSection,
  MyPageTopSummary,
} from '../components/mypage'

/** Figma 3223:26507 — mobile my page main. */
export function MyPage() {
  return (
    <main className="bg-white lg:hidden">
      <MyPageMobileHeader />

      <div className="px-[15px] pb-10 pt-4">
        <MyPageTopSummary user={DEMO_MY_PAGE_USER} variant="mobile" />
        <div className="mt-6">
          <MyPageOrderStatusSection status={DEMO_MY_PAGE_ORDER_STATUS} variant="mobile" />
        </div>
        <div className="mt-10">
          <MyPageMenuSections />
        </div>
      </div>
    </main>
  )
}
