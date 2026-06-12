import {
  createEmptyEditorialBenefit,
  createEmptyEditorialCoupon,
  createEmptyEditorialProductTab,
  FEATURED_PRODUCT_SLOTS,
  MAX_BENEFITS,
  MAX_COUPONS,
  MAX_PRODUCT_TABS,
  MUST_ITEM_SLOTS,
  PRODUCT_TAB_SLOTS,
} from '../../lib/adminEditorialConfig'
import { FormRow, ImageUploader, ProductIdField, TextInput } from './editorialAdminPrimitives'

export function EditorialSectionFields({
  sectionType,
  event,
  uploadingKey,
  onUpdate,
  onImageUpload,
  onLookbookSlot,
  onProductIds,
  onTabProductIds,
}) {
  switch (sectionType) {
    case 'benefit':
      return (
        <div className="space-y-1.5">
          {event.benefits.map((benefit, index) => (
            <div key={benefit.id} className="flex items-center gap-1.5">
              <span className="w-4 shrink-0 text-[11px] text-subtleText">{index + 1}</span>
              <TextInput
                value={benefit.text}
                onChange={(value) =>
                  onUpdate({
                    benefits: event.benefits.map((item, i) => (i === index ? { ...item, text: value } : item)),
                  })
                }
                placeholder="혜택 문구"
              />
              {event.benefits.length > 1 ? (
                <button
                  type="button"
                  className="shrink-0 text-[11px] text-subtleText"
                  onClick={() => onUpdate({ benefits: event.benefits.filter((_, i) => i !== index) })}
                >
                  삭제
                </button>
              ) : null}
            </div>
          ))}
          {event.benefits.length < MAX_BENEFITS ? (
            <button
              type="button"
              className="rounded-sm border border-dashed border-lightGray px-2 py-1 text-[11px]"
              onClick={() => onUpdate({ benefits: [...event.benefits, createEmptyEditorialBenefit()] })}
            >
              + 혜택
            </button>
          ) : null}
        </div>
      )

    case 'gift':
      return (
        <div className="space-y-2">
          <FormRow label="타이틀">
            <TextInput
              value={event.giftTitle}
              onChange={(value) => onUpdate({ giftTitle: value })}
              placeholder="OTZ :DOT EDITION GIFT"
            />
          </FormRow>
          <FormRow label="안내 문구">
            <TextInput
              value={event.giftNote}
              onChange={(value) => onUpdate({ giftNote: value })}
              placeholder="구매 시 증정 안내"
            />
          </FormRow>
          <ImageUploader
            label="기프트 이미지"
            spec="MO/PC 공용"
            aspectClass="aspect-square w-[88px]"
            previewUrl={event.giftImageUrl}
            fileName={event.giftImageFileName}
            isUploading={uploadingKey === `editorial-gift-${event.id}`}
            onSelect={(e) => {
              const file = e.target.files?.[0]
              onImageUpload(file, `editorial-gift-${event.id}`, (url, fileName) => {
                onUpdate({ giftImageUrl: url, giftImageFileName: fileName })
              })
              e.target.value = ''
            }}
            onClear={() => onUpdate({ giftImageUrl: null, giftImageFileName: null })}
          />
        </div>
      )

    case 'coupon':
      return (
        <div className="space-y-2">
          {event.coupons.map((coupon, index) => (
            <div key={coupon.id} className="space-y-2 rounded-sm border border-lightGray p-2.5">
              <div className="flex items-center justify-between">
                <p className="m-0 text-[11px] font-semibold">쿠폰 {index + 1}</p>
                <button
                  type="button"
                  className="text-[11px] text-subtleText"
                  onClick={() => onUpdate({ coupons: event.coupons.filter((_, i) => i !== index) })}
                >
                  삭제
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <FormRow label="종류">
                  <select
                    value={coupon.kind}
                    onChange={(e) => {
                      const kind = e.target.value
                      onUpdate({
                        coupons: event.coupons.map((item, i) =>
                          i === index ? { ...item, kind, unit: kind === 'amount' ? '원' : '%' } : item,
                        ),
                      })
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
                    onChange={(v) =>
                      onUpdate({
                        coupons: event.coupons.map((item, i) => (i === index ? { ...item, label: v } : item)),
                      })
                    }
                    placeholder="장바구니 쿠폰"
                  />
                </FormRow>
                <FormRow label="할인 값">
                  <TextInput
                    value={coupon.value}
                    onChange={(v) =>
                      onUpdate({
                        coupons: event.coupons.map((item, i) => (i === index ? { ...item, value: v } : item)),
                      })
                    }
                    placeholder="15"
                  />
                </FormRow>
                <FormRow label="유효 기간">
                  <TextInput
                    value={coupon.validPeriod}
                    onChange={(v) =>
                      onUpdate({
                        coupons: event.coupons.map((item, i) => (i === index ? { ...item, validPeriod: v } : item)),
                      })
                    }
                  />
                </FormRow>
                <FormRow label="조건 1">
                  <TextInput
                    value={coupon.condition1}
                    onChange={(v) =>
                      onUpdate({
                        coupons: event.coupons.map((item, i) => (i === index ? { ...item, condition1: v } : item)),
                      })
                    }
                  />
                </FormRow>
                <FormRow label="조건 2">
                  <TextInput
                    value={coupon.condition2}
                    onChange={(v) =>
                      onUpdate({
                        coupons: event.coupons.map((item, i) => (i === index ? { ...item, condition2: v } : item)),
                      })
                    }
                  />
                </FormRow>
                <FormRow label="적용 상품">
                  <TextInput
                    value={coupon.applicableProducts}
                    onChange={(v) =>
                      onUpdate({
                        coupons: event.coupons.map((item, i) =>
                          i === index ? { ...item, applicableProducts: v } : item,
                        ),
                      })
                    }
                  />
                </FormRow>
              </div>
            </div>
          ))}
          {event.coupons.length < MAX_COUPONS ? (
            <button
              type="button"
              className="rounded-sm border border-dashed border-lightGray px-2 py-1 text-[11px]"
              onClick={() => onUpdate({ coupons: [...event.coupons, createEmptyEditorialCoupon()] })}
            >
              + 쿠폰
            </button>
          ) : null}
          <FormRow label="유의사항" hint="한 줄씩">
            <TextInput
              value={event.couponNotes.join('\n')}
              onChange={(value) =>
                onUpdate({ couponNotes: value.split('\n').filter((line) => line.trim()) })
              }
              multiline
              rows={3}
              placeholder="줄바꿈으로 구분"
            />
          </FormRow>
        </div>
      )

    case 'lookbook':
      return (
        <ImageUploader
          label="룩북 이미지"
          spec="MO/PC 공용 · 통이미지"
          aspectClass="aspect-[3/4] w-[88px]"
          previewUrl={event.lookbookPair[0]?.imageUrl}
          fileName={event.lookbookPair[0]?.imageFileName}
          isUploading={uploadingKey === `editorial-lookbook-${event.id}`}
          onSelect={(e) => {
            const file = e.target.files?.[0]
            onImageUpload(file, `editorial-lookbook-${event.id}`, (url, fileName) => {
              onUpdate({
                lookbookPair: [
                  { imageUrl: url, imageFileName: fileName },
                  { imageUrl: null, imageFileName: null },
                ],
              })
            })
            e.target.value = ''
          }}
          onClear={() =>
            onUpdate({
              lookbookPair: [
                { imageUrl: null, imageFileName: null },
                { imageUrl: null, imageFileName: null },
              ],
            })
          }
        />
      )

    case 'middle_banner':
      return (
        <ImageUploader
          label="중간 배너"
          spec="MO/PC 공용 · 통이미지"
          aspectClass="aspect-[1400/460] w-[120px]"
          previewUrl={event.middleBannerUrl}
          fileName={event.middleBannerFileName}
          isUploading={uploadingKey === `editorial-middle-${event.id}`}
          onSelect={(e) => {
            const file = e.target.files?.[0]
            onImageUpload(file, `editorial-middle-${event.id}`, (url, fileName) => {
              onUpdate({ middleBannerUrl: url, middleBannerFileName: fileName })
            })
            e.target.value = ''
          }}
          onClear={() => onUpdate({ middleBannerUrl: null, middleBannerFileName: null })}
        />
      )

    case 'middle_lookbook':
      return (
        <ImageUploader
          label="룩북 이미지"
          spec="MO/PC 공용 · 통이미지"
          aspectClass="aspect-[3/4] w-[88px]"
          previewUrl={event.middleLookbook[0]?.imageUrl}
          fileName={event.middleLookbook[0]?.imageFileName}
          isUploading={uploadingKey === `editorial-midlook-${event.id}`}
          onSelect={(e) => {
            const file = e.target.files?.[0]
            onImageUpload(file, `editorial-midlook-${event.id}`, (url, fileName) => {
              onUpdate({
                middleLookbook: [
                  { imageUrl: url, imageFileName: fileName },
                  { imageUrl: null, imageFileName: null },
                ],
              })
            })
            e.target.value = ''
          }}
          onClear={() =>
            onUpdate({
              middleLookbook: [
                { imageUrl: null, imageFileName: null },
                { imageUrl: null, imageFileName: null },
              ],
            })
          }
        />
      )

    case 'featured_products':
      return (
        <div className="space-y-2">
          <FormRow label="타이틀">
            <TextInput
              value={event.featuredProducts.title}
              onChange={(value) =>
                onUpdate({ featuredProducts: { ...event.featuredProducts, title: value } })
              }
            />
          </FormRow>
          <label className="flex items-center gap-2 text-[12px]">
            <input
              type="checkbox"
              checked={event.featuredProducts.darkBackground}
              onChange={(e) =>
                onUpdate({
                  featuredProducts: { ...event.featuredProducts, darkBackground: e.target.checked },
                })
              }
            />
            다크 배경
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            {Array.from({ length: FEATURED_PRODUCT_SLOTS }).map((_, slotIndex) => (
              <ProductIdField
                key={`featured-${slotIndex}`}
                slotLabel={`상품 ${slotIndex + 1}`}
                productId={event.featuredProducts.productIds[slotIndex]}
                onAssign={(id) => onProductIds('featuredProducts', slotIndex, id)}
                onClear={() => onProductIds('featuredProducts', slotIndex, null)}
              />
            ))}
          </div>
        </div>
      )

    case 'product_tabs':
      return (
        <div className="space-y-2">
          {event.productTabs.map((tab, tabIndex) => (
            <div key={tab.id} className="space-y-2 rounded-sm border border-lightGray p-2.5">
              <div className="flex items-center justify-between">
                <p className="m-0 text-[11px] font-semibold text-dark">탭 {tabIndex + 1}</p>
                {event.productTabs.length > 1 ? (
                  <button
                    type="button"
                    className="text-[11px] text-subtleText"
                    onClick={() =>
                      onUpdate({ productTabs: event.productTabs.filter((_, i) => i !== tabIndex) })
                    }
                  >
                    탭 삭제
                  </button>
                ) : null}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <FormRow label="라벨">
                  <TextInput
                    value={tab.label}
                    onChange={(value) =>
                      onUpdate({
                        productTabs: event.productTabs.map((item, i) =>
                          i === tabIndex ? { ...item, label: value } : item,
                        ),
                      })
                    }
                  />
                </FormRow>
                <FormRow label="타이틀">
                  <TextInput
                    value={tab.sectionTitle}
                    onChange={(value) =>
                      onUpdate({
                        productTabs: event.productTabs.map((item, i) =>
                          i === tabIndex ? { ...item, sectionTitle: value } : item,
                        ),
                      })
                    }
                  />
                </FormRow>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {Array.from({ length: PRODUCT_TAB_SLOTS }).map((_, slotIndex) => (
                  <ProductIdField
                    key={`tab-${tabIndex}-${slotIndex}`}
                    slotLabel={`슬롯 ${slotIndex + 1}`}
                    productId={tab.productIds[slotIndex]}
                    onAssign={(id) => onTabProductIds(tabIndex, slotIndex, id)}
                    onClear={() => onTabProductIds(tabIndex, slotIndex, null)}
                  />
                ))}
              </div>
            </div>
          ))}
          {event.productTabs.length < MAX_PRODUCT_TABS ? (
            <button
              type="button"
              className="rounded-sm border border-dashed border-lightGray px-2 py-1 text-[11px]"
              onClick={() =>
                onUpdate({ productTabs: [...event.productTabs, createEmptyEditorialProductTab()] })
              }
            >
              + 탭
            </button>
          ) : null}
        </div>
      )

    case 'must_item':
      return (
        <div className="space-y-2">
          <FormRow label="타이틀">
            <TextInput
              value={event.mustItemSection.title}
              onChange={(value) =>
                onUpdate({ mustItemSection: { ...event.mustItemSection, title: value } })
              }
            />
          </FormRow>
          <FormRow label="노트">
            <TextInput
              value={event.mustItemSection.note}
              onChange={(value) =>
                onUpdate({ mustItemSection: { ...event.mustItemSection, note: value } })
              }
            />
          </FormRow>
          <div className="grid gap-2 sm:grid-cols-2">
            {Array.from({ length: MUST_ITEM_SLOTS }).map((_, slotIndex) => (
              <ProductIdField
                key={`must-${slotIndex}`}
                slotLabel={`MUST ${slotIndex + 1}`}
                productId={event.mustItemSection.productIds[slotIndex]}
                onAssign={(id) => onProductIds('mustItemSection', slotIndex, id)}
                onClear={() => onProductIds('mustItemSection', slotIndex, null)}
              />
            ))}
          </div>
        </div>
      )

    default:
      return null
  }
}
