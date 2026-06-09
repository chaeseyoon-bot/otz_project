import { useEffect, useState } from 'react'
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
import { useHomeMainConfigContext } from '../../contexts/HomeMainConfigContext'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { uploadAdminBannerImage } from '../../lib/adminBannerUpload'
import {
  createDefaultHomeMainConfig,
  createEmptyPlanningBanner,
  createEmptyQuickMenuSlot,
  loadAdminHomeMainConfig,
} from '../../lib/adminHomeMainConfig'
import { navigateSpa } from '../../lib/spaNavigation'

const SECTION_TABS = [
  { id: 'main', label: '1. 메인 배너' },
  { id: 'quick', label: '2. 퀵메뉴' },
  { id: 'brand', label: '3. 브랜드 배너' },
  { id: 'series', label: '4. 시리즈 배너' },
  { id: 'planning', label: '5. 기획전 배너' },
]

const MAX_PLANNING_BANNERS = 5

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

function TextInput({ value, onChange, placeholder, multiline = false }) {
  const cls =
    'rounded-sm border border-lightGray bg-white px-3 py-2 text-bodyRegular2 text-dark outline-none focus:border-dark'
  if (multiline) {
    return (
      <textarea
        rows={4}
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
            <p className="m-0 text-[12px] font-extrabold leading-tight">
              {slide.title || '메인 타이틀'}
            </p>
            <p className="m-0 mt-2 text-[14px] leading-relaxed opacity-90">
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
    setIsSaving(true)
    try {
      const saved = saveConfig({
        mainBanners: config.mainBanners,
        quickMenuSlots: config.quickMenuSlots,
        brandBanner: config.brandBanner,
        seriesBanners: config.seriesBanners,
        planningBanners: config.planningBanners,
      })
      setConfig(saved)
      showMessage('홈메인 설정이 저장되었습니다. 홈 화면에 반영됩니다.')
      window.setTimeout(() => navigateSpa('/'), 600)
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
          홈 화면 8개 섹션 중 메인·퀵메뉴·브랜드·시리즈·기획전 배너를 관리합니다. (룩북은 추후 추가)
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
        <span className="flex items-center rounded-sm border border-dashed border-lightGray bg-light px-4 py-2 text-bodySmall text-subtleText">
          6–8. 룩북 (준비중)
        </span>
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

      <div className="mt-8 flex justify-end border-t border-lightGray pt-6">
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          className="rounded-sm border border-dark bg-dark px-6 py-3 text-bodyRegular2 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSaving ? '저장 중…' : '설정 저장'}
        </button>
      </div>
    </div>
  )
}
