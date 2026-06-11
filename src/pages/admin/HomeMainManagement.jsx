import { useEffect, useMemo, useState } from 'react'
import { ProductEditorialThumbnail } from '../../components/molecules/ProductEditorialThumbnail'
import { QuickMenuSlotPreview } from '../../components/molecules/QuickMenuSlotPreview'
import {
  BRAND_INTRO_MOBILE_HEIGHT,
  BRAND_INTRO_MOBILE_WIDTH,
  BrandIntroMobileSlide,
} from '../../components/molecules/BrandIntroMobileSlide'
import { BrandSeriesMobileSlide } from '../../components/molecules/BrandSeriesMobileSlide'
import {
  PLANNING_BANNER_MOBILE_HEIGHT,
  PLANNING_BANNER_MOBILE_WIDTH,
  PlanningBannerMobileSlide,
} from '../../components/molecules/PlanningBannerMobileSlide'
import {
  CURATION_MOBILE_HEIGHT,
  CURATION_MOBILE_WIDTH,
  CurationMobileSlide,
} from '../../components/molecules/CurationMobileSlide'
import {
  PLANNING_COLLECTION_BANNER_HEIGHT,
  PLANNING_COLLECTION_CARD_WIDTH,
  PlanningCollectionMobileSlide,
} from '../../components/molecules/PlanningCollectionMobileSlide'
import { useHomeMainConfigContext } from '../../contexts/HomeMainConfigContext'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { uploadAdminBannerImage } from '../../lib/adminBannerUpload'
import { ARCHIVE_LOOKBOOK_ITEMS } from '../../data/archiveLookbooks'
import {
  clampCurationTitle,
  clampLookbookTitle,
  clampPlanningCollectionTitle,
  clampStyleBannerTitle,
  createDefaultHomeMainConfig,
  createEmptyMarketingPopupSlide,
  createEmptyPlanningBanner,
  createEmptyPlanningCollection,
  createEmptyQuickMenuSlot,
  createEmptyStyleBannerCard,
  CURATION_PRODUCT_SLOTS,
  loadAdminHomeMainConfig,
  LOOKBOOK_IMAGE_SLOTS,
  LOOKBOOK_MOBILE_VISIBLE_SLOTS,
  countFilledPlanningCollectionProducts,
  MAX_PLANNING_COLLECTIONS,
  MAX_MARKETING_POPUP_SLIDES,
  MAX_STYLE_BANNER_CARDS,
  MIN_PLANNING_COLLECTION_PRODUCTS,
  MIN_MARKETING_POPUP_SLIDES,
  PLANNING_COLLECTION_PRODUCT_SLOTS,
  STYLE_BANNER_PRODUCT_SLOTS,
} from '../../lib/adminHomeMainConfig'
import { getDefaultLookbookSlotUrls, getLatestArchiveLookbookId } from '../../lib/archiveLookbookImages'
import { mainImageAsset } from '../../lib/mainImagesAssetUrl'
import { resolveLookbookSection, resolveStyleBannerSection } from '../../lib/homeMainContentResolver'
import { getAdminProductEditPath } from '../../lib/adminRoutes'
import {
  adminProductTitle,
  fetchProductById,
  fetchProductDetailById,
  formatAdminDiscountRate,
  formatAdminPrice,
  fetchProductRowById,
  getProductEditorialCutCandidates,
  getProductThumbnailCandidates,
  searchAdminProductsForPicker,
} from '../../lib/productsApi'
import { PRODUCT_CARD_CUTS } from '../../lib/productImage'

const SECTION_TABS = [
  { id: 'main', label: '1. 메인 배너' },
  { id: 'quick', label: '2. 퀵메뉴' },
  { id: 'brand', label: '3. 브랜드 배너' },
  { id: 'series', label: '4. 시리즈 배너' },
  { id: 'planning', label: '5. 기획전 배너' },
  { id: 'collection', label: '6. 기획전 컬렉션' },
  { id: 'curation', label: '7. 큐레이션 상품' },
  { id: 'styling', label: '8. 스타일 배너' },
  { id: 'lookbook', label: '9. 룩북' },
  { id: 'marketingPopup', label: '10. 마케팅 팝업' },
]

const SECTION_SAVE_LABELS = {
  main: '메인 배너',
  quick: '퀵메뉴',
  brand: '브랜드 배너',
  series: '시리즈 배너',
  planning: '기획전 배너',
  collection: '기획전 컬렉션',
  curation: '큐레이션 상품',
  styling: '스타일 배너',
  lookbook: '룩북',
  marketingPopup: '마케팅 팝업',
}

function validateHomeMainActiveTab(activeTab, config) {
  switch (activeTab) {
    case 'planning': {
      const filledBannerCount = config.planningBanners.filter((banner) =>
        Boolean(banner.imageUrl?.trim()),
      ).length
      if (filledBannerCount < 1) {
        return '기획전 배너를 1개 이상 등록해 주세요.'
      }
      return null
    }
    case 'collection': {
      for (let index = 0; index < config.planningCollections.length; index++) {
        const filledCount = countFilledPlanningCollectionProducts(
          config.planningCollections[index].productIds,
        )
        if (filledCount < MIN_PLANNING_COLLECTION_PRODUCTS) {
          return `기획전 컬렉션 ${index + 1}: 상품을 최소 ${MIN_PLANNING_COLLECTION_PRODUCTS}개 등록해 주세요.`
        }
      }
      return null
    }
    case 'marketingPopup': {
      const filledSlideCount = config.marketingPopupSlides.filter((slide) =>
        Boolean(slide.imageUrl?.trim()),
      ).length
      if (filledSlideCount < MIN_MARKETING_POPUP_SLIDES) {
        return '마케팅 팝업 이미지를 1개 이상 등록해 주세요.'
      }
      return null
    }
    default:
      return null
  }
}

const LOOKBOOK_SLOT_LABELS = [
  '슬롯 1 · MO 메인 / PC 히어로',
  '슬롯 2 · MO / PC',
  '슬롯 3 · MO / PC',
  '슬롯 4 · PC',
  '슬롯 5 · PC',
  '슬롯 6 · PC',
  '슬롯 7 · PC',
]

const LOOKBOOK_MOBILE_PREVIEW_HEIGHT = 520

const CURATION_CATEGORY_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'bagacc', label: 'Bag&Acc' },
]

const MAX_PLANNING_BANNERS = 5
const PLANNING_COLLECTION_PREVIEW_HEIGHT = PLANNING_COLLECTION_BANNER_HEIGHT + 105
const CURATION_PICKER_LIMIT = 50
const CURATION_SEARCH_DEBOUNCE_MS = 300

