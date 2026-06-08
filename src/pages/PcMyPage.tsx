import { useState } from 'react'
import {
  DEMO_MY_PAGE_ORDER_STATUS,
  DEMO_MY_PAGE_PC_USER,
  DEMO_MY_PAGE_RECENT_ORDERS,
  type MyPageOrderClaimAction,
  type MyPageOrderLineItem,
  type MyPageRecentOrder,
} from '../data/myPageContent'
import { MyPageLnb } from '../components/mypage/MyPageLnb'
import { MyPageChevronLink } from '../components/mypage/MyPageChevronLink'
import { MyPageOrdersEmptyState } from '../components/mypage/MyPageOrdersEmptyState'
import { MyPageOrderStatusSection } from '../components/mypage/MyPageOrderStatusSection'
import { MyPageTopSummary } from '../components/mypage/MyPageTopSummary'
import { ProductThumbFrame } from '../components/atoms/ProductThumbFrame'
import { figmaAsset } from '../lib/figmaAssetUrl'

const iconChevronLeft = figmaAsset('icons/chevron-left.svg')

function formatPrice(value: number) {
  return value.toLocaleString('ko-KR')
}

const CLAIM_ACTION_LABELS: Record<MyPageOrderClaimAction, string> = {
  cancel: '취소신청',
  exchange: '교환신청',
  return: '반품신청',
}

/** Figma 5032:8658 — product row with status and line actions. */
function OrderLineItemRow({
  item,
  showDivider,
}: {
  item: MyPageOrderLineItem
  showDivider?: boolean
}) {
  const statusLabel = item.statusLabel ?? '배송완료'

  return (
    <div
      className={`flex w-full items-start ${showDivider ? 'border-b border-lightGray pb-6' : ''}`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-6">
        <ProductThumbFrame src={figmaAsset(item.image)} alt="" className="w-[120px] shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="m-0 text-bodyRegular1 text-textDefault">{item.productName}</p>
            <div className="flex items-center gap-1">
              <span className="text-bodyBold1 text-dark">{formatPrice(item.price)}</span>
              <span className="text-bodySmall text-textDefault">({item.quantity}개)</span>
            </div>
          </div>
          <p className="m-0 text-bodySmall text-subtleText">{item.optionLabel}</p>
        </div>
      </div>

      <div className="flex size-[120px] shrink-0 items-center justify-center">
        <p className="m-0 whitespace-nowrap text-bodyBold2 text-dark">{statusLabel}</p>
      </div>

      <div className="flex h-[120px] w-32 shrink-0 items-center justify-center px-6">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="flex h-[34px] w-20 items-center justify-center rounded border border-gray bg-white text-bodySmall text-dark"
          >
            배송조회
          </button>
          <button
            type="button"
            className="flex h-[34px] w-20 items-center justify-center rounded border border-dark bg-dark text-bodySmall text-white"
          >
            리뷰작성
          </button>
        </div>
      </div>
    </div>
  )
}

function OrderClaimButtons({ actions }: { actions: MyPageOrderClaimAction[] }) {
  return (
    <div className="flex items-end justify-end gap-2 border-t border-lightGray pt-6">
      {actions.map((action) => (
        <button
          key={action}
          type="button"
          className="flex w-[168.5px] items-center justify-center rounded border border-gray bg-white px-4 py-3.5 text-bodyRegular2 text-dark"
        >
          {CLAIM_ACTION_LABELS[action]}
        </button>
      ))}
    </div>
  )
}

/** Figma 5032:8647 — PC recent order card. */
function RecentOrderCard({ order }: { order: MyPageRecentOrder }) {
  return (
    <article className="flex w-full flex-col gap-6">
      <header className="bg-light px-6 py-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-bodyBold2 text-dark">{order.date}</span>
            <span className="text-bodySmall text-subtleText">({order.orderNumber})</span>
          </div>
          <MyPageChevronLink
            variant="pc"
            label="상세보기"
            className="shrink-0 [&_span]:text-bodyRegular2 [&_span]:text-dark"
          />
        </div>
      </header>

      <div className="flex flex-col gap-6">
        {order.lineItems.map((item, index) => (
          <OrderLineItemRow
            key={item.id}
            item={item}
            showDivider={index < order.lineItems.length - 1}
          />
        ))}
        <OrderClaimButtons actions={order.claimActions} />
      </div>
    </article>
  )
}

function MyPagePagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  return (
    <nav className="flex items-center justify-center gap-4" aria-label="주문 목록 페이지">
      <button
        type="button"
        className="flex size-8 items-center justify-center border-0 bg-transparent p-0 disabled:opacity-30"
        aria-label="이전 페이지"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <img src={iconChevronLeft} alt="" aria-hidden className="size-8 object-contain" draggable={false} />
      </button>

      <div className="flex items-center gap-3">
        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1
          const isActive = page === currentPage
          return (
            <button
              key={page}
              type="button"
              aria-label={`${page}페이지`}
              aria-current={isActive ? 'page' : undefined}
              className={`flex size-8 items-center justify-center rounded-full border text-bodyBold3 ${
                isActive
                  ? 'border-dark bg-dark text-white'
                  : 'border-lightGray bg-white text-subtleText'
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        className="flex size-8 items-center justify-center border-0 bg-transparent p-0 disabled:opacity-30"
        aria-label="다음 페이지"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <img
          src={iconChevronLeft}
          alt=""
          aria-hidden
          className="size-8 rotate-180 object-contain"
          draggable={false}
        />
      </button>
    </nav>
  )
}

/** Figma 3223:23933 — PC my page main. */
export function PcMyPage() {
  const [orderPage, setOrderPage] = useState(1)
  const totalOrderPages = 3
  const recentOrders = DEMO_MY_PAGE_RECENT_ORDERS
  const hasRecentOrders = recentOrders.length > 0

  return (
    <main className="hidden bg-white lg:block">
      <div className="mx-auto flex max-w-[1400px] gap-[60px] px-0 pb-20 pt-10">
        <MyPageLnb />

        <div className="flex min-w-0 flex-1 flex-col gap-16">
          <MyPageTopSummary user={DEMO_MY_PAGE_PC_USER} variant="pc" />
          <MyPageOrderStatusSection status={DEMO_MY_PAGE_ORDER_STATUS} variant="pc" />

          <section>
            <div className="border-b border-lightGray pb-6">
              <h2 className="m-0 text-bodyBold1 text-dark">최근 주문상품</h2>
            </div>

            <div className="mt-6 flex flex-col gap-12">
              {hasRecentOrders ? (
                recentOrders.map((order) => <RecentOrderCard key={order.id} order={order} />)
              ) : (
                <MyPageOrdersEmptyState />
              )}
            </div>

            {hasRecentOrders ? (
              <div className="mt-16">
                <MyPagePagination
                  currentPage={orderPage}
                  totalPages={totalOrderPages}
                  onPageChange={setOrderPage}
                />
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  )
}
