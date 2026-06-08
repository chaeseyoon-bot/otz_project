import { useMemo, useState } from 'react'
import { CouponNoticePopup } from '../components/atoms/CouponNoticePopup'
import { CartEmptyState } from '../components/cart/CartEmptyState'
import { CartMobileBottomSheet } from '../components/cart/CartMobileBottomSheet'
import { CartOptionChangeSheet } from '../components/cart/CartOptionChangeSheet'
import { CartMobileBulkHeader } from '../components/cart/CartMobileBulkHeader'
import { MobileCartItemCard } from '../components/cart/MobileCartItemCard'
import { CartGuideSection } from '../components/cart/CartSummarySections'
import { CartMobileHeader } from '../components/organisms/CartMobileHeader'
import { useCart } from '../contexts/CartContext'

/** Figma 51:2244 / 42:1943 — mobile cart page. */
export function MobileCartPage() {
  const { items, toggleItemSelected, removeItem, selectAll, removeSelected, updateItem } = useCart()
  const [summaryExpanded, setSummaryExpanded] = useState(false)
  const [optionChangeItemId, setOptionChangeItemId] = useState<string | null>(null)
  const [couponNoticeOpen, setCouponNoticeOpen] = useState(false)

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
    <main className="bg-white lg:hidden">
      <CartMobileHeader />

      <div className={`px-[15px] pt-4 ${isEmpty ? 'pb-10' : 'pb-[280px]'}`}>
        {isEmpty ? (
          <>
            <CartEmptyState />
            <div className="mt-10">
              <CartGuideSection />
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-6">
            <CartMobileBulkHeader
              selectedCount={totals.selectedCount}
              totalCount={items.length}
              allSelected={allSelected}
              onToggleSelectAll={() => selectAll(!allSelected)}
              onRemoveSelected={removeSelected}
            />

            <div className="flex flex-col gap-6">
              {items.map((item) => (
                <MobileCartItemCard
                  key={item.id}
                  item={item}
                  onToggleSelected={() => toggleItemSelected(item.id)}
                  onRemove={() => removeItem(item.id)}
                  onOptionChange={() => setOptionChangeItemId(item.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {!isEmpty ? (
        <CartMobileBottomSheet
          selectedQuantity={totals.selectedQuantity}
          productTotal={totals.productTotal}
          shippingTotal={totals.shippingTotal}
          discountTotal={totals.discountTotal}
          paymentTotal={totals.paymentTotal}
          expanded={summaryExpanded}
          onToggleExpanded={() => setSummaryExpanded((open) => !open)}
          onClaimAllCoupons={() => setCouponNoticeOpen(true)}
        />
      ) : null}

      <CartOptionChangeSheet
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
      <CouponNoticePopup
        open={couponNoticeOpen}
        message="전체 쿠폰을 다운받았습니다."
        onClose={() => setCouponNoticeOpen(false)}
      />
    </main>
  )
}
