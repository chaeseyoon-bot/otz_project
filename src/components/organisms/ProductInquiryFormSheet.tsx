import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { CartCheckbox } from '../cart/CartItemCard'
import { SCROLL_LOCK_ALLOW_ATTR, useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { figmaAsset } from '../../lib/figmaAssetUrl'

const iconClose = figmaAsset('icons/search_close.svg')

const MAX_CONTENT_LENGTH = 1000
const DISALLOWED_CHAR_PATTERN = /[\\/:<>]/g

export type ProductInquiryVisibility = 'public' | 'private'

export interface ProductInquiryFormData {
  content: string
  phone: string
  notifyReply: boolean
  visibility: ProductInquiryVisibility
}

export interface ProductInquiryFormSheetProps {
  open: boolean
  onClose: () => void
  onSubmit?: (data: ProductInquiryFormData) => void
}

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`
}

function FormFieldLabel({ children, required = false }: { children: string; required?: boolean }) {
  return (
    <span className="text-bodyRegular2 text-dark">
      {children}
      {required ? <span aria-hidden> *</span> : null}
    </span>
  )
}

function InquiryRadio({
  checked,
  label,
  name,
  onSelect,
}: {
  checked: boolean
  label: string
  name: string
  onSelect: () => void
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2">
      <input
        type="radio"
        name={name}
        className="sr-only"
        checked={checked}
        onChange={onSelect}
      />
      <span
        className={`inline-flex size-4 items-center justify-center rounded-full border ${
          checked ? 'border-dark' : 'border-lightGray'
        }`}
        aria-hidden
      >
        {checked ? <span className="size-2 rounded-full bg-dark" /> : null}
      </span>
      <span className="text-bodyRegular2 text-dark">{label}</span>
    </label>
  )
}

const INITIAL_FORM: ProductInquiryFormData = {
  content: '',
  phone: '',
  notifyReply: true,
  visibility: 'public',
}

/** MO PDP — 상품 문의 작성 레이어 팝업. */
export function ProductInquiryFormSheet({ open, onClose, onSubmit }: ProductInquiryFormSheetProps) {
  const [entered, setEntered] = useState(false)
  const [form, setForm] = useState<ProductInquiryFormData>(INITIAL_FORM)
  const [contentError, setContentError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)

  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) {
      setEntered(false)
      return
    }
    const frame = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const resetForm = () => {
    setForm(INITIAL_FORM)
    setContentError(null)
    setPhoneError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleContentChange = (value: string) => {
    const sanitized = value.replace(DISALLOWED_CHAR_PATTERN, '').slice(0, MAX_CONTENT_LENGTH)
    setForm((prev) => ({ ...prev, content: sanitized }))
    if (contentError) setContentError(null)
  }

  const handlePhoneChange = (value: string) => {
    setForm((prev) => ({ ...prev, phone: formatPhoneInput(value) }))
    if (phoneError) setPhoneError(null)
  }

  const validate = (): boolean => {
    let valid = true

    if (!form.content.trim()) {
      setContentError('문의 내용을 입력해주세요.')
      valid = false
    }

    const phoneDigits = form.phone.replace(/\D/g, '')
    if (!phoneDigits) {
      setPhoneError('휴대폰 번호를 입력해주세요.')
      valid = false
    } else if (phoneDigits.length < 10) {
      setPhoneError('올바른 휴대폰 번호를 입력해주세요.')
      valid = false
    }

    return valid
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit?.(form)
    resetForm()
    onClose()
  }

  if (!open) return null

  return createPortal(
    <div
      className={`fixed inset-0 z-[70] flex touch-none flex-col bg-white transition-opacity duration-300 ease-out lg:hidden ${
        entered ? 'opacity-100' : 'opacity-0'
      }`}
      role="presentation"
    >
      <header className="relative flex shrink-0 items-center justify-center px-4 pb-4 pt-[max(16px,env(safe-area-inset-top,0px))]">
        <h2 className="m-0 text-bodyMedium1 text-dark">상품 문의</h2>
        <button
          type="button"
          className="absolute right-4 top-[max(16px,env(safe-area-inset-top,0px))] flex size-6 items-center justify-center border-0 bg-transparent p-0"
          aria-label="상품 문의 닫기"
          onClick={handleClose}
        >
          <img src={iconClose} alt="" aria-hidden className="size-6 object-contain" draggable={false} />
        </button>
      </header>

      <div
        {...{ [SCROLL_LOCK_ALLOW_ATTR]: true }}
        className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-[15px] pb-6"
      >
        <div className="flex flex-col gap-2">
          <FormFieldLabel required>문의 내용</FormFieldLabel>
          <div className="relative">
            <textarea
              value={form.content}
              rows={6}
              placeholder="문의하실 내용을 입력해주세요. (특수문자 \/:<>는 사용할 수 없습니다.)"
              className="w-full resize-none border border-gray bg-white px-4 py-3 text-bodyRegular2 text-dark outline-none placeholder:text-subtleText"
              onChange={(event) => handleContentChange(event.target.value)}
            />
            <span className="pointer-events-none absolute bottom-3 right-3 text-bodySmall text-subtleText">
              {form.content.length.toLocaleString('ko-KR')}/{MAX_CONTENT_LENGTH.toLocaleString('ko-KR')}
            </span>
          </div>
          {contentError ? <p className="m-0 text-bodySmall text-primaryText">{contentError}</p> : null}
        </div>

        <div className="flex flex-col gap-2">
          <FormFieldLabel required>답변알림 수신 휴대폰 번호</FormFieldLabel>
          <input
            type="tel"
            inputMode="numeric"
            value={form.phone}
            placeholder="010 0000 0000"
            className="h-[42px] w-full border border-gray bg-white px-4 text-bodyRegular2 text-dark outline-none placeholder:text-subtleText"
            onChange={(event) => handlePhoneChange(event.target.value)}
          />
          {phoneError ? <p className="m-0 text-bodySmall text-primaryText">{phoneError}</p> : null}
          <label className="mt-1 inline-flex cursor-pointer items-center gap-2">
            <CartCheckbox
              checked={form.notifyReply}
              onChange={() => setForm((prev) => ({ ...prev, notifyReply: !prev.notifyReply }))}
              ariaLabel="답변 알림 받기"
              size="lg"
            />
            <span className="text-bodyRegular2 text-dark">답변 알림 받기</span>
          </label>
        </div>

        <div className="flex flex-col gap-3">
          <FormFieldLabel required>공개여부</FormFieldLabel>
          <div className="flex items-center gap-6">
            <InquiryRadio
              name="inquiry-visibility"
              label="공개"
              checked={form.visibility === 'public'}
              onSelect={() => setForm((prev) => ({ ...prev, visibility: 'public' }))}
            />
            <InquiryRadio
              name="inquiry-visibility"
              label="비공개"
              checked={form.visibility === 'private'}
              onSelect={() => setForm((prev) => ({ ...prev, visibility: 'private' }))}
            />
          </div>
          <p className="m-0 text-bodySmall text-subtleText">
            * 공개로 설정하시면 다른 고객님들께 도움을 줄 수 있습니다.
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-lightGray pt-6">
          <h3 className="m-0 text-bodyBold3 text-dark">문의 시 유의사항</h3>
          <ul className="m-0 list-disc space-y-2 pl-4 text-bodySmall text-subtleText">
            <li>
              배송, 교환, 반품, 주문취소 문의는{' '}
              <span className="text-dark underline">마이페이지 &gt; 1:1문의</span>에서 가능합니다.
            </li>
            <li>
              상품과 무관한 비방, 욕설, 광고 등 부적절한 글은 동의 없이 삭제될 수 있습니다.
            </li>
            <li>
              작성하신 문의는 <span className="text-dark underline">마이페이지 &gt; 상품 Q&amp;A</span>에서
              확인 가능합니다.
            </li>
          </ul>
        </div>
      </div>

      <div className="flex shrink-0 gap-2 border-t border-lightGray px-[15px] py-4 pb-[max(16px,env(safe-area-inset-bottom,0px))]">
        <button
          type="button"
          className="flex h-12 flex-1 items-center justify-center rounded border border-dark bg-white text-button text-dark"
          onClick={handleClose}
        >
          취소
        </button>
        <button
          type="button"
          className="flex h-12 flex-1 items-center justify-center rounded border-0 bg-dark text-button text-white"
          onClick={handleSubmit}
        >
          등록
        </button>
      </div>
    </div>,
    document.body,
  )
}
