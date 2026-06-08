import { useState } from 'react'
import {
  DEMO_PRODUCT_INQUIRIES,
  DEMO_PRODUCT_INQUIRY_COUNT,
  getInquiryStatusLabel,
  type ProductInquiryItem,
} from '../../data/productInquiries'
import { CouponNoticePopup } from '../atoms/CouponNoticePopup'
import { MobileListPagination } from '../molecules/MobileListPagination'
import { ProductInquiryFormSheet } from './ProductInquiryFormSheet'

interface ProductDetailMobileInquirySectionProps {
  inquiryCount?: number
}

/** Figma 2978:20399 — MO PDP inquiry list page size. */
const MO_PDP_INQUIRY_PAGE_SIZE = 5

function InquiryLockIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="size-4 shrink-0 text-subtleText">
      <rect x="3.5" y="7" width="9" height="6.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ProductInquiryCard({ inquiry }: { inquiry: ProductInquiryItem }) {
  return (
    <li className="border-b border-lightGray py-5">
      <p className="m-0 text-bodySmall text-subtleText">
        {inquiry.date} | {inquiry.author}
      </p>
      <span className="mt-2 inline-flex bg-dark px-2 py-1 text-bodySmall text-white">
        {getInquiryStatusLabel(inquiry.status)}
      </span>
      {inquiry.isSecret ? (
        <p className="mt-3 m-0 flex items-center gap-1.5 text-bodyRegular2 text-dark">
          <InquiryLockIcon />
          비밀글 입니다.
        </p>
      ) : (
        <p className="mt-3 m-0 text-bodyRegular2 text-dark">{inquiry.content}</p>
      )}
    </li>
  )
}

/** EQL mobile-style product inquiry tab. */
export function ProductDetailMobileInquirySection({
  inquiryCount = DEMO_PRODUCT_INQUIRY_COUNT,
}: ProductDetailMobileInquirySectionProps) {
  const [inquiryPage, setInquiryPage] = useState(1)
  const [inquiryFormOpen, setInquiryFormOpen] = useState(false)
  const [inquiryNoticeOpen, setInquiryNoticeOpen] = useState(false)
  const inquiries = DEMO_PRODUCT_INQUIRIES
  const totalInquiryPages = Math.max(1, Math.ceil(inquiries.length / MO_PDP_INQUIRY_PAGE_SIZE))
  const safeInquiryPage = Math.min(inquiryPage, totalInquiryPages)
  const paginatedInquiries = inquiries.slice(
    (safeInquiryPage - 1) * MO_PDP_INQUIRY_PAGE_SIZE,
    safeInquiryPage * MO_PDP_INQUIRY_PAGE_SIZE,
  )

  return (
    <div className="px-[15px] pb-10 pt-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="m-0 text-bodyBold1 text-dark">상품 문의 [{inquiryCount}]</h2>
        <button
          type="button"
          className="shrink-0 border-0 bg-transparent p-0 text-bodySmall text-dark underline underline-offset-2"
          onClick={() => setInquiryFormOpen(true)}
        >
          문의하기
        </button>
      </div>

      <ProductInquiryFormSheet
        open={inquiryFormOpen}
        onClose={() => setInquiryFormOpen(false)}
        onSubmit={() => setInquiryNoticeOpen(true)}
      />

      <CouponNoticePopup
        open={inquiryNoticeOpen}
        message="문의가 등록되었습니다."
        onClose={() => setInquiryNoticeOpen(false)}
      />

      <ul className="mt-6 m-0 list-none p-0">
        {paginatedInquiries.map((inquiry) => (
          <ProductInquiryCard key={inquiry.id} inquiry={inquiry} />
        ))}
      </ul>

      <MobileListPagination
        className="mt-8"
        currentPage={safeInquiryPage}
        totalPages={totalInquiryPages}
        onPageChange={setInquiryPage}
        ariaLabel="상품 문의 페이지"
      />
    </div>
  )
}
