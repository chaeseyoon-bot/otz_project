import { useEffect, useMemo, useRef, useState } from 'react'
import { EditorialPcDetailContent } from '../../components/organisms/EditorialPcDetailContent'
import { EditorialCollectionPcDetailContent } from '../../components/organisms/EditorialCollectionPcDetailContent'
import { useEditorialConfigContext } from '../../contexts/EditorialConfigContext'
import { uploadAdminBannerImage } from '../../lib/adminBannerUpload'
import {
  createEmptyEditorialEvent,
  createDefaultEditorialConfig,
  createDefaultCollectionBlocks,
  EDITORIAL_CATEGORY_OPTIONS,
  EDITORIAL_SECTION_LABELS,
  EDITORIAL_SECTION_TYPES,
  editorialCategoryLabel,
  getEditorialImageBlockLabel,
  getNextEditorialId,
  loadAdminEditorialConfig,
  MAX_EDITORIAL_EVENTS,
  sortEditorialEventsNewestFirst,
} from '../../lib/adminEditorialConfig'
import { resolveEditorialEventDetail } from '../../lib/editorialContentResolver'
import { getEditorialDetailPath } from '../../lib/editorialRoutes'
import { navigateSpa } from '../../lib/spaNavigation'
import { FormRow, ImageUploader, TextInput } from './editorialAdminPrimitives'
import { EditorialSectionFields } from './editorialSectionFields'
import { EditorialHeroInfoAdminFields, EditorialHeroGalleryAdminFields } from './EditorialHeroInfoAdminFields'
import { EditorialStandaloneProductsAdminFields } from './EditorialStandaloneProductsAdminFields'
import { EditorialCatalogProductGridsAdminFields } from './EditorialCatalogProductGridsAdminFields'

function SectionBlock({ title, children }) {
  return (
    <section className="border-b border-lightGray pb-4 last:border-b-0">
      <h3 className="m-0 mb-2.5 text-[12px] font-semibold text-dark">{title}</h3>
      {children}
    </section>
  )
}

function SectionOrderToolbar({ index, total, onMoveUp, onMoveDown, onRemove }) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        disabled={index === 0}
        className="rounded-sm border border-lightGray bg-white px-1.5 py-0.5 text-[10px] disabled:opacity-30"
        onClick={onMoveUp}
        aria-label="위로"
      >
        ↑
      </button>
      <button
        type="button"
        disabled={index >= total - 1}
        className="rounded-sm border border-lightGray bg-white px-1.5 py-0.5 text-[10px] disabled:opacity-30"
        onClick={onMoveDown}
        aria-label="아래로"
      >
        ↓
      </button>
      <button
        type="button"
        className="rounded-sm border border-lightGray bg-white px-1.5 py-0.5 text-[10px] text-subtleText"
        onClick={onRemove}
      >
        제거
      </button>
    </div>
  )
}

const PC_PREVIEW_WIDTH = 1400

