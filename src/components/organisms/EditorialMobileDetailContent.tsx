import { Fragment, useState } from 'react'
import type { EditorialSectionType } from '../../lib/adminEditorialConfig'
import type {
  EditorialCouponItem,
  EditorialEventDetail,
  EditorialProductSection,
  EditorialProductTab,
} from '../../data/editorialEventDetails'
import { ProductCardUnit } from '../molecules/ProductCardUnit'
import { ICONS } from '../../constants/icons'
import { getProductDetailPath } from '../../lib/productRoutes'
import { navigateSpa } from '../../lib/spaNavigation'

export interface EditorialMobileDetailContentProps {
  detail: EditorialEventDetail
}

function MobileBulletNote({ children }: { children: string }) {
  return (
    <div className="flex items-start justify-center gap-[5px]">
      <span className="mt-[7px] block size-[2px] shrink-0 bg-subtleText" aria-hidden />
      <p className="m-0 text-[12px] font-normal leading-[1.4] tracking-[-0.04em] text-subtleText">{children}</p>
    </div>
  )
}

function MobileHeroBanner({ mainBanner }: { mainBanner: string }) {
  if (!mainBanner) return null

  return (
    <section className="w-full">
      <div className="h-[200px] w-full overflow-hidden">
        <img src={mainBanner} alt="" className="size-full object-cover" loading="eager" decoding="async" draggable={false} />
      </div>
    </section>
  )
}

function MobileMiddleBanner({ src }: { src: string }) {
  if (!src) return null

  return (
    <section className="h-[140px] w-full overflow-hidden">
      <img src={src} alt="" className="size-full object-cover" loading="lazy" decoding="async" draggable={false} />
    </section>
  )
}

function MobileBenefitSection({ items }: { items: EditorialEventDetail['benefits'] }) {
  return (
    <section className="w-full bg-light px-[30px] pb-[30px] pt-10">
      <div className="flex flex-col items-center">
        <p className="m-0 text-[13px] font-medium leading-[1.2] tracking-[-0.02em] text-subtleText">특별한 혜택</p>
        <h2 className="m-0 text-[28px] font-extrabold leading-[1.2] tracking-[-0.02em] text-dark">BENEFIT</h2>
      </div>
      <div className="mt-0 w-full">
        {items.map((item, index) => (
          <div key={index}>
            <div className="flex items-center py-2.5">
              <span className="flex size-5 shrink-0 items-center justify-center bg-black text-[14px] font-bold leading-none text-white">
                {index + 1}
              </span>
              <p className="m-0 flex-1 text-right text-[16px] font-medium leading-[1.4] tracking-[-0.04em] text-dark">
                {item.text}
              </p>
            </div>
            {index < items.length - 1 ? <div className="h-px w-full bg-lightGray" /> : null}
          </div>
        ))}
      </div>
    </section>
  )
}

function MobileGiftSection({ gift }: { gift: EditorialEventDetail['giftSection'] }) {
  return (
    <section className="flex w-full flex-col items-center gap-[15px] bg-dark px-[30px] pb-[30px]">
      <span className="block size-0 border-x-[6px] border-t-[7px] border-x-transparent border-t-light" aria-hidden />
      <h2 className="m-0 text-center text-[18px] font-bold leading-[1.4] tracking-[-0.02em] text-white">
        {gift.title}
      </h2>
      <div className="w-full overflow-hidden rounded-sm bg-light">
        <img src={gift.image} alt="" className="block aspect-[285/356] w-full object-cover" draggable={false} />
      </div>
      <MobileBulletNote>{gift.note}</MobileBulletNote>
    </section>
  )
}

function MobileCouponCard({ coupon }: { coupon: EditorialCouponItem }) {
  return (
    <div className="flex w-full items-stretch">
      <div className="flex w-[120px] shrink-0 flex-col bg-black text-white">
        <div className="flex flex-1 flex-col items-center justify-center px-2 py-3">
          <p className="m-0 text-[11px] font-medium leading-[1.2] text-subtleText">{coupon.label}</p>
          <div className="mt-1 flex items-end leading-none">
            <span className="text-[34px] font-extrabold tracking-[-0.02em]">{coupon.value}</span>
            <span className="mb-1 text-[24px] font-extrabold">{coupon.unit}</span>
          </div>
        </div>
        <div className="h-px w-full bg-white/20" />
        <div className="flex flex-col items-center gap-0 px-2 py-2.5 text-center text-[11px] font-medium leading-[1.2] text-subtleText">
          <p className="m-0">{coupon.conditions[0]}</p>
          <p className="m-0">{coupon.conditions[1]}</p>
        </div>
        <div className="flex justify-center">
          <span className="block size-0 border-x-[4px] border-t-[4px] border-x-transparent border-t-[#f1f1f1]" aria-hidden />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between py-2.5 pl-3">
        <div className="flex flex-col gap-[3px]">
          <div className="flex items-center gap-1 pt-1.5">
            <span className="flex w-[52px] shrink-0 items-center justify-center rounded-full border border-dark px-1 py-1 text-[11px] leading-[1.2] text-dark">
              사용기간
            </span>
            <p className="m-0 text-[12px] leading-[1.4] tracking-[-0.04em] text-textDefault">{coupon.validPeriod}</p>
          </div>
          <div className="flex items-center gap-1 pt-1.5">
            <span className="flex w-[52px] shrink-0 items-center justify-center rounded-full border border-dark px-1 py-1 text-[11px] leading-[1.2] text-dark">
              적용상품
            </span>
            <p className="m-0 text-[12px] leading-[1.4] tracking-[-0.04em] text-textDefault">
              {coupon.applicableProducts}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="mt-3 w-full rounded-sm border-0 bg-dark px-2 py-2.5 text-[11px] font-medium leading-[1.2] text-white"
        >
          쿠폰 다운로드하기
        </button>
      </div>
    </div>
  )
}

