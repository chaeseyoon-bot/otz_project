import { useEffect, useState } from 'react'
import {
  createEmptyEditorialCoupon,
  DEFAULT_COUPON_NOTES_TITLE,
  DEFAULT_COUPON_SECTION_EYEBROW,
  DEFAULT_COUPON_SECTION_TITLE,
  MAX_COUPONS,
  MAX_COUPON_NOTES,
} from '../../lib/adminEditorialConfig'
import { FormRow, TextInput } from './editorialAdminPrimitives'

function CouponFieldGroup({ title, description, children }) {
  return (
    <div className="space-y-2 rounded-sm border border-lightGray bg-white p-2.5">
      <div>
        <p className="m-0 text-[11px] font-semibold text-dark">{title}</p>
        {description ? (
          <p className="m-0 mt-0.5 text-[10px] leading-snug text-subtleText">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  )
}

function updateCouponAtIndex(coupons, index, patch) {
  return coupons.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
}

function parseCouponNotesFromText(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, MAX_COUPON_NOTES)
}

function CouponNotesField({ eventId, notes, onChange }) {
  const [text, setText] = useState(() => notes.join('\n'))

  useEffect(() => {
    setText(notes.join('\n'))
  }, [eventId])

  const parsedNotes = parseCouponNotesFromText(text)

  return (
    <div className="space-y-2">
      <TextInput
        multiline
        rows={4}
        className="h-[100px] min-h-[100px]"
        value={text}
        onChange={(value) => {
          if (value.split('\n').length > MAX_COUPON_NOTES) return
          setText(value)
          onChange(parseCouponNotesFromText(value))
        }}
        placeholder={'기획전 내 아우터 상품에 적용 가능한 선착순 쿠폰 입니다. (일부상품 제외)\n12월 31일까지 사용 가능합니다.'}
      />
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-subtleText">
        <span>줄바꿈마다 불릿 1개 · {parsedNotes.length}/{MAX_COUPON_NOTES}줄</span>
        {parsedNotes.length > 0 ? (
          <ul className="m-0 w-full list-none space-y-1 border-t border-lightGray pt-2 p-0">
            {parsedNotes.map((note, index) => (
              <li key={`${index}-${note}`} className="flex items-start gap-1.5">
                <span className="mt-1.5 block size-1 shrink-0 rounded-full bg-subtleText" aria-hidden />
                <span className="min-w-0 flex-1 leading-snug text-dark">{note}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}

export function EditorialCouponAdminFields({ event, onUpdate, embedded = false }) {
  const coupons = event.coupons ?? []

  const updateCoupons = (nextCoupons) => {
    onUpdate({ coupons: nextCoupons })
  }

  return (
    <div className={`space-y-3 ${embedded ? 'rounded-sm border border-lightGray bg-light3 p-2.5' : ''}`}>
      <div>
        <p className="m-0 text-[11px] font-semibold text-dark">쿠폰 타이틀</p>
        <p className="m-0 mt-0.5 text-[10px] leading-snug text-subtleText">
          히어로 쿠폰 카드 · COUPON 섹션 공용 · 1번 쿠폰이 히어로 카드에 노출됩니다.
        </p>
      </div>

      <CouponFieldGroup title="섹션 헤더" description="COUPON 블록 상단 타이틀">
        <div className="space-y-2">
          <FormRow label="메인 타이틀">
            <TextInput
              value={event.couponSectionEyebrow ?? ''}
              onChange={(value) => onUpdate({ couponSectionEyebrow: value })}
              placeholder={DEFAULT_COUPON_SECTION_EYEBROW}
            />
          </FormRow>
          <FormRow label="서브문구">
            <TextInput
              value={event.couponSectionTitle ?? ''}
              onChange={(value) => onUpdate({ couponSectionTitle: value })}
              placeholder={DEFAULT_COUPON_SECTION_TITLE}
            />
          </FormRow>
          <FormRow label="유의사항 제목">
            <TextInput
              value={event.couponNotesTitle ?? ''}
              onChange={(value) => onUpdate({ couponNotesTitle: value })}
              placeholder={DEFAULT_COUPON_NOTES_TITLE}
            />
          </FormRow>
        </div>
      </CouponFieldGroup>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="m-0 text-[11px] font-semibold text-dark">쿠폰 목록</p>
        {coupons.length < MAX_COUPONS ? (
          <button
            type="button"
            className="rounded-sm border border-dashed border-lightGray bg-white px-2 py-1 text-[10px]"
            onClick={() => updateCoupons([...coupons, createEmptyEditorialCoupon()])}
          >
            + 쿠폰
          </button>
        ) : null}
      </div>

      {coupons.length ? (
        <div className="space-y-2.5">
          {coupons.map((coupon, index) => (
            <div key={coupon.id} className="space-y-2 rounded-sm border border-lightGray bg-light3 p-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="m-0 text-[11px] font-semibold text-dark">
                  쿠폰 {String(index + 1).padStart(2, '0')}
                  {index === 0 ? (
                    <span className="ml-1.5 font-normal text-subtleText">· 히어로 카드</span>
                  ) : null}
                </p>
                <button
                  type="button"
                  className="text-[11px] text-subtleText"
                  onClick={() => updateCoupons(coupons.filter((_, itemIndex) => itemIndex !== index))}
                >
                  삭제
                </button>
              </div>

              <CouponFieldGroup title="카드 앞면" description="검정 쿠폰 티켓 — 라벨 · 할인값 · 이용조건">
                <div className="space-y-2">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <FormRow label="종류">
                      <select
                        value={coupon.kind}
                        onChange={(e) => {
                          const kind = e.target.value
                          updateCoupons(
                            updateCouponAtIndex(coupons, index, {
                              kind,
                              unit: kind === 'amount' ? '원' : '%',
                            }),
                          )
                        }}
                        className="h-8 w-full rounded-sm border border-lightGray px-2 text-[13px]"
                      >
                        <option value="percent">할인율 (%)</option>
                        <option value="amount">할인금액 (원)</option>
                      </select>
                    </FormRow>
                    <FormRow label="라벨">
                      <TextInput
                        value={coupon.label}
                        onChange={(value) =>
                          updateCoupons(updateCouponAtIndex(coupons, index, { label: value }))
                        }
                        placeholder="장바구니 쿠폰"
                      />
                    </FormRow>
                    <FormRow label="할인 값">
                      <TextInput
                        value={coupon.value}
                        onChange={(value) =>
                          updateCoupons(updateCouponAtIndex(coupons, index, { value: value }))
                        }
                        placeholder="15"
                      />
                    </FormRow>
                    <FormRow label="단위">
                      <TextInput
                        value={coupon.unit}
                        onChange={(value) =>
                          updateCoupons(updateCouponAtIndex(coupons, index, { unit: value }))
                        }
                        placeholder={coupon.kind === 'amount' ? '원' : '%'}
                      />
                    </FormRow>
                  </div>
                  <FormRow label="이용조건 1">
                    <TextInput
                      value={coupon.condition1}
                      onChange={(value) =>
                        updateCoupons(updateCouponAtIndex(coupons, index, { condition1: value }))
                      }
                      placeholder="ID당 3회 발급/사용 가능"
                    />
                  </FormRow>
                  <FormRow label="이용조건 2">
                    <TextInput
                      value={coupon.condition2}
                      onChange={(value) =>
                        updateCoupons(updateCouponAtIndex(coupons, index, { condition2: value }))
                      }
                      placeholder="5만원 이상 구매 시"
                    />
                  </FormRow>
                </div>
              </CouponFieldGroup>

              <CouponFieldGroup title="카드 상세" description="우측 영역 — 사용기간 · 적용상품">
                <div className="space-y-2">
                  <FormRow label="사용기간">
                    <TextInput
                      value={coupon.validPeriod}
                      onChange={(value) =>
                        updateCoupons(updateCouponAtIndex(coupons, index, { validPeriod: value }))
                      }
                      placeholder="2026.03.01 - 2026.03.31"
                    />
                  </FormRow>
                  <FormRow label="적용상품" alignTop>
                    <TextInput
                      multiline
                      rows={3}
                      value={coupon.applicableProducts}
                      onChange={(value) =>
                        updateCoupons(updateCouponAtIndex(coupons, index, { applicableProducts: value }))
                      }
                      placeholder="오찌 로마리 도트팩"
                    />
                  </FormRow>
                </div>
              </CouponFieldGroup>
            </div>
          ))}
        </div>
      ) : (
        <p className="m-0 rounded-sm border border-dashed border-lightGray bg-white px-3 py-4 text-center text-[10px] text-subtleText">
          등록된 쿠폰이 없습니다. + 쿠폰으로 COUPON 섹션을 추가하세요.
        </p>
      )}

      <CouponFieldGroup title="유의사항" description={`쿠폰 섹션 하단 불릿 목록 · Enter로 줄 추가 · 최대 ${MAX_COUPON_NOTES}줄`}>
        <FormRow label="내용" alignTop>
          <CouponNotesField
            eventId={event.id}
            notes={event.couponNotes ?? []}
            onChange={(couponNotes) => onUpdate({ couponNotes })}
          />
        </FormRow>
      </CouponFieldGroup>
    </div>
  )
}
