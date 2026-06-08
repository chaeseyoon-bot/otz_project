export interface CheckoutShippingAddress {
  name: string
  postalCode: string
  address: string
  phone: string
}

export type CheckoutPaymentMethodId = 'card' | 'quickTransfer' | 'easyPay'

export const DEMO_CHECKOUT_SHIPPING: CheckoutShippingAddress = {
  name: '채단오(우리집)',
  postalCode: '10113',
  address: '경기 김포시 유현로 200 107동 3201호',
  phone: '010-1234-5678',
}

export const CHECKOUT_PAYMENT_METHODS: { id: CheckoutPaymentMethodId; label: string }[] = [
  { id: 'card', label: '신용카드' },
  { id: 'quickTransfer', label: '퀵계좌이체' },
  { id: 'easyPay', label: '간편결제' },
]

export const CHECKOUT_CARD_OPTIONS = ['롯데카드', '신한카드', 'KB국민카드', '삼성카드'] as const

export const CHECKOUT_INSTALLMENT_OPTIONS = ['일시불', '2개월', '3개월', '6개월'] as const

export const CHECKOUT_DELIVERY_REQUESTS = [
  '배송 요청사항(선택)',
  '문 앞에 놓아주세요.',
  '경비실에 맡겨주세요.',
  '배송 전 연락 부탁드립니다.',
] as const

export const CHECKOUT_TERMS_ITEMS = [
  {
    id: 'purchase',
    label: '[필수] 구매 조건 확인 및 결제 동의',
    body: '주문할 상품의 상품명, 가격, 배송정보등 서비스 제공기간을 확인하였으며 구매에 동의합니다.',
  },
  {
    id: 'refund',
    label: '[필수] 청약철회 및 환불 정책 고지',
    body: '상품 수령 후 7일 이내 환불 가능하며, 단순 변심 시 반품비는 고객 부담입니다.',
  },
] as const
