import { useEffect, useLayoutEffect, useState, type CSSProperties } from 'react'
import { useSpaPathname } from './hooks/useSpaPathname'
import { BottomTabBar } from './components/organisms/BottomTabBar'
import { FooterSection } from './components/organisms/FooterSection'
import { HeaderSection } from './components/organisms/HeaderSection'
import { HomeMainPromoPopup } from './components/organisms/HomeMainPromoPopup'
import { MobileGnbDrawer } from './components/organisms/MobileGnbDrawer'
import { MobileGnbProvider } from './contexts/MobileGnbContext'
import { CartProvider } from './contexts/CartContext'
import { HomeMainConfigProvider } from './contexts/HomeMainConfigContext'
import { tokens } from './design-system/tokens'
import { CategoryShoesPage } from './pages/CategoryShoesPage'
import { HomePage } from './pages/HomePage'
import { ArchiveDetailPage } from './pages/ArchiveDetailPage'
import { ArchivePage } from './pages/ArchivePage'
import { parseArchiveDetailId } from './lib/archiveRoutes'
import { isCartPath } from './lib/cartRoutes'
import { isCheckoutPath } from './lib/checkoutRoutes'
import { isOrderCompletePath, isOrderDetailPath, parseOrderDetailId } from './lib/orderRoutes'
import { isMyPagePath } from './lib/myPageRoutes'
import { parseProductId } from './lib/productRoutes'
import { BestPage } from './pages/BestPage'
import { EditorialPage } from './pages/EditorialPage'
import { BrandStoryPage } from './pages/BrandStoryPage'
import { NewPage } from './pages/NewPage'
import { MobileProductDetailPage } from './pages/MobileProductDetailPage'
import { PcProductDetailPage } from './pages/PcProductDetailPage'
import { MobileSearchResultsPage } from './pages/MobileSearchResultsPage'
import { MobileCheckoutPage } from './pages/MobileCheckoutPage'
import { MobileOrderCompletePage } from './pages/MobileOrderCompletePage'
import { MobileOrderDetailPage } from './pages/MobileOrderDetailPage'
import { PcCheckoutPage } from './pages/PcCheckoutPage'
import { PcOrderCompletePage } from './pages/PcOrderCompletePage'
import { MobileCartPage } from './pages/MobileCartPage'
import { PcCartPage } from './pages/PcCartPage'
import { MyPage } from './pages/MyPage'
import { PcMyPage } from './pages/PcMyPage'
import { PcSearchResultsPage } from './pages/PcSearchResultsPage'
import { SearchPage } from './pages/SearchPage'
import { isSearchOverlayPath, isSearchResultsPath } from './lib/searchRoutes'
import { getAdminActiveMenu, isAdminMainPath, isAdminPath, isAdminProductFormPath } from './lib/adminRoutes'
import { AdminLayout } from './pages/admin/AdminLayout'
import { HomeMainManagement } from './pages/admin/HomeMainManagement'
import { ProductManagement } from './pages/admin/ProductManagement'
import { ProductRegistration } from './pages/admin/ProductRegistration'

const shellStyles: Record<string, CSSProperties> = {
  appFrame: {
    width: '100%',
    margin: '0 auto',
    backgroundColor: tokens.color.white,
    minHeight: '100vh',
  },
}