// ─────────────────────────────────────────────
// ScaledMobilePreview
// 실제 모바일 뷰포트(390 × height)로 렌더링한 내용을
// CSS transform: scale() 로 proportionally 축소한 미리보기.
// 텍스트·여백이 실제 화면과 동일한 비율로 표시됩니다.
//
// Props:
//   mobileWidth  — 기준 모바일 뷰포트 너비 (default 390)
//   mobileHeight — 기준 모바일 뷰포트 높이 (default 812)
//   previewWidth — 미리보기 박스 너비(px)  (default 195)
//   label        — 박스 상단에 표시할 레이블
// ─────────────────────────────────────────────
function ScaledMobilePreview({
  mobileWidth = 390,
  mobileHeight = 812,
  previewWidth = 195,
  label,
  children,
}) {
  const scale = previewWidth / mobileWidth
  const previewHeight = Math.round(mobileHeight * scale)

  return (
    <div className="flex w-fit flex-col gap-1">
      {label ? (
        <p className="m-0 text-[11px] text-subtleText">{label}</p>
      ) : null}
      {/* 바깥 클리핑 박스 — 실제 표시 크기 */}
      <div
        style={{ width: previewWidth, height: previewHeight }}
        className="relative overflow-hidden rounded-[6px] border border-lightGray bg-light shadow-sm"
      >
        {/* 안쪽 박스 — 실제 모바일 크기로 렌더링 후 scale 축소 */}
        <div
          style={{
            width: mobileWidth,
            height: mobileHeight,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Shared UI atoms
// ─────────────────────────────────────────────
function SpecNote({ children }) {
  return (
    <p className="m-0 rounded-sm border border-lightGray bg-light3 px-3 py-2 text-bodySmall text-subtleText">
      {children}
    </p>
  )
}

function FieldLabel({ children, hint }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-bodySmall text-subtleText">{children}</span>
      {hint ? <span className="text-[11px] text-subtleText">{hint}</span> : null}
    </label>
  )
}

function TextInput({ value, onChange, placeholder, multiline = false, rows = 4 }) {
  const cls =
    'rounded-sm border border-lightGray bg-white px-3 py-2 text-bodyRegular2 text-dark outline-none focus:border-dark'
  if (multiline) {
    return (
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${cls} resize-y`}
      />
    )
  }
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`h-10 ${cls}`}
    />
  )
}

const MAIN_BANNER_MOBILE_WIDTH = 375
const MARKETING_POPUP_WIDTH = 375
const MARKETING_POPUP_BANNER_HEIGHT = 340
const MARKETING_POPUP_FOOTER_HEIGHT = 52
const MARKETING_POPUP_FALLBACK_IMAGE = mainImageAsset('homemain_pop_banner01.jpg')

function MainBannerPreviewContent({ slide, mobileWidth = MAIN_BANNER_MOBILE_WIDTH }) {
  const mobileHeight = Math.round(mobileWidth * (5 / 4))

  return (
    <div className="relative bg-light" style={{ width: mobileWidth, height: mobileHeight }}>
      {slide.imageUrl ? (
        <>
          <img src={slide.imageUrl} alt="" className="absolute inset-0 size-full object-cover" />
          <div
            className="pointer-events-none absolute inset-y-0 left-0 bg-red-500/15"
            style={{ width: '6.6%' }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 bg-red-500/15"
            style={{ width: '6.6%' }}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-5 pb-10 pt-20 text-center text-white">
            <p className="m-0 whitespace-pre-line text-[25px] font-extrabold leading-tight">
              {slide.title || '메인 타이틀'}
            </p>
            <p className="m-0 mt-2 text-[13px] leading-relaxed opacity-90">
              {slide.subtitle || '서브 카피'}
            </p>
            <span className="mt-4 inline-block rounded-sm border border-white/80 px-5 py-2 text-[11px]">
              {slide.ctaLabel || 'CTA'}
            </span>
          </div>
        </>
      ) : (
        <div className="flex size-full items-center justify-center text-[16px] text-subtleText">
          이미지를 업로드하세요
        </div>
      )}
    </div>
  )
}

function MarketingPopupPreviewContent({ slide, slideIndex, totalCount }) {
  const imageUrl = slide.imageUrl || MARKETING_POPUP_FALLBACK_IMAGE

  return (
    <div className="bg-white" style={{ width: MARKETING_POPUP_WIDTH }}>
      <div
        className="relative overflow-hidden bg-black"
        style={{ height: MARKETING_POPUP_BANNER_HEIGHT }}
      >
        <img src={imageUrl} alt="" className="size-full object-cover object-top" draggable={false} />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-start gap-4 px-[30px] py-10 text-white">
          <h2 className="m-0 max-w-[200px] whitespace-pre-line text-[24px] font-extrabold leading-[1.2] tracking-[-0.02em]">
            {slide.title || '대타이틀'}
          </h2>
          <p className="m-0 max-w-[200px] whitespace-pre-line text-[12px] leading-[1.4]">
            {slide.subtitle || '서브텍스트'}
          </p>
        </div>
        {totalCount >= 2 ? (
          <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-black/30 px-2.5 py-1 text-[11px] leading-[1.2] text-white">
            <span>{slideIndex + 1}</span>
            <span className="text-white/50"> / {totalCount}</span>
          </div>
        ) : null}
      </div>
      <footer
        className="flex items-center justify-between bg-white text-[14px] leading-[1.4] tracking-[-0.02em]"
        style={{ minHeight: MARKETING_POPUP_FOOTER_HEIGHT }}
      >
        <span className="px-5 py-2.5 text-textSecondary">오늘 그만보기</span>
        <span className="px-5 py-2.5 text-dark">닫기</span>
      </footer>
    </div>
  )
}

function MainBannerPreviewModal({ slide, slideIndex, onClose }) {
  useLockBodyScroll(true)

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[calc(100vh-2rem)] w-full max-w-[min(100%,420px)] flex-col overflow-hidden rounded-sm bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`메인 배너 슬라이드 ${slideIndex + 1} 모바일 미리보기`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-lightGray px-4 py-3">
          <p className="m-0 text-bodySmall text-dark">
            슬라이드 {slideIndex + 1} · 모바일 미리보기 ({MAIN_BANNER_MOBILE_WIDTH}px)
          </p>
          <button
            type="button"
            className="rounded-sm border border-lightGray bg-white px-3 py-1.5 text-bodySmall text-dark hover:border-dark"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
        <div className="flex justify-center overflow-auto p-4">
          <div className="overflow-hidden rounded-[6px] border border-lightGray shadow-sm">
            <MainBannerPreviewContent slide={slide} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ImageUploader({ label, spec, aspectClass, previewUrl, fileName, isUploading, onSelect, onClear }) {
  return (
    <div className="w-fit">
      <FieldLabel hint={spec}>{label}</FieldLabel>
      <div className={`mt-2 overflow-hidden rounded-sm border border-lightGray bg-light ${aspectClass}`}>
        {previewUrl ? (
          <img src={previewUrl} alt="" className="size-full object-cover" draggable={false} />
        ) : (
          <div className="flex size-full items-center justify-center text-bodySmall text-subtleText">
            이미지 없음
          </div>
        )}
      </div>
      {fileName ? <p className="m-0 mt-1 text-[11px] text-textDefault">{fileName}</p> : null}
      <div className="mt-2 flex gap-2">
        <label className="flex-1 cursor-pointer rounded-sm border border-dashed border-lightGray bg-light3 px-3 py-3 text-center text-bodySmall text-dark hover:border-dark">
          {isUploading ? '업로드 중…' : '이미지 선택'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="sr-only"
            disabled={isUploading}
            onChange={onSelect}
          />
        </label>
        {previewUrl ? (
          <button
            type="button"
            className="rounded-sm border border-lightGray bg-white px-3 py-2 text-bodySmall text-subtleText"
            onClick={onClear}
          >
            제거
          </button>
        ) : null}
      </div>
    </div>
  )
}

function CollectionMobilePreview({ collection, tags }) {
  const tagLabel = tags.find((tag) => tag.id === collection.tagId)?.label ?? tags[0]?.label ?? ''
  const [productImages, setProductImages] = useState([])

  useEffect(() => {
    let cancelled = false
    const ids = collection.productIds.filter((id) => id != null)
    if (!ids.length) {
      setProductImages([])
      return undefined
    }

    Promise.all(ids.map((id) => fetchProductById(id))).then((products) => {
      if (cancelled) return
      setProductImages(products.filter(Boolean).map((product) => product.image))
    })

    return () => {
      cancelled = true
    }
  }, [collection.productIds])

  return (
    <ScaledMobilePreview
      mobileWidth={PLANNING_COLLECTION_CARD_WIDTH}
      mobileHeight={PLANNING_COLLECTION_PREVIEW_HEIGHT}
      previewWidth={195}
      label="모바일 미리보기"
    >
      <PlanningCollectionMobileSlide
        bannerImage={collection.imageUrl}
        tagLabel={tagLabel}
        title={collection.title}
        productImages={productImages}
      />
    </ScaledMobilePreview>
  )
}

function isEditorialPrimaryCandidate(url) {
  return url.includes(`_${PRODUCT_CARD_CUTS.editorial}_big`)
}

function CurationCopyPanel({ curationProducts, onUpdate }) {
  return (
    <article className="rounded-sm border border-lightGray bg-white p-5">
      <h3 className="m-0 mb-4 text-bodyBold1 text-dark">큐레이션 텍스트</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1 sm:col-span-2">
          <FieldLabel>뱃지</FieldLabel>
          <TextInput
            value={curationProducts.badge}
            onChange={(value) => onUpdate({ badge: value })}
            placeholder="CURATION"
          />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <FieldLabel hint="최대 2줄 (Enter로 줄바꿈)">메인 타이틀</FieldLabel>
          <textarea
            rows={2}
            value={curationProducts.title}
            onChange={(e) => onUpdate({ title: clampCurationTitle(e.target.value) })}
            placeholder={'WINTER ACC\nSTYLING'}
            className="resize-none rounded-sm border border-lightGray bg-white px-3 py-2 text-bodyRegular2 text-dark outline-none focus:border-dark"
          />
        </div>
        <div className="flex flex-col gap-1">
          <FieldLabel>모바일 CTA (Figma 2424:16202)</FieldLabel>
          <TextInput
            value={curationProducts.mobileCtaLabel}
            onChange={(value) => onUpdate({ mobileCtaLabel: value })}
            placeholder="상품 보러 가기"
          />
        </div>
        <div className="flex flex-col gap-1">
          <FieldLabel>PC 링크 라벨 (Figma 2601:23305)</FieldLabel>
          <TextInput
            value={curationProducts.pcLinkLabel}
            onChange={(value) => onUpdate({ pcLinkLabel: value })}
            placeholder="상품 바로가기"
          />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <FieldLabel>링크 URL</FieldLabel>
          <TextInput
            value={curationProducts.linkHref}
            onChange={(value) => onUpdate({ linkHref: value })}
            placeholder="/category/shoes"
          />
        </div>
      </div>
    </article>
  )
}

function CurationSlotsPanel({
  curationProducts,
  slotMetaById,
  activeSlotIndex,
  filledCount,
  missingEditorialCount,
  onSelectSlot,
  onMoveSlot,
  onRemoveSlot,
}) {
  return (
    <article className="rounded-sm border border-lightGray bg-white p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="m-0 text-bodyBold1 text-dark">홈 노출 슬롯</h3>
        <span className="text-bodySmall text-subtleText">
          {filledCount}/{CURATION_PRODUCT_SLOTS}
        </span>
      </div>
      <p className="m-0 mb-4 text-[11px] text-subtleText">
        슬롯을 클릭한 뒤 목록에서 상품을 고르면 해당 칸이 교체됩니다. 07 착장컷 우선 노출.
      </p>

      {missingEditorialCount > 0 ? (
        <p className="m-0 mb-3 rounded-sm border border-primary/30 bg-primary/5 px-3 py-2 text-[11px] text-primary">
          착장컷(07)이 없는 상품 {missingEditorialCount}개 — 누끼컷으로 대체됩니다.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        {curationProducts.productIds.map((productId, slotIndex) => {
          const meta = productId != null ? slotMetaById[productId] : null
          const isActive = activeSlotIndex === slotIndex
          return (
            <div
              key={slotIndex}
              className={`rounded-sm border p-3 transition-colors ${
                isActive ? 'border-dark bg-light3' : 'border-lightGray bg-light3'
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectSlot(slotIndex)}
                  className="m-0 border-0 bg-transparent p-0 text-[11px] font-semibold text-dark"
                >
                  슬롯 {slotIndex + 1}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={slotIndex === 0}
                    onClick={() => onMoveSlot(slotIndex, -1)}
                    className="rounded-sm border border-lightGray bg-white px-1.5 py-0.5 text-[10px] text-subtleText disabled:opacity-30"
                    aria-label={`슬롯 ${slotIndex + 1} 왼쪽으로`}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    disabled={slotIndex >= CURATION_PRODUCT_SLOTS - 1}
                    onClick={() => onMoveSlot(slotIndex, 1)}
                    className="rounded-sm border border-lightGray bg-white px-1.5 py-0.5 text-[10px] text-subtleText disabled:opacity-30"
                    aria-label={`슬롯 ${slotIndex + 1} 오른쪽으로`}
                  >
                    →
                  </button>
                  {productId != null ? (
                    <button
                      type="button"
                      onClick={() => onRemoveSlot(slotIndex)}
                      className="rounded-sm border border-lightGray bg-white px-1.5 py-0.5 text-[10px] text-subtleText hover:border-dark"
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              </div>

              {productId != null && meta ? (
                <>
                  <ProductEditorialThumbnail
                    candidates={meta.candidates}
                    className="mb-2 aspect-[4/5] w-full overflow-hidden rounded-sm border border-lightGray bg-white"
                  />
                  <p className="m-0 line-clamp-2 text-[11px] text-dark">{meta.title}</p>
                  {!meta.usesEditorial ? (
                    <a
                      href={getAdminProductEditPath(productId)}
                      className="mt-1 inline-block text-[10px] text-primary underline"
                    >
                      착장컷 등록하기
                    </a>
                  ) : null}
                </>
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center rounded-sm border border-dashed border-lightGray bg-white text-[11px] text-subtleText">
                  비어 있음
                </div>
              )}
            </div>
          )
        })}
      </div>
    </article>
  )
}

function CurationMobilePreview({ curationProducts, slotMetaById }) {
  const tiles = curationProducts.productIds.map((productId) => {
    if (productId == null) return []
    const meta = slotMetaById[productId]
    return meta?.candidates ?? []
  })

  return (
    <ScaledMobilePreview
      mobileWidth={CURATION_MOBILE_WIDTH}
      mobileHeight={CURATION_MOBILE_HEIGHT}
      previewWidth={195}
    >
      <div className="bg-white px-[15px] pt-10">
        <CurationMobileSlide
          tiles={tiles}
          badge={curationProducts.badge}
          title={curationProducts.title}
          ctaLabel={curationProducts.mobileCtaLabel}
          ctaHref={curationProducts.linkHref || '#'}
        />
      </div>
    </ScaledMobilePreview>
  )
}

function CurationAdminPanel({
  curationProducts,
  onUpdate,
  onCategoryFilterChange,
  onSetProductIds,
  onNotify,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [pickerProducts, setPickerProducts] = useState([])
  const [isPickerLoading, setIsPickerLoading] = useState(false)
  const [pickerError, setPickerError] = useState(null)
  const [activeSlotIndex, setActiveSlotIndex] = useState(null)
  const [slotMetaById, setSlotMetaById] = useState({})

  const selectedIdSet = useMemo(
    () => new Set(curationProducts.productIds.filter((id) => id != null)),
    [curationProducts.productIds],
  )

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(searchQuery), CURATION_SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    let cancelled = false
    setIsPickerLoading(true)
    setPickerError(null)

    searchAdminProductsForPicker({
      query: debouncedQuery,
      category: curationProducts.categoryFilter,
      limit: CURATION_PICKER_LIMIT,
    })
      .then((rows) => {
        if (cancelled) return
        setPickerProducts(rows)
      })
      .catch((err) => {
        if (cancelled) return
        setPickerError(err instanceof Error ? err.message : '상품 목록을 불러오지 못했습니다.')
        setPickerProducts([])
      })
      .finally(() => {
        if (!cancelled) setIsPickerLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedQuery, curationProducts.categoryFilter])

  useEffect(() => {
    let cancelled = false
    const ids = curationProducts.productIds.filter((id) => id != null)
    if (!ids.length) {
      setSlotMetaById({})
      return undefined
    }

    Promise.all(
      ids.map(async (id) => {
        const detail = await fetchProductDetailById(id)
        if (!detail) return null
        const row = { id: detail.numericId, category: detail.folder }
        const candidates = getProductEditorialCutCandidates(row)
        return [
          id,
          {
            title: detail.product.title,
            discount: detail.product.discountRate,
            price: detail.product.price,
            candidates,
            usesEditorial: candidates.some(isEditorialPrimaryCandidate),
          },
        ]
      }),
    ).then((entries) => {
      if (cancelled) return
      const next = {}
      for (const entry of entries) {
        if (entry) next[entry[0]] = entry[1]
      }
      setSlotMetaById(next)
    })

    return () => {
      cancelled = true
    }
  }, [curationProducts.productIds])

  const filledCount = curationProducts.productIds.filter((id) => id != null).length
  const missingEditorialCount = curationProducts.productIds.filter((id) => {
    if (id == null) return false
    const meta = slotMetaById[id]
    return meta && !meta.usesEditorial
  }).length

  const setProductIds = (nextIds) => onSetProductIds(nextIds)

  const addProduct = (productId) => {
    if (selectedIdSet.has(productId)) {
      onNotify('이미 등록된 상품입니다.')
      return
    }

    const nextIds = [...curationProducts.productIds]
    if (activeSlotIndex != null) {
      nextIds[activeSlotIndex] = productId
      setProductIds(nextIds)
      setActiveSlotIndex(null)
      return
    }

    const emptyIndex = nextIds.findIndex((id) => id == null)
    if (emptyIndex < 0) {
      onNotify('슬롯이 가득 찼습니다. 슬롯을 비운 뒤 추가하세요.')
      return
    }
    nextIds[emptyIndex] = productId
    setProductIds(nextIds)
  }

  const removeSlot = (slotIndex) => {
    const nextIds = [...curationProducts.productIds]
    nextIds[slotIndex] = null
    setProductIds(nextIds)
    if (activeSlotIndex === slotIndex) setActiveSlotIndex(null)
  }

  const moveSlot = (slotIndex, direction) => {
    const target = slotIndex + direction
    if (target < 0 || target >= CURATION_PRODUCT_SLOTS) return
    const nextIds = [...curationProducts.productIds]
    ;[nextIds[slotIndex], nextIds[target]] = [nextIds[target], nextIds[slotIndex]]
    setProductIds(nextIds)
    if (activeSlotIndex === slotIndex) setActiveSlotIndex(target)
    else if (activeSlotIndex === target) setActiveSlotIndex(slotIndex)
  }

  const toggleSlotSelection = (slotIndex) => {
    setActiveSlotIndex((prev) => (prev === slotIndex ? null : slotIndex))
  }

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-6">
          <CurationCopyPanel curationProducts={curationProducts} onUpdate={onUpdate} />

          <article className="rounded-sm border border-lightGray bg-white p-5">
            <h3 className="m-0 mb-4 text-bodyBold1 text-dark">상품 선택</h3>
            <div className="mb-4 flex flex-wrap items-end gap-3">
              <div className="flex flex-wrap gap-2">
                {CURATION_CATEGORY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onCategoryFilterChange(option.value)}
                    className={`rounded-sm border px-3 py-2 text-bodySmall transition-colors ${
                      curationProducts.categoryFilter === option.value
                        ? 'border-dark bg-dark text-white'
                        : 'border-lightGray bg-white text-textDefault hover:border-dark'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="상품명 또는 ID 검색"
                className="h-10 min-w-[220px] flex-1 rounded-sm border border-lightGray bg-white px-3 text-bodyRegular2 text-dark outline-none focus:border-dark"
              />
            </div>

            <p className="m-0 mb-3 text-[11px] text-subtleText">
              {debouncedQuery.trim()
                ? `검색 결과 최대 ${CURATION_PICKER_LIMIT}개`
                : `최근 등록 상품 ${CURATION_PICKER_LIMIT}개 · 상품명/ID 검색으로 더 좁힐 수 있습니다`}
            </p>

            {pickerError ? (
              <p className="m-0 text-bodySmall text-primary">{pickerError}</p>
            ) : isPickerLoading ? (
              <p className="m-0 text-bodySmall text-subtleText">상품 목록 불러오는 중…</p>
            ) : (
              <div className="max-h-[520px] overflow-y-auto rounded-sm border border-lightGray">
                {pickerProducts.length === 0 ? (
                  <p className="m-0 p-4 text-bodySmall text-subtleText">조건에 맞는 상품이 없습니다.</p>
                ) : (
                  <ul className="m-0 list-none divide-y divide-lightGray p-0">
                    {pickerProducts.map((product) => {
                      const isSelected = selectedIdSet.has(product.id)
                      const candidates = getProductEditorialCutCandidates(product)
                      return (
                        <li key={product.id} className="flex items-center gap-3 px-4 py-3">
                          <ProductEditorialThumbnail
                            candidates={candidates}
                            className="size-[50px] shrink-0 overflow-hidden rounded-sm border border-lightGray bg-light"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="m-0 truncate text-bodySmall text-dark">{adminProductTitle(product)}</p>
                            <p className="m-0 mt-0.5 text-[11px] text-subtleText">
                              ID {product.id} · {formatAdminDiscountRate(product.discount_rate)} ·{' '}
                              {formatAdminPrice(product.price)}
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={isSelected}
                            onClick={() => addProduct(product.id)}
                            className="shrink-0 rounded-sm border border-lightGray bg-white px-3 py-2 text-bodySmall text-dark transition-colors hover:border-dark disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {isSelected ? '등록됨' : activeSlotIndex != null ? '교체' : '추가'}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )}
          </article>
        </div>

        <CurationSlotsPanel
          curationProducts={curationProducts}
          slotMetaById={slotMetaById}
          activeSlotIndex={activeSlotIndex}
          filledCount={filledCount}
          missingEditorialCount={missingEditorialCount}
          onSelectSlot={toggleSlotSelection}
          onMoveSlot={moveSlot}
          onRemoveSlot={removeSlot}
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <article className="rounded-sm border border-lightGray bg-white p-5">
          <h3 className="m-0 mb-3 text-bodyBold1 text-dark">모바일 미리보기</h3>
          <CurationMobilePreview curationProducts={curationProducts} slotMetaById={slotMetaById} />
        </article>

        <article className="rounded-sm border border-lightGray bg-white p-5">
          <h3 className="m-0 mb-3 text-bodyBold1 text-dark">PC 미리보기</h3>
          <div className="grid grid-cols-4 gap-1">
            {curationProducts.productIds.map((productId, slotIndex) => {
              const meta = productId != null ? slotMetaById[productId] : null
              return (
                <div key={slotIndex} className="min-w-0">
                  <div className="aspect-[4/5] overflow-hidden bg-light">
                    {meta ? (
                      <ProductEditorialThumbnail
                        candidates={meta.candidates}
                        className="size-full"
                        imageClassName="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-[9px] text-subtleText">
                        {slotIndex + 1}
                      </div>
                    )}
                  </div>
                  {meta ? (
                    <p className="m-0 mt-1 truncate text-[9px] text-subtleText">{meta.title}</p>
                  ) : null}
                </div>
              )
            })}
          </div>
        </article>
      </div>
    </div>
  )
}

function StyleBannerCopyPanel({ styleBannerSection, onUpdate }) {
  return (
    <article className="rounded-sm border border-lightGray bg-white p-5">
      <h3 className="m-0 mb-4 text-bodyBold1 text-dark">스타일 배너 텍스트 (PC)</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <FieldLabel>뱃지</FieldLabel>
          <TextInput
            value={styleBannerSection.badge}
            onChange={(value) => onUpdate({ badge: value })}
            placeholder="CORDINATION"
          />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <FieldLabel hint="최대 2줄 (Enter로 줄바꿈)">메인 타이틀</FieldLabel>
          <textarea
            rows={2}
            value={styleBannerSection.title}
            onChange={(e) => onUpdate({ title: clampStyleBannerTitle(e.target.value) })}
            placeholder={"OTZ'S\nSTYLE LOG"}
            className="resize-none rounded-sm border border-lightGray bg-white px-3 py-2 text-bodyRegular2 text-dark outline-none focus:border-dark"
          />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <FieldLabel>본문</FieldLabel>
          <TextInput
            value={styleBannerSection.body}
            onChange={(value) => onUpdate({ body: value })}
            placeholder="스타일링 소개 문구"
            multiline
          />
        </div>
      </div>
    </article>
  )
}

function StyleBannerAdminPanel({
  styleBannerSection,
  onUpdateSection,
  onUpdateCard,
  onUpdateProductId,
  onImageUpload,
  uploadingKey,
}) {
  const resolved = useMemo(() => resolveStyleBannerSection(styleBannerSection), [styleBannerSection])

  return (
    <div className="space-y-6">
      <StyleBannerCopyPanel styleBannerSection={styleBannerSection} onUpdate={onUpdateSection} />

      <div className="grid gap-6 lg:grid-cols-2">
        {styleBannerSection.cards.map((card, cardIndex) => {
          const resolvedCard = resolved.cards[cardIndex]
          const firstProductId = card.productIds.find((id) => id != null)

          return (
            <article key={card.id} className="rounded-sm border border-lightGray bg-white p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="m-0 text-bodyBold1 text-dark">스타일 카드 {cardIndex + 1}</h3>
                {styleBannerSection.cards.length > 1 ? (
                  <button
                    type="button"
                    className="shrink-0 text-bodySmall text-subtleText hover:text-primaryText"
                    onClick={() => onUpdateCard(cardIndex, null, 'remove')}
                  >
                    카드 삭제
                  </button>
                ) : null}
              </div>

              <p className="m-0 mb-4 text-[11px] text-subtleText">
                배너 클릭 시 첫 번째 등록 상품 상세로 이동 · 상품 썸네일은 03 누끼컷 · 카드당 상품 2~4개
              </p>

              <div className="flex flex-wrap items-start gap-6">
                <ImageUploader
                  label="배너 이미지"
                  spec="4:5 권장 · 관리자 직접 등록"
                  aspectClass="aspect-[4/5] w-[200px]"
                  previewUrl={card.imageUrl}
                  fileName={card.imageFileName}
                  isUploading={uploadingKey === `styling-${cardIndex}`}
                  onSelect={(event) =>
                    onImageUpload(event.target.files?.[0], `styling-${cardIndex}`, (url, name) =>
                      onUpdateCard(cardIndex, { imageUrl: url, imageFileName: name }),
                    )
                  }
                  onClear={() => onUpdateCard(cardIndex, { imageUrl: null, imageFileName: null })}
                />

                {resolvedCard ? (
                  <div className="min-w-0 flex-1">
                    <p className="m-0 mb-2 text-bodySmall text-dark">미리보기</p>
                    <div className="relative aspect-[320/400] w-[160px] overflow-hidden rounded-sm border border-lightGray bg-light">
                      <img
                        src={resolvedCard.imageUrl}
                        alt=""
                        className="size-full object-cover"
                        draggable={false}
                      />
                      {resolvedCard.badge ? (
                        <span className="absolute left-0 top-0 bg-black px-2 py-1 text-[9px] text-white">
                          {resolvedCard.badge}
                        </span>
                      ) : null}
                    </div>
                    {firstProductId ? (
                      <p className="m-0 mt-2 text-[11px] text-subtleText">
                        배너 링크: 첫 상품 ID {firstProductId}
                      </p>
                    ) : (
                      <p className="m-0 mt-2 text-[11px] text-primary">상품을 1개 이상 등록하면 배너 링크가 연결됩니다.</p>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <FieldLabel hint="비우면 뱃지 미노출">카드 뱃지 (선택)</FieldLabel>
                  <TextInput
                    value={card.badge ?? ''}
                    onChange={(value) => onUpdateCard(cardIndex, { badge: value.trim() || null })}
                    placeholder="LIMITED EDITION"
                  />
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {Array.from({ length: STYLE_BANNER_PRODUCT_SLOTS }, (_, slotIndex) => (
                    <ProductIdSlot
                      key={slotIndex}
                      slotIndex={slotIndex}
                      productId={card.productIds[slotIndex]}
                      thumbnailMode="square"
                      onChange={(productId) => onUpdateProductId(cardIndex, slotIndex, productId)}
                    />
                  ))}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {styleBannerSection.cards.length < MAX_STYLE_BANNER_CARDS ? (
        <button
          type="button"
          className="rounded-sm border border-lightGray bg-white px-4 py-3 text-bodyRegular2 text-dark hover:border-dark"
          onClick={() => onUpdateCard(null, null, 'add')}
        >
          + 스타일 카드 추가 ({styleBannerSection.cards.length}/{MAX_STYLE_BANNER_CARDS})
        </button>
      ) : null}
    </div>
  )
}

function LookbookCopyPanel({ lookbookSection, onUpdate }) {
  return (
    <article className="rounded-sm border border-lightGray bg-white p-5">
      <h3 className="m-0 mb-4 text-bodyBold1 text-dark">룩북 텍스트</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1 sm:col-span-2">
          <FieldLabel>아카이브 룩북 (기본 이미지 소스)</FieldLabel>
          <select
            value={lookbookSection.archiveLookbookId ?? ''}
            onChange={(event) =>
              onUpdate({
                archiveLookbookId: event.target.value ? event.target.value : null,
              })
            }
            className="h-10 rounded-sm border border-lightGray bg-white px-3 text-bodyRegular2 text-dark outline-none focus:border-dark"
          >
            <option value="">최신 룩북 ({getLatestArchiveLookbookId()})</option>
            {ARCHIVE_LOOKBOOK_ITEMS.map((item, index) => (
              <option key={item.id} value={item.id}>
                {index + 1}. {item.id}
                {item.title ? ` — ${item.title}` : ''}
              </option>
            ))}
          </select>
          <p className="m-0 text-[11px] text-subtleText">
            슬롯에 직접 업로드한 이미지가 없으면 선택한 아카이브 룩북에서 MO 3장 · PC 7장을 불러옵니다.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <FieldLabel>뱃지 (PC)</FieldLabel>
          <TextInput
            value={lookbookSection.badge}
            onChange={(value) => onUpdate({ badge: value })}
            placeholder="ARCHIVE"
          />
        </div>
        <div className="flex flex-col gap-1">
          <FieldLabel>모바일 CTA</FieldLabel>
          <TextInput
            value={lookbookSection.mobileCtaLabel}
            onChange={(value) => onUpdate({ mobileCtaLabel: value })}
            placeholder="아카이브 바로가기"
          />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <FieldLabel hint="최대 2줄 (Enter로 줄바꿈)">메인 타이틀</FieldLabel>
          <textarea
            rows={2}
            value={lookbookSection.title}
            onChange={(e) => onUpdate({ title: clampLookbookTitle(e.target.value) })}
            placeholder={'SPRING IN\nOTZ'}
            className="resize-none rounded-sm border border-lightGray bg-white px-3 py-2 text-bodyRegular2 text-dark outline-none focus:border-dark"
          />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <FieldLabel>본문</FieldLabel>
          <TextInput
            value={lookbookSection.body}
            onChange={(value) => onUpdate({ body: value })}
            placeholder="룩북 소개 문구"
            multiline
          />
        </div>
        {lookbookSection.tags.map((tag, index) => (
          <div key={index} className="flex flex-col gap-1">
            <FieldLabel>태그 {index + 1}</FieldLabel>
            <TextInput
              value={tag}
              onChange={(value) => {
                const nextTags = [...lookbookSection.tags]
                nextTags[index] = value
                onUpdate({ tags: nextTags })
              }}
              placeholder="#OTZ"
            />
          </div>
        ))}
        <div className="flex flex-col gap-1 sm:col-span-2">
          <FieldLabel>링크 URL</FieldLabel>
          <TextInput
            value={lookbookSection.linkHref}
            onChange={(value) => onUpdate({ linkHref: value })}
            placeholder="/archive"
          />
        </div>
      </div>
    </article>
  )
}

function LookbookSlotsPanel({ resolved, lookbookSection }) {
  const archiveId = resolved.archiveLookbookId
  const archiveDefaults = getDefaultLookbookSlotUrls(archiveId)

  return (
    <article className="rounded-sm border border-lightGray bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="m-0 text-bodyBold1 text-dark">홈 노출 이미지</h3>
        <span className="text-bodySmall text-subtleText">MO {LOOKBOOK_MOBILE_VISIBLE_SLOTS} · PC {LOOKBOOK_IMAGE_SLOTS}</span>
      </div>
      <p className="m-0 mb-4 text-[11px] text-subtleText">
        소스: {archiveId} · 커스텀 {lookbookSection.imageSlots.filter((slot) => slot.imageUrl).length}/
        {LOOKBOOK_IMAGE_SLOTS}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {resolved.imageUrls.map((url, slotIndex) => {
          const isCustom = Boolean(lookbookSection.imageSlots[slotIndex]?.imageUrl)
          return (
            <div key={slotIndex} className="rounded-sm border border-lightGray bg-light3 p-2">
              <p className="m-0 mb-2 text-[10px] font-semibold text-dark">{LOOKBOOK_SLOT_LABELS[slotIndex]}</p>
              <div className="aspect-[4/5] overflow-hidden rounded-sm border border-lightGray bg-white">
                <img src={url} alt="" className="size-full object-cover" draggable={false} />
              </div>
              <p className="m-0 mt-1 text-[10px] text-subtleText">
                {isCustom ? '관리자 업로드' : '아카이브 기본'}
                {!isCustom && archiveDefaults[slotIndex] ? '' : ''}
              </p>
            </div>
          )
        })}
      </div>
    </article>
  )
}

function LookbookMobilePreview({ resolved }) {
  const mobileImages = resolved.mobileImageUrls
  const mobileTitle = resolved.titleLines.join(' ') || resolved.title.replace(/\n/g, ' ')

  return (
    <ScaledMobilePreview mobileWidth={390} mobileHeight={LOOKBOOK_MOBILE_PREVIEW_HEIGHT} previewWidth={195}>
      <div className="bg-white px-[15px] pt-10">
        <div className="grid h-[352px] grid-cols-[203px_140px] gap-[2px]">
          <div className="relative h-[352px] w-[203px] overflow-hidden bg-light">
            <img
              src={mobileImages[0]}
              alt=""
              className="absolute inset-0 size-full object-cover"
              draggable={false}
            />
          </div>
          <div className="grid grid-rows-2 gap-[2px]">
            <div className="relative h-[175px] w-[140px] overflow-hidden bg-light">
              <img
                src={mobileImages[1]}
                alt=""
                className="absolute inset-0 size-full object-cover"
                draggable={false}
              />
            </div>
            <div className="relative h-[175px] w-[140px] overflow-hidden bg-light">
              <img
                src={mobileImages[2]}
                alt=""
                className="absolute inset-0 size-full object-cover"
                draggable={false}
              />
            </div>
          </div>
        </div>
        <div className="pt-[10px]">
          <h3 className="text-h4 text-black">{mobileTitle}</h3>
          <p className="pt-1 text-bodySmall text-subtleText">{resolved.body}</p>
        </div>
        <div className="flex gap-[6px] pt-[10px]">
          {resolved.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-[100px] border border-[#e1e1e1] px-3 pb-[6px] pt-[5px] text-[12px] leading-none text-[#777]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </ScaledMobilePreview>
  )
}

function LookbookAdminPanel({ lookbookSection, onUpdate, onUpdateSlot, onImageUpload, uploadingKey }) {
  const resolved = useMemo(() => resolveLookbookSection(lookbookSection), [lookbookSection])
  const archiveDefaults = useMemo(
    () => getDefaultLookbookSlotUrls(resolved.archiveLookbookId),
    [resolved.archiveLookbookId],
  )

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <LookbookCopyPanel lookbookSection={lookbookSection} onUpdate={onUpdate} />
        <LookbookSlotsPanel resolved={resolved} lookbookSection={lookbookSection} />
      </div>

      <article className="rounded-sm border border-lightGray bg-white p-5">
        <h3 className="m-0 mb-4 text-bodyBold1 text-dark">이미지 슬롯 설정</h3>
        <p className="m-0 mb-4 text-[11px] text-subtleText">
          비워 두면 아카이브 룩북 기본 이미지가 사용됩니다. 업로드 시 해당 슬롯만 교체됩니다.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {lookbookSection.imageSlots.map((slot, slotIndex) => (
            <div key={slotIndex} className="rounded-sm border border-lightGray bg-light3 p-4">
              <p className="m-0 mb-3 text-bodySmall font-semibold text-dark">{LOOKBOOK_SLOT_LABELS[slotIndex]}</p>
              <ImageUploader
                label="이미지"
                spec="4:5 권장 · object-cover"
                aspectClass="aspect-[4/5] w-full"
                previewUrl={slot.imageUrl ?? archiveDefaults[slotIndex]}
                fileName={slot.imageFileName}
                isUploading={uploadingKey === `lookbook-${slotIndex}`}
                onSelect={(event) =>
                  onImageUpload(event.target.files?.[0], `lookbook-${slotIndex}`, (url, name) =>
                    onUpdateSlot(slotIndex, { imageUrl: url, imageFileName: name }),
                  )
                }
                onClear={() => onUpdateSlot(slotIndex, { imageUrl: null, imageFileName: null })}
              />
              {slot.imageUrl ? (
                <p className="m-0 mt-2 text-[11px] text-primary">관리자 이미지 적용 중</p>
              ) : (
                <p className="m-0 mt-2 text-[11px] text-subtleText">아카이브 기본 사용 중</p>
              )}
            </div>
          ))}
        </div>
      </article>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <article className="rounded-sm border border-lightGray bg-white p-5">
          <h3 className="m-0 mb-3 text-bodyBold1 text-dark">모바일 미리보기</h3>
          <LookbookMobilePreview resolved={resolved} />
        </article>

        <article className="rounded-sm border border-lightGray bg-white p-5">
          <h3 className="m-0 mb-3 text-bodyBold1 text-dark">PC 미리보기</h3>
          <div className="flex min-w-0 items-stretch justify-end gap-0 overflow-x-auto">
            <div className="relative h-[200px] w-[160px] shrink-0 overflow-hidden bg-light">
              <img
                src={resolved.pcHeroImage}
                alt=""
                className="absolute inset-0 size-full object-cover"
                draggable={false}
              />
            </div>
            <div className="grid shrink-0 grid-cols-3 grid-rows-2">
              {resolved.pcGridImages.map((src, index) => (
                <div key={index} className="relative h-[100px] w-[80px] overflow-hidden bg-light">
                  <img src={src} alt="" className="absolute inset-0 size-full object-cover" draggable={false} />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {resolved.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex rounded-full border border-[#999] px-2 py-1 text-[10px] text-textDefault"
              >
                {tag}
              </span>
            ))}
          </div>
        </article>
      </div>
    </div>
  )
}

function ProductIdSlot({ slotIndex, productId, onChange, thumbnailMode = 'admin' }) {
  const [preview, setPreview] = useState(null)
  const [thumbCandidates, setThumbCandidates] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    if (productId == null || productId === '') {
      setPreview(null)
      setThumbCandidates([])
      setError(null)
      return undefined
    }

    const numericId = Number(productId)
    if (Number.isNaN(numericId)) {
      setPreview(null)
      setThumbCandidates([])
      setError('숫자 상품 ID를 입력하세요.')
      return undefined
    }

    setError(null)
    Promise.all([fetchProductById(numericId), fetchProductRowById(numericId)])
      .then(([product, row]) => {
        if (cancelled) return
        if (!product || !row) {
          setPreview(null)
          setThumbCandidates([])
          setError('상품을 찾을 수 없습니다.')
          return
        }
        setPreview(product)
        setThumbCandidates(getProductThumbnailCandidates(row, thumbnailMode))
        setError(null)
      })
      .catch(() => {
        if (cancelled) return
        setPreview(null)
        setThumbCandidates([])
        setError('상품 조회에 실패했습니다.')
      })

    return () => {
      cancelled = true
    }
  }, [productId, thumbnailMode])

  return (
    <div className="rounded-sm border border-lightGray bg-light3 p-3">
      <FieldLabel>관련 상품 {slotIndex + 1}</FieldLabel>
      <input
        type="number"
        min="1"
        value={productId ?? ''}
        onChange={(event) => {
          const raw = event.target.value
          onChange(raw === '' ? null : Number(raw))
        }}
        placeholder="상품 ID"
        className="mt-1 h-10 w-full rounded-sm border border-lightGray bg-white px-3 py-2 text-bodyRegular2 text-dark outline-none focus:border-dark"
      />
      {error ? <p className="m-0 mt-1 text-[11px] text-primary">{error}</p> : null}
      {preview ? (
        <div className="mt-2 flex items-center gap-3">
          <ProductEditorialThumbnail
            candidates={thumbCandidates}
            className="aspect-square w-14 shrink-0 overflow-hidden rounded-sm bg-white"
          />
          <div className="min-w-0">
            <p className="m-0 truncate text-bodySmall text-dark">{preview.title}</p>
            <p className="m-0 mt-0.5 text-[11px] text-subtleText">
              {preview.discountRate ? `${preview.discountRate} · ` : ''}
              {preview.price}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ConfirmDialog({ title, message, confirmLabel = '삭제', cancelLabel = '취소', onConfirm, onCancel }) {
  useLockBodyScroll(true)

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="w-full max-w-[360px] rounded-sm bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <p id="confirm-dialog-title" className="m-0 text-bodyBold1 text-dark">
          {title}
        </p>
        <p id="confirm-dialog-message" className="m-0 mt-2 text-bodyRegular2 text-textDefault">
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-sm border border-lightGray bg-white px-4 py-2 text-bodySmall text-dark hover:border-dark"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="rounded-sm border border-dark bg-dark px-4 py-2 text-bodySmall text-white hover:opacity-90"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export function HomeMainManagement() {
  const { saveConfig } = useHomeMainConfigContext()
  const [config, setConfig] = useState(createDefaultHomeMainConfig)
  const [activeTab, setActiveTab] = useState('main')
  const [uploadingKey, setUploadingKey] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [mainBannerPreviewIndex, setMainBannerPreviewIndex] = useState(null)
  const [quickSlotDeleteIndex, setQuickSlotDeleteIndex] = useState(null)
  useEffect(() => {
    setConfig(loadAdminHomeMainConfig())
  }, [])

  useEffect(() => {
    if (activeTab !== 'main') setMainBannerPreviewIndex(null)
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== 'quick') setQuickSlotDeleteIndex(null)
  }, [activeTab])

  const showMessage = (text) => {
    setMessage(text)
    window.setTimeout(() => setMessage(null), 2800)
  }

  const handleImageUpload = async (file, folder, onDone) => {
    if (!file) return
    setUploadingKey(folder)
    try {
      const result = await uploadAdminBannerImage(file, folder)
      onDone(result.url, result.fileName)
      showMessage(
        result.usedLocalFallback
          ? '스토리지 업로드 실패 — 로컬 미리보기로 저장됩니다.'
          : '이미지가 업로드되었습니다.',
      )
    } catch (error) {
      console.error('스토리지 에러 상세:', error)
      const detail = error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.'
      showMessage(detail)
    } finally {
      setUploadingKey(null)
    }
  }

  const handleSave = () => {
    const validationError = validateHomeMainActiveTab(activeTab, config)
    if (validationError) {
      showMessage(validationError)
      return
    }

    setIsSaving(true)
    try {
      const saved = saveConfig({
        mainBanners: config.mainBanners,
        quickMenuSlots: config.quickMenuSlots,
        brandBanner: config.brandBanner,
        seriesBanners: config.seriesBanners,
        planningBanners: config.planningBanners,
        planningCollectionTags: config.planningCollectionTags,
        planningCollections: config.planningCollections,
        curationProducts: config.curationProducts,
        styleBannerSection: config.styleBannerSection,
        lookbookSection: config.lookbookSection,
        marketingPopupSlides: config.marketingPopupSlides,
      })
      setConfig(saved)
      const sectionLabel = SECTION_SAVE_LABELS[activeTab] ?? '홈메인'
      showMessage(`${sectionLabel} 설정이 저장되었습니다. 홈 화면에 반영됩니다.`)
    } catch {
      showMessage('저장에 실패했습니다. 이미지 용량이 크면 다시 시도해 주세요.')
    } finally {
      setIsSaving(false)
    }
  }

  const updateMainBanner = (index, patch) =>
    setConfig((prev) => ({
      ...prev,
      mainBanners: prev.mainBanners.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }))

  const addMainBanner = () =>
    setConfig((prev) => ({
      ...prev,
      mainBanners: [
        ...prev.mainBanners,
        {
          id: `main-${Date.now()}`,
          imageUrl: null,
          imageFileName: null,
          title: '',
          subtitle: '',
          ctaLabel: '쇼핑 바로가기',
          ctaHref: '',
        },
      ],
    }))

  const removeMainBanner = (index) => {
    setMainBannerPreviewIndex((prev) => {
      if (prev === null) return null
      if (prev === index) return null
      if (prev > index) return prev - 1
      return prev
    })
    setConfig((prev) => ({
      ...prev,
      mainBanners: prev.mainBanners.filter((_, i) => i !== index),
    }))
  }

  const updateQuickSlot = (index, patch) =>
    setConfig((prev) => ({
      ...prev,
      quickMenuSlots: prev.quickMenuSlots.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }))

  const addQuickSlot = () =>
    setConfig((prev) => ({
      ...prev,
      quickMenuSlots: [...prev.quickMenuSlots, createEmptyQuickMenuSlot()],
    }))

  const removeQuickSlot = (index) => {
    setConfig((prev) => ({
      ...prev,
      quickMenuSlots: prev.quickMenuSlots.filter((_, i) => i !== index),
    }))
    setQuickSlotDeleteIndex(null)
  }

  const updateSeries = (index, patch) =>
    setConfig((prev) => ({
      ...prev,
      seriesBanners: prev.seriesBanners.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }))

  const updatePlanning = (index, patch) =>
    setConfig((prev) => ({
      ...prev,
      planningBanners: prev.planningBanners.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }))

  const addPlanningBanner = () =>
    setConfig((prev) => {
      if (prev.planningBanners.length >= MAX_PLANNING_BANNERS) return prev
      return {
        ...prev,
        planningBanners: [...prev.planningBanners, createEmptyPlanningBanner()],
      }
    })

  const removePlanningBanner = (index) => {
    setConfig((prev) => {
      if (prev.planningBanners.length <= 1) return prev
      return {
        ...prev,
        planningBanners: prev.planningBanners.filter((_, i) => i !== index),
      }
    })
  }

  const updateMarketingPopup = (index, patch) =>
    setConfig((prev) => ({
      ...prev,
      marketingPopupSlides: prev.marketingPopupSlides.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    }))

  const addMarketingPopupSlide = () =>
    setConfig((prev) => {
      if (prev.marketingPopupSlides.length >= MAX_MARKETING_POPUP_SLIDES) return prev
      return {
        ...prev,
        marketingPopupSlides: [...prev.marketingPopupSlides, createEmptyMarketingPopupSlide()],
      }
    })

  const removeMarketingPopupSlide = (index) => {
    setConfig((prev) => {
      if (prev.marketingPopupSlides.length <= 1) return prev
      return {
        ...prev,
        marketingPopupSlides: prev.marketingPopupSlides.filter((_, i) => i !== index),
      }
    })
  }

  const updateCollectionTag = (index, label) =>
    setConfig((prev) => ({
      ...prev,
      planningCollectionTags: prev.planningCollectionTags.map((tag, i) =>
        i === index ? { ...tag, label } : tag,
      ),
    }))

  const updateCollection = (index, patch) =>
    setConfig((prev) => ({
      ...prev,
      planningCollections: prev.planningCollections.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    }))

  const updateCollectionProductId = (collectionIndex, slotIndex, productId) =>
    setConfig((prev) => ({
      ...prev,
      planningCollections: prev.planningCollections.map((item, i) => {
        if (i !== collectionIndex) return item
        const nextIds = [...item.productIds]
        nextIds[slotIndex] = productId
        return { ...item, productIds: nextIds }
      }),
    }))

  const addPlanningCollection = () =>
    setConfig((prev) => {
      if (prev.planningCollections.length >= MAX_PLANNING_COLLECTIONS) return prev
      return {
        ...prev,
        planningCollections: [...prev.planningCollections, createEmptyPlanningCollection()],
      }
    })

  const removePlanningCollection = (index) => {
    setConfig((prev) => {
      if (prev.planningCollections.length <= 1) return prev
      return {
        ...prev,
        planningCollections: prev.planningCollections.filter((_, i) => i !== index),
      }
    })
  }

  const updateCurationProducts = (patch) =>
    setConfig((prev) => ({
      ...prev,
      curationProducts: { ...prev.curationProducts, ...patch },
    }))

  const setCurationProductIds = (productIds) => updateCurationProducts({ productIds })

  const updateStyleBannerSection = (patch) =>
    setConfig((prev) => ({
      ...prev,
      styleBannerSection: { ...prev.styleBannerSection, ...patch },
    }))

  const updateStyleBannerCard = (cardIndex, patch, action) => {
    if (action === 'add') {
      setConfig((prev) => {
        if (prev.styleBannerSection.cards.length >= MAX_STYLE_BANNER_CARDS) return prev
        return {
          ...prev,
          styleBannerSection: {
            ...prev.styleBannerSection,
            cards: [...prev.styleBannerSection.cards, createEmptyStyleBannerCard()],
          },
        }
      })
      return
    }
    if (action === 'remove') {
      setConfig((prev) => {
        if (prev.styleBannerSection.cards.length <= 1) return prev
        return {
          ...prev,
          styleBannerSection: {
            ...prev.styleBannerSection,
            cards: prev.styleBannerSection.cards.filter((_, index) => index !== cardIndex),
          },
        }
      })
      return
    }
    setConfig((prev) => ({
      ...prev,
      styleBannerSection: {
        ...prev.styleBannerSection,
        cards: prev.styleBannerSection.cards.map((card, index) =>
          index === cardIndex ? { ...card, ...patch } : card,
        ),
      },
    }))
  }

  const updateStyleBannerProductId = (cardIndex, slotIndex, productId) =>
    setConfig((prev) => ({
      ...prev,
      styleBannerSection: {
        ...prev.styleBannerSection,
        cards: prev.styleBannerSection.cards.map((card, index) => {
          if (index !== cardIndex) return card
          const nextIds = [...card.productIds]
          nextIds[slotIndex] = productId
          return { ...card, productIds: nextIds }
        }),
      },
    }))

  const updateLookbookSection = (patch) =>
    setConfig((prev) => ({
      ...prev,
      lookbookSection: { ...prev.lookbookSection, ...patch },
    }))

  const updateLookbookSlot = (slotIndex, patch) =>
    setConfig((prev) => ({
      ...prev,
      lookbookSection: {
        ...prev.lookbookSection,
        imageSlots: prev.lookbookSection.imageSlots.map((slot, index) =>
          index === slotIndex ? { ...slot, ...patch } : slot,
        ),
      },
    }))

  const quickSlotTypeLabel = (slotType) => {
    if (slotType === 'text') return '텍스트형'
    if (slotType === 'cutout') return '누끼컷'
    if (slotType === 'mixed') return '혼합형'
    return '이미지형'
  }

  // ── 브랜드/시리즈 배너 미리보기 (345×431 → 195×244, Figma 102:3477)
  const BrandMobilePreview = ({ imageUrl, body }) => (
    <ScaledMobilePreview
      mobileWidth={BRAND_INTRO_MOBILE_WIDTH}
      mobileHeight={BRAND_INTRO_MOBILE_HEIGHT}
      previewWidth={195}
      label="모바일 미리보기"
    >
      <BrandIntroMobileSlide
        imageUrl={imageUrl}
        body={body}
        showIndicator
        indicatorCount={5}
        activeIndicatorIndex={0}
      />
    </ScaledMobilePreview>
  )

  const SeriesMobilePreview = ({ series, seriesIndex }) => (
    <ScaledMobilePreview
      mobileWidth={BRAND_INTRO_MOBILE_WIDTH}
      mobileHeight={BRAND_INTRO_MOBILE_HEIGHT}
      previewWidth={195}
      label="모바일 미리보기"
    >
      <BrandSeriesMobileSlide
        imageUrl={series.imageUrl}
        title={series.title}
        body={series.body}
        ctaLabel={series.ctaLabel}
        showIndicator
        indicatorCount={5}
        activeIndicatorIndex={seriesIndex + 1}
      />
    </ScaledMobilePreview>
  )

  const PlanningMobilePreview = ({ banner, bannerIndex, totalCount }) => (
    <ScaledMobilePreview
      mobileWidth={PLANNING_BANNER_MOBILE_WIDTH}
      mobileHeight={PLANNING_BANNER_MOBILE_HEIGHT}
      previewWidth={195}
      label="모바일 미리보기"
    >
      <PlanningBannerMobileSlide
        imageUrl={banner.imageUrl}
        badge={banner.badge}
        title={banner.title}
        subtitle={banner.subtitle}
        showIndicator={totalCount >= 2}
        indicatorCount={totalCount}
        activeIndicatorIndex={bannerIndex}
      />
    </ScaledMobilePreview>
  )

  return (
    <div className="relative px-8 py-8">
      {message ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-sm border border-dark bg-dark px-4 py-3 text-bodySmall text-white shadow-lg">
          {message}
        </div>
      ) : null}

      <header className="mb-6 border-b border-lightGray pb-6">
        <h2 className="m-0 text-h3 text-dark">홈메인관리</h2>
        <p className="m-0 mt-2 text-bodyRegular2 text-textDefault">
          홈 화면 10개 섹션(메인·퀵메뉴·브랜드·시리즈·기획전·컬렉션·큐레이션·스타일배너·룩북·마케팅팝업)을 관리합니다.
        </p>
      </header>

      <nav className="mb-6 flex flex-wrap gap-2">
        {SECTION_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-sm border px-4 py-2 text-bodySmall transition-colors ${
              activeTab === tab.id
                ? 'border-dark bg-dark text-white'
                : 'border-lightGray bg-white text-textDefault hover:border-dark'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ── 1. 메인 배너 ───────────────────────────── */}
      {activeTab === 'main' ? (
        <section className="space-y-6">
          <SpecNote>
            제작 이미지 864×1080 또는 1200×1500 (비율 4:5) · jpg/png/gif · 모바일/PC 공통 사용 (좌우
            크롭 주의, 핵심 요소는 중앙 배치) · 라운드/테두리는 CSS 처리
          </SpecNote>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {config.mainBanners.map((slide, index) => (
              <article key={slide.id} className="rounded-sm border border-lightGray bg-white p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="m-0 text-bodyBold1 text-dark">메인 배너 슬라이드 {index + 1}</h3>
                  {config.mainBanners.length > 1 ? (
                    <button
                      type="button"
                      className="shrink-0 text-bodySmall text-subtleText hover:text-primaryText"
                      onClick={() => removeMainBanner(index)}
                    >
                      슬라이드 삭제
                    </button>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <ImageUploader
                    label="배너 이미지"
                    spec="4:5 비율 · PC 전체 노출 / 모바일 좌우 크롭"
                    aspectClass="aspect-[4/5] max-w-[260px]"
                    previewUrl={slide.imageUrl}
                    fileName={slide.imageFileName}
                    isUploading={uploadingKey === `main-${index}`}
                    onSelect={(e) =>
                      handleImageUpload(e.target.files?.[0], `main-${index}`, (url, name) =>
                        updateMainBanner(index, { imageUrl: url, imageFileName: name }),
                      )
                    }
                    onClear={() => updateMainBanner(index, { imageUrl: null, imageFileName: null })}
                  />
                  <button
                    type="button"
                    className="w-full rounded-sm border border-lightGray bg-white px-4 py-2.5 text-bodySmall text-dark hover:border-dark sm:w-fit"
                    onClick={() => setMainBannerPreviewIndex(index)}
                  >
                    모바일 미리보기
                  </button>
                </div>

                <div className="mt-5 grid gap-x-4 gap-y-3">
                  <div className="flex flex-col gap-1">
                    <FieldLabel>메인 타이틀</FieldLabel>
                    <TextInput
                      value={slide.title}
                      onChange={(v) => updateMainBanner(index, { title: v })}
                      placeholder="OTZ x LOFA Seoul"
                      multiline
                      rows={2}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <FieldLabel>CTA 버튼 문구</FieldLabel>
                    <TextInput
                      value={slide.ctaLabel}
                      onChange={(v) => updateMainBanner(index, { ctaLabel: v })}
                      placeholder="쇼핑 바로가기"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <FieldLabel>서브 카피</FieldLabel>
                    <TextInput
                      value={slide.subtitle}
                      onChange={(v) => updateMainBanner(index, { subtitle: v })}
                      placeholder="감각적인 라이프스타일…"
                      multiline
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <FieldLabel>CTA 링크</FieldLabel>
                    <TextInput
                      value={slide.ctaHref}
                      onChange={(v) => updateMainBanner(index, { ctaHref: v })}
                      placeholder="/new"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            className="rounded-sm border border-lightGray bg-white px-4 py-3 text-bodyRegular2 text-dark hover:border-dark"
            onClick={addMainBanner}
          >
            + 메인 배너 슬라이드 추가
          </button>

          {mainBannerPreviewIndex !== null && config.mainBanners[mainBannerPreviewIndex] ? (
            <MainBannerPreviewModal
              slide={config.mainBanners[mainBannerPreviewIndex]}
              slideIndex={mainBannerPreviewIndex}
              onClose={() => setMainBannerPreviewIndex(null)}
            />
          ) : null}
        </section>
      ) : null}

      {/* ── 2. 퀵메뉴 ─────────────────────────────── */}
      {activeTab === 'quick' ? (
        <section className="space-y-4">
          <SpecNote>
            제작 이미지 160×100 · jpg/png/gif · 슬롯 추가/삭제 가능 · 라운드/테두리 CSS 처리 · 텍스트형 /
            이미지형 / 누끼컷 / 혼합형(배경 이미지 + 타일 내 텍스트 + 하단 텍스트)
          </SpecNote>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {config.quickMenuSlots.map((slot, index) => (
              <article key={slot.id} className="relative rounded-sm border border-lightGray bg-white p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <p className="m-0 text-bodyBold2 text-dark">
                    슬롯 {index + 1}
                    <span className="ml-2 text-bodySmall font-normal text-subtleText">
                      {quickSlotTypeLabel(slot.slotType)}
                    </span>
                  </p>
                  <button
                    type="button"
                    aria-label={`슬롯 ${index + 1} 삭제`}
                    className="flex size-7 shrink-0 items-center justify-center rounded-sm border border-lightGray bg-white text-[18px] leading-none text-subtleText hover:border-dark hover:text-dark"
                    onClick={() => setQuickSlotDeleteIndex(index)}
                  >
                    ×
                  </button>
                </div>

                <div className="mb-3 flex justify-center">
                  <QuickMenuSlotPreview
                    key={`${slot.id}-${slot.slotType}-${slot.imageUrl ?? 'default'}`}
                    slot={slot}
                    slotIndex={index}
                  />
                </div>
                <div className="space-y-2">
                  <select
                    value={slot.slotType}
                    onChange={(e) => updateQuickSlot(index, { slotType: e.target.value })}
                    className="h-9 w-full rounded-sm border border-lightGray px-2 text-bodySmall"
                  >
                    <option value="image">이미지형</option>
                    <option value="text">텍스트형</option>
                    <option value="cutout">누끼컷</option>
                    <option value="mixed">혼합형</option>
                  </select>
                  {slot.slotType === 'mixed' ? (
                    <>
                      <FieldLabel hint="Enter 키로 줄바꿈 · 타일 안에 표시됩니다.">
                        타일 내 텍스트
                      </FieldLabel>
                      <TextInput
                        value={slot.label}
                        onChange={(v) => updateQuickSlot(index, { label: v })}
                        placeholder={'Best\nSellers'}
                        multiline
                      />
                      <FieldLabel hint="타일 아래 13px 캡션 · 홈 퀵메뉴에 그대로 반영됩니다.">
                        하단 텍스트
                      </FieldLabel>
                      <TextInput
                        value={slot.captionLabel}
                        onChange={(v) => updateQuickSlot(index, { captionLabel: v })}
                        placeholder="BEST"
                      />
                    </>
                  ) : (
                    <>
                      <FieldLabel hint="Enter 키로 줄바꿈 · 홈 퀵메뉴에 그대로 반영됩니다.">
                        {slot.slotType === 'image' || slot.slotType === 'cutout' ? '하단 텍스트' : '텍스트'}
                      </FieldLabel>
                      <TextInput
                        value={slot.label}
                        onChange={(v) => updateQuickSlot(index, { label: v })}
                        placeholder={
                          slot.slotType === 'image' || slot.slotType === 'cutout'
                            ? '봄 Edition'
                            : '라벨\n줄바꿈 가능'
                        }
                        multiline
                      />
                    </>
                  )}
                  <TextInput
                    value={slot.href}
                    onChange={(v) => updateQuickSlot(index, { href: v })}
                    placeholder="링크 (/best)"
                  />
                  {slot.slotType !== 'image' ? (
                    <>
                      <TextInput
                        value={slot.bgColor}
                        onChange={(v) => updateQuickSlot(index, { bgColor: v })}
                        placeholder={
                          slot.slotType === 'mixed'
                            ? '배경색 (이미지 없을 때) #F1F1F1'
                            : '배경색 #F1F1F1'
                        }
                      />
                      {slot.slotType === 'text' || slot.slotType === 'mixed' ? (
                        <TextInput
                          value={slot.textColor}
                          onChange={(v) => updateQuickSlot(index, { textColor: v })}
                          placeholder="텍스트색 #FFFFFF"
                        />
                      ) : null}
                    </>
                  ) : null}
                  {slot.slotType !== 'text' ? (
                    <label className="block cursor-pointer rounded-sm border border-dashed border-lightGray bg-light3 px-2 py-2 text-center text-[11px] text-dark">
                      {uploadingKey === `quick-${index}` ? '업로드 중…' : '이미지 업로드'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        className="sr-only"
                        onChange={(e) =>
                          handleImageUpload(e.target.files?.[0], `quick-${index}`, (url, name) =>
                            updateQuickSlot(index, { imageUrl: url, imageFileName: name }),
                          )
                        }
                      />
                    </label>
                  ) : null}
                </div>
              </article>
            ))}
            <button
              type="button"
              className="flex min-h-[240px] flex-col items-center justify-center rounded-sm border border-dashed border-lightGray bg-light3 p-4 text-bodyRegular2 text-subtleText transition-colors hover:border-dark hover:text-dark"
              onClick={addQuickSlot}
            >
              + 슬롯 추가
            </button>
          </div>

          {quickSlotDeleteIndex !== null && config.quickMenuSlots[quickSlotDeleteIndex] ? (
            <ConfirmDialog
              title="슬롯 삭제"
              message={`슬롯 ${quickSlotDeleteIndex + 1}을(를) 삭제하시겠습니까?`}
              onCancel={() => setQuickSlotDeleteIndex(null)}
              onConfirm={() => removeQuickSlot(quickSlotDeleteIndex)}
            />
          ) : null}
        </section>
      ) : null}

      {/* ── 3. 브랜드 배너 ────────────────────────── */}
      {activeTab === 'brand' ? (
        <section className="space-y-4">
          <SpecNote>
            제작 이미지 690×862 또는 1200×1500 (4:5) · jpg/png · 브랜드 로고/카피는 이미지 중앙 배치 ·
            Dimmed 원형 효과는 CSS 처리
          </SpecNote>

          <article className="rounded-sm border border-lightGray bg-white p-6">
            <div className="flex flex-wrap gap-8">
              <div className="w-fit shrink-0">
                <ImageUploader
                  label="브랜드 배너 이미지"
                  spec="4:5 · 로고/카피 중앙 배치"
                  aspectClass="aspect-[4/5] max-w-[260px]"
                  previewUrl={config.brandBanner.imageUrl}
                  fileName={config.brandBanner.imageFileName}
                  isUploading={uploadingKey === 'brand'}
                  onSelect={(e) =>
                    handleImageUpload(e.target.files?.[0], 'brand', (url, name) =>
                      setConfig((prev) => ({
                        ...prev,
                        brandBanner: { ...prev.brandBanner, imageUrl: url, imageFileName: name },
                      })),
                    )
                  }
                  onClear={() =>
                    setConfig((prev) => ({
                      ...prev,
                      brandBanner: { ...prev.brandBanner, imageUrl: null, imageFileName: null },
                    }))
                  }
                />
              </div>

              <BrandMobilePreview
                imageUrl={config.brandBanner.imageUrl}
                body={config.brandBanner.body}
              />
            </div>

            <div className="mt-5 flex flex-col gap-1">
              <FieldLabel hint="줄바꿈은 Enter로 입력">브랜드 카피</FieldLabel>
              <TextInput
                value={config.brandBanner.body}
                onChange={(v) =>
                  setConfig((prev) => ({ ...prev, brandBanner: { ...prev.brandBanner, body: v } }))
                }
                multiline
              />
            </div>
          </article>
        </section>
      ) : null}

      {/* ── 4. 시리즈 배너 ────────────────────────── */}
      {activeTab === 'series' ? (
        <section className="space-y-4">
          <SpecNote>
            제작 이미지 690×862 또는 1200×1500 (4:5) · jpg/png · Dimmed/텍스트/버튼 영역은 CSS 처리 ·
            브랜드 배너 다음 4개 시리즈
          </SpecNote>

          <div className="grid gap-6 lg:grid-cols-2">
            {config.seriesBanners.map((series, index) => (
              <article key={series.id} className="rounded-sm border border-lightGray bg-white p-5">
                <h3 className="m-0 mb-4 text-bodyBold1 text-dark">시리즈 {index + 1}</h3>

                <div className="flex flex-nowrap items-start justify-start gap-6">
                  <div className="w-fit shrink-0">
                    <ImageUploader
                      label="시리즈 이미지"
                      spec="4:5"
                      aspectClass="aspect-[4/5] w-[200px]"
                      previewUrl={series.imageUrl}
                      fileName={series.imageFileName}
                      isUploading={uploadingKey === `series-${index}`}
                      onSelect={(e) =>
                        handleImageUpload(e.target.files?.[0], `series-${index}`, (url, name) =>
                          updateSeries(index, { imageUrl: url, imageFileName: name }),
                        )
                      }
                      onClear={() => updateSeries(index, { imageUrl: null, imageFileName: null })}
                    />
                  </div>

                  <SeriesMobilePreview series={series} seriesIndex={index} />
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <TextInput
                    value={series.title}
                    onChange={(v) => updateSeries(index, { title: v })}
                    placeholder="시리즈명 (LOMITA)"
                  />
                  <TextInput
                    value={series.body}
                    onChange={(v) => updateSeries(index, { body: v })}
                    placeholder="설명 카피"
                    multiline
                  />
                  <TextInput
                    value={series.ctaLabel}
                    onChange={(v) => updateSeries(index, { ctaLabel: v })}
                    placeholder="상품 보러 가기"
                  />
                  <TextInput
                    value={series.ctaHref}
                    onChange={(v) => updateSeries(index, { ctaHref: v })}
                    placeholder="링크 URL"
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── 5. 기획전 배너 ────────────────────────── */}
      {activeTab === 'planning' ? (
        <section className="space-y-4">
          <SpecNote>
            제작 이미지 690×862 또는 1200×1500 (비율 4:5) · jpg/png · 모바일/PC 공통 사용 · Dimmed
            영역은 CSS 처리 · 최소 1개, 최대 5개 등록 · 배너 2개 이상일 때만 인디케이터 노출
          </SpecNote>

          <div className="grid gap-6 lg:grid-cols-2">
            {config.planningBanners.map((banner, index) => (
              <article key={banner.id} className="rounded-sm border border-lightGray bg-white p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="m-0 text-bodyBold1 text-dark">기획전 배너 {index + 1}</h3>
                  {config.planningBanners.length > 1 ? (
                    <button
                      type="button"
                      className="shrink-0 text-bodySmall text-subtleText hover:text-primaryText"
                      onClick={() => removePlanningBanner(index)}
                    >
                      배너 삭제
                    </button>
                  ) : null}
                </div>

                <div className="flex flex-nowrap items-start justify-start gap-6">
                  <div className="w-fit shrink-0">
                    <ImageUploader
                      label="기획전 이미지"
                      spec="4:5"
                      aspectClass="aspect-[4/5] w-[200px]"
                      previewUrl={banner.imageUrl}
                      fileName={banner.imageFileName}
                      isUploading={uploadingKey === `planning-${index}`}
                      onSelect={(e) =>
                        handleImageUpload(e.target.files?.[0], `planning-${index}`, (url, name) =>
                          updatePlanning(index, { imageUrl: url, imageFileName: name }),
                        )
                      }
                      onClear={() => updatePlanning(index, { imageUrl: null, imageFileName: null })}
                    />
                  </div>

                  <PlanningMobilePreview
                    banner={banner}
                    bannerIndex={index}
                    totalCount={config.planningBanners.length}
                  />
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <FieldLabel>라벨 (뱃지)</FieldLabel>
                    <TextInput
                      value={banner.badge}
                      onChange={(v) => updatePlanning(index, { badge: v })}
                      placeholder="26SS"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <FieldLabel>메인 타이틀</FieldLabel>
                    <TextInput
                      value={banner.title}
                      onChange={(v) => updatePlanning(index, { title: v })}
                      placeholder="코지 발레코어 슈즈"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <FieldLabel>서브 카피</FieldLabel>
                    <TextInput
                      value={banner.subtitle}
                      onChange={(v) => updatePlanning(index, { subtitle: v })}
                      placeholder="오찌x 론론 핑크와 그레이의 세련된 조합"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {config.planningBanners.length < MAX_PLANNING_BANNERS ? (
            <button
              type="button"
              className="rounded-sm border border-lightGray bg-white px-4 py-3 text-bodyRegular2 text-dark hover:border-dark"
              onClick={addPlanningBanner}
            >
              + 기획전 배너 추가 ({config.planningBanners.length}/{MAX_PLANNING_BANNERS})
            </button>
          ) : null}
        </section>
      ) : null}

      {/* ── 6. 기획전 컬렉션 ──────────────────────── */}
      {activeTab === 'collection' ? (
        <section className="space-y-4">
          <SpecNote>
            제작 이미지 640×800 또는 1280×1600 (비율 4:5) · jpg/png · 모바일/PC 공통 · 메인 타이틀 최대 2줄 ·
            배너당 관련 상품 1~4개 등록 · 썸네일은 4열 기준 고정 크기(개수가 줄어도 타일이 커지지 않음) · 태그 4종
            라벨 편집 가능
          </SpecNote>

          <article className="rounded-sm border border-lightGray bg-white p-5">
            <h3 className="m-0 mb-4 text-bodyBold1 text-dark">컬렉션 태그 (4종)</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {config.planningCollectionTags.map((tag, index) => (
                <div key={tag.id} className="flex flex-col gap-1">
                  <FieldLabel>태그 {index + 1}</FieldLabel>
                  <TextInput
                    value={tag.label}
                    onChange={(value) => updateCollectionTag(index, value)}
                    placeholder="COLLECTION"
                  />
                </div>
              ))}
            </div>
          </article>

          <div className="grid gap-6 lg:grid-cols-2">
            {config.planningCollections.map((collection, index) => {
              const selectedTagLabel =
                config.planningCollectionTags.find((tag) => tag.id === collection.tagId)?.label ??
                config.planningCollectionTags[0]?.label ??
                ''

              return (
                <article key={collection.id} className="rounded-sm border border-lightGray bg-white p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="m-0 text-bodyBold1 text-dark">기획전 컬렉션 {index + 1}</h3>
                    {config.planningCollections.length > 1 ? (
                      <button
                        type="button"
                        className="shrink-0 text-bodySmall text-subtleText hover:text-primaryText"
                        onClick={() => removePlanningCollection(index)}
                      >
                        컬렉션 삭제
                      </button>
                    ) : null}
                  </div>

                  <div className="flex flex-nowrap items-start justify-start gap-6">
                    <div className="w-fit shrink-0">
                      <ImageUploader
                        label="컬렉션 배너"
                        spec="4:5"
                        aspectClass="aspect-[4/5] w-[200px]"
                        previewUrl={collection.imageUrl}
                        fileName={collection.imageFileName}
                        isUploading={uploadingKey === `collection-${index}`}
                        onSelect={(e) =>
                          handleImageUpload(e.target.files?.[0], `collection-${index}`, (url, name) =>
                            updateCollection(index, { imageUrl: url, imageFileName: name }),
                          )
                        }
                        onClear={() => updateCollection(index, { imageUrl: null, imageFileName: null })}
                      />
                    </div>

                    <CollectionMobilePreview collection={collection} tags={config.planningCollectionTags} />
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                      <FieldLabel hint="배너 상단에 표시 · 1개만 선택">태그</FieldLabel>
                      <div className="flex flex-wrap gap-2">
                        {config.planningCollectionTags.map((tag) => {
                          const checked = collection.tagId === tag.id
                          return (
                            <label
                              key={tag.id}
                              className={`inline-flex cursor-pointer items-center gap-2 rounded-sm border px-3 py-2 text-bodySmall ${
                                checked
                                  ? 'border-dark bg-dark text-white'
                                  : 'border-lightGray bg-white text-textDefault hover:border-dark'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={checked}
                                onChange={() => updateCollection(index, { tagId: tag.id })}
                              />
                              {tag.label.trim() || `태그`}
                            </label>
                          )
                        })}
                      </div>
                      {selectedTagLabel ? (
                        <p className="m-0 text-[11px] text-subtleText">선택: {selectedTagLabel}</p>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-1">
                      <FieldLabel hint="최대 2줄 (Enter로 줄바꿈)">메인 타이틀</FieldLabel>
                      <textarea
                        rows={2}
                        value={collection.title}
                        onChange={(e) =>
                          updateCollection(index, { title: clampPlanningCollectionTitle(e.target.value) })
                        }
                        placeholder={'OTZ×UMU\nLove Winter Day'}
                        className="resize-none rounded-sm border border-lightGray bg-white px-3 py-2 text-bodyRegular2 text-dark outline-none focus:border-dark"
                      />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="flex flex-col gap-1">
                        <FieldLabel>링크 라벨 (PC)</FieldLabel>
                        <TextInput
                          value={collection.linkLabel}
                          onChange={(value) => updateCollection(index, { linkLabel: value })}
                          placeholder="오찌x우무 바로가기"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <FieldLabel>링크 URL</FieldLabel>
                        <TextInput
                          value={collection.linkHref}
                          onChange={(value) => updateCollection(index, { linkHref: value })}
                          placeholder="/collection/umu"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <p className="m-0 text-[11px] text-subtleText">
                        관련 상품 {MIN_PLANNING_COLLECTION_PRODUCTS}~{PLANNING_COLLECTION_PRODUCT_SLOTS}개 · 홈 노출
                        타일은 4개 기준 고정 크기
                        {countFilledPlanningCollectionProducts(collection.productIds) <
                        MIN_PLANNING_COLLECTION_PRODUCTS ? (
                          <span className="text-primary">
                            {' '}
                            · 상품을 최소 {MIN_PLANNING_COLLECTION_PRODUCTS}개 등록해 주세요
                          </span>
                        ) : null}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {Array.from({ length: PLANNING_COLLECTION_PRODUCT_SLOTS }, (_, slotIndex) => (
                          <ProductIdSlot
                            key={slotIndex}
                            slotIndex={slotIndex}
                            productId={collection.productIds[slotIndex]}
                            onChange={(productId) => updateCollectionProductId(index, slotIndex, productId)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {config.planningCollections.length < MAX_PLANNING_COLLECTIONS ? (
            <button
              type="button"
              className="rounded-sm border border-lightGray bg-white px-4 py-3 text-bodyRegular2 text-dark hover:border-dark"
              onClick={addPlanningCollection}
            >
              + 기획전 컬렉션 추가 ({config.planningCollections.length}/{MAX_PLANNING_COLLECTIONS})
            </button>
          ) : null}
        </section>
      ) : null}

      {/* ── 7. 큐레이션 상품 ───────────────────────── */}
      {activeTab === 'curation' ? (
        <section className="space-y-4">
          <SpecNote>
            Figma 2424:16202(모바일) / 2601:23305(PC) · 배너 이미지 없음 · 텍스트 + 상품 4슬롯 · 썸네일 07
            착장컷 우선 · 모바일 2×2 / PC 4열
          </SpecNote>

          <CurationAdminPanel
            curationProducts={config.curationProducts}
            onUpdate={updateCurationProducts}
            onCategoryFilterChange={(categoryFilter) => updateCurationProducts({ categoryFilter })}
            onSetProductIds={setCurationProductIds}
            onNotify={showMessage}
          />
        </section>
      ) : null}

      {activeTab === 'styling' ? (
        <section className="space-y-4">
          <SpecNote>
            Figma 2384:7536 / 2601:23377 · 카드 최대 4개 · 카드당 상품 2~4개(03 누끼컷 썸네일) · 배너 이미지 관리자
            업로드 · 배너 클릭 시 첫 번째 등록 상품 상세 이동
          </SpecNote>

          <StyleBannerAdminPanel
            styleBannerSection={config.styleBannerSection}
            onUpdateSection={updateStyleBannerSection}
            onUpdateCard={updateStyleBannerCard}
            onUpdateProductId={updateStyleBannerProductId}
            onImageUpload={handleImageUpload}
            uploadingKey={uploadingKey}
          />
        </section>
      ) : null}

      {activeTab === 'lookbook' ? (
        <section className="space-y-4">
          <SpecNote>
            Figma 2366:5794 · 기본 이미지는 아카이브 최신 룩북에서 불러옴 (MO 3 / PC 7) · 슬롯별 이미지 업로드로
            교체 가능 · 텍스트·태그·링크 편집
          </SpecNote>

          <LookbookAdminPanel
            lookbookSection={config.lookbookSection}
            onUpdate={updateLookbookSection}
            onUpdateSlot={updateLookbookSlot}
            onImageUpload={handleImageUpload}
            uploadingKey={uploadingKey}
          />
        </section>
      ) : null}

      {activeTab === 'marketingPopup' ? (
        <section className="space-y-4">
          <SpecNote>
            Figma 2786:7841 · 홈 메인 마케팅 레이어 팝업 (MO 하단 시트 / PC 우하단 플로팅) · 배너 이미지 750×680 또는
            375×340 비율 권장 · jpg/png · 대타이틀·서브텍스트 줄바꿈 지원 · 최소 1개, 최대 10개 · 2개 이상일 때
            슬라이드 인디케이터 노출
          </SpecNote>

          <div className="grid gap-6 lg:grid-cols-2">
            {config.marketingPopupSlides.map((slide, index) => (
              <article key={slide.id} className="rounded-sm border border-lightGray bg-white p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="m-0 text-bodyBold1 text-dark">마케팅 팝업 {index + 1}</h3>
                  {config.marketingPopupSlides.length > 1 ? (
                    <button
                      type="button"
                      className="shrink-0 text-bodySmall text-subtleText hover:text-primaryText"
                      onClick={() => removeMarketingPopupSlide(index)}
                    >
                      팝업 삭제
                    </button>
                  ) : null}
                </div>

                <div className="flex flex-nowrap items-start justify-start gap-6">
                  <div className="w-fit shrink-0">
                    <ImageUploader
                      label="배너 이미지"
                      spec="375×340 권장"
                      aspectClass="aspect-[375/340] w-[200px]"
                      previewUrl={slide.imageUrl}
                      fileName={slide.imageFileName}
                      isUploading={uploadingKey === `promo-${index}`}
                      onSelect={(e) =>
                        handleImageUpload(e.target.files?.[0], `promo-${index}`, (url, name) =>
                          updateMarketingPopup(index, { imageUrl: url, imageFileName: name }),
                        )
                      }
                      onClear={() =>
                        updateMarketingPopup(index, { imageUrl: null, imageFileName: null })
                      }
                    />
                  </div>

                  <ScaledMobilePreview
                    mobileWidth={MARKETING_POPUP_WIDTH}
                    mobileHeight={MARKETING_POPUP_BANNER_HEIGHT + MARKETING_POPUP_FOOTER_HEIGHT}
                    previewWidth={195}
                    label="모바일 미리보기"
                  >
                    <MarketingPopupPreviewContent
                      slide={slide}
                      slideIndex={index}
                      totalCount={config.marketingPopupSlides.length}
                    />
                  </ScaledMobilePreview>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <FieldLabel>대타이틀</FieldLabel>
                    <TextInput
                      value={slide.title}
                      onChange={(v) => updateMarketingPopup(index, { title: v })}
                      placeholder="코코아모브 에디션"
                      multiline
                      rows={2}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <FieldLabel>서브텍스트</FieldLabel>
                    <TextInput
                      value={slide.subtitle}
                      onChange={(v) => updateMarketingPopup(index, { subtitle: v })}
                      placeholder="로마리 스웨이드 시즌 한정…"
                      multiline
                      rows={3}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {config.marketingPopupSlides.length < MAX_MARKETING_POPUP_SLIDES ? (
            <button
              type="button"
              className="rounded-sm border border-lightGray bg-white px-4 py-3 text-bodyRegular2 text-dark hover:border-dark"
              onClick={addMarketingPopupSlide}
            >
              + 마케팅 팝업 추가 ({config.marketingPopupSlides.length}/{MAX_MARKETING_POPUP_SLIDES})
            </button>
          ) : null}
        </section>
      ) : null}

      <div className="mt-8 flex flex-col items-end gap-2 border-t border-lightGray pt-6">
        <p className="m-0 text-bodySmall text-subtleText">
          현재 탭({SECTION_SAVE_LABELS[activeTab] ?? activeTab})만 검증 후 저장됩니다.
        </p>
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          className="rounded-sm border border-dark bg-dark px-6 py-3 text-bodyRegular2 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSaving ? '저장 중…' : `${SECTION_SAVE_LABELS[activeTab] ?? '설정'} 저장`}
        </button>
      </div>
    </div>
  )
}
