import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CartAddedPopup } from '../components/cart/CartAddedPopup'
import { ProductOptionRequiredPopup } from '../components/cart/ProductOptionRequiredPopup'
import { useCart } from '../contexts/CartContext'
import { usePdpOptionGate } from '../hooks/usePdpOptionGate'
import { buildCartItemFromProduct } from '../lib/buildCartItemFromProduct'
import { CART_PATH } from '../lib/cartRoutes'
import { useAvailableProductSlides } from '../hooks/useAvailableProductSlides'
import { figmaAsset } from '../lib/figmaAssetUrl'
import { getPdpColorVariantsForProduct } from '../data/productColorVariants'
import { PRODUCT_DETAIL_TABS, type ProductDetailTabId } from '../data/productDetailTabs'
import { getProductById } from '../lib/productCatalog'
import { useProductDetail } from '../hooks/useProductDetail'
import { getProductDetailPath, parseShoesProductNum } from '../lib/productRoutes'
import { getStorefrontSizeOptionsForProductId } from '../lib/productSizeOptions'
import { navigateSpa } from '../lib/spaNavigation'
import { shoesProductPdpGallerySlides } from '../lib/shoesAssetUrl'
import { PdpColorVariantPicker } from '../components/molecules/PdpColorVariantPicker'
import { PdpSizeOptionButton } from '../components/molecules/PdpSizeOptionButton'
import { ProductDetailImageGallery } from '../components/molecules/ProductDetailImageGallery'
import { AdaptiveProductImage } from '../components/molecules/AdaptiveProductImage'
import { ProductDetailFixedActionBar } from '../components/organisms/ProductDetailFixedActionBar'
import { ProductDetailMobileReviewSection } from '../components/organisms/ProductDetailMobileReviewSection'
import { ProductDetailMobileInquirySection } from '../components/organisms/ProductDetailMobileInquirySection'
import { ProductDetailReviewSummary } from '../components/molecules/ProductDetailReviewSummary'
import { ProductMobileDetailHeader } from '../components/organisms/ProductMobileDetailHeader'
import { CouponNoticePopup } from '../components/atoms/CouponNoticePopup'
import { ProductCouponBenefitsSheet } from '../components/product/ProductCouponBenefitsSheet'
import { PRODUCT_DETAIL_COUPONS, areAllLimitedCouponsClaimed, getUnclaimedLimitedCoupons } from '../data/productCouponContent'
import { DEMO_PRODUCT_REVIEW_SUMMARY } from '../data/productReviews'
import { DEMO_PRODUCT_INQUIRY_COUNT } from '../data/productInquiries'

const iconChevronDown = figmaAsset('icons/list_chevron.svg')
const iconDetailShare = figmaAsset('icons/detail_share.svg')

/** MO PDP — sticky header (52px) + tab nav (58px) scroll offset for in-page anchors. */
const MO_PDP_HEADER_HEIGHT_PX = 52
const MO_PDP_TAB_NAV_HEIGHT_PX = 58
const MO_PDP_STICKY_SCROLL_OFFSET_PX = MO_PDP_HEADER_HEIGHT_PX + MO_PDP_TAB_NAV_HEIGHT_PX

/** Figma 2978:16227 — collapsed detail shows first N slides, then expand button. */
const MO_DETAIL_PREVIEW_SLIDE_COUNT = 2

interface ProductDisclosureRow {
  label: string
  value: string | string[]
}

/** Figma 2978:16572 — 상품정보 제공고시 */
const PRODUCT_DISCLOSURE_ROWS: ProductDisclosureRow[] = [
  { label: '제품 소재', value: '면 54% , 폴리에스터 46%' },
  { label: '색상', value: 'BLACK, MELANGE GRAY' },
  { label: '치수', value: '220, 230, 240, 250' },
  { label: '제조사', value: '이랜드 월드' },
  {
    label: '세탁 및 취급 주의',
    value: [
      '- 자세한 주의사항은 상품에 부착된 세탁 라벨을 참고해주세요.',
      '- 짙은 색상과 밝은 색상의 경우 분리하여 세탁하십시오',
      '- 세탁 시 표백재 및 강력효소를 사용하지 마십시오.',
      '- 지퍼/스냅 등은 잠그신 후 세탁해 주시기 바랍니다.',
      '- 심한 마찰은 제품의 원단 및 손상의 원인이 되므로 주의하십시오',
      '- 땀과 비 등에 의해 젖은 상태로 오래 방치할 경우 변색의 우려가 있습니다.',
      '- 소비자 부주의로 인한 제품 손상은 보상 되지 않습니다.',
    ],
  },
  {
    label: '품질보증기준',
    value: '구매일로부터 1년간 / 그 외 기준은 관련볍 및 소비자분쟁해결 규정에 따름',
  },
  { label: 'A/S책임자 ∙ 전화번호', value: '㈜ 이랜드월드 오찌 고객센터 / 1566-8221' },
]

