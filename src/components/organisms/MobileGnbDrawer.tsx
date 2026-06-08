import { createPortal } from 'react-dom'
import { useMobileGnb } from '../../contexts/MobileGnbContext'
import { GNB_MEGA_MENU_GROUPS } from '../../data/gnbMegaMenu'
import { getMobileGnbDrawerItems } from '../../data/categoryMobileMain'
import { mainImageAsset } from '../../lib/mainImagesAssetUrl'
import { buildCategoryPlpPath, navigateCategoryPlp, resolveGnbDrawerNavigation } from '../../lib/categoryRoutes'

const imgMoHamburgerBrand = mainImageAsset('mo_hamburger_brandstory.png')
const imgMembership = mainImageAsset('mo_hamburger_membership.png')

/** Global mobile hamburger menu — same layer from every header / tab bar entry point. */
export function MobileGnbDrawer() {
  const { isOpen, isEntered, activeTab, setActiveTab, close, isMobileViewport, mobileScale } = useMobileGnb()

  if (!isOpen) return null

  return createPortal(
    <>
      <DrawerBackdrop isEntered={isEntered} onClose={close} />
      <div
        id="mobile-gnb-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-gnb-menu-trigger"
        className={`fixed left-0 right-0 top-0 bottom-[calc(50px+env(safe-area-inset-bottom,0px))] z-[56] flex min-h-0 min-w-0 flex-col bg-white transition-transform duration-300 ease-out motion-reduce:transition-none ${
          isEntered ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={
          isMobileViewport
            ? {
                width: '375px',
                right: 'auto',
                left: '50%',
                marginLeft: '-187.5px',
                zoom: mobileScale,
              }
            : undefined
        }
      >
        <DrawerHeader onClose={close} />
        <div className="flex shrink-0 border-b border-[#EDEDED] px-5" role="tablist" aria-label="카테고리">
          {GNB_MEGA_MENU_GROUPS.map((group, idx) => (
            <button
              key={group.title}
              type="button"
              role="tab"
              aria-selected={activeTab === idx}
              id={`mobile-gnb-tab-${idx}`}
              aria-controls="mobile-gnb-tabpanel"
              onClick={() => setActiveTab(idx)}
              className={`mr-10 border-0 border-b-2 bg-transparent pb-[11px] pt-[14px] text-[14px] font-medium uppercase leading-tight tracking-[-0.02em] transition-colors last:mr-0 ${
                activeTab === idx
                  ? 'border-black font-bold text-black'
                  : 'border-transparent text-[#666666]'
              }`}
            >
              {group.title}
            </button>
          ))}
        </div>
        <DrawerBody activeTab={activeTab} onNavigate={close} />
      </div>
    </>,
    document.body,
  )
}

function DrawerBackdrop({ isEntered, onClose }: { isEntered: boolean; onClose: () => void }) {
  return (
    <div
      role="presentation"
      className={`fixed left-0 right-0 top-0 bottom-[calc(50px+env(safe-area-inset-bottom,0px))] z-[55] bg-black/40 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
        isEntered ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    />
  )
}

function DrawerHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-end px-2">
      <button
        type="button"
        className="flex size-10 items-center justify-center border-0 bg-transparent p-0"
        aria-label="메뉴 닫기"
        onClick={onClose}
      >
        <span className="relative block size-4 rotate-45">
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#1a1a1a]" />
          <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#1a1a1a]" />
        </span>
      </button>
    </div>
  )
}

function DrawerBody({ activeTab, onNavigate }: { activeTab: number; onNavigate: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        id="mobile-gnb-tabpanel"
        role="tabpanel"
        aria-labelledby={`mobile-gnb-tab-${activeTab}`}
        className="min-h-0 flex-1 overflow-y-auto bg-white"
        data-scroll-lock-allow
      >
        <div className="bg-[#F6F6F6] px-5 py-4 text-[var(--otz-color-text-secondary)]">
          <ul className="m-0 grid list-none grid-cols-2 gap-x-0 p-0">
            {getMobileGnbDrawerItems(activeTab).map((label) => {
              const { mainId, subLabel } = resolveGnbDrawerNavigation(activeTab, label)
              const href = buildCategoryPlpPath(mainId, subLabel)
              return (
                <li key={label} className="py-2">
                  <a
                    href={href}
                    className="block text-[14px] font-normal leading-[1.2] tracking-[-0.02em] text-[#666666]"
                    onClick={(event) => {
                      event.preventDefault()
                      onNavigate()
                      navigateCategoryPlp(mainId, subLabel)
                    }}
                  >
                    {label}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
        <div className="bg-white px-5 pb-6 pt-6">
          <p className="mb-4 text-[14px] font-medium uppercase leading-[1.4] tracking-[-0.02em] text-[#1A1A1A]">
            MORE
          </p>
          <MoreTiles />
          <div className="mt-7 overflow-hidden rounded-[10px] border border-[#ECECEC] bg-white">
            <EditorialLinks />
          </div>
        </div>
      </div>
    </div>
  )
}

function MoreTiles() {
  return (
    <div className="grid grid-cols-2 gap-[10px]">
      <a href="#" className="block overflow-hidden bg-white">
        <img
          src={imgMoHamburgerBrand}
          alt="브랜드"
          className="block aspect-[168/210] w-full object-cover"
          draggable={false}
        />
        <span className="mt-3 block text-[14px] font-normal leading-[1.2] tracking-[-0.02em] text-[#6B6B6B]">
          브랜드 스토리
        </span>
      </a>
      <a href="#" className="block overflow-hidden bg-white">
        <img
          src={imgMembership}
          alt="멤버십"
          className="block aspect-[168/210] w-full object-cover"
          draggable={false}
        />
        <span className="mt-3 block text-[14px] font-normal leading-[1.2] tracking-[-0.02em] text-[#6B6B6B]">
          멤버십 혜택
        </span>
      </a>
    </div>
  )
}

function EditorialLinks() {
  return (
    <div className="grid grid-cols-2 divide-x divide-[#ECECEC] rounded-tl-[10px] rounded-tr-[10px] rounded-br-[10px]">
      <a
        href="#"
        className="flex h-14 items-center justify-center bg-[var(--otz-color-surface-subtle)] text-[14px] font-normal uppercase leading-[1.4] tracking-[-0.02em] text-[rgba(102,102,102,1)] visited:text-[rgba(102,102,102,1)]"
      >
        Editorial
      </a>
      <a
        href="#"
        className="flex h-14 items-center justify-center bg-[var(--otz-color-surface-subtle)] text-[14px] font-normal uppercase leading-[1.4] tracking-[-0.02em] text-[rgba(102,102,102,1)] visited:text-[rgba(102,102,102,1)]"
      >
        Archive
      </a>
    </div>
  )
}
