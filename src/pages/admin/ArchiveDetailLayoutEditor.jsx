import { inferRowLayout, ARCHIVE_ROW_LAYOUT_OPTIONS } from '../../lib/archiveDetailLayout'

function LayoutPreview({ row, introPreview }) {
  const layout = inferRowLayout(row.columnsPerRow, row.rowLayout)
  const images = row.images

  if (layout === 'full') {
    return (
      <div className="flex justify-center">
        <div className="h-14 w-10 overflow-hidden rounded-sm bg-light2">
          {images[0]?.imageUrl ? (
            <img src={images[0].imageUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-[8px] text-subtleText">1</div>
          )}
        </div>
      </div>
    )
  }

  if (layout === 'intro-split') {
    return (
      <div className="flex gap-1.5">
        <div className="h-14 w-11 shrink-0 overflow-hidden rounded-sm bg-light2">
          {images[0]?.imageUrl ? (
            <img src={images[0].imageUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-[8px] text-subtleText">IMG</div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 rounded-sm bg-light3 px-1.5 py-1 text-right">
          <p className="m-0 truncate text-[8px] font-bold text-dark">
            {introPreview?.heading || '소개 제목'}
          </p>
          <p className="m-0 line-clamp-2 text-[7px] leading-snug text-subtleText">
            {introPreview?.body || '소개 본문'}
          </p>
        </div>
      </div>
    )
  }

  if (layout === 'asymmetric-small-left') {
    return (
      <div className="flex items-center gap-1.5">
        <div className="h-14 w-8 shrink-0 overflow-hidden rounded-sm bg-light2">
          {images[0]?.imageUrl ? (
            <img src={images[0].imageUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-[8px] text-subtleText">S</div>
          )}
        </div>
        <div className="h-14 min-w-0 flex-1 overflow-hidden rounded-sm bg-light2">
          {images[1]?.imageUrl ? (
            <img src={images[1].imageUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-[8px] text-subtleText">L</div>
          )}
        </div>
      </div>
    )
  }

  if (layout === 'asymmetric-small-right') {
    return (
      <div className="flex items-center gap-1.5">
        <div className="h-14 min-w-0 flex-1 overflow-hidden rounded-sm bg-light2">
          {images[0]?.imageUrl ? (
            <img src={images[0].imageUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-[8px] text-subtleText">L</div>
          )}
        </div>
        <div className="h-14 w-8 shrink-0 overflow-hidden rounded-sm bg-light2">
          {images[1]?.imageUrl ? (
            <img src={images[1].imageUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-[8px] text-subtleText">S</div>
          )}
        </div>
      </div>
    )
  }

  const cols = layout === 'equal-3' ? 3 : 2
  return (
    <div className={`grid gap-1.5 ${cols === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {Array.from({ length: cols }, (_, index) => (
        <div key={index} className="h-14 overflow-hidden rounded-sm bg-light2">
          {images[index]?.imageUrl ? (
            <img src={images[index].imageUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-[8px] text-subtleText">
              {index + 1}
            </div>
          )}
        </div>
      ))}
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

export function ArchiveDetailLayoutEditor({
  rows,
  introPreview,
  onLayoutChange,
  onMoveUp,
  onMoveDown,
  onRemove,
}) {
  return (
    <div className="space-y-2">
      {rows.map((row, rowIndex) => {
        const layout = inferRowLayout(row.columnsPerRow, row.rowLayout)

        return (
          <article
            key={row.id}
            className="rounded-sm border border-lightGray bg-white p-2.5 shadow-[0_1px_0_rgba(0,0,0,0.03)]"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="m-0 text-[11px] font-semibold text-dark">{rowIndex + 1}행</p>
                <select
                  value={layout}
                  onChange={(e) => onLayoutChange(rowIndex, e.target.value)}
                  className="rounded-sm border border-lightGray bg-white px-2 py-1 text-[10px] text-dark"
                >
                  {ARCHIVE_ROW_LAYOUT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <RowToolbar
                index={rowIndex}
                total={rows.length}
                onMoveUp={() => onMoveUp(rowIndex)}
                onMoveDown={() => onMoveDown(rowIndex)}
                onRemove={() => onRemove(rowIndex)}
              />
            </div>

            <div className="mx-auto max-w-[240px] rounded-sm border border-dashed border-lightGray bg-light3 px-2 py-1.5">
              <LayoutPreview row={row} introPreview={introPreview} />
            </div>
          </article>
        )
      })}
    </div>
  )
}