/** Sample — 배송/교환/반품 안내 */
const SHIPPING_DISCLOSURE_ROWS: ProductDisclosureRow[] = [
  { label: '배송 방법', value: '택배' },
  { label: '배송 지역', value: '전국 (제주 및 도서산간 지역 별도)' },
  { label: '배송 비용', value: '2,500원 (50,000원 이상 구매 시 무료)' },
  { label: '배송 기간', value: '결제 완료 후 2~5일 (주말·공휴일 제외)' },
  {
    label: '교환/반품 안내',
    value: [
      '- 상품 수령 후 7일 이내 교환·반품 가능합니다.',
      '- 단순 변심의 경우 왕복 배송비가 부과될 수 있습니다.',
      '- 상품 하자 및 오배송의 경우 배송비는 판매자가 부담합니다.',
    ],
  },
  { label: '교환/반품 불가', value: '착용·세탁 흔적이 있거나 택이 제거된 경우' },
  { label: '문의', value: '㈜ 이랜드월드 오찌 고객센터 / 1566-8221' },
]

interface MobileProductDetailPageProps {
  productId: string
}

function ProductDisclosurePanel({ rows }: { rows: ProductDisclosureRow[] }) {
  return (
    <div className="flex flex-col">
      {rows.map((row, index) => (
        <div
          key={row.label}
          className={`flex border-lightGray ${index === 0 ? 'border-y' : 'border-b'}`}
        >
          <div className="flex w-28 shrink-0 bg-light3 p-4">
            <span className="text-bodySmall text-dark">{row.label}</span>
          </div>
          <div className="flex min-w-0 flex-1 p-4">
            {Array.isArray(row.value) ? (
              <div className="flex flex-col gap-2">
                {row.value.map((line) => (
                  <p key={line} className="m-0 text-bodySmall text-textDefault">
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <p className="m-0 text-bodySmall text-textDefault">{row.value}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function ShareIconButton() {
  return (
    <button
      type="button"
      className="flex size-6 shrink-0 items-center justify-center border-0 bg-transparent p-0"
      aria-label="공유하기"
    >
      <img src={iconDetailShare} alt="" aria-hidden className="size-6 object-contain" draggable={false} />
    </button>
  )
}

function DetailDescriptionSlide({
  slide,
  index,
}: {
  slide: { image: string; variant: 'square' | 'portrait' | 'editorial' }
  index: number
}) {
  return (
    <div className="flex aspect-[4/5] w-full items-center justify-center overflow-hidden bg-white">
      <AdaptiveProductImage
        src={slide.image}
        alt=""
        orientation={slide.variant === 'square' ? 'square' : 'portrait'}
        containClassName="w-full object-contain mix-blend-multiply"
        portraitClassName="h-full w-auto object-contain mix-blend-multiply"
        draggable={false}
        loading={index < 2 ? 'eager' : 'lazy'}
      />
    </div>
  )
}

/** Figma 2978:16227 — overlays bottom of 2nd detail image (PC-style gradient + button). */
function MobileDetailExpandButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center bg-gradient-to-b from-transparent via-white/50 to-white px-[15px] pb-4 pt-16">
      <button
        type="button"
        className="pointer-events-auto flex w-full items-center justify-center rounded border border-dark bg-white px-4 py-4 shadow-[0_4px_2px_rgba(0,0,0,0.1)]"
        onClick={onClick}
      >
        <span className="text-bodyRegular1 text-dark">상품 상세 설명 더보기 +</span>
      </button>
    </div>
  )
}

/** Figma 2978:16098 — mobile product detail (PDP). */
export function MobileProductDetailPage({ productId }: MobileProductDetailPageProps) {
  const csvDetail = useProductDetail(productId)
  const fallbackProduct = getProductById(productId)
  const isCsvProduct = csvDetail.product != null
  const product = csvDetail.product ?? fallbackProduct
  const { addItem } = useCart()
  const [liked, setLiked] = useState(false)
  const [cartPopupOpen, setCartPopupOpen] = useState(false)
  const [couponSheetOpen, setCouponSheetOpen] = useState(false)
  const [claimedCouponIds, setClaimedCouponIds] = useState<Set<string>>(() => new Set())
  const [couponNoticeOpen, setCouponNoticeOpen] = useState(false)
  const [couponNoticeMessage, setCouponNoticeMessage] = useState('')
  const [benefitsOpen, setBenefitsOpen] = useState(true)
  const [productInfoOpen, setProductInfoOpen] = useState(false)
  const [shippingInfoOpen, setShippingInfoOpen] = useState(false)
  const [detailExpanded, setDetailExpanded] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ProductDetailTabId>('detail')
  const sizeSectionRef = useRef<HTMLElement>(null)
  const detailSectionRef = useRef<HTMLElement>(null)
  const reviewSectionRef = useRef<HTMLDivElement>(null)
  const inquirySectionRef = useRef<HTMLElement>(null)

  const shoesProductNum = parseShoesProductNum(productId)

  // Legacy (non-CSV) slides: old shoes catalog or fallback catalog item.
  const legacyRawSlides = useMemo(() => {
    if (shoesProductNum != null) return shoesProductPdpGallerySlides(shoesProductNum)
    if (!fallbackProduct) return []
    if (fallbackProduct.multiCutSlides?.length) return fallbackProduct.multiCutSlides
    return [{ image: fallbackProduct.image, variant: 'square' as const }]
  }, [fallbackProduct, shoesProductNum])

  const { slides: legacyProbedSlides, isResolving: legacyResolving } = useAvailableProductSlides(legacyRawSlides, {
    enabled: !isCsvProduct && shoesProductNum != null,
  })

  // CSV products use the probed 01..08 gallery; legacy ids keep their old behavior.
  const gallerySlides = isCsvProduct
    ? csvDetail.slides
    : shoesProductNum != null
      ? legacyProbedSlides
      : legacyRawSlides
  const detailSlides = gallerySlides
  const slidesResolving = isCsvProduct ? csvDetail.isResolving : shoesProductNum != null && legacyResolving

  const soldOutSizeSet = useMemo(() => new Set(product?.soldOutSizes ?? []), [product?.soldOutSizes])
  const sizeOptions = useMemo(
    () => product?.sizeOptions ?? getStorefrontSizeOptionsForProductId(productId),
    [product?.sizeOptions, productId],
  )
  const isShoesProduct = useMemo(
    () => sizeOptions.length > 1 || sizeOptions[0] !== 'FREE',
    [sizeOptions],
  )
  const colorVariants = useMemo(() => getPdpColorVariantsForProduct(productId), [productId])
  const { optionRequiredOpen, optionRequiredHintActive, closeOptionRequiredPopup, ensureOptionSelected } =
    usePdpOptionGate(selectedSize, soldOutSizeSet, sizeSectionRef)

  useEffect(() => {
    if (selectedSize && soldOutSizeSet.has(selectedSize)) {
      setSelectedSize(null)
    }
  }, [selectedSize, soldOutSizeSet])

  useEffect(() => {
    setDetailExpanded(false)
  }, [productId])

  const reviewPhotoUrls = useMemo(
    () => gallerySlides.map((slide) => slide.image).slice(0, 6),
    [gallerySlides],
  )

  const scrollToDetailTab = useCallback((tabId: ProductDetailTabId) => {
    setActiveTab(tabId)
    const targetRef =
      tabId === 'detail'
        ? detailSectionRef
        : tabId === 'review'
          ? reviewSectionRef
          : inquirySectionRef
    requestAnimationFrame(() => {
      targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  const goToReviewTab = useCallback(() => {
    scrollToDetailTab('review')
  }, [scrollToDetailTab])

  const showCouponNotice = useCallback((message: string) => {
    setCouponNoticeMessage(message)
    setCouponNoticeOpen(true)
  }, [])

  const closeCouponNotice = useCallback(() => setCouponNoticeOpen(false), [])

  const handleClaimOneCoupon = useCallback((couponId: string) => {
    const coupon = PRODUCT_DETAIL_COUPONS.find((item) => item.id === couponId)
    if (!coupon) return

    if (coupon.unlimited) {
      showCouponNotice('쿠폰을 받았습니다.')
      return
    }

    let newlyClaimed = false
    setClaimedCouponIds((prev) => {
      if (prev.has(couponId)) return prev
      newlyClaimed = true
      return new Set(prev).add(couponId)
    })
    if (newlyClaimed) {
      showCouponNotice('쿠폰을 받았습니다.')
    }
  }, [showCouponNotice])

  const handleClaimAllCoupons = useCallback(() => {
    const unclaimed = getUnclaimedLimitedCoupons(claimedCouponIds)
    const count = unclaimed.length

    if (count > 0) {
      setClaimedCouponIds((prev) => {
        const next = new Set(prev)
        unclaimed.forEach((coupon) => next.add(coupon.id))
        return next
      })
    }

    setCouponSheetOpen(false)
    showCouponNotice(`${count}개의 쿠폰을 받았습니다.`)
  }, [claimedCouponIds, showCouponNotice])

  if (!product) {
    return (
      <main className="bg-white lg:hidden">
        <ProductMobileDetailHeader />
        <p className="px-[15px] py-10 text-bodyRegular2 text-textDefault">
          {csvDetail.isLoading ? '상품을 불러오는 중입니다…' : '상품을 찾을 수 없습니다.'}
        </p>
      </main>
    )
  }

  const isFigmaDemoProduct = productId === 'shoes-3'
  const title = isFigmaDemoProduct
    ? '로마리 스웨이드 밴딩플랫 메리제인 코코아모브 브라운 FLOTFA3W59'
    : product.title
  const originalPrice = isFigmaDemoProduct ? '89,000' : product.originalPrice ?? '89,000'
  const discountRate = isFigmaDemoProduct ? '5%' : product.discountRate
  const price = isFigmaDemoProduct ? '85,000' : product.price
  const reviewCount = DEMO_PRODUCT_REVIEW_SUMMARY.totalCount
  const inquiryCount = DEMO_PRODUCT_INQUIRY_COUNT

  const handleColorVariantSelect = (nextProductId: string) => {
    if (nextProductId === productId) return
    navigateSpa(getProductDetailPath(nextProductId))
  }

  const handleAddToCart = () => {
    if (!ensureOptionSelected()) return
    addItem(
      buildCartItemFromProduct(product, {
        size: selectedSize!,
        productName: title,
        price,
      }),
    )
    setCartPopupOpen(true)
  }

  const handleBuyNow = () => {
    if (!ensureOptionSelected()) return
  }

  const handleGoToCart = () => {
    setCartPopupOpen(false)
    navigateSpa(CART_PATH)
  }

  const allCouponsClaimed = areAllLimitedCouponsClaimed(claimedCouponIds)
  const previewDetailSlides = detailSlides.slice(0, MO_DETAIL_PREVIEW_SLIDE_COUNT)
  const hiddenDetailSlides = detailSlides.slice(MO_DETAIL_PREVIEW_SLIDE_COUNT)
  const hasHiddenDetailSlides = hiddenDetailSlides.length > 0

  return (
    <main className="bg-white pb-[78px] lg:hidden">
      <ProductMobileDetailHeader />

      <ProductDetailImageGallery
        productTitle={title}
        slides={gallerySlides}
        isResolving={slidesResolving}
      />

      <section className="px-[15px] pt-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="m-0 flex-1 text-bodyBold1 text-dark">{title}</h1>
          <ShareIconButton />
        </div>

        <ProductDetailReviewSummary
          reviewCount={reviewCount}
          onViewReviews={goToReviewTab}
        />

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="m-0 text-bodyRegular2 text-subtleText line-through">{originalPrice}원</p>
            <div className="flex items-center gap-2">
              <span className="text-bodyBold1 text-primary">{discountRate}</span>
              <span className="text-bodyBold1 text-black">{price}원</span>
            </div>
          </div>
          <button
            type="button"
            className={`flex shrink-0 items-center rounded px-2 py-1 ${
              allCouponsClaimed ? 'bg-subtleText' : 'bg-[var(--otz-color-text-primary)]'
            }`}
            onClick={() => setCouponSheetOpen(true)}
          >
            <span className="text-bodyMedium3 text-[var(--otz-color-white)]">
              {allCouponsClaimed ? '받은쿠폰' : '쿠폰 받기'}
            </span>
          </button>
        </div>
      </section>

      {/* Figma 2978:16129 — 혜택 안내 accordion (open: 2978:16133, closed: header only) */}
      <section className="mx-[15px] mt-5 overflow-hidden rounded-lg border border-lightGray bg-white">
        <button
          type="button"
          className="flex w-full items-center justify-between border-0 bg-light px-4 py-3"
          aria-expanded={benefitsOpen}
          aria-controls="product-benefits-panel"
          onClick={() => setBenefitsOpen((open) => !open)}
        >
          <span className="text-bodySmall text-dark">혜택 안내</span>
          <img
            src={iconChevronDown}
            alt=""
            aria-hidden
            className={`size-4 object-contain transition-transform duration-200 ${benefitsOpen ? 'rotate-180' : ''}`}
            draggable={false}
          />
        </button>
        {benefitsOpen ? (
          <div id="product-benefits-panel" className="flex gap-2 bg-white px-4 pb-4 pt-3">
            <div className="flex w-20 shrink-0 flex-col gap-3 text-bodySmall text-textDefault">
              <span>적립금</span>
              <span>배송비</span>
              <span>혜택정보</span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-3 text-bodySmall text-dark">
              <span>280P</span>
              <span>2,500원 (50,000원 이상 구매 시 무료)</span>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                  카드무이자
                  <span className="inline-flex size-[18px] items-center justify-center rounded-full border border-lightGray bg-white text-[10px] text-[var(--otz-color-text-primary)]">
                    ?
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  자동 할인 적용가
                  <span className="inline-flex size-[18px] items-center justify-center rounded-full border border-lightGray bg-white text-[10px] text-[var(--otz-color-text-primary)]">
                    ?
                  </span>
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {colorVariants ? (
        <section className="border-b border-lightGray mx-[15px] py-6">
          <h2 className="m-0 text-bodyBold3 text-dark">컬러</h2>
          <div className="mt-3 w-fit">
            <PdpColorVariantPicker
              variants={colorVariants}
              currentProductId={productId}
              onSelect={handleColorVariantSelect}
            />
          </div>
        </section>
      ) : null}

      <section
        ref={sizeSectionRef}
        tabIndex={-1}
        aria-label={isShoesProduct ? '사이즈 옵션' : '옵션'}
        className="border-b border-lightGray mx-[15px] py-6 outline-none"
      >
        <h2 className="m-0 px-2 text-bodyBold3 text-dark">{isShoesProduct ? '사이즈' : '옵션'}</h2>
        <div className="mt-3 flex flex-col gap-2 px-2">
          <div className={`grid gap-2 ${isShoesProduct ? 'grid-cols-4' : 'grid-cols-1 max-w-[120px]'}`}>
            {sizeOptions.map((size) => (
              <PdpSizeOptionButton
                key={size}
                size={size}
                selected={selectedSize === size}
                soldOut={soldOutSizeSet.has(size)}
                onSelect={setSelectedSize}
              />
            ))}
          </div>
          {selectedSize ? (
            <p className="m-0 text-bodySmall text-dark">
              {isShoesProduct ? '사이즈' : '옵션'} : {selectedSize}
            </p>
          ) : (
            <p
              className={`m-0 text-bodySmall ${optionRequiredHintActive ? 'text-primaryText' : 'text-subtleText'}`}
            >
              [필수] 옵션을 선택해 주세요
            </p>
          )}
        </div>
      </section>

      <nav
        className="sticky z-40 flex bg-white"
        style={{ top: MO_PDP_HEADER_HEIGHT_PX }}
        aria-label="상품 상세 탭"
      >
        {PRODUCT_DETAIL_TABS.map((tab) => {
          const active = tab.id === activeTab
          const tabLabel =
            tab.id === 'review'
              ? `리뷰 [${reviewCount}]`
              : tab.id === 'shipping'
                ? `문의 [${inquiryCount}]`
                : tab.id === 'detail'
                  ? '상품 설명'
                  : tab.label
          return (
            <button
              key={tab.id}
              type="button"
              className={`flex min-w-0 flex-1 items-center justify-center border-0 bg-transparent px-[23px] py-[18px] ${
                active
                  ? 'border-b-2 border-dark text-bodyBold3 text-dark'
                  : 'border-b border-lightGray text-bodyMedium2 text-subtleText'
              }`}
              aria-current={active ? 'page' : undefined}
              onClick={() => scrollToDetailTab(tab.id)}
            >
              {tabLabel}
            </button>
          )
        })}
      </nav>

      <section
        ref={detailSectionRef}
        id="product-detail-description"
        className="flex flex-col"
        style={{ scrollMarginTop: MO_PDP_STICKY_SCROLL_OFFSET_PX }}
      >
        {slidesResolving ? null : (
          <>
            {previewDetailSlides.map((slide, index) => {
              const isSecondPreviewSlide = index === MO_DETAIL_PREVIEW_SLIDE_COUNT - 1
              const showExpandOverlay =
                !detailExpanded && hasHiddenDetailSlides && isSecondPreviewSlide

              if (showExpandOverlay) {
                return (
                  <div key={slide.image} className="relative">
                    <DetailDescriptionSlide slide={slide} index={index} />
                    <MobileDetailExpandButton onClick={() => setDetailExpanded(true)} />
                  </div>
                )
              }

              return <DetailDescriptionSlide key={slide.image} slide={slide} index={index} />
            })}
            {detailExpanded
              ? hiddenDetailSlides.map((slide, index) => (
                  <DetailDescriptionSlide
                    key={slide.image}
                    slide={slide}
                    index={index + MO_DETAIL_PREVIEW_SLIDE_COUNT}
                  />
                ))
              : null}
          </>
        )}
      </section>

      <section
        id="product-detail-disclosures"
        className="border-t border-lightGray"
        style={{ scrollMarginTop: MO_PDP_STICKY_SCROLL_OFFSET_PX }}
      >
        <button
          type="button"
          className="flex w-full items-center justify-between border-0 border-b border-lightGray bg-transparent px-[15px] py-4 text-left"
          aria-expanded={productInfoOpen}
          aria-controls="product-disclosure-panel"
          onClick={() => setProductInfoOpen((open) => !open)}
        >
          <span className="text-bodyMedium2 text-dark">상품정보 제공고시</span>
          <img
            src={iconChevronDown}
            alt=""
            aria-hidden
            className={`size-4 object-contain transition-transform duration-200 ${productInfoOpen ? 'rotate-180' : ''}`}
            draggable={false}
          />
        </button>
        {productInfoOpen ? (
          <div id="product-disclosure-panel" className="mx-[15px] my-[24px]">
            <ProductDisclosurePanel rows={PRODUCT_DISCLOSURE_ROWS} />
          </div>
        ) : null}
        <button
          type="button"
          className="flex w-full items-center justify-between border-0 border-b border-lightGray bg-transparent px-[15px] py-4 text-left"
          aria-expanded={shippingInfoOpen}
          aria-controls="shipping-disclosure-panel"
          onClick={() => setShippingInfoOpen((open) => !open)}
        >
          <span className="text-bodyMedium2 text-dark">배송/교환/반품 안내</span>
          <img
            src={iconChevronDown}
            alt=""
            aria-hidden
            className={`size-4 object-contain transition-transform duration-200 ${shippingInfoOpen ? 'rotate-180' : ''}`}
            draggable={false}
          />
        </button>
        {shippingInfoOpen ? (
          <div id="shipping-disclosure-panel" className="mx-[15px] my-[24px]">
            <ProductDisclosurePanel rows={SHIPPING_DISCLOSURE_ROWS} />
          </div>
        ) : null}
      </section>

      <div
        ref={reviewSectionRef}
        id="product-detail-review"
        style={{ scrollMarginTop: MO_PDP_STICKY_SCROLL_OFFSET_PX }}
      >
        <ProductDetailMobileReviewSection
          photoUrls={reviewPhotoUrls}
          reviewCount={reviewCount}
          productTitle={title}
          productThumbnailUrl={gallerySlides[0]?.image ?? product.image}
          averageRating={DEMO_PRODUCT_REVIEW_SUMMARY.averageRating}
          isShoesProduct={isShoesProduct}
        />
      </div>

      <section
        ref={inquirySectionRef}
        id="product-detail-inquiry"
        className="border-t border-lightGray"
        style={{ scrollMarginTop: MO_PDP_STICKY_SCROLL_OFFSET_PX }}
      >
        <ProductDetailMobileInquirySection inquiryCount={inquiryCount} />
      </section>

      <ProductDetailFixedActionBar
        liked={liked}
        onToggleLike={() => setLiked((v) => !v)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      <CartAddedPopup
        open={cartPopupOpen}
        onClose={() => setCartPopupOpen(false)}
        onGoToCart={handleGoToCart}
      />

      <ProductOptionRequiredPopup open={optionRequiredOpen} onClose={closeOptionRequiredPopup} />

      <ProductCouponBenefitsSheet
        open={couponSheetOpen}
        claimedIds={claimedCouponIds}
        onClose={() => setCouponSheetOpen(false)}
        onClaimOne={handleClaimOneCoupon}
        onClaimAll={handleClaimAllCoupons}
      />

      <CouponNoticePopup
        open={couponNoticeOpen}
        message={couponNoticeMessage}
        onClose={closeCouponNotice}
      />
    </main>
  )
}