export default function App() {
  const pathname = useSpaPathname()
  const [mobileScale, setMobileScale] = useState(1)
  const [isMobileViewport, setIsMobileViewport] = useState(false)

  useEffect(() => {
    const updateViewportScale = () => {
      const viewportWidth = window.innerWidth
      const mobile = viewportWidth < 1024
      setIsMobileViewport(mobile)
      if (!mobile) {
        setMobileScale(1)
        return
      }
      setMobileScale(viewportWidth / 375)
    }

    updateViewportScale()
    window.addEventListener('resize', updateViewportScale)
    return () => window.removeEventListener('resize', updateViewportScale)
  }, [])

  const isNew = pathname.startsWith('/new')
  const isBest = pathname.startsWith('/best')
  const archiveDetailId = parseArchiveDetailId(pathname)
  const isArchive = pathname.startsWith('/archive')
  const isEditorial = pathname.startsWith('/editorial')
  const isBrandStory = pathname.startsWith('/brand-story')
  const isCategoryShoes = pathname.startsWith('/category/shoes')
  const isSearchOverlay = isSearchOverlayPath(pathname)
  const isSearchResults = isSearchResultsPath(pathname)
  const isSearch = isSearchOverlay || isSearchResults
  const isMyPage = isMyPagePath(pathname)
  const isCart = isCartPath(pathname)
  const isCheckout = isCheckoutPath(pathname)
  const isOrderComplete = isOrderCompletePath(pathname)
  const orderDetailId = parseOrderDetailId(pathname)
  const isOrderDetail = isOrderDetailPath(pathname)
  const productId = parseProductId(pathname)
  const isProductDetail = productId != null
  const isAdmin = isAdminPath(pathname)
  const isHome = pathname === '/' || pathname === ''

  /** PDP entry / product switch — always start at top (SPA keeps window scroll otherwise). */
  useLayoutEffect(() => {
    if (productId != null) {
      window.scrollTo(0, 0)
      return
    }

    /** Shorter route body can leave scrollY past max — browser clamps async; sync before paint to avoid header scroll glitches. */
    const root = document.documentElement
    const maxScroll = Math.max(0, root.scrollHeight - window.innerHeight)
    const y = window.scrollY
    if (y > maxScroll) {
      window.scrollTo(0, maxScroll)
    }
  }, [pathname, productId])

  return (
    <HomeMainConfigProvider>
      {isAdmin ? (
        <AdminLayout activeMenu={getAdminActiveMenu(pathname)}>
          {isAdminMainPath(pathname) ? (
            <HomeMainManagement />
          ) : isAdminProductFormPath(pathname) ? (
            <ProductRegistration pathname={pathname} />
          ) : (
            <ProductManagement />
          )}
        </AdminLayout>
      ) : (
    <MobileGnbProvider>
      <CartProvider>
      <div className="min-h-screen bg-[#ebebeb]">
        <div
          className={`app-home-shell mx-auto w-full bg-white lg:pb-0 ${
            isProductDetail
              ? 'pb-0'
              : 'pb-[calc(50px+env(safe-area-inset-bottom,0px))]'
          }`}
          style={{
            ...shellStyles.appFrame,
            width: isMobileViewport ? 375 : '100%',
            zoom: isMobileViewport ? mobileScale : 1,
          }}
        >
          <HeaderSection />
          {isProductDetail && productId ? (
            <>
              <MobileProductDetailPage key={productId} productId={productId} />
              <PcProductDetailPage key={`pc-${productId}`} productId={productId} />
            </>
          ) : isSearchResults ? (
            <>
              <MobileSearchResultsPage />
              <PcSearchResultsPage />
            </>
          ) : isSearchOverlay ? (
            <SearchPage />
          ) : isOrderComplete ? (
            <>
              <MobileOrderCompletePage />
              <PcOrderCompletePage />
            </>
          ) : isOrderDetail && orderDetailId ? (
            <MobileOrderDetailPage orderId={orderDetailId} />
          ) : isCheckout ? (
            <>
              <MobileCheckoutPage />
              <PcCheckoutPage />
            </>
          ) : isCart ? (
            <>
              <MobileCartPage />
              <PcCartPage />
            </>
          ) : isMyPage ? (
            <>
              <MyPage />
              <PcMyPage />
            </>
          ) : isCategoryShoes ? (
            <CategoryShoesPage />
          ) : isNew ? (
            <NewPage />
          ) : isBest ? (
            <BestPage />
          ) : archiveDetailId ? (
            <ArchiveDetailPage lookbookId={archiveDetailId} />
          ) : isArchive ? (
            <ArchivePage />
          ) : isEditorial ? (
            <EditorialPage />
          ) : isBrandStory ? (
            <BrandStoryPage />
          ) : (
            <HomePage />
          )}
          {isProductDetail ? (
            <div className="hidden lg:contents">
              <FooterSection />
            </div>
          ) : isSearchOverlay || isCart || isCheckout || isOrderDetail ? (
            <div className="hidden lg:contents">
              <FooterSection />
            </div>
          ) : (
            <FooterSection />
          )}
          <BottomTabBar />
          {isHome ? <HomeMainPromoPopup /> : null}
        </div>
        <MobileGnbDrawer />
      </div>
      </CartProvider>
    </MobileGnbProvider>
      )}
    </HomeMainConfigProvider>
  )
}