function ScaledPcPreview({ children }) {
  const containerRef = useRef(null)
  const contentRef = useRef(null)
  const [frame, setFrame] = useState({ scale: 0.2, height: 120 })

  useEffect(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return undefined

    const update = () => {
      const width = container.clientWidth || 280
      const scale = width / PC_PREVIEW_WIDTH
      content.style.width = `${PC_PREVIEW_WIDTH}px`
      content.style.transform = `scale(${scale})`
      const visualHeight = Math.ceil(content.getBoundingClientRect().height)
      setFrame({
        scale,
        height: Math.max(120, visualHeight),
      })
    }

    update()
    const raf = window.requestAnimationFrame(update)
    const timer = window.setTimeout(update, 300)

    const observer = new ResizeObserver(update)
    observer.observe(container)
    observer.observe(content)

    content.querySelectorAll('img').forEach((img) => {
      if (!img.complete) img.addEventListener('load', update, { once: true })
    })

    return () => {
      window.cancelAnimationFrame(raf)
      window.clearTimeout(timer)
      observer.disconnect()
    }
  }, [children])

  return (
    <div
      ref={containerRef}
      style={{ height: frame.height }}
      className="relative w-full shrink-0 overflow-hidden bg-white"
    >
      <div
        ref={contentRef}
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: PC_PREVIEW_WIDTH,
          transform: `scale(${frame.scale})`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

function EditorialPreviewPanel({ event, config }) {
  const [detail, setDetail] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const previewConfig = useMemo(
    () => ({
      ...config,
      events: config.events.map((item) =>
        item.id === event?.id ? { ...item, enabled: true } : item,
      ),
    }),
    [config, event?.id],
  )

  useEffect(() => {
    if (!event?.id) {
      setDetail(null)
      return undefined
    }
    let cancelled = false
    setIsLoading(true)
    const timer = window.setTimeout(() => {
      resolveEditorialEventDetail(event.id, previewConfig)
        .then((resolved) => {
          if (!cancelled) setDetail(resolved ?? null)
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false)
        })
    }, 280)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [event, previewConfig])

  if (!event) return null

  return (
    <div className="w-full">
      <p className="m-0 text-[11px] font-medium text-dark">PC 미리보기</p>
      <p className="m-0 mt-0.5 text-[10px] text-subtleText">실시간 반영 · 1400px 기준 축소</p>
      <div className="mt-2 rounded-sm border border-lightGray bg-white shadow-sm">
        {isLoading && !detail ? (
          <p className="m-0 px-2 py-12 text-center text-[10px] text-subtleText">로딩…</p>
        ) : detail ? (
          <ScaledPcPreview key={`${event.id}-${detail.layout}-${detail.collectionBlocks?.length ?? 0}`}>
            {detail.layout === 'collection' ? (
              <EditorialCollectionPcDetailContent detail={detail} />
            ) : (
              <EditorialPcDetailContent detail={detail} />
            )}
          </ScaledPcPreview>
        ) : (
          <p className="m-0 px-2 py-12 text-center text-[10px] text-subtleText">미리보기 없음</p>
        )}
      </div>
    </div>
  )
}

export function EditorialManagement() {
  const { saveConfig } = useEditorialConfigContext()
  const [config, setConfig] = useState(createDefaultEditorialConfig)
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [uploadingKey, setUploadingKey] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [sectionToAdd, setSectionToAdd] = useState('')

  const sortedEvents = useMemo(
    () => sortEditorialEventsNewestFirst(config.events),
    [config.events],
  )

  useEffect(() => {
    const loaded = loadAdminEditorialConfig()
    setConfig(loaded)
    const first = sortEditorialEventsNewestFirst(loaded.events)[0]
    setSelectedEventId(first?.id ?? null)
  }, [])

  const selectedEvent = useMemo(
    () => config.events.find((event) => event.id === selectedEventId) ?? null,
    [config.events, selectedEventId],
  )

  const availableSections = useMemo(() => {
    if (!selectedEvent) return []
    return EDITORIAL_SECTION_TYPES.filter((type) => !selectedEvent.sectionOrder.includes(type))
  }, [selectedEvent])

  const showMessage = (text) => {
    setMessage(text)
    window.setTimeout(() => setMessage(null), 2800)
  }

  const updateSelectedEvent = (patch) => {
    if (!selectedEventId) return
    setConfig((prev) => ({
      ...prev,
      events: prev.events.map((event) =>
        event.id === selectedEventId ? { ...event, ...patch } : event,
      ),
    }))
  }

  const handleImageUpload = async (file, folder, onDone) => {
    if (!file) return
    setUploadingKey(folder)
    try {
      const result = await uploadAdminBannerImage(file, folder)
      onDone(result.url, result.fileName)
      showMessage('이미지가 업로드되었습니다.')
    } catch (error) {
      const detail = error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.'
      showMessage(detail)
    } finally {
      setUploadingKey(null)
    }
  }

  const handleSave = () => {
    if (!selectedEvent) return
    if (!selectedEvent.title.trim()) {
      showMessage('기획전 제목을 입력해 주세요.')
      return
    }
    if (!selectedEvent.thumbnailUrl?.trim()) {
      showMessage('리스트 썸네일 이미지를 등록해 주세요.')
      return
    }

    setIsSaving(true)
    try {
      const saved = saveConfig({ events: config.events })
      setConfig(saved)
      showMessage('기획전 설정이 저장되었습니다. 에디토리얼 화면에 반영됩니다.')
    } catch {
      showMessage('저장에 실패했습니다. 이미지 용량이 크면 다시 시도해 주세요.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddEvent = () => {
    const nextId = getNextEditorialId(config.events)
    if (!nextId) {
      showMessage(`기획전은 최대 ${MAX_EDITORIAL_EVENTS}개까지 등록할 수 있습니다.`)
      return
    }
    const index = Number(nextId.replace('editorial-', ''))
    const nextEvent = createEmptyEditorialEvent(index)
    setConfig((prev) => ({
      ...prev,
      events: sortEditorialEventsNewestFirst([nextEvent, ...prev.events]),
    }))
    setSelectedEventId(nextId)
  }

  const handleRemoveEvent = (eventId) => {
    const nextEvents = config.events.filter((event) => event.id !== eventId)
    setConfig((prev) => ({ ...prev, events: nextEvents }))
    if (selectedEventId === eventId) {
      setSelectedEventId(sortEditorialEventsNewestFirst(nextEvents)[0]?.id ?? null)
    }
    try {
      const saved = saveConfig({ events: nextEvents })
      setConfig(saved)
      showMessage('기획전이 삭제되었습니다.')
    } catch {
      showMessage('삭제 저장에 실패했습니다.')
    }
  }

  const moveSection = (index, direction) => {
    if (!selectedEvent) return
    const next = [...selectedEvent.sectionOrder]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    updateSelectedEvent({ sectionOrder: next })
  }

  const removeSection = (sectionType) => {
    if (!selectedEvent) return
    updateSelectedEvent({
      sectionOrder: selectedEvent.sectionOrder.filter((type) => type !== sectionType),
    })
  }

  const addSection = (sectionType) => {
    if (!selectedEvent || !sectionType) return
    if (selectedEvent.sectionOrder.includes(sectionType)) return
    updateSelectedEvent({ sectionOrder: [...selectedEvent.sectionOrder, sectionType] })
  }

  const updateLookbookSlot = (pairKey, slotIndex, patch) => {
    if (!selectedEvent) return
    const pair = [...selectedEvent[pairKey]]
    pair[slotIndex] = { ...pair[slotIndex], ...patch }
    updateSelectedEvent({ [pairKey]: pair })
  }

  const updateProductIds = (sectionKey, slotIndex, productId) => {
    if (!selectedEvent) return
    const section = selectedEvent[sectionKey]
    const nextIds = [...section.productIds]
    nextIds[slotIndex] = productId
    updateSelectedEvent({ [sectionKey]: { ...section, productIds: nextIds } })
  }

  const updateTabProductIds = (tabIndex, slotIndex, productId) => {
    if (!selectedEvent) return
    const nextTabs = selectedEvent.productTabs.map((tab, index) => {
      if (index !== tabIndex) return tab
      const nextIds = [...tab.productIds]
      nextIds[slotIndex] = productId
      return { ...tab, productIds: nextIds }
    })
    updateSelectedEvent({ productTabs: nextTabs })
  }

  const isCatalogCategory =
    selectedEvent?.category === 'collection' || selectedEvent?.category === 'collabo'

  if (!selectedEvent) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {message ? (
          <div className="fixed bottom-6 right-6 z-50 rounded-sm border border-dark bg-dark px-4 py-3 text-bodySmall text-white shadow-lg">
            {message}
          </div>
        ) : null}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-lightGray px-5 py-3">
          <div>
            <h2 className="m-0 text-[18px] font-bold text-dark">기획전 관리</h2>
            <p className="m-0 text-[11px] text-subtleText">기획전을 한 개씩 추가하면 최신 항목이 목록 맨 위에 노출됩니다.</p>
          </div>
          <button
            type="button"
            className="rounded-sm border border-dark bg-dark px-3 py-1.5 text-[12px] text-white"
            onClick={handleAddEvent}
          >
            + 기획전 추가
          </button>
        </header>
        <div className="flex flex-1 items-center justify-center p-8">
          <p className="m-0 text-center text-bodyRegular2 text-subtleText">
            등록된 기획전이 없습니다.
            <br />
            상단의 「+ 기획전 추가」로 첫 기획전을 등록해 주세요.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {message ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-sm border border-dark bg-dark px-4 py-3 text-bodySmall text-white shadow-lg">
          {message}
        </div>
      ) : null}

      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-lightGray px-5 py-3">
        <div>
          <h2 className="m-0 text-[18px] font-bold text-dark">기획전 관리</h2>
          <p className="m-0 text-[11px] text-subtleText">리스트·상세 콘텐츠 등록 (MO/PC 공용)</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-sm border border-lightGray bg-white px-2.5 py-1.5 text-[11px] text-dark"
            onClick={() => navigateSpa(getEditorialDetailPath(selectedEvent.id))}
          >
            상세 보기
          </button>
          <button
            type="button"
            disabled={isSaving}
            className="rounded-sm border-0 bg-dark px-3 py-1.5 text-[12px] text-white disabled:opacity-50"
            onClick={handleSave}
          >
            {isSaving ? '저장 중…' : '저장'}
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[168px_minmax(0,1fr)] overflow-hidden">
        <aside className="flex min-h-0 flex-col border-r border-lightGray bg-light3 px-2 py-3">
          <div className="flex items-center justify-between gap-1">
            <p className="m-0 text-[11px] font-semibold text-dark">목록</p>
            <button
              type="button"
              className="rounded-sm border border-lightGray bg-white px-1.5 py-0.5 text-[10px] text-dark"
              onClick={handleAddEvent}
            >
              +추가
            </button>
          </div>
          <p className="m-0 mt-1 text-[9px] leading-snug text-subtleText">최신 등록이 위 · editorial-01이 가장 오래됨</p>
          <ul className="m-0 mt-2 min-h-0 flex-1 list-none space-y-0.5 overflow-y-auto p-0">
            {sortedEvents.map((event) => {
              const isActive = event.id === selectedEventId
              return (
                <li key={event.id}>
                  <div className="flex items-stretch gap-0.5">
                    <button
                      type="button"
                      className={`flex min-w-0 flex-1 flex-col rounded-sm border-0 px-2 py-1.5 text-left ${
                        isActive ? 'bg-dark text-white' : 'bg-white text-dark hover:bg-light'
                      }`}
                      onClick={() => setSelectedEventId(event.id)}
                    >
                      <span className="text-[10px] opacity-70">{event.id}</span>
                      <span className="truncate text-[11px]">{event.title || '제목 없음'}</span>
                      {!event.enabled ? <span className="text-[9px] opacity-60">OFF</span> : null}
                    </button>
                    <button
                      type="button"
                      className="shrink-0 rounded-sm border border-lightGray bg-white px-1 text-[10px] text-subtleText hover:text-dark"
                      onClick={() => handleRemoveEvent(event.id)}
                      aria-label={`${event.id} 삭제`}
                    >
                      ×
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </aside>

        <div className="grid min-h-0 min-w-0 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="flex min-h-0 flex-col items-start justify-start overflow-y-auto overscroll-contain px-5 py-4">
            <div className="mx-auto w-full max-w-2xl space-y-5 pb-6">
              <SectionBlock title="기본 정보">
                <div className="space-y-2.5">
                  <FormRow label="ID">
                    <TextInput value={selectedEvent.id} onChange={() => {}} placeholder="" />
                  </FormRow>
                  <FormRow label="제목" hint="목록 카드 제목">
                    <TextInput
                      value={selectedEvent.title}
                      onChange={(value) => updateSelectedEvent({ title: value })}
                      placeholder="스페셜 이슈 | 26SS ..."
                    />
                  </FormRow>
                  <FormRow label="기간">
                    <TextInput
                      value={selectedEvent.period}
                      onChange={(value) => updateSelectedEvent({ period: value })}
                      placeholder="2026.02.02 - 2026.02.15"
                    />
                  </FormRow>
                  <FormRow label="카테고리">
                    <select
                      value={selectedEvent.category}
                      onChange={(e) => {
                        const category = e.target.value
                        const categoryLabel = editorialCategoryLabel(category)
                        const patch = { category, categoryLabel }
                        if (
                          (category === 'collection' || category === 'collabo') &&
                          !selectedEvent.collectionBlocks?.length
                        ) {
                          patch.collectionBlocks = createDefaultCollectionBlocks()
                        }
                        updateSelectedEvent(patch)
                      }}
                      className="h-8 w-full rounded-sm border border-lightGray bg-white px-2 text-[13px]"
                    >
                      {EDITORIAL_CATEGORY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </FormRow>
                  <FormRow label="노출">
                    <label className="flex h-8 items-center gap-2 text-[13px]">
                      <input
                        type="checkbox"
                        checked={selectedEvent.enabled}
                        onChange={(e) => updateSelectedEvent({ enabled: e.target.checked })}
                      />
                      쇼핑몰 노출
                    </label>
                  </FormRow>
                  <ImageUploader
                    label="썸네일"
                    spec="MO/PC 공용"
                    aspectClass="aspect-[4/3] w-[88px]"
                    previewUrl={selectedEvent.thumbnailUrl}
                    fileName={selectedEvent.thumbnailFileName}
                    isUploading={uploadingKey === `editorial-thumb-${selectedEvent.id}`}
                    onSelect={(e) => {
                      const file = e.target.files?.[0]
                      handleImageUpload(file, `editorial-thumb-${selectedEvent.id}`, (url, fileName) => {
                        updateSelectedEvent({ thumbnailUrl: url, thumbnailFileName: fileName })
                      })
                      e.target.value = ''
                    }}
                    onClear={() => updateSelectedEvent({ thumbnailUrl: null, thumbnailFileName: null })}
                  />
                  <button
                    type="button"
                    className="rounded-sm border border-red-200 bg-white px-2 py-1 text-[11px] text-red-600"
                    onClick={() => handleRemoveEvent(selectedEvent.id)}
                  >
                    기획전 삭제
                  </button>
                </div>
              </SectionBlock>

              <SectionBlock title="히어로 배너">
                <ImageUploader
                  label="통이미지"
                  spec={isCatalogCategory ? 'MO/PC 공용 · 전체 너비 히어로' : 'MO/PC 공용 · Figma 1400×637'}
                  aspectClass="aspect-[1400/637] w-[140px]"
                  previewUrl={selectedEvent.mainBannerUrl}
                  fileName={selectedEvent.mainBannerFileName}
                  isUploading={uploadingKey === `editorial-hero-${selectedEvent.id}`}
                  onSelect={(e) => {
                    const file = e.target.files?.[0]
                    handleImageUpload(file, `editorial-hero-${selectedEvent.id}`, (url, fileName) => {
                      updateSelectedEvent({ mainBannerUrl: url, mainBannerFileName: fileName })
                    })
                    e.target.value = ''
                  }}
                  onClear={() => updateSelectedEvent({ mainBannerUrl: null, mainBannerFileName: null })}
                />
              </SectionBlock>

              <SectionBlock title="히어로 하단 정보">
                <EditorialHeroInfoAdminFields event={selectedEvent} onUpdate={updateSelectedEvent} />
              </SectionBlock>

              <SectionBlock title="갤러리 이미지 등록">
                <EditorialHeroGalleryAdminFields
                  event={selectedEvent}
                  onUpdate={updateSelectedEvent}
                  uploadingKey={uploadingKey}
                  onImageUpload={handleImageUpload}
                />
              </SectionBlock>

              {isCatalogCategory ? (
                <SectionBlock title="단독상품 등록">
                  <EditorialStandaloneProductsAdminFields event={selectedEvent} onUpdate={updateSelectedEvent} />
                </SectionBlock>
              ) : null}

              {isCatalogCategory ? (
                <SectionBlock title="카탈로그 상품 그리드 (SHOES / BAG & ACC)">
                  <EditorialCatalogProductGridsAdminFields event={selectedEvent} onUpdate={updateSelectedEvent} />
                </SectionBlock>
              ) : null}

              {!isCatalogCategory ? (
              <SectionBlock title="콘텐츠 영역">
                <p className="m-0 mb-2 text-[10px] text-subtleText">
                  히어로 아래 영역입니다. 순서 변경·추가·제거가 가능합니다. (COLLABO / KEYWORD)
                </p>
                <div className="space-y-2.5">
                  {selectedEvent.sectionOrder.map((sectionType, index) => (
                    <div key={sectionType} className="rounded-sm border border-lightGray bg-light3 p-2.5">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="m-0 text-[11px] font-semibold text-dark">
                          {getEditorialImageBlockLabel(selectedEvent.sectionOrder, sectionType)}
                        </p>
                        <SectionOrderToolbar
                          index={index}
                          total={selectedEvent.sectionOrder.length}
                          onMoveUp={() => moveSection(index, -1)}
                          onMoveDown={() => moveSection(index, 1)}
                          onRemove={() => removeSection(sectionType)}
                        />
                      </div>
                      <EditorialSectionFields
                        sectionType={sectionType}
                        imageLabel={getEditorialImageBlockLabel(selectedEvent.sectionOrder, sectionType)}
                        event={selectedEvent}
                        uploadingKey={uploadingKey}
                        onUpdate={updateSelectedEvent}
                        onImageUpload={handleImageUpload}
                        onLookbookSlot={updateLookbookSlot}
                        onProductIds={updateProductIds}
                        onTabProductIds={updateTabProductIds}
                      />
                    </div>
                  ))}
                  {availableSections.length ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={sectionToAdd}
                        onChange={(e) => setSectionToAdd(e.target.value)}
                        className="h-8 min-w-[140px] rounded-sm border border-lightGray bg-white px-2 text-[12px]"
                      >
                        <option value="">영역 선택</option>
                        {availableSections.map((type) => (
                          <option key={type} value={type}>
                            {EDITORIAL_SECTION_LABELS[type]}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={!sectionToAdd}
                        className="rounded-sm border border-dashed border-lightGray bg-white px-2 py-1 text-[11px] disabled:opacity-40"
                        onClick={() => {
                          addSection(sectionToAdd)
                          setSectionToAdd('')
                        }}
                      >
                        + 영역 추가
                      </button>
                    </div>
                  ) : (
                    <p className="m-0 text-[10px] text-subtleText">모든 영역이 추가되었습니다.</p>
                  )}
                </div>
              </SectionBlock>
              ) : null}

            </div>
          </div>

          <div className="hidden min-h-0 overflow-y-auto overscroll-contain border-l border-lightGray bg-light3 px-4 py-4 lg:block">
            <EditorialPreviewPanel event={selectedEvent} config={config} />
          </div>
        </div>
      </div>
    </div>
  )
}
