import {
  MAX_STANDALONE_PRODUCTS,
  createEmptyStandaloneProduct,
} from '../../lib/adminEditorialConfig'
import { FormRow, ProductSlotPicker, TextInput } from './editorialAdminPrimitives'

function StandaloneOrderToolbar({ index, total, onMoveUp, onMoveDown, onRemove }) {
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

export function EditorialStandaloneProductsAdminFields({ event, onUpdate }) {
  const items = event.standaloneProducts ?? []

  const updateItems = (nextItems) => {
    onUpdate({ standaloneProducts: nextItems })
  }

  const updateItem = (index, patch) => {
    updateItems(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)))
  }

  const moveItem = (index, direction) => {
    const next = [...items]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    updateItems(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="m-0 text-[11px] font-semibold text-dark">갤러리 하단 단독상품</p>
          <p className="m-0 mt-0.5 text-[10px] text-subtleText">
            Figma 144:4223 — 룩북 갤러리 바로 아래 노출 · 상품당 03·04·05·07·08 컷 자동 출력
          </p>
        </div>
        <button
          type="button"
          disabled={items.length >= MAX_STANDALONE_PRODUCTS}
          className="rounded-sm border border-dashed border-lightGray bg-white px-2 py-1 text-[10px] disabled:opacity-40"
          onClick={() => updateItems([...items, createEmptyStandaloneProduct()])}
        >
          + 단독상품
        </button>
      </div>

      {items.length ? (
        <div className="space-y-2.5">
          {items.map((item, index) => (
            <div key={item.id} className="rounded-sm border border-lightGray bg-light3 p-2.5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="m-0 text-[11px] font-semibold text-dark">
                  단독상품 {String(index + 1).padStart(2, '0')}
                </p>
                <StandaloneOrderToolbar
                  index={index}
                  total={items.length}
                  onMoveUp={() => moveItem(index, -1)}
                  onMoveDown={() => moveItem(index, 1)}
                  onRemove={() => updateItems(items.filter((_, itemIndex) => itemIndex !== index))}
                />
              </div>
              <div className="space-y-2.5">
                <FormRow label="섹션 제목">
                  <TextInput
                    value={item.title}
                    onChange={(value) => updateItem(index, { title: value })}
                    placeholder="ROMARY SNEAKERS"
                  />
                </FormRow>
                <FormRow label="부제목">
                  <TextInput
                    value={item.subtitle}
                    onChange={(value) => updateItem(index, { subtitle: value })}
                    placeholder="로마리 밴딩 SE 스니커즈 다크 브라운 FLOTGA1W59"
                  />
                </FormRow>
                <FormRow label="연결 상품">
                  <ProductSlotPicker
                    slotLabel="상품"
                    productId={item.productId}
                    onAssign={(id) => updateItem(index, { productId: id })}
                    onClear={() => updateItem(index, { productId: null })}
                  />
                </FormRow>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="m-0 rounded-sm border border-dashed border-lightGray bg-white px-3 py-4 text-center text-[10px] text-subtleText">
          등록된 단독상품이 없습니다. + 단독상품으로 갤러리 하단 영역을 추가하세요.
        </p>
      )}
    </div>
  )
}