function MobileCouponSection({
  coupons,
  notes,
}: {
  coupons: EditorialCouponItem[]
  notes: string[]
}) {
  if (coupons.length === 0) return null

  return (
    <section className="w-full bg-white pt-10">
      <div className="flex flex-col items-center pb-2.5">
        <p className="m-0 text-[13px] font-medium leading-[1.2] text-subtleText">SPECIAL GIFT</p>
        <h2 className="m-0 text-[28px] font-extrabold leading-[1.2] tracking-[-0.02em] text-dark">COUPON</h2>
      </div>
      <div className="bg-light2 px-3 py-[25px]">
        <div className="flex flex-col gap-5">
          {coupons.map((coupon, index) => (
            <MobileCouponCard key={index} coupon={coupon} />
          ))}
        </div>
      </div>
      {notes.length > 0 ? (
        <div className="px-1 pb-10 pt-5">
          <h3 className="m-0 text-center text-[18px] font-bold leading-[1.4] tracking-[-0.02em] text-dark">유의사항</h3>
          <ul className="m-0 mt-2 flex list-none flex-col gap-1.5 p-0">
            {notes.map((note, index) => (
              <li key={index} className="flex items-start gap-1">
                <span className="mt-[7px] block size-[2px] shrink-0 bg-subtleText" aria-hidden />
                <p className="m-0 flex-1 text-[12px] leading-[1.4] tracking-[-0.04em] text-textDefault">{note}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}

function MobileLookbookStack({ images }: { images: string[] }) {
  const visible = images.filter(Boolean)
  if (!visible.length) return null

  return (
    <section className="w-full">
      {visible.map((src, index) => (
        <img
          key={`${src}-${index}`}
          src={src}
          alt=""
          className="block h-auto w-full object-cover"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      ))}
    </section>
  )
}

function MobileProductGrid({
  section,
  likedIds,
  onToggleLike,
  darkBackground = false,
}: {
  section: EditorialProductSection
  likedIds: Set<string>
  onToggleLike: (id: string) => void
  darkBackground?: boolean
}) {
  const products = section.products.filter(Boolean)
  if (!products.length) return null

  return (
    <section className={`w-full ${darkBackground ? 'bg-dark px-5 py-[30px]' : 'bg-white px-[15px] py-10'}`}>
      <h2
        className={`m-0 text-center text-[20px] font-semibold leading-[1.2] tracking-[-0.02em] ${
          darkBackground ? 'text-white' : 'text-dark'
        }`}
      >
        {section.title}
      </h2>
      {section.note ? (
        <p
          className={`m-0 mt-2 text-center text-[12px] leading-[1.4] tracking-[-0.02em] ${
            darkBackground ? 'text-white/70' : 'text-subtleText'
          }`}
        >
          {section.note}
        </p>
      ) : null}
      <div className={`grid grid-cols-2 gap-x-[10px] gap-y-[50px] ${darkBackground ? 'mt-[15px] rounded-sm bg-light p-[13px]' : 'mt-5'}`}>
        {products.map((product) => (
          <div
            key={product.id}
            className="cursor-pointer"
            role="link"
            tabIndex={0}
            onClick={() => navigateSpa(getProductDetailPath(product.id))}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                navigateSpa(getProductDetailPath(product.id))
              }
            }}
          >
            <ProductCardUnit
              product={product}
              liked={likedIds.has(product.id)}
              onToggleLike={() => onToggleLike(product.id)}
              articleClassName="flex w-full flex-col"
              titleClassName="min-w-0 truncate pt-3 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault"
              hideMultiCutDots
            />
          </div>
        ))}
      </div>
      {darkBackground && products.length > 2 ? (
        <div className="mt-[15px] flex items-center justify-center gap-0 px-[50px]">
          <div className="h-0.5 w-20 bg-[#ddd]" />
          <div className="h-0.5 flex-1 bg-[#525252]" />
        </div>
      ) : null}
    </section>
  )
}

function MobileTabGrid({
  tabs,
  activeTabId,
  onSelect,
}: {
  tabs: EditorialProductTab[]
  activeTabId: string
  onSelect: (id: string) => void
}) {
  const rows = useMemo(() => {
    const pairs: EditorialProductTab[][] = []
    for (let index = 0; index < tabs.length; index += 2) {
      pairs.push(tabs.slice(index, index + 2))
    }
    return pairs
  }, [tabs])

  if (!tabs.length) return null

  return (
    <section className="w-full">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex h-[50px] w-full bg-dark">
          {row.map((tab, colIndex) => {
            const isActive = tab.id === activeTabId
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelect(tab.id)}
                className={`flex flex-1 items-center justify-center border-0 px-[30px] text-[13px] font-medium leading-[1.2] tracking-[-0.02em] ${
                  colIndex > 0 ? 'border-l border-[#666]' : ''
                } ${isActive ? 'text-white' : 'text-subtleText'}`}
              >
                {tab.label}
              </button>
            )
          })}
          {row.length === 1 ? <div className="flex-1 border-l border-[#666]" aria-hidden /> : null}
        </div>
      ))}
    </section>
  )
}

