import { Fragment, useCallback, useMemo, useRef, useState } from 'react'
import type { EditorialCollectionBlock, EditorialCouponItem, EditorialEventDetail, EditorialHeroInfo, EditorialProductSection } from '../../data/editorialEventDetails'
import { EditorialMainTab, type EditorialMainTabId } from '../molecules/EditorialMainTab'
import { ProductCardUnit } from '../molecules/ProductCardUnit'
import { EditorialHeroInfoSection } from './EditorialHeroInfoSection'
import { EditorialLookbookMasonrySection } from './EditorialLookbookMasonrySection'
import { EditorialProductShowcaseSection } from './EditorialProductShowcaseSection'
import { EditorialCatalogProductGridSection } from './EditorialCatalogProductGridSection'
import { ICONS } from '../../constants/icons'
import { getProductDetailPath } from '../../lib/productRoutes'
import { resolveCatalogHeroGalleryUrls } from '../../lib/editorialContentResolver'
import { navigateSpa } from '../../lib/spaNavigation'

const iconPlus = ICONS.common.plus

const CATALOG_PC_FALLBACK_COUPON: EditorialCouponItem = {
  kind: 'percent',
  label: '장바구니 쿠폰',
  value: '15',
  unit: '%',
  conditions: ['ID당 3회 발급/사용 가능', ''],
  validPeriod: '',
  applicableProducts: '',
  downloadLabel: '쿠폰 다운로드하기',
}

function resolveCatalogPcHeroInfo(detail: EditorialEventDetail): EditorialHeroInfo {
  const coupon =
    detail.heroInfo.coupon ??
    detail.coupons.find((item) => item.value.trim().length > 0) ??
    CATALOG_PC_FALLBACK_COUPON

  return {
    ...detail.heroInfo,
    coupon,
    showCoupon: detail.heroInfo.showCoupon !== false,
  }
}

export interface EditorialCollectionPcDetailContentProps {
  detail: EditorialEventDetail
}

