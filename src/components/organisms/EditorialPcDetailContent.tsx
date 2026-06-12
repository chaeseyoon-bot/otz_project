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

const iconPlus = ICONS.common.plus

export interface EditorialPcDetailContentProps {
  detail: EditorialEventDetail
}

function EditorialDetailHeader({ detail }: { detail: EditorialEventDetail }) {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <h1 className="m-0 text-center text-[34px] font-extrabold leading-[1.2] tracking-[-0.02em] text-dark">
        OTZ EDITORIAL
      </h1>
      <div className="flex w-full items-center gap-5">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-1">
          <p className="m-0 text-[15px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault">
            {detail.title}
          </p>
          <p className="m-0 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-subtleText">
            {detail.period}
          </p>
        </div>
        <button
          type="button"
          className="flex shrink-0 items-center gap-1.5 border-0 bg-transparent p-0 pl-[15px] text-[16px] font-medium leading-[1.4] tracking-[-0.04em] text-dark hover:opacity-80"
          onClick={() => navigateSpa('/editorial')}
        >
          리스트가기
          <img src={iconPlus} alt="" className="size-[22px] shrink-0" draggable={false} aria-hidden />
        </button>
      </div>
    </div>
  )
}

function EditorialHeroBanner({ mainBanner }: { mainBanner: string }) {
  if (!mainBanner) return null

  return (
    <section className="w-full pt-5">
      <div className="w-full overflow-hidden">
        <img
          src={mainBanner}
          alt=""
          className="block h-auto w-full"
          loading="eager"
          decoding="async"
          draggable={false}
        />
      </div>
    </section>
  )
}

function EditorialMiddleBanner({ src }: { src: string }) {
  if (!src) return null

  return (
    <section className="w-full overflow-hidden">
      <img
        src={src}
        alt=""
        className="block h-auto w-full"
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </section>
  )
}

