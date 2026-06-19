import { Fragment, useMemo, useState } from 'react'
import type {
  EditorialCollectionBlock,
  EditorialCouponItem,
  EditorialEventDetail,
  EditorialHeroInfo,
  EditorialProductSection,
} from '../../data/editorialEventDetails'
import { ProductCardUnit } from '../molecules/ProductCardUnit'
import { EditorialHeroInfoSection } from './EditorialHeroInfoSection'
import { EditorialLookbookMasonrySection } from './EditorialLookbookMasonrySection'
import { EditorialProductShowcaseSection } from './EditorialProductShowcaseSection'
import { EditorialCatalogProductGridSection } from './EditorialCatalogProductGridSection'
import { getProductDetailPath } from '../../lib/productRoutes'
import { resolveCatalogHeroGalleryUrls } from '../../lib/editorialContentResolver'
import { navigateSpa } from '../../lib/spaNavigation'

const CATALOG_MOBILE_FALLBACK_COUPON: EditorialCouponItem = {
  kind: 'percent',
  label: '장바구니 쿠폰',
  value: '15',
  unit: '%',
  conditions: ['ID당 3회 발급/사용 가능', ''],
  validPeriod: '',
  applicableProducts: '',
  downloadLabel: '쿠폰 다운로드하기',
}

function resolveCatalogMobileHeroInfo(detail: EditorialEventDetail): EditorialHeroInfo {
  const coupon =
    detail.heroInfo.coupon ??
    detail.coupons.find((item) => item.value.trim().length > 0) ??
    CATALOG_MOBILE_FALLBACK_COUPON

  return {
    ...detail.heroInfo,
    coupon,
    showCoupon: detail.heroInfo.showCoupon !== false,
  }
}

export interface EditorialCollectionMobileDetailContentProps {
  detail: EditorialEventDetail
}

/** Figma 163:4737 — MO collection meta row above list content. */
function CollectionMobileMetaHeader({ title, period }: { title: string; period: string }) {
  const trimmedTitle = title.trim()
  const trimmedPeriod = period.trim()
  if (!trimmedTitle && !trimmedPeriod) return null

  return (
    <section className="px-[15px] py-[15px]">
      {trimmedTitle ? (
        <h1 className="m-0 text-[16px] font-medium leading-[1.4] tracking-[-0.04em] text-dark">{trimmedTitle}</h1>
      ) : null}
      {trimmedPeriod ? (
        <p className="m-0 pt-1 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-subtleText">
          {trimmedPeriod}
        </p>
      ) : null}
    </section>
  )
}

function CollectionProductGridMobile({
  section,
  likedIds,
  onToggleLike,
}: {
  section: EditorialProductSection
  likedIds: Set<string>
  onToggleLike: (id: string) => void
}) {
  if (!section.products.length) return null

  return (
    <section className="px-[15px] py-10">
      {section.title ? (
        <h2 className="m-0 text-center text-[18px] font-extrabold leading-[1.2] text-dark">{section.title}</h2>
      ) : null}
      <div className={`grid grid-cols-2 gap-x-2 gap-y-8 ${section.title ? 'mt-6' : ''}`}>
        {section.products.map((product, index) => (
          <div
            key={`${product.id}-${index}`}
            className="min-w-0 cursor-pointer"
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
              titleClassName="min-h-[28px] truncate pt-2 text-[12px] leading-[1.4] text-textDefault"
              priceRowClassName="flex flex-wrap items-center gap-x-1 pt-1 text-[12px]"
              mediaInnerClassName="aspect-[1200/1500]"
              hideMultiCutDots
            />
          </div>
        ))}
      </div>
    </section>
  )
}

function renderCollectionBlockMobile(
  block: EditorialCollectionBlock,
  likedIds: Set<string>,
  toggleLike: (id: string) => void,
) {
  if (block.type === 'lookbook_gallery') {
    return (
      <section className="flex flex-col gap-2 px-[15px] py-8">
        {block.images.map((image, index) => (
          <img key={`${image}-${index}`} src={image} alt="" className="block h-auto w-full" loading="lazy" draggable={false} />
        ))}
      </section>
    )
  }

  if (block.type === 'product_showcase') {
    return (
      <EditorialProductShowcaseSection
        title={block.title}
        subtitle={block.subtitle}
        product={block.product}
        gallery={block.gallery}
        layout="collection"
      />
    )
  }

  if (block.type === 'image') {
    if (!block.image.trim()) return null
    return (
      <section className="w-full">
        <img src={block.image} alt="" className="block h-auto w-full" loading="lazy" draggable={false} />
      </section>
    )
  }

  return (
    <CollectionProductGridMobile
      section={{ title: block.title, products: block.products, columns: block.columns }}
      likedIds={likedIds}
      onToggleLike={toggleLike}
    />
  )
}

/** Figma 163:4742 — collection/collabo MO editorial detail. */
export function EditorialCollectionMobileDetailContent({ detail }: EditorialCollectionMobileDetailContentProps) {
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set())
  const heroGalleryImages = resolveCatalogHeroGalleryUrls(detail)
  const catalogHeroInfo = useMemo(() => resolveCatalogMobileHeroInfo(detail), [detail])

  const otherBlocks = useMemo(() => {
    const blocks: EditorialCollectionBlock[] = []
    const skipLookbookGallery = heroGalleryImages.length > 0

    for (const block of detail.collectionBlocks) {
      if (skipLookbookGallery && block.type === 'lookbook_gallery') continue
      if (block.type === 'product_showcase') continue
      blocks.push(block)
    }

    return blocks
  }, [detail.collectionBlocks, heroGalleryImages.length])

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="w-full bg-white pb-16">
      <CollectionMobileMetaHeader title={detail.title} period={detail.period} />

      <div className="px-[15px]">
        {detail.mainBanner ? (
          <img
            src={detail.mainBanner}
            alt=""
            className="block aspect-[345/460] w-full object-cover"
            loading="eager"
            draggable={false}
          />
        ) : null}

        <EditorialHeroInfoSection heroInfo={catalogHeroInfo} variant="catalog-mobile" />

        {(detail.standaloneShowcases ?? []).map((showcase) => (
          <EditorialProductShowcaseSection
            key={showcase.id}
            title={showcase.title}
            subtitle={showcase.subtitle}
            product={showcase.product}
            gallery={showcase.gallery}
            layout="collection"
          />
        ))}

        {heroGalleryImages.length > 0 ? (
          <EditorialLookbookMasonrySection images={heroGalleryImages} variant="hero-follow-mobile" />
        ) : null}
      </div>

      {(detail.catalogProductGrids ?? []).map((section) => (
        <EditorialCatalogProductGridSection
          key={section.id}
          section={section}
          likedIds={likedIds}
          onToggleLike={toggleLike}
          variant="mobile"
        />
      ))}

      {otherBlocks.map((block) => (
        <Fragment key={block.id}>{renderCollectionBlockMobile(block, likedIds, toggleLike)}</Fragment>
      ))}
    </div>
  )
}
