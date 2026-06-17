import { useEffect, useMemo, useRef, useState } from 'react'
import {
  uploadArchiveImageBatch,
  uploadArchiveImageSlot,
  uploadArchiveLookbookImages,
} from '../../lib/archiveImageUpload'
import {
  countCompleteRows,
  countDetailImages,
  createDetailRowWithLayout,
  createEmptyAdminArchiveLookbookEntry,
  createDefaultAdminArchiveDetailConfig,
  getNextArchiveLookbookId,
  MAX_ARCHIVE_DETAIL_IMAGES,
  MAX_ARCHIVE_DETAIL_ROWS,
  MAX_ARCHIVE_LOOKBOOKS,
  normalizeRowLayoutFields,
  saveAdminArchiveDetailConfig,
} from '../../lib/adminArchiveDetailConfig'
import { getRowSlotCount, isArchiveRowLayout, planFigmaAutoLayoutRows } from '../../lib/archiveDetailLayout'
import { getArchiveDetailPath } from '../../lib/archiveRoutes'
import {
  hydrateArchiveDetailConfig,
  loadArchiveDetailConfigFromSupabase,
  upsertArchiveDetailConfig,
} from '../../lib/archiveLookbooksApi'
import { navigateSpa } from '../../lib/spaNavigation'
import { ArchiveDetailLayoutEditor } from './ArchiveDetailLayoutEditor'
import { ImageUploader, TextInput } from './editorialAdminPrimitives'

