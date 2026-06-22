import {
  CATALOG_PRODUCT_GRID_COLUMNS,
  CATALOG_PRODUCT_GRID_MAX_ROWS,
  CATALOG_PRODUCT_GRID_MIN_ROWS,
  createDefaultCatalogProductGrids,
  normalizeCatalogProductGridIds,
} from '../../lib/adminEditorialConfig'
import { FormRow, ProductSlotPicker, TextInput } from './editorialAdminPrimitives'

const GRID_LABELS = {
  shoes: 'SHOES',
  bagacc: 'BAG & ACC',
}

function getCatalogGridRowCount(productIds) {
  const slotCount = normalizeCatalogProductGridIds(productIds).length
  return Math.max(CATALOG_PRODUCT_GRID_MIN_ROWS, slotCount / CATALOG_PRODUCT_GRID_COLUMNS)
}

export function EditorialCatalogProductGridsAdminFields({ event, onUpdate }) {
  const grids =
    event.catalogProductGrids?.length === 2
      ? event.catalogProductGrids.map((grid) => ({
          ...grid,
          productIds: normalizeCatalogProductGridIds(grid.productIds),
        }))
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

    const rowCount = Math.max(
      getCatalogGridRowCount(grid.productIds),
      Math.ceil((slotIndex + 1) / CATALOG_PRODUCT_GRID_COLUMNS),
    )
    const slotLength = rowCount * CATALOG_PRODUCT_GRID_COLUMNS
    const nextIds = normalizeCatalogProductGridIds(grid.productIds).slice(0, slotLength)
    while (nextIds.length < slotLength) nextIds.push(null)

    if (productId != null) {
      for (let i = 0; i < nextIds.length; i += 1) {
        if (i !== slotIndex && nextIds[i] === productId) nextIds[i] = null
      }
    }

    nextIds[slotIndex] = productId
    updateGrid(gridId, { productIds: nextIds })
  }

  const addRow = (gridId) => {
    const grid = grids.find((item) => item.id === gridId)
    if (!grid) return

    const rowCount = getCatalogGridRowCount(grid.productIds)
    if (rowCount >= CATALOG_PRODUCT_GRID_MAX_ROWS) return

    updateGrid(gridId, {
      productIds: [
        ...grid.productIds,
        ...Array.from({ length: CATALOG_PRODUCT_GRID_COLUMNS }, () => null),
      ],
    })
  }

  const removeLastRow = (gridId) => {
    const grid = grids.find((item) => item.id === gridId)
    if (!grid) return

    const rowCount = getCatalogGridRowCount(grid.productIds)
    if (rowCount <= CATALOG_PRODUCT_GRID_MIN_ROWS) return

    updateGrid(gridId, {
      productIds: grid.productIds.slice(0, -CATALOG_PRODUCT_GRID_COLUMNS),
    })
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="m-0 text-[10px] text-subtleText">
          Figma 151:4481 — 단독상품 아래 SHOES / BAG &amp; ACC 6열 그리드 · 열당{' '}
          {CATALOG_PRODUCT_GRID_COLUMNS}개 · 최대 {CATALOG_PRODUCT_GRID_MAX_ROWS}열
        </p>
      </div>

      <div className="space-y-2.5">
        {grids.map((grid) => {
          const productIds = normalizeCatalogProductGridIds(grid.productIds)
          const rowCount = getCatalogGridRowCount(productIds)
          const canAddRow = rowCount < CATALOG_PRODUCT_GRID_MAX_ROWS
          const canRemoveRow = rowCount > CATALOG_PRODUCT_GRID_MIN_ROWS

          return (
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
                <FormRow label="상품 슬롯" alignTop stacked>
                  <div className="space-y-3">
                    {Array.from({ length: rowCount }, (_, rowIndex) => (
                      <div key={`${grid.id}-row-${rowIndex}`}>
                        <p className="m-0 mb-1.5 text-[10px] font-medium text-subtleText">
                          {rowIndex + 1}열
                        </p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                          {Array.from({ length: CATALOG_PRODUCT_GRID_COLUMNS }, (_, colIndex) => {
                            const slotIndex = rowIndex * CATALOG_PRODUCT_GRID_COLUMNS + colIndex
                            return (
                              <ProductSlotPicker
                                key={`${grid.id}-slot-${slotIndex}`}
                                slotLabel={`${String(slotIndex + 1).padStart(2, '0')}`}
                                productId={productIds[slotIndex] ?? null}
                                onAssign={(id) => updateProductId(grid.id, slotIndex, id)}
                                onClear={() => updateProductId(grid.id, slotIndex, null)}
                              />
                            )
                          })}
                        </div>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-2">
                      {canAddRow ? (
                        <button
                          type="button"
                          className="rounded-sm border border-dashed border-lightGray bg-white px-2.5 py-1 text-[11px] text-dark hover:border-dark"
                          onClick={() => addRow(grid.id)}
                        >
                          열 추가 (+{CATALOG_PRODUCT_GRID_COLUMNS})
                        </button>
                      ) : null}
                      {canRemoveRow ? (
                        <button
                          type="button"
                          className="rounded-sm border border-lightGray bg-white px-2.5 py-1 text-[11px] text-subtleText hover:border-dark hover:text-dark"
                          onClick={() => removeLastRow(grid.id)}
                        >
                          마지막 열 삭제
                        </button>
                      ) : null}
                    </div>
                  </div>
                </FormRow>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
