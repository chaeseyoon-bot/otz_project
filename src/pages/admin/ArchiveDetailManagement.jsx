import { useEffect, useMemo, useRef, useState } from 'react'
import { uploadArchiveLookbookImages } from '../../lib/archiveImageUpload'
import {
  countCompleteRows,
  countDetailImages,
  createEmptyAdminArchiveDetailRow,
  createEmptyAdminArchiveImageRef,
  createEmptyAdminArchiveLookbookEntry,
  createDefaultAdminArchiveDetailConfig,
  getNextArchiveLookbookId,
  loadAdminArchiveDetailConfig,
  MAX_ARCHIVE_DETAIL_IMAGES,
  MAX_ARCHIVE_DETAIL_ROWS,
  MAX_ARCHIVE_LOOKBOOKS,
  saveAdminArchiveDetailConfig,
  sortArchiveLookbooksNewestFirst,
} from '../../lib/adminArchiveDetailConfig'
import { getArchiveDetailPath } from '../../lib/archiveRoutes'
import { hydrateArchiveDetailConfig, loadArchiveDetailConfigFromSupabase, upsertArchiveDetailConfig } from '../../lib/archiveLookbooksApi'
import { navigateSpa } from '../../lib/spaNavigation'
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

function ColumnSelector({ value, onChange, compact = false }) {
  const options = [
    { value: 1, label: '1개' },
    { value: 2, label: '2개' },
    { value: 3, label: '3개' },
  ]

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            className={`rounded-sm border transition-colors ${
              compact ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-[12px]'
            } ${
              isActive
                ? 'border-dark bg-dark text-white'
                : 'border-lightGray bg-white text-dark hover:border-dark'
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function RowToolbar({ index, total, onMoveUp, onMoveDown, onRemove }) {
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
        행 제거
      </button>
    </div>
  )
}

function DetailRowEditor({
  row,
  rowIndex,
  totalRows,
  onColumnsChange,
  onImageChange,
  onClearImage,
  onMoveUp,
  onMoveDown,
  onRemove,
}) {
  const slotLabels = ['왼쪽', '가운데', '오른쪽']

  return (
    <article className="rounded-sm border border-lightGray bg-light3 p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="m-0 text-[11px] font-semibold text-dark">{rowIndex + 1}행</p>
          <ColumnSelector value={row.columnsPerRow} onChange={onColumnsChange} compact />
        </div>
        <RowToolbar
          index={rowIndex}
          total={totalRows}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onRemove={onRemove}
        />
      </div>

      <div
        className={`grid gap-3 ${
          row.columnsPerRow === 1
            ? 'grid-cols-1'
            : row.columnsPerRow === 2
              ? 'grid-cols-1 sm:grid-cols-2'
              : 'grid-cols-1 sm:grid-cols-3'
        }`}
      >
        {Array.from({ length: row.columnsPerRow }, (_, slotIndex) => (
          <ImageUploader
            key={`${row.id}-slot-${slotIndex}`}
            label={row.columnsPerRow === 1 ? '이미지' : slotLabels[slotIndex]}
            spec="MO/PC 공용"
            aspectClass="aspect-[3/4] w-full max-w-[140px]"
            previewUrl={row.images[slotIndex]?.imageUrl}
            fileName={row.images[slotIndex]?.imageFileName}
            onSelect={(e) => {
              const file = e.target.files?.[0]
              onImageChange(slotIndex, file)
              e.target.value = ''
            }}
            onClear={() => onClearImage(slotIndex)}
          />
        ))}
      </div>
    </article>
  )
}

export function ArchiveDetailManagement() {
  const [config, setConfig] = useState(createDefaultAdminArchiveDetailConfig)
  const [selectedId, setSelectedId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState(null)
  /** Selected files waiting for upload on save — key: archive-thumb-* / archive-row-* */
  const pendingFilesRef = useRef(new Map())

  const sortedLookbooks = useMemo(
    () => sortArchiveLookbooksNewestFirst(config.lookbooks),
    [config.lookbooks],
  )

  useEffect(() => {
    void (async () => {
      const remote = await loadArchiveDetailConfigFromSupabase()
      const local = loadAdminArchiveDetailConfig()

      let next = remote ?? local

      if (!remote && local.lookbooks.length > 0) {
        const migrated = await upsertArchiveDetailConfig(local)
        if (!migrated.ok) {
          console.warn('[ArchiveDetailManagement] Supabase migrate failed:', migrated.message)
        }
      }

      await hydrateArchiveDetailConfig()
      next = remote ?? local
      setConfig(next)
      const first = sortArchiveLookbooksNewestFirst(next.lookbooks)[0]
      setSelectedId(first?.id ?? null)
    })()
  }, [])

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

  const handleImageSelect = (file, storageKey, previousUrl, onDone) => {
    if (!file) return
    revokeBlobUrl(previousUrl)
    pendingFilesRef.current.set(storageKey, file)
    const previewUrl = URL.createObjectURL(file)
    onDone(previewUrl, file.name)
    showMessage('이미지가 선택되었습니다. 저장 시 스토리지에 업로드됩니다.')
  }

  const clearPendingImage = (storageKey, previousUrl, onDone) => {
    pendingFilesRef.current.delete(storageKey)
    revokeBlobUrl(previousUrl)
    onDone()
  }

  const addDetailRow = (columnsPerRow = 1) => {
    if (!selected) return
    if (selected.detailRows.length >= MAX_ARCHIVE_DETAIL_ROWS) {
      showMessage(`상세 행은 최대 ${MAX_ARCHIVE_DETAIL_ROWS}개까지 추가할 수 있습니다.`)
      return
    }
    if (countDetailImages(selected.detailRows) >= MAX_ARCHIVE_DETAIL_IMAGES) {
      showMessage(`상세 이미지는 최대 ${MAX_ARCHIVE_DETAIL_IMAGES}장까지 등록할 수 있습니다.`)
      return
    }
    updateDetailRows([...selected.detailRows, createEmptyAdminArchiveDetailRow(columnsPerRow)])
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

  const setRowColumns = (rowIndex, columnsPerRow) => {
    if (!selected) return
    const next = selected.detailRows.map((row, index) => {
      if (index !== rowIndex) return row
      const images = [...row.images]
      while (images.length < columnsPerRow) images.push(createEmptyAdminArchiveImageRef())
      return { ...row, columnsPerRow, images: images.slice(0, columnsPerRow) }
    })
    updateDetailRows(next)
  }

  const setRowImage = (rowIndex, slotIndex, patch) => {
    if (!selected) return
    const next = selected.detailRows.map((row, index) => {
      if (index !== rowIndex) return row
      const images = row.images.map((image, imageIndex) =>
        imageIndex === slotIndex ? { ...image, ...patch } : image,
      )
      return { ...row, images }
    })
    updateDetailRows(next)
  }

  const handleRowImageSelect = (rowIndex, slotIndex, file) => {
    if (!selected || !file) return
    if (countDetailImages(selected.detailRows) >= MAX_ARCHIVE_DETAIL_IMAGES && !selected.detailRows[rowIndex]?.images[slotIndex]?.imageUrl) {
      showMessage(`상세 이미지는 최대 ${MAX_ARCHIVE_DETAIL_IMAGES}장까지 등록할 수 있습니다.`)
      return
    }

    const storageKey = `archive-row-${selected.id}-${rowIndex}-${slotIndex}`
    const previousUrl = selected.detailRows[rowIndex]?.images[slotIndex]?.imageUrl
    handleImageSelect(file, storageKey, previousUrl, (url, fileName) =>
      setRowImage(rowIndex, slotIndex, { imageUrl: url, imageFileName: fileName }),
    )
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
      const filled = row.images.slice(0, row.columnsPerRow).filter((img) => img.imageUrl?.trim()).length
      return filled > 0 && filled < row.columnsPerRow
    })
    if (hasIncomplete) {
      showMessage('이미지가 비어 있는 행이 있습니다. 행을 완성하거나 제거해 주세요.')
      return
    }

    setIsSaving(true)
    try {
      const normalizedEntry = {
        ...selected,
        detailRows: selected.detailRows.filter((row) =>
          row.images.slice(0, row.columnsPerRow).every((img) => img.imageUrl?.trim()),
        ),
      }

      showMessage('이미지를 스토리지에 업로드하는 중…')
      const uploadedEntry = await uploadArchiveLookbookImages(normalizedEntry, pendingFilesRef.current)

      const lookbooks = config.lookbooks.map((item) =>
        item.id === selected.id ? uploadedEntry : item,
      )
      const saved = saveAdminArchiveDetailConfig({ lookbooks })
      setConfig(saved)

      const supabaseResult = await upsertArchiveDetailConfig(saved)
      if (!supabaseResult.ok) {
        showMessage(supabaseResult.message)
        return
      }

      showMessage('아카이브가 저장되었습니다. 이미지·설정이 스토리지에 반영됩니다.')
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
      lookbooks: sortArchiveLookbooksNewestFirst([nextEntry, ...prev.lookbooks]),
    }))
    setSelectedId(nextId)
  }

  const handleRemoveLookbook = async (lookbookId) => {
    const nextLookbooks = config.lookbooks.filter((item) => item.id !== lookbookId)
    setConfig((prev) => ({ ...prev, lookbooks: nextLookbooks }))
    if (selectedId === lookbookId) {
      setSelectedId(sortArchiveLookbooksNewestFirst(nextLookbooks)[0]?.id ?? null)
    }
    try {
      const saved = saveAdminArchiveDetailConfig({ lookbooks: nextLookbooks })
      const supabaseResult = await upsertArchiveDetailConfig(saved)
      if (!supabaseResult.ok) {
        showMessage(supabaseResult.message)
        return
      }
      showMessage('룩북이 삭제되었습니다.')
    } catch {
      showMessage('삭제 저장에 실패했습니다.')
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
            <p className="m-0 text-[11px] text-subtleText">룩북을 한 개씩 추가하면 최신 항목이 목록 맨 위에 노출됩니다.</p>
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
            MO/PC 동일 이미지 · 행마다 1~3열 자유 배치 · 저장 시 스토리지 업로드
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
          <p className="m-0 mt-1 text-[9px] leading-snug text-subtleText">최신 등록이 위 · archive-01이 가장 오래됨</p>
          <ul className="m-0 mt-2 min-h-0 flex-1 list-none space-y-0.5 overflow-y-auto p-0">
            {sortedLookbooks.map((item) => {
              const isActive = item.id === selectedId
              const hasThumb = Boolean(item.thumbnailUrl)
              const rows = item.detailRows.length
              const images = countDetailImages(item.detailRows)
              return (
                <li key={item.id}>
                  <div className="flex items-stretch gap-0.5">
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
          <div className="mx-auto w-full max-w-2xl space-y-5 pb-6">
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

            <SectionBlock title="리스트 썸네일" hint="아카이브 목록 카드에 노출됩니다. 선택 후 저장 시 스토리지에 업로드됩니다.">
              <ImageUploader
                label="썸네일"
                spec="MO/PC 공용 · 1장"
                aspectClass="aspect-[4/5] w-[100px]"
                previewUrl={selected.thumbnailUrl}
                fileName={selected.thumbnailFileName}
                onSelect={(e) => {
                  const file = e.target.files?.[0]
                  const storageKey = `archive-thumb-${selected.id}`
                  handleImageSelect(file, storageKey, selected.thumbnailUrl, (url, fileName) => {
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
              hint="첫 번째 이미지 행 바로 아래에 노출됩니다. (MO/PC 공용 · Figma 131:3486)"
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
              title="상세 이미지 (행 단위)"
              hint="행마다 1~3개를 선택해 배치하세요. 저장 시 스토리지에 업로드됩니다."
            >
              {selected.detailRows.length ? (
                <div className="space-y-3">
                  {selected.detailRows.map((row, rowIndex) => (
                    <DetailRowEditor
                      key={row.id}
                      row={row}
                      rowIndex={rowIndex}
                      totalRows={selected.detailRows.length}
                      onColumnsChange={(columns) => setRowColumns(rowIndex, columns)}
                      onImageChange={(slotIndex, file) => handleRowImageSelect(rowIndex, slotIndex, file)}
                      onClearImage={(slotIndex) => {
                        const storageKey = `archive-row-${selected.id}-${rowIndex}-${slotIndex}`
                        const previousUrl = selected.detailRows[rowIndex]?.images[slotIndex]?.imageUrl
                        clearPendingImage(storageKey, previousUrl, () =>
                          setRowImage(rowIndex, slotIndex, { imageUrl: null, imageFileName: null }),
                        )
                      }}
                      onMoveUp={() => moveDetailRow(rowIndex, -1)}
                      onMoveDown={() => moveDetailRow(rowIndex, 1)}
                      onRemove={() => removeDetailRow(rowIndex)}
                    />
                  ))}
                </div>
              ) : (
                <p className="m-0 rounded-sm border border-dashed border-lightGray bg-light3 px-3 py-6 text-center text-[11px] text-subtleText">
                  등록된 행이 없습니다. 아래에서 행을 추가해 주세요.
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isSaving}
                  className="rounded-sm border border-dashed border-lightGray bg-white px-3 py-2 text-[12px] text-dark hover:border-dark disabled:opacity-40"
                  onClick={() => addDetailRow(1)}
                >
                  + 1열 행 추가
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  className="rounded-sm border border-dashed border-lightGray bg-white px-3 py-2 text-[12px] text-dark hover:border-dark disabled:opacity-40"
                  onClick={() => addDetailRow(2)}
                >
                  + 2열 행 추가
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  className="rounded-sm border border-dashed border-lightGray bg-white px-3 py-2 text-[12px] text-dark hover:border-dark disabled:opacity-40"
                  onClick={() => addDetailRow(3)}
                >
                  + 3열 행 추가
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