function SectionBlock({ title, hint, children }) {
  return (
    <section className="border-b border-lightGray pb-5 last:border-b-0">
      <h3 className="m-0 text-[12px] font-semibold text-dark">{title}</h3>
      {hint ? <p className="m-0 mt-1 text-[10px] text-subtleText">{hint}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  )
}

function rowStorageKey(lookbookId, rowId, slotIndex) {
  return `archive-row-${lookbookId}-${rowId}-${slotIndex}`
}

export function ArchiveDetailManagement() {
  const [config, setConfig] = useState(createDefaultAdminArchiveDetailConfig)
  const [selectedId, setSelectedId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingKey, setUploadingKey] = useState(null)
  const [bulkUploading, setBulkUploading] = useState(false)
  const [bulkUploadProgress, setBulkUploadProgress] = useState({ done: 0, total: 0 })
  const [message, setMessage] = useState(null)
  const pendingFilesRef = useRef(new Map())
  const bulkInputRef = useRef(null)

  const lookbooks = config.lookbooks

  useEffect(() => {
    void (async () => {
      const hydrated = await hydrateArchiveDetailConfig()
      setConfig(hydrated)
      setSelectedId(hydrated.lookbooks[0]?.id ?? null)
    })()
  }, [])

  useEffect(() => {
    const warnOnLeave = (event) => {
      if (uploadingKey || isSaving || bulkUploading) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', warnOnLeave)
    return () => window.removeEventListener('beforeunload', warnOnLeave)
  }, [uploadingKey, isSaving, bulkUploading])

  const selected = useMemo(
    () => config.lookbooks.find((item) => item.id === selectedId) ?? null,
    [config.lookbooks, selectedId],
  )

  const showMessage = (text) => {
    setMessage(text)
    window.setTimeout(() => setMessage(null), 2800)
  }

  const updateSelected = (patch) => {
    if (!selectedId) return
    setConfig((prev) => ({
      ...prev,
      lookbooks: prev.lookbooks.map((item) => (item.id === selectedId ? { ...item, ...patch } : item)),
    }))
  }

  const updateDetailRows = (nextRows) => {
    updateSelected({ detailRows: nextRows })
  }

  const revokeBlobUrl = (url) => {
    if (typeof url === 'string' && url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  }

  const handleImageUpload = async (file, storageKey, previousUrl, onDone) => {
    if (!file) return
    revokeBlobUrl(previousUrl)
    setUploadingKey(storageKey)
    try {
      const uploaded = await uploadArchiveImageSlot(file, storageKey)
      onDone(uploaded.url, uploaded.fileName)
      showMessage('이미지가 서버에 저장되었습니다.')
    } catch (error) {
      const detail = error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.'
      showMessage(detail)
    } finally {
      setUploadingKey(null)
    }
  }

  const clearPendingImage = (storageKey, previousUrl, onDone) => {
    pendingFilesRef.current.delete(storageKey)
    revokeBlobUrl(previousUrl)
    onDone()
  }

  const addDetailRow = (layout = 'full') => {
    if (!selected) return
    if (selected.detailRows.length >= MAX_ARCHIVE_DETAIL_ROWS) {
      showMessage(`상세 행은 최대 ${MAX_ARCHIVE_DETAIL_ROWS}개까지 추가할 수 있습니다.`)
      return
    }
    if (countDetailImages(selected.detailRows) >= MAX_ARCHIVE_DETAIL_IMAGES) {
      showMessage(`상세 이미지는 최대 ${MAX_ARCHIVE_DETAIL_IMAGES}장까지 등록할 수 있습니다.`)
      return
    }
    updateDetailRows([...selected.detailRows, createDetailRowWithLayout(layout)])
  }

  const removeDetailRow = (rowIndex) => {
    if (!selected) return
    updateDetailRows(selected.detailRows.filter((_, index) => index !== rowIndex))
  }

  const moveDetailRow = (rowIndex, direction) => {
    if (!selected) return
    const target = rowIndex + direction
    if (target < 0 || target >= selected.detailRows.length) return
    const next = [...selected.detailRows]
    ;[next[rowIndex], next[target]] = [next[target], next[rowIndex]]
    updateDetailRows(next)
  }

  const setRowLayout = (rowIndex, nextLayout) => {
    if (!selected || !isArchiveRowLayout(nextLayout)) return
    const next = selected.detailRows.map((row, index) => {
      if (index !== rowIndex) return row
      return normalizeRowLayoutFields({ ...row, rowLayout: nextLayout })
    })
    updateDetailRows(next)
  }

  const handleBulkImagesSelect = async (event) => {
    const fileList = event.target.files
    if (!selected || !fileList?.length) return

    const files = Array.from(fileList).filter((file) => file.type.startsWith('image/'))
    event.target.value = ''
    if (!files.length) {
      showMessage('이미지 파일을 선택해 주세요.')
      return
    }

    const currentImages = countDetailImages(selected.detailRows)
    const remainingImages = MAX_ARCHIVE_DETAIL_IMAGES - currentImages
    if (files.length > remainingImages) {
      showMessage(`상세 이미지는 최대 ${MAX_ARCHIVE_DETAIL_IMAGES}장까지 등록할 수 있습니다. (남은 ${remainingImages}장)`)
      return
    }

    const replaceExisting = selected.detailRows.length === 0
    const plan = planFigmaAutoLayoutRows(files.length, replaceExisting ? 0 : selected.detailRows.length)
    if (!replaceExisting && selected.detailRows.length + plan.length > MAX_ARCHIVE_DETAIL_ROWS) {
      showMessage(`상세 행은 최대 ${MAX_ARCHIVE_DETAIL_ROWS}개까지 추가할 수 있습니다.`)
      return
    }

    const stagedRows = plan.map(({ layout }) => createDetailRowWithLayout(layout))
    const uploadItems = []
    let fileIndex = 0
    for (const row of stagedRows) {
      const slotCount = getRowSlotCount(row)
      for (let slotIndex = 0; slotIndex < slotCount; slotIndex += 1) {
        uploadItems.push({
          file: files[fileIndex],
          storageKey: rowStorageKey(selected.id, row.id, slotIndex),
        })
        fileIndex += 1
      }
    }

    setBulkUploading(true)
    setBulkUploadProgress({ done: 0, total: files.length })

    try {
      const uploaded = await uploadArchiveImageBatch(
        uploadItems.map(({ file, storageKey }) => ({ file, storageKey })),
      )
      setBulkUploadProgress({ done: files.length, total: files.length })

      let uploadIndex = 0
      const newRows = stagedRows.map((row) => {
        const slotCount = getRowSlotCount(row)
        const images = Array.from({ length: slotCount }, () => {
          const result = uploaded[uploadIndex]
          uploadIndex += 1
          return { imageUrl: result.url, imageFileName: result.fileName }
        })
        return normalizeRowLayoutFields({ ...row, images })
      })

      const nextRows = replaceExisting ? newRows : [...selected.detailRows, ...newRows]
      updateDetailRows(nextRows)
      showMessage(
        replaceExisting
          ? `${files.length}장을 Figma 레이아웃에 배치했습니다. 행별 레이아웃·순서를 조절하세요.`
          : `${files.length}장을 추가 배치했습니다.`,
      )
    } catch (error) {
      const detail = error instanceof Error ? error.message : '일괄 업로드에 실패했습니다.'
      showMessage(detail)
    } finally {
      setBulkUploading(false)
      setBulkUploadProgress({ done: 0, total: 0 })
    }
  }

  const moveLookbook = async (lookbookId, direction) => {
    const index = config.lookbooks.findIndex((item) => item.id === lookbookId)
    const target = index + direction
    if (index < 0 || target < 0 || target >= config.lookbooks.length) return

    const nextLookbooks = [...config.lookbooks]
    ;[nextLookbooks[index], nextLookbooks[target]] = [nextLookbooks[target], nextLookbooks[index]]
    setConfig((prev) => ({ ...prev, lookbooks: nextLookbooks }))

    try {
      await persistConfigToServer(nextLookbooks)
      showMessage('목록 순서가 서버에 저장되었습니다.')
    } catch (error) {
      const detail = error instanceof Error ? error.message : '순서 저장에 실패했습니다.'
      showMessage(detail)
    }
  }

  const persistConfigToServer = async (lookbooks) => {
    const payload = saveAdminArchiveDetailConfig({ lookbooks })
    const result = await upsertArchiveDetailConfig(payload)
    if (!result.ok) {
      throw new Error(result.message)
    }

    const verified = await loadArchiveDetailConfigFromSupabase()
    if (!verified) {
      throw new Error('서버 저장 후 데이터 확인에 실패했습니다. 다시 시도해 주세요.')
    }

    setConfig(verified)
    return verified
  }

  const handleSave = async () => {
    if (!selected) return
    if (!selected.title.trim()) {
      showMessage('룩북 제목을 입력해 주세요.')
      return
    }
    if (!selected.thumbnailUrl?.trim()) {
      showMessage('리스트 썸네일 이미지를 등록해 주세요.')
      return
    }

    const completeRows = countCompleteRows(selected.detailRows)
    if (!completeRows) {
      showMessage('상세 이미지 행을 1개 이상 완성해 주세요. (행마다 이미지를 모두 등록)')
      return
    }

    const hasIncomplete = selected.detailRows.some((row) => {
      const slots = getRowSlotCount(row)
      const filled = row.images.slice(0, slots).filter((img) => img.imageUrl?.trim()).length
      return filled > 0 && filled < slots
    })
    if (hasIncomplete) {
      showMessage('이미지가 비어 있는 행이 있습니다. 행을 완성하거나 제거해 주세요.')
      return
    }

    setIsSaving(true)
    try {
      const normalizedEntry = {
        ...selected,
        detailRows: selected.detailRows
          .map((row) => normalizeRowLayoutFields(row))
          .filter((row) =>
            row.images.slice(0, getRowSlotCount(row)).every((img) => img.imageUrl?.trim()),
          ),
      }

      showMessage('서버에 저장하는 중…')
      const uploadedEntry = await uploadArchiveLookbookImages(normalizedEntry, pendingFilesRef.current)

      const lookbooks = config.lookbooks.map((item) =>
        item.id === selected.id ? uploadedEntry : item,
      )

      await persistConfigToServer(lookbooks)
      showMessage('서버에 저장되었습니다.')
    } catch (error) {
      const detail = error instanceof Error ? error.message : '저장에 실패했습니다.'
      showMessage(detail)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddLookbook = () => {
    const nextId = getNextArchiveLookbookId(config.lookbooks)
    if (!nextId) {
      showMessage(`룩북은 최대 ${MAX_ARCHIVE_LOOKBOOKS}개까지 등록할 수 있습니다.`)
      return
    }
    const nextEntry = createEmptyAdminArchiveLookbookEntry(nextId)
    setConfig((prev) => ({
      ...prev,
      lookbooks: [nextEntry, ...prev.lookbooks],
    }))
    setSelectedId(nextId)
  }

  const handleRemoveLookbook = async (lookbookId) => {
    const nextLookbooks = config.lookbooks.filter((item) => item.id !== lookbookId)
    setConfig((prev) => ({ ...prev, lookbooks: nextLookbooks }))
    if (selectedId === lookbookId) {
      setSelectedId(nextLookbooks[0]?.id ?? null)
    }
    try {
      await persistConfigToServer(nextLookbooks)
      showMessage('서버에 저장되었습니다.')
    } catch (error) {
      const detail = error instanceof Error ? error.message : '삭제 저장에 실패했습니다.'
      showMessage(detail)
    }
  }

  if (!selected) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {message ? (
          <div className="fixed bottom-6 right-6 z-50 rounded-sm border border-dark bg-dark px-4 py-3 text-bodySmall text-white shadow-lg">
            {message}
          </div>
        ) : null}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-lightGray px-5 py-3">
          <div>
            <h2 className="m-0 text-[18px] font-bold text-dark">아카이브 상세 관리</h2>
            <p className="m-0 text-[11px] text-subtleText">룩북 목록 순서가 아카이브 페이지 노출 순서입니다.</p>
          </div>
          <button
            type="button"
            className="rounded-sm border border-dark bg-dark px-3 py-1.5 text-[12px] text-white"
            onClick={handleAddLookbook}
          >
            + 룩북 추가
          </button>
        </header>
        <div className="flex flex-1 items-center justify-center p-8">
          <p className="m-0 text-center text-bodyRegular2 text-subtleText">
            등록된 룩북이 없습니다.
            <br />
            상단의 「+ 룩북 추가」로 첫 룩북을 등록해 주세요.
          </p>
        </div>
      </div>
    )
  }

  const imageCount = countDetailImages(selected.detailRows)
  const rowCount = selected.detailRows.length

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {message ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-sm border border-dark bg-dark px-4 py-3 text-bodySmall text-white shadow-lg">
          {message}
        </div>
      ) : null}

      <header className="sticky top-0 z-20 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-lightGray bg-white px-5 py-3">
        <div className="min-w-0">
          <h2 className="m-0 text-[18px] font-bold text-dark">아카이브 상세 관리</h2>
          <p className="m-0 text-[11px] text-subtleText">
            이미지는 선택 즉시 서버 업로드 · 제목·행 배치는 「저장」 시 Supabase에 반영
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-sm border border-lightGray bg-white px-2.5 py-1.5 text-[11px] text-dark"
            onClick={() => navigateSpa(getArchiveDetailPath(selected.id))}
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
            <p className="m-0 text-[11px] font-semibold text-dark">룩북 목록</p>
            <button
              type="button"
              className="rounded-sm border border-lightGray bg-white px-1.5 py-0.5 text-[10px] text-dark"
              onClick={handleAddLookbook}
            >
              +추가
            </button>
          </div>
          <p className="m-0 mt-1 text-[9px] leading-snug text-subtleText">위쪽이 먼저 노출 · ↑↓로 순서 변경</p>
          <ul className="m-0 mt-2 min-h-0 flex-1 list-none space-y-0.5 overflow-y-auto p-0">
            {lookbooks.map((item, listIndex) => {
              const isActive = item.id === selectedId
              const hasThumb = Boolean(item.thumbnailUrl)
              const rows = item.detailRows.length
              const images = countDetailImages(item.detailRows)
              return (
                <li key={item.id}>
                  <div className="flex items-stretch gap-0.5">
                    <div className="flex shrink-0 flex-col gap-0.5">
                      <button
                        type="button"
                        disabled={listIndex === 0 || isSaving || bulkUploading}
                        className="rounded-sm border border-lightGray bg-white px-1 py-0.5 text-[9px] leading-none disabled:opacity-30"
                        onClick={() => moveLookbook(item.id, -1)}
                        aria-label={`${item.id} 위로`}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={listIndex >= lookbooks.length - 1 || isSaving || bulkUploading}
                        className="rounded-sm border border-lightGray bg-white px-1 py-0.5 text-[9px] leading-none disabled:opacity-30"
                        onClick={() => moveLookbook(item.id, 1)}
                        aria-label={`${item.id} 아래로`}
                      >
                        ↓
                      </button>
                    </div>
                    <button
                      type="button"
                      className={`flex min-w-0 flex-1 flex-col rounded-sm border-0 px-2 py-1.5 text-left ${
                        isActive ? 'bg-dark text-white' : 'bg-white text-dark hover:bg-light'
                      }`}
                      onClick={() => setSelectedId(item.id)}
                    >
                      <span className="text-[10px] opacity-70">{item.id}</span>
                      <span className="truncate text-[11px]">
                        {item.title.trim() || '(제목 없음)'}
                      </span>
                      <span className="text-[10px] opacity-80">
                        {hasThumb ? '썸네일 ✓' : '썸네일 —'} · {rows}행 · {images}장
                      </span>
                    </button>
                    <button
                      type="button"
                      className="shrink-0 rounded-sm border border-lightGray bg-white px-1 text-[10px] text-subtleText hover:text-dark"
                      onClick={() => handleRemoveLookbook(item.id)}
                      aria-label={`${item.id} 삭제`}
                    >
                      ×
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </aside>

        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 py-4">
          <div className="mx-auto w-full max-w-4xl space-y-5 pb-6">
            <SectionBlock title="룩북 정보">
              <div className="max-w-md">
                <p className="m-0 mb-1 text-[11px] text-dark">제목</p>
                <TextInput
                  value={selected.title}
                  onChange={(value) => updateSelected({ title: value })}
                  placeholder="예: 26SS NEW EDITION"
                />
              </div>
            </SectionBlock>

            <SectionBlock title="리스트 썸네일" hint="선택 즉시 서버에 저장됩니다.">
              <ImageUploader
                label="썸네일"
                spec="MO/PC 공용 · 1장"
                aspectClass="aspect-[4/5] w-[100px]"
                previewUrl={selected.thumbnailUrl}
                fileName={selected.thumbnailFileName}
                isUploading={uploadingKey === `archive-thumb-${selected.id}`}
                onSelect={(e) => {
                  const file = e.target.files?.[0]
                  const storageKey = `archive-thumb-${selected.id}`
                  handleImageUpload(file, storageKey, selected.thumbnailUrl, (url, fileName) => {
                    updateSelected({ thumbnailUrl: url, thumbnailFileName: fileName })
                  })
                  e.target.value = ''
                }}
                onClear={() =>
                  clearPendingImage(`archive-thumb-${selected.id}`, selected.thumbnailUrl, () =>
                    updateSelected({ thumbnailUrl: null, thumbnailFileName: null }),
                  )
                }
              />
            </SectionBlock>

            <SectionBlock
              title="상세 소개 문구"
              hint="「이미지 + 소개」 행에서 PC 우측에 노출됩니다. MO에서는 첫 행 아래에 표시됩니다."
            >
              <div className="space-y-3">
                <div>
                  <p className="m-0 mb-1 text-[11px] text-dark">소개 제목</p>
                  <TextInput
                    value={selected.introHeading}
                    onChange={(value) => updateSelected({ introHeading: value })}
                    placeholder="예: ROMARY PETAL SHEER"
                  />
                </div>
                <div>
                  <p className="m-0 mb-1 text-[11px] text-dark">소개 본문</p>
                  <TextInput
                    value={selected.introBody}
                    onChange={(value) => updateSelected({ introBody: value })}
                    placeholder="예: 투명한 꽃잎처럼, 은은하게 빛이 스며드는 날의 무드를 담은…"
                    multiline
                    rows={6}
                  />
                </div>
              </div>
            </SectionBlock>

            <SectionBlock
              title="상세 레이아웃 (Figma 141-3059)"
              hint="여러 장 선택 시 Figma 패턴으로 자동 배치 · 행별 레이아웃·순서는 아래에서 수정"
            >
              <div className="mb-4 rounded-sm border border-dashed border-lightGray bg-white p-3">
                <p className="m-0 text-[11px] font-medium text-dark">이미지 일괄 등록</p>
                <p className="m-0 mt-1 text-[10px] text-subtleText">
                  Ctrl 또는 Shift를 누른 채 여러 장 선택 · 전체 → 이미지+소개 → 2분할 순 자동 배치
                </p>
                <input
                  ref={bulkInputRef}
                  id="archive-detail-bulk-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  multiple
                  className="sr-only"
                  onChange={handleBulkImagesSelect}
                />
                <label
                  htmlFor="archive-detail-bulk-upload"
                  className={`mt-3 inline-flex cursor-pointer rounded-sm border border-dark bg-dark px-3 py-2 text-[12px] text-white ${
                    isSaving || bulkUploading ? 'pointer-events-none opacity-50' : 'hover:opacity-90'
                  }`}
                >
                  {bulkUploading
                    ? `업로드 중… ${bulkUploadProgress.done}/${bulkUploadProgress.total}`
                    : '이미지 여러 장 선택'}
                </label>
              </div>

              {selected.detailRows.length ? (
                <ArchiveDetailLayoutEditor
                  rows={selected.detailRows}
                  introPreview={{
                    heading: selected.introHeading,
                    body: selected.introBody,
                  }}
                  onLayoutChange={(rowIndex, layout) => setRowLayout(rowIndex, layout)}
                  onMoveUp={(rowIndex) => moveDetailRow(rowIndex, -1)}
                  onMoveDown={(rowIndex) => moveDetailRow(rowIndex, 1)}
                  onRemove={(rowIndex) => removeDetailRow(rowIndex)}
                />
              ) : (
                <p className="m-0 rounded-sm border border-dashed border-lightGray bg-light3 px-3 py-6 text-center text-[11px] text-subtleText">
                  등록된 행이 없습니다. 아래에서 행을 추가해 주세요.
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isSaving || bulkUploading}
                  className="rounded-sm border border-dashed border-lightGray bg-white px-3 py-2 text-[12px] text-dark hover:border-dark disabled:opacity-40"
                  onClick={() => addDetailRow('full')}
                >
                  + 전체 행
                </button>
                <button
                  type="button"
                  disabled={isSaving || bulkUploading}
                  className="rounded-sm border border-dashed border-lightGray bg-white px-3 py-2 text-[12px] text-dark hover:border-dark disabled:opacity-40"
                  onClick={() => addDetailRow('intro-split')}
                >
                  + 소개 행
                </button>
                <button
                  type="button"
                  disabled={isSaving || bulkUploading}
                  className="rounded-sm border border-dashed border-lightGray bg-white px-3 py-2 text-[12px] text-dark hover:border-dark disabled:opacity-40"
                  onClick={() => addDetailRow('asymmetric-small-left')}
                >
                  + 2분할 행
                </button>
                <span className="text-[10px] text-subtleText">
                  {rowCount}행 · {imageCount}/{MAX_ARCHIVE_DETAIL_IMAGES}장
                </span>
              </div>
            </SectionBlock>
          </div>
        </div>
      </div>
    </div>
  )
}
