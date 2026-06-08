export interface MyPageUserSummary {
  name: string
  gradeLabel: string
  couponCount: number
  reviewCount: number
  pointBalance: number
}

export interface MyPageOrderStatus {
  beforePayment: number
  preparing: number
  shipping: number
  delivered: number
  cancelled: number
  exchanged: number
  returned: number
}

export interface MyPageMenuItem {
  id: string
  label: string
}

export interface MyPageMenuSection {
  id: string
  title: string
  items: MyPageMenuItem[]
}

export const DEMO_MY_PAGE_USER: MyPageUserSummary = {
  name: '홍길동',
  gradeLabel: 'HELLO',
  couponCount: 11,
  reviewCount: 2,
  pointBalance: 7600,
}

/** Figma 3223:23933 — PC my page summary (적립금 100,000P). */
export const DEMO_MY_PAGE_PC_USER: MyPageUserSummary = {
  ...DEMO_MY_PAGE_USER,
  pointBalance: 100_000,
}

export interface MyPageOrderLineItem {
  id: string
  productName: string
  price: number
  quantity: number
  optionLabel: string
  image: string
  /** When set, renders per-line status row (multi-item orders). */
  statusLabel?: string
}

export interface MyPageOrderPriceSummary {
  productAmount: number
  shippingFee: number
  discountAmount: number
  additionalPaymentAmount: number
  totalPayment: number
}

export type MyPageOrderClaimAction = 'cancel' | 'exchange' | 'return'

export interface MyPageRecentOrder {
  id: string
  date: string
  orderNumber: string
  lineItems: MyPageOrderLineItem[]
  /** Bottom claim buttons (Figma 5032:8645). */
  claimActions: MyPageOrderClaimAction[]
  priceSummary: MyPageOrderPriceSummary
}

/** Empty list for Figma 4891:3691 — set `recentOrders` to this to preview the empty state. */
export const DEMO_MY_PAGE_RECENT_ORDERS_EMPTY: MyPageRecentOrder[] = []

export const DEMO_MY_PAGE_RECENT_ORDERS: MyPageRecentOrder[] = [
  {
    id: 'order-1',
    date: '2026-04-20',
    orderNumber: '20260420-0000003',
    claimActions: ['cancel', 'exchange', 'return'],
    lineItems: [
      {
        id: 'line-1',
        productName: '[블랙팩] 3300 하이 스웨이드 FLOTEA0U36',
        price: 67_150,
        quantity: 1,
        optionLabel: '[옵션: 245]',
        image: 'product_01.png',
        statusLabel: '배송준비중',
      },
    ],
    priceSummary: {
      productAmount: 67_150,
      shippingFee: 2_500,
      discountAmount: 1_000,
      additionalPaymentAmount: 68_500,
      totalPayment: 68_500,
    },
  },
  {
    id: 'order-2',
    date: '2026-03-21',
    orderNumber: '20260420-0000003',
    claimActions: ['exchange', 'return'],
    lineItems: [
      {
        id: 'line-2a',
        productName: '[블랙팩] 3300 하이 스웨이드 FLOTEA0U36',
        price: 67_150,
        quantity: 1,
        optionLabel: '[옵션: 245]',
        image: 'product_02.png',
        statusLabel: '배송중',
      },
      {
        id: 'line-2b',
        productName: '[블랙팩] 3300 하이 스웨이드 FLOTEA0U36',
        price: 67_150,
        quantity: 1,
        optionLabel: '[옵션: 245]',
        image: 'product_03.png',
        statusLabel: '배송완료',
      },
    ],
    priceSummary: {
      productAmount: 67_150,
      shippingFee: 2_500,
      discountAmount: 1_000,
      additionalPaymentAmount: 68_500,
      totalPayment: 68_500,
    },
  },
  {
    id: 'order-3',
    date: '2026-02-10',
    orderNumber: '20260420-0000003',
    claimActions: ['exchange', 'return'],
    lineItems: [
      {
        id: 'line-3',
        productName: '[블랙팩] 3300 하이 스웨이드 FLOTEA0U36',
        price: 67_150,
        quantity: 1,
        optionLabel: '[옵션: 245]',
        image: 'product_01.png',
        statusLabel: '배송완료',
      },
    ],
    priceSummary: {
      productAmount: 67_150,
      shippingFee: 2_500,
      discountAmount: 1_000,
      additionalPaymentAmount: 68_500,
      totalPayment: 68_500,
    },
  },
]

export const DEMO_MY_PAGE_ORDER_STATUS: MyPageOrderStatus = {
  beforePayment: 0,
  preparing: 0,
  shipping: 0,
  delivered: 1,
  cancelled: 0,
  exchanged: 0,
  returned: 0,
}

export const MY_PAGE_MENU_SECTIONS: MyPageMenuSection[] = [
  {
    id: 'shopping',
    title: '나의 쇼핑 정보',
    items: [
      { id: 'orders', label: '주문/배송' },
      { id: 'claims', label: '취소/교환/반품' },
      { id: 'wishlist', label: '나의 관심상품' },
      { id: 'recent', label: '최근본상품' },
      { id: 'reviews', label: '나의 리뷰' },
    ],
  },
  {
    id: 'benefits',
    title: '나의 혜택 정보',
    items: [
      { id: 'points', label: '적립금 조회' },
      { id: 'coupons', label: '쿠폰 보유 내역' },
    ],
  },
  {
    id: 'account',
    title: '나의 정보',
    items: [
      { id: 'addresses', label: '배송지 관리' },
      { id: 'profile', label: '개인정보수정' },
      { id: 'inquiry', label: '1:1 문의하기' },
      { id: 'withdraw', label: '회원탈퇴' },
    ],
  },
]

export const MY_PAGE_ORDER_STEPS = [
  { key: 'beforePayment' as const, label: '입금전' },
  { key: 'preparing' as const, label: '배송준비중' },
  { key: 'shipping' as const, label: '배송중' },
  { key: 'delivered' as const, label: '배송완료' },
] as const