function MobileTabbedProducts({
  tabs,
  likedIds,
  onToggleLike,
}: {
  tabs: EditorialProductTab[]
  likedIds: Set<string>
  onToggleLike: (id: string) => void
}) {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? 'all')
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0]

  if (!activeTab) return null

  return (
    <section className="w-full bg-white pb-10">
      <MobileTabGrid tabs={tabs} activeTabId={activeTabId} onSelect={setActiveTabId} />
      <div className="px-10 pb-0 pt-[50px] text-center">
        <h2 className="m-0 text-[26px] font-extrabold leading-[1.2] tracking-[-0.02em] text-dark">
          {activeTab.sectionTitle}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-x-[10px] gap-y-[50px] px-[15px] pt-5">
        {activeTab.products.map((product) => (
          <div
            key={product.id}
            className="cursor-pointer"
            role="link"
            tabIndex={0}
            onClick={() => navigateSpa(getProductDetailPath(product.id))}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                navigateSpa(getProductDetailPath(product.id))
              }
            }}
          >
            <ProductCardUnit
              product={product}
              liked={likedIds.has(product.id)}
              onToggleLike={() => onToggleLike(product.id)}
              articleClassName="flex w-full flex-col"
              titleClassName="min-w-0 truncate pt-3 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault"
              hideMultiCutDots
            />
          </div>
        ))}
      </div>
    </section>
  )
}

function renderMobileEditorialSection(
  type: EditorialSectionType,
  detail: EditorialEventDetail,
  likedIds: Set<string>,
  toggleLike: (id: string) => void,
) {
  switch (type) {
    case 'benefit':
      return <MobileBenefitSection items={detail.benefits} />
    case 'gift':
      return <MobileGiftSection gift={detail.giftSection} />
    case 'coupon':
      return <MobileCouponSection coupons={detail.coupons} notes={detail.couponNotes} />
    case 'lookbook':
      return <MobileLookbookStack images={detail.lookbookPair} />
    case 'featured_products':
      return (
        <MobileProductGrid
          section={detail.featuredProducts}
          likedIds={likedIds}
          onToggleLike={toggleLike}
          darkBackground={detail.featuredProducts.darkBackground}
        />
      )
    case 'middle_banner':
      return <MobileMiddleBanner src={detail.middleBanner} />
    case 'middle_lookbook':
      return <MobileLookbookStack images={detail.middleLookbook} />
    case 'product_tabs':
      return <MobileTabbedProducts tabs={detail.productTabs} likedIds={likedIds} onToggleLike={toggleLike} />
    case 'must_item':
      return <MobileProductGrid section={detail.mustItemSection} likedIds={likedIds} onToggleLike={toggleLike} />
    default:
      return null
  }
}

/** Figma 2680:17738 — MO editorial / event detail (375px). Images are MO/PC shared. */
export function EditorialMobileDetailContent({ detail }: EditorialMobileDetailContentProps) {
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set())

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const insetSections: EditorialSectionType[] = [
    'benefit',
    'gift',
    'coupon',
    'lookbook',
    'featured_products',
    'middle_banner',
    'middle_lookbook',
  ]
  const fullWidthSections: EditorialSectionType[] = ['product_tabs', 'must_item']

  return (
    <div className="w-full bg-white">
      <section className="px-[15px] pb-0 pt-[15px]">
        <h1 className="m-0 text-[16px] font-medium leading-[1.4] tracking-[-0.04em] text-dark">{detail.title}</h1>
        <p className="m-0 pt-1 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-subtleText">{detail.period}</p>
      </section>

      <div className="px-[15px]">
        <MobileHeroBanner mainBanner={detail.mainBanner} />
        {detail.sectionOrder
          .filter((sectionType) => insetSections.includes(sectionType))
          .map((sectionType) => (
            <Fragment key={sectionType}>
              {renderMobileEditorialSection(sectionType, detail, likedIds, toggleLike)}
            </Fragment>
          ))}
      </div>

      {detail.sectionOrder
        .filter((sectionType) => fullWidthSections.includes(sectionType))
        .map((sectionType) => (
          <Fragment key={sectionType}>
            {renderMobileEditorialSection(sectionType, detail, likedIds, toggleLike)}
          </Fragment>
        ))}
    </div>
  )
}
