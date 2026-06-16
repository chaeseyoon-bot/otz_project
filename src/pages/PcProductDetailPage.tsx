import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CartAddedPopup } from '../components/cart/CartAddedPopup'
import { ProductOptionRequiredPopup } from '../components/cart/ProductOptionRequiredPopup'
import { CouponNoticePopup } from '../components/atoms/CouponNoticePopup'
import { ProductCouponBenefitsModal } from '../components/product/ProductCouponBenefitsModal'
import { useCart } from '../contexts/CartContext'
import { usePdpOptionGate } from '../hooks/usePdpOptionGate'
import { buildCartItemFromProduct } from '../lib/buildCartItemFromProduct'
import { CART_PATH } from '../lib/cartRoutes'
import { ProductDetailPcGallery } from '../components/organisms/ProductDetailPcGallery'
import { AdaptiveProductImage } from '../components/molecules/AdaptiveProductImage'
import { ProductDetailReviewSummary } from '../components/molecules/ProductDetailReviewSummary'
import { ProductDetailPcReviewSection } from '../components/organisms/ProductDetailPcReviewSection'
import { ProductDetailPcPurchasePanel } from '../components/organisms/ProductDetailPcPurchasePanel'
import { DEMO_PRODUCT_REVIEW_SUMMARY } from '../data/productReviews'
import {
  areAllLimitedCouponsClaimed,
  getUnclaimedLimitedCoupons,
  PRODUCT_DETAIL_COUPONS,
} from '../data/productCouponContent'
import { getPdpColorVariantsForProduct } from '../data/productColorVariants'
import { PRODUCT_DETAIL_TABS, type ProductDetailTabId } from '../data/productDetailTabs'
import { useAvailableProductSlides } from '../hooks/useAvailableProductSlides'
import { ICONS } from '../constants/icons'
import { figmaAsset } from '../lib/figmaAssetUrl'
import { getProductById } from '../lib/productCatalog'
import { useProductDetail } from '../hooks/useProductDetail'
import { getProductDetailPath, parseShoesProductNum } from '../lib/productRoutes'
import { getStorefrontSizeOptionsForProductId } from '../lib/productSizeOptions'
import { navigateSpa } from '../lib/spaNavigation'
import { shoesProductPdpGallerySlides } from '../lib/shoesAssetUrl'
import { PRODUCT_CUT_CONTAIN_CLASS, PRODUCT_CUT_PORTRAIT_CLASS } from '../lib/productImage'

const iconChevronDown = figmaAsset('icons/list_chevron.svg')
const iconDetailShare = figmaAsset('icons/detail_share.svg')
const iconPlus = ICONS.common.plus

interface PcProductDetailPageProps {
  productId: string
}

function BenefitHelpIcon() {
  return (
    <span className="inline-flex size-[18px] items-center justify-center rounded-full border border-lightGray bg-white text-[10px] text-dark">
      ?
    </span>
  )
}

