import {
  CATALOG_PRODUCT_GRID_SLOTS,
  createDefaultCatalogProductGrids,
} from '../../lib/adminEditorialConfig'
import { FormRow, ProductSlotPicker, TextInput } from './editorialAdminPrimitives'

const GRID_LABELS = {
  shoes: 'SHOES',
  bagacc: 'BAG & ACC',
}

export function EditorialCatalogProductGridsAdminFields({ event, onUpdate }) {
  const grids =
    event.catalogProductGrids?.length === 2
      ? event.catalogProductGrids
      : createDefaultCatalogProductGrids()

  const updateGrid = (gridId, patch) => {
    onUpdate({
      catalogProductGrids: grids.map((grid) =>
        grid.id === gridId ? { ...grid, ...patch } : grid,
      ),
    })
  }

  const updateProductId = (gridId, slotIndex, productId) => {
    const grid = grids.find((item) => item.id === gridId)
    if (!grid) return

    const nextIds = [...grid.productIds]
    nextIds[slotIndex] = productId
    updateGrid(gridId, { productIds: nextIds })
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="m-0 text-[11px] font-semibold text-dark">카탈로그 상품 그리드</p>
        <p className="m-0 mt-0.5 text-[10px] text-subtleText">
          Figma 151:4481 — 단독상품 아래 SHOES / BAG &amp; ACC 5열 그리드 · 섹션당 최대{' '}
          {CATALOG_PRODUCT_GRID_SLOTS}개
        </p>
      </div>

      <div className="space-y-2.5">
        {grids.map((grid) => (
          <div key={grid.id} className="rounded-sm border border-lightGray bg-light3 p-2.5">
            <p className="m-0 mb-2 text-[11px] font-semibold text-dark">
              {GRID_LABELS[grid.id] ?? grid.id}
            </p>
            <div className="space-y-2.5">
              <FormRow label="섹션 제목">
                <TextInput
                  value={grid.title}
                  onChange={(value) => updateGrid(grid.id, { title: value })}
                  placeholder={GRID_LABELS[grid.id]}
                />
              </FormRow>
              <FormRow label="상품 슬롯" alignTop>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                  {Array.from({ length: CATALOG_PRODUCT_GRID_SLOTS }, (_, slotIndex) => (
                    <ProductSlotPicker
                      key={`${grid.id}-slot-${slotIndex}`}
                      slotLabel={`${String(slotIndex + 1).padStart(2, '0')}`}
                      productId={grid.productIds[slotIndex] ?? null}
                      onAssign={(id) => updateProductId(grid.id, slotIndex, id)}
                      onClear={() => updateProductId(grid.id, slotIndex, null)}
                    />
                  ))}
                </div>
              </FormRow>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