function EditorialBenefitSection({ items }: { items: EditorialEventDetail['benefits'] }) {
  return (
    <section className="w-full bg-light px-[300px] pb-[50px] pt-[80px]">
      <div className="mx-auto flex max-w-[800px] flex-col items-center">
        <p className="m-0 text-[18px] font-bold leading-[1.4] tracking-[-0.02em] text-subtleText">특별한 혜택</p>
        <h2 className="m-0 text-[52px] font-extrabold leading-[1.2] tracking-[-0.02em] text-dark">BENEFIT</h2>
        <div className="mt-0 w-full">
          {items.map((item, index) => (
            <div key={index}>
              <div className="flex items-center gap-0 py-[30px]">
                <span className="flex size-10 shrink-0 items-center justify-center bg-black text-[24px] font-extrabold leading-none text-white">
                  {index + 1}
                </span>
                <p className="m-0 flex-1 text-right text-[28px] font-medium leading-[1.4] tracking-[-0.04em] text-dark">
                  {item.text}
                </p>
              </div>
              {index < items.length - 1 ? <div className="h-px w-full bg-lightGray" /> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function EditorialGiftSection({ gift }: { gift: EditorialEventDetail['giftSection'] }) {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-[30px] bg-dark px-0 pb-[60px] pt-0">
      <div className="flex h-[14px] w-6 items-center justify-center">
        <span className="block size-0 border-x-[12px] border-t-[14px] border-x-transparent border-t-light" aria-hidden />
      </div>
      <h2 className="m-0 text-center text-[30px] font-extrabold leading-[1.2] tracking-[-0.02em] text-white">
        {gift.title}
      </h2>
      <div className="w-[580px] overflow-hidden rounded-sm bg-light">
        <img src={gift.image} alt="" className="block aspect-[580/765] w-full object-cover" draggable={false} />
      </div>
      <div className="flex items-start gap-1.5">
        <span className="mt-3 block size-1 shrink-0 bg-subtleText" aria-hidden />
        <p className="m-0 text-[25px] font-normal leading-[1.4] tracking-[-0.04em] text-subtleText">{gift.note}</p>
      </div>
    </section>
  )
}

function EditorialCouponCard({ coupon }: { coupon: EditorialCouponItem }) {
  return (
    <div className="flex w-full items-stretch">
      <div className="flex w-[400px] shrink-0 flex-col bg-black text-white">
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-[50px]">
          <p className="m-0 text-[28px] font-medium leading-[1.4] tracking-[-0.04em] text-subtleText">{coupon.label}</p>
          <div className="mt-2 flex items-end leading-none">
            <span className="text-[80px] font-extrabold tracking-[-0.02em]">{coupon.value}</span>
            <span className="mb-2 text-[52px] font-extrabold">{coupon.unit}</span>
          </div>
        </div>
        <div className="h-px w-full bg-white/20" />
        <div className="flex flex-col items-center gap-0 px-6 py-[30px] text-center text-[25px] font-normal leading-[1.4] tracking-[-0.04em] text-subtleText">
          <p className="m-0">{coupon.conditions[0]}</p>
          <p className="m-0">{coupon.conditions[1]}</p>
        </div>
        <div className="flex justify-center pb-0 pt-1">
          <span className="block size-0 -scale-y-100 border-x-[12px] border-t-[14px] border-x-transparent border-t-[#f1f1f1]" aria-hidden />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between py-10 pl-[60px]">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-[30px] px-2.5 pt-4">
            <span className="flex w-[190px] shrink-0 items-center justify-center rounded-full border border-dark px-3.5 py-3.5 text-[28px] font-medium leading-[1.4] tracking-[-0.04em] text-dark">
              사용기간
            </span>
            <p className="m-0 text-[28px] font-medium leading-[1.4] tracking-[-0.04em] text-textDefault">
              {coupon.validPeriod}
            </p>
          </div>
          <div className="flex items-center gap-[30px] px-2.5 pt-4">
            <span className="flex w-[190px] shrink-0 items-center justify-center rounded-full border border-dark px-3.5 py-3.5 text-[28px] font-medium leading-[1.4] tracking-[-0.04em] text-dark">
              적용상품
            </span>
            <p className="m-0 text-[28px] font-medium leading-[1.4] tracking-[-0.04em] text-textDefault">
              {coupon.applicableProducts}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="mt-12 w-full rounded-sm border-0 bg-dark px-[30px] py-[30px] text-[28px] font-medium leading-[1.4] tracking-[-0.04em] text-white hover:opacity-90"
        >
          쿠폰 다운로드하기
        </button>
      </div>
    </div>
  )
}

function EditorialCouponSection({
  coupons,
  notes,
}: {
  coupons: EditorialCouponItem[]
  notes: string[]
}) {
  if (coupons.length === 0) return null

  return (
    <section className="w-full bg-white pb-[100px] pt-[80px]">
      <div className="flex flex-col items-center pb-[30px]">
        <p className="m-0 text-[18px] font-bold leading-[1.4] tracking-[-0.02em] text-subtleText">SPECIAL GIFT</p>
        <h2 className="m-0 text-[52px] font-extrabold leading-[1.2] tracking-[-0.02em] text-dark">COUPON</h2>
      </div>
      <div className="bg-[#f1f1f1] px-40 py-[100px]">
        <div className="flex flex-col gap-10">
          {coupons.map((coupon, index) => (
            <EditorialCouponCard key={index} coupon={coupon} />
          ))}
        </div>
      </div>
      {notes.length > 0 ? (
        <div className="px-[100px] pt-[50px]">
          <h3 className="m-0 text-center text-[34px] font-extrabold leading-[1.2] tracking-[-0.02em] text-dark">
            유의사항
          </h3>
          <ul className="m-0 mt-[30px] flex list-none flex-col gap-3 p-0">
            {notes.map((note, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <span className="mt-3 block size-1 shrink-0 bg-subtleText" aria-hidden />
                <p className="m-0 flex-1 text-[25px] font-normal leading-[1.4] tracking-[-0.04em] text-textDefault">
                  {note}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}

function EditorialProductGrid({
  section,
  likedIds,
  onToggleLike,
}: {
  section: EditorialProductSection
  likedIds: Set<string>
  onToggleLike: (id: string) => void
}) {
  const gridClass =
    section.columns === 5
      ? 'grid grid-cols-5 auto-rows-[1fr] items-stretch gap-x-4 gap-y-10'
      : 'grid grid-cols-4 auto-rows-[1fr] items-stretch gap-x-4 gap-y-10'

  return (
    <div className={`w-full ${section.darkBackground ? 'bg-dark px-[110px] py-16' : 'bg-white px-0 py-10'}`}>
      <h2
        className={`m-0 text-center text-[34px] font-extrabold leading-[1.2] tracking-[-0.02em] ${
          section.darkBackground ? 'text-white' : 'text-dark'
        }`}
      >
        {section.title}
      </h2>
      {section.note ? (
        <p
          className={`m-0 mt-3 text-center text-[18px] font-normal leading-[1.4] tracking-[-0.02em] ${
            section.darkBackground ? 'text-white/70' : 'text-subtleText'
          }`}
        >
          {section.note}
        </p>
      ) : null}
      <div
        className={`mt-10 w-full ${gridClass} ${
          section.darkBackground ? 'bg-light px-[50px] pt-5 pb-[30px] text-dark' : ''
        }`}
      >
        {section.products.map((product, index) => (
          <div
            key={`${product.id}-${index}`}
            className="flex h-full min-w-0 w-full cursor-pointer flex-col"
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
              articleClassName="flex h-full w-full min-h-0 flex-col"
              titleClassName="min-h-[32px] min-w-0 truncate pt-3 text-[14px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault"
              priceRowClassName="flex min-h-[25px] flex-wrap items-center gap-x-[6px] gap-y-0 pt-1"
              mediaInnerClassName="aspect-[1200/1500] lg:aspect-[1200/1500]"
              hideMultiCutDots
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function EditorialLookbookImage({ images }: { images: [string, string] }) {
  const src = images.find((url) => url.trim().length > 0)
  if (!src) return null

  return (
    <section className="w-full">
      <img src={src} alt="" className="block h-auto w-full object-cover" loading="lazy" draggable={false} />
    </section>
  )
}

function EditorialTabbedProducts({
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
    <section className="w-full bg-white pb-20 pt-10">
      <div className="flex w-full justify-center bg-dark">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTabId(tab.id)}
              className={`border-0 bg-transparent px-10 py-4 text-[15px] font-medium tracking-[0.06em] transition-colors ${
                isActive ? 'border-b-2 border-white text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      <EditorialProductGrid
        section={{
          title: activeTab.sectionTitle,
          products: activeTab.products,
          columns: 5,
        }}
        likedIds={likedIds}
        onToggleLike={onToggleLike}
      />
    </section>
  )
}

function renderEditorialSection(
  type: EditorialSectionType,
  detail: EditorialEventDetail,
  likedIds: Set<string>,
  toggleLike: (id: string) => void,
) {
  switch (type) {
    case 'benefit':
      return <EditorialBenefitSection items={detail.benefits} />
    case 'gift':
      return <EditorialGiftSection gift={detail.giftSection} />
    case 'coupon':
      return <EditorialCouponSection coupons={detail.coupons} notes={detail.couponNotes} />
    case 'lookbook':
      return <EditorialLookbookImage images={detail.lookbookPair} />
    case 'featured_products':
      return (
        <EditorialProductGrid section={detail.featuredProducts} likedIds={likedIds} onToggleLike={toggleLike} />
      )
    case 'middle_banner':
      return <EditorialMiddleBanner src={detail.middleBanner} />
    case 'middle_lookbook':
      return <EditorialLookbookImage images={detail.middleLookbook} />
    case 'product_tabs':
      return <EditorialTabbedProducts tabs={detail.productTabs} likedIds={likedIds} onToggleLike={toggleLike} />
    case 'must_item':
      return <EditorialProductGrid section={detail.mustItemSection} likedIds={likedIds} onToggleLike={toggleLike} />
    default:
      return null
  }
}

/** Figma 2644:60528 — PC editorial / event detail within 1400px content rail. */
export function EditorialPcDetailContent({ detail }: EditorialPcDetailContentProps) {
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set())

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] py-[60px]">
      <EditorialDetailHeader detail={detail} />
      <EditorialHeroBanner mainBanner={detail.mainBanner} />
      {detail.sectionOrder.map((sectionType) => (
        <Fragment key={sectionType}>{renderEditorialSection(sectionType, detail, likedIds, toggleLike)}</Fragment>
      ))}
    </div>
  )
}
