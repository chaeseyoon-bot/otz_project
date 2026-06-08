import { useMemo, useState } from 'react'
import { CartCheckbox } from '../components/cart/CartItemCard'
import { CartOptionChangePopup } from '../components/cart/CartOptionChangePopup'
import { PcCartBulkHeader } from '../components/cart/PcCartBulkHeader'
import { PcCartItemCard } from '../components/cart/PcCartItemCard'
import { PcCartOrderSidebar } from '../components/cart/PcCartOrderSidebar'
import { useCart } from '../contexts/CartContext'

/** Figma 51:2455 — PC cart page. */
export function PcCartPage() {
  const { items, toggleItemSelected, removeItem, selectAll, removeSelected, updateItem } = useCart()
  const [optionChangeItemId, setOptionChangeItemId] = useState<string | null>(null)

  const totals = useMemo(() => {
    const selectedItems = items.filter((item) => item.selected)
    const productTotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shippingTotal = selectedItems.reduce(
      (sum, item) =>
        sum + item.shippingBreakdown.shippingFee + item.shippingBreakdown.regionalShippingFee,
      0,
    )
    const discountTotal = selectedItems.reduce(
      (sum, item) => sum + (item.discountAmount ?? 0) * item.quantity,
      0,
    )
    const selectedQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0)

    return {
      productTotal,
      shippingTotal,
      discountTotal,
      paymentTotal: productTotal + shippingTotal - discountTotal,
      selectedQuantity,
      selectedCount: selectedItems.length,
    }
  }, [items])

  const isEmpty = items.length === 0
  const allSelected = items.length > 0 && items.every((item) => item.selected)
  const optionChangeItem = items.find((item) => item.id === optionChangeItemId) ?? null

  return (
    <main className="hidden bg-white lg:block">
      <div className="mx-auto max-w-[1400px] px-0 pb-20 pt-16">
        <h1 className="m-0 text-center text-h1 text-black">장바구니</h1>

        <div className="mt-16 flex items-start gap-[60px]">
          <div className="flex min-w-0 flex-1 flex-col gap-0">
            {isEmpty ? (
              <div className="flex flex-col items-center py-16">
                <p className="m-0 text-bodyRegular2 text-subtleText">장바구니에 담긴 상품이 없습니다.</p>
              </div>
            ) : (
              <>
                <PcCartBulkHeader
                  selectedCount={totals.selectedCount}
                  totalCount={items.length}
                  allSelected={allSelected}
                  onToggleSelectAll={() => selectAll(!allSelected)}
                  onRemoveSelected={removeSelected}
                />

                <div className="flex flex-col">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-6 border-b border-lightGray">
                      <div className="flex shrink-0 items-start pt-6">
                        <CartCheckbox
                          size="lg"
                          checked={item.selected}
                          onChange={() => toggleItemSelected(item.id)}
                          ariaLabel={`${item.productName} 선택`}
                        />
                      </div>
                      <PcCartItemCard
                        item={item}
                        onRemove={() => removeItem(item.id)}
                        onOptionChange={() => setOptionChangeItemId(item.id)}
                      />
                    </div>
                  ))}
                </div>

                <p className="m-0 pt-6 text-bodySmall text-subtleText">
                  * 장바구니에 담긴 상품은 30일 동안 보관됩니다. 더 오래 상품을 보관하시려면 관심 상품에
                  담아주시기 바랍니다.
                </p>
              </>
            )}
          </div>

          {!isEmpty ? (
            <PcCartOrderSidebar
              selectedQuantity={totals.selectedQuantity}
              productTotal={totals.productTotal}
              shippingTotal={totals.shippingTotal}
              discountTotal={totals.discountTotal}
              paymentTotal={totals.paymentTotal}
            />
          ) : null}
        </div>
      </div>

      <CartOptionChangePopup
        open={optionChangeItemId !== null}
        item={optionChangeItem}
        onClose={() => setOptionChangeItemId(null)}
        onConfirm={(optionSize, quantity) => {
          if (optionChangeItemId) {
            updateItem(optionChangeItemId, {
              quantity,
              optionLabel: `[옵션 : ${optionSize}]`,
            })
          }
          setOptionChangeItemId(null)
        }}
      />
    </main>
  )
}
