export type ProductInquiryStatus = 'answered' | 'pending'

export interface ProductInquiryItem {
  id: string
  date: string
  author: string
  status: ProductInquiryStatus
  content?: string
  isSecret?: boolean
}

export const DEMO_PRODUCT_INQUIRIES: ProductInquiryItem[] = [
  {
    id: 'inquiry-1',
    date: '2026.05.28',
    author: 'day*******',
    status: 'answered',
    content: '사은행사 아직 안끝났나용?',
  },
  {
    id: 'inquiry-2',
    date: '2026.05.28',
    author: 'day*******',
    status: 'answered',
    isSecret: true,
  },
  {
    id: 'inquiry-3',
    date: '2026.05.28',
    author: 'day*******',
    status: 'answered',
    content: '배송일정 문의드립니다',
  },
]

export const DEMO_PRODUCT_INQUIRY_COUNT = DEMO_PRODUCT_INQUIRIES.length

export function getInquiryStatusLabel(status: ProductInquiryStatus): string {
  return status === 'answered' ? '답변 완료' : '답변 대기'
}