/** Figma g60Jix8lxQjYRzn3l7MNWf node 22:6860 — desktop product detail (PDP). */
export function PcProductDetailPage({ productId }: PcProductDetailPageProps) {
  const csvDetail = useProductDetail(productId)
  const fallbackProduct = getProductById(productId)
  const isCsvProduct = csvDetail.product != null
  const product = csvDetail.product ?? fallbackProduct
  const { addItem } = useCart()
  const [liked, setLiked] = useState(false)
  const [cartPopupOpen, setCartPopupOpen] = useState(false)
  const [couponModalOpen, setCouponModalOpen] = useState(false)
  const [claimedCouponIds, setClaimedCouponIds] = useState<Set<string>>(() => new Set())
  const [couponNoticeOpen, setCouponNoticeOpen] = useState(false)
  const [couponNoticeMessage, setCouponNoticeMessage] = useState('')
  const [benefitsOpen, setBenefitsOpen] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ProductDetailTabId>('detail')
  const [detailExpanded, setDetailExpanded] = useState(false)
  const sizeSectionRef = useRef<HTMLElement>(null)

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

  const showCouponNotice = useCallback((message: string) => {
    setCouponNoticeMessage(message)
    setCouponNoticeOpen(true)
  }, [])

  const closeCouponNotice = useCallback(() => setCouponNoticeOpen(false), [])

  const handleClaimOneCoupon = useCallback(
    (couponId: string) => {
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
    },
    [showCouponNotice],
  )

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

    setCouponModalOpen(false)
    showCouponNotice(`${count}개의 쿠폰을 받았습니다.`)
  }, [claimedCouponIds, showCouponNotice])

  const allCouponsClaimed = areAllLimitedCouponsClaimed(claimedCouponIds)

  if (!product) {
    return (
      <main className="hidden bg-white lg:block">
        <p className="mx-auto max-w-[1400px] py-20 text-bodyRegular2 text-textDefault">
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

  return (
    <main className="hidden bg-white lg:block">
      <div className="mx-auto max-w-[1400px] grid grid-cols-[776px_544px] gap-20 pb-20 pt-10">
        <div className="min-w-0">
          <ProductDetailPcGallery
            productTitle={title}
            slides={gallerySlides}
            isResolving={slidesResolving}
          />

          <div className="mt-14">
            <nav className="flex border-b border-lightGray" aria-label="상품 상세 탭">
              {PRODUCT_DETAIL_TABS.map((tab) => {
                const active = tab.id === activeTab
                const tabLabel =
                  tab.id === 'review'
                    ? `리뷰 [${reviewCount}]`
                    : tab.id === 'shipping'
                      ? '문의 [0]'
                      : tab.label
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`flex min-w-0 flex-1 items-center justify-center border-0 bg-transparent px-2 py-6 ${
                      active
                        ? 'border-b-2 border-dark text-bodyBold1 text-dark'
                        : 'border-b border-transparent text-titleMedium text-subtleText'
                    }`}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tabLabel}
                  </button>
                )
              })}
            </nav>

            {activeTab === 'detail' ? (
              <section className="mt-14">
                {slidesResolving ? null : (
                  <div className={`relative w-full ${detailExpanded ? '' : 'max-h-[646px] overflow-hidden'}`}>
                    <div className="flex flex-col">
                      {detailSlides.map((slide, index) => (
                        <div
                          key={slide.image}
                          className="flex aspect-[4/5] w-full items-center justify-center overflow-hidden bg-white"
                        >
                          <AdaptiveProductImage
                            src={slide.image}
                            alt=""
                            orientation={slide.variant === 'square' ? 'square' : 'portrait'}
                            containClassName={PRODUCT_CUT_CONTAIN_CLASS}
                            portraitClassName={PRODUCT_CUT_PORTRAIT_CLASS}
                            draggable={false}
                            loading={index < 2 ? 'eager' : 'lazy'}
                          />
                        </div>
                      ))}
                    </div>

                    {!detailExpanded ? (
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center bg-gradient-to-b from-transparent via-white/50 to-white px-2 py-12">
                        <button
                          type="button"
                          className="pointer-events-auto flex w-full max-w-[400px] items-center justify-center gap-2 rounded border border-dark bg-white px-[88px] py-4 shadow-[0_4px_2px_rgba(0,0,0,0.1)]"
                          onClick={() => setDetailExpanded(true)}
                        >
                          <span className="text-bodyRegular1 text-dark">상품 상세 설명 더보기</span>
                          <img src={iconPlus} alt="" aria-hidden className="size-6 object-contain" draggable={false} />
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </section>
            ) : activeTab === 'review' ? (
              <ProductDetailPcReviewSection photoUrls={reviewPhotoUrls} reviewCount={reviewCount} />
            ) : (
              <section className="py-20 text-center text-bodyRegular2 text-subtleText">
                {PRODUCT_DETAIL_TABS.find((tab) => tab.id === activeTab)?.label} 영역 (준비 중)
              </section>
            )}
          </div>
        </div>

        <aside className="min-w-0">
          <div className="flex items-start justify-between gap-4">
            <h1 className="m-0 max-w-[436px] text-titleBold text-dark">{title}</h1>
            <button
              type="button"
              className="flex size-7 shrink-0 items-center justify-center border-0 bg-transparent p-0"
              aria-label="공유하기"
            >
              <img src={iconDetailShare} alt="" aria-hidden className="size-7 object-contain" draggable={false} />
            </button>
          </div>

          <ProductDetailReviewSummary
            reviewCount={reviewCount}
            onViewReviews={() => setActiveTab('review')}
          />

          <div className="mt-4 flex items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="m-0 text-bodyRegular1 text-subtleText line-through">{originalPrice}원</p>
              <div className="flex items-center gap-2">
                <span className="text-titleBold text-primary">{discountRate}</span>
                <span className="text-titleBold text-black">{price}원</span>
              </div>
            </div>
            <button
              type="button"
              className={`flex shrink-0 items-center rounded-sm px-2 py-1.5 ${
                allCouponsClaimed ? 'bg-subtleText' : 'bg-dark'
              }`}
              onClick={() => setCouponModalOpen(true)}
            >
              <span className="text-bodyMedium2 text-white">
                {allCouponsClaimed ? '받은쿠폰' : '쿠폰 받기'}
              </span>
            </button>
          </div>

          <section className="mt-5 overflow-hidden rounded-lg border border-lightGray bg-white">
            <button
              type="button"
              className="flex w-full items-center justify-between border-0 bg-light px-4 py-3"
              aria-expanded={benefitsOpen}
              aria-controls="pc-product-benefits-panel"
              onClick={() => setBenefitsOpen((open) => !open)}
            >
              <span className="text-bodyRegular2 text-dark">혜택 안내</span>
              <img
                src={iconChevronDown}
                alt=""
                aria-hidden
                className={`size-4 object-contain transition-transform duration-200 ${benefitsOpen ? 'rotate-180' : ''}`}
                draggable={false}
              />
            </button>
            {benefitsOpen ? (
              <div id="pc-product-benefits-panel" className="flex gap-2 bg-white px-4 pb-6 pt-4">
                <div className="flex w-24 shrink-0 flex-col gap-3 text-bodyRegular2 text-textDefault">
                  <span>적립금</span>
                  <span>배송비</span>
                  <span>혜택정보</span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-3 text-bodyRegular2 text-dark">
                  <span>280P</span>
                  <span>2,500원 (50,000원 이상 구매 시 무료)</span>
                  <div className="flex items-center gap-6">
                    <span className="inline-flex items-center gap-1.5">
                      카드무이자
                      <BenefitHelpIcon />
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      자동 할인 적용가
                      <BenefitHelpIcon />
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <ProductDetailPcPurchasePanel
            colorVariants={colorVariants}
            productId={productId}
            onColorSelect={handleColorVariantSelect}
            sizes={sizeOptions}
            selectedSize={selectedSize}
            soldOutSizes={soldOutSizeSet}
            onSizeSelect={setSelectedSize}
            isShoesProduct={isShoesProduct}
            liked={liked}
            onToggleLike={() => setLiked((value) => !value)}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            sizeSectionRef={sizeSectionRef}
            showOptionRequiredHint={optionRequiredHintActive}
          />
        </aside>
      </div>

      <CartAddedPopup
        open={cartPopupOpen}
        onClose={() => setCartPopupOpen(false)}
        onGoToCart={handleGoToCart}
        lockBodyScroll={false}
      />

      <ProductOptionRequiredPopup
        open={optionRequiredOpen}
        onClose={closeOptionRequiredPopup}
        lockBodyScroll={false}
      />

      <ProductCouponBenefitsModal
        open={couponModalOpen}
        claimedIds={claimedCouponIds}
        onClose={() => setCouponModalOpen(false)}
        onClaimOne={handleClaimOneCoupon}
        onClaimAll={handleClaimAllCoupons}
      />

      <CouponNoticePopup
        open={couponNoticeOpen}
        message={couponNoticeMessage}
        onClose={closeCouponNotice}
        lockBodyScroll={false}
      />
    </main>
  )
}