/** Figma 155:4661 + 143:4080 — OTZ EDITORIAL title, event meta row, list link above collection tabs. */
function CollectionDetailHeader({ detail }: { detail: EditorialEventDetail }) {
  const title = detail.title.trim()
  const period = detail.period.trim()

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-2 pt-16">
      <h1 className="m-0 text-center text-[34px] font-extrabold leading-[1.2] tracking-[-0.02em] text-dark">
        OTZ EDITORIAL
      </h1>
      <div className="flex h-[30px] w-full items-center gap-5">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-1">
          {title ? (
            <p className="m-0 text-[15px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault">{title}</p>
          ) : null}
          {period ? (
            <p className="m-0 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-subtleText">{period}</p>
          ) : null}
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

function CollectionHero({ mainBanner }: { mainBanner: string }) {
  if (!mainBanner) return null

  return (
    <section className="mx-auto flex h-[862px] w-full max-w-[1400px] flex-col items-center justify-center pb-16">
      <img
        src={mainBanner}
        alt=""
        className="block min-h-0 w-full flex-1 object-cover object-center"
        loading="eager"
        decoding="async"
        draggable={false}
      />
    </section>
  )
}

function CollectionProductGrid({
  section,
  likedIds,
  onToggleLike,
}: {
  section: EditorialProductSection
  likedIds: Set<string>
  onToggleLike: (id: string) => void
}) {
  if (!section.products.length) return null

  const gridClass =
    section.columns === 5
      ? 'grid grid-cols-5 gap-[10px]'
      : 'grid grid-cols-4 gap-3'

  return (
    <section className="w-full bg-white pb-16 pt-20">
      <div className="mx-auto w-full max-w-[1400px] px-10">
        {section.title ? (
          <h2 className="m-0 text-center text-[30px] font-extrabold leading-[1.2] tracking-[-0.02em] text-dark lg:text-[38px]">
            {section.title}
          </h2>
        ) : null}
        <div className={`w-full ${section.title ? 'mt-10' : ''} ${gridClass}`}>
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
                titleClassName="min-h-[42px] min-w-0 line-clamp-2 pt-3 text-[14px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault"
                priceRowClassName="flex min-h-[25px] flex-wrap items-center gap-x-[6px] gap-y-0 pt-1"
                mediaInnerClassName="aspect-[272/340] lg:aspect-[272/340]"
                hideMultiCutDots
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CollectionImageBlock({ src }: { src: string }) {
  if (!src.trim()) return null

  return (
    <section className="w-full">
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

function isProductGridBlock(block: EditorialCollectionBlock): boolean {
  return block.type === 'products'
}

function isContentBlock(block: EditorialCollectionBlock): boolean {
  return block.type !== 'products' && block.type !== 'product_showcase'
}

function renderCollectionBlock(
  block: EditorialCollectionBlock,
  likedIds: Set<string>,
  toggleLike: (id: string) => void,
) {
  if (block.type === 'lookbook_gallery') {
    return <EditorialLookbookMasonrySection images={block.images} />
  }

  if (block.type === 'product_showcase') {
    return (
      <EditorialProductShowcaseSection
        title={block.title}
        subtitle={block.subtitle}
        product={block.product}
        gallery={block.gallery}
      />
    )
  }

  if (block.type === 'image') {
    return <CollectionImageBlock src={block.image} />
  }

  return (
    <CollectionProductGrid
      section={{
        title: block.title,
        products: block.products,
        columns: block.columns,
      }}
      likedIds={likedIds}
      onToggleLike={toggleLike}
    />
  )
}

/** Figma 143:4090 — collection/collabo PC editorial detail. */
export function EditorialCollectionPcDetailContent({ detail }: EditorialCollectionPcDetailContentProps) {
  const [activeTab, setActiveTab] = useState<EditorialMainTabId>('content')
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set())
  const contentSectionRef = useRef<HTMLDivElement>(null)
  const productSectionRef = useRef<HTMLDivElement>(null)
  const heroGalleryImages = useMemo(() => resolveCatalogHeroGalleryUrls(detail), [detail])

  const { contentBlocks, productBlocks } = useMemo(() => {
    const content: EditorialCollectionBlock[] = []
    const product: EditorialCollectionBlock[] = []
    const skipLookbookGallery = heroGalleryImages.length > 0
    for (const block of detail.collectionBlocks) {
      if (skipLookbookGallery && block.type === 'lookbook_gallery') continue
      if (block.type === 'product_showcase') continue
      if (isProductGridBlock(block)) product.push(block)
      else if (isContentBlock(block)) content.push(block)
    }
    return { contentBlocks: content, productBlocks: product }
  }, [detail.collectionBlocks, heroGalleryImages.length])

  const hasProductTab = useMemo(() => {
    const hasCatalogProducts = (detail.catalogProductGrids ?? []).some((section) => section.products.length > 0)
    const hasProductBlocks = productBlocks.some((block) => block.products.length > 0)
    return hasCatalogProducts || hasProductBlocks
  }, [detail.catalogProductGrids, productBlocks])

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleTabChange = useCallback((tab: EditorialMainTabId) => {
    setActiveTab(tab)
    requestAnimationFrame(() => {
      const targetRef = tab === 'product' ? productSectionRef : contentSectionRef
      targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  const catalogHeroInfo = useMemo(() => resolveCatalogPcHeroInfo(detail), [detail])

  return (
    <div className="flex w-full flex-col items-center justify-start bg-white pb-20">
      <CollectionDetailHeader detail={detail} />
      {hasProductTab ? (
        <EditorialMainTab activeTab={activeTab} onTabChange={handleTabChange} />
      ) : null}
      <CollectionHero mainBanner={detail.mainBanner} />
      <div ref={contentSectionRef} className="w-full scroll-mt-6">
        <EditorialHeroInfoSection heroInfo={catalogHeroInfo} variant="catalog-pc" />
        {heroGalleryImages.length > 0 ? (
          <EditorialLookbookMasonrySection images={heroGalleryImages} variant="hero-follow" />
        ) : null}
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
      </div>
      <div ref={productSectionRef} className="w-full scroll-mt-6">
        {(detail.catalogProductGrids ?? []).map((section) => (
          <EditorialCatalogProductGridSection
            key={section.id}
            section={section}
            likedIds={likedIds}
            onToggleLike={toggleLike}
            variant="pc"
          />
        ))}
        {productBlocks.map((block) => (
          <Fragment key={block.id}>{renderCollectionBlock(block, likedIds, toggleLike)}</Fragment>
        ))}
      </div>
      {contentBlocks.map((block) => (
        <Fragment key={block.id}>{renderCollectionBlock(block, likedIds, toggleLike)}</Fragment>
      ))}
    </div>
  )
}
