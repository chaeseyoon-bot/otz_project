import { useCallback, useEffect, useState, type RefObject } from 'react'

export function usePdpOptionGate(
  selectedSize: string | null,
  soldOutSizes: Set<string>,
  sizeSectionRef?: RefObject<HTMLElement | null>,
) {
  const [optionRequiredOpen, setOptionRequiredOpen] = useState(false)
  const [optionRequiredHintActive, setOptionRequiredHintActive] = useState(false)

  useEffect(() => {
    if (selectedSize && !soldOutSizes.has(selectedSize)) {
      setOptionRequiredHintActive(false)
    }
  }, [selectedSize, soldOutSizes])

  const ensureOptionSelected = useCallback(() => {
    if (selectedSize && !soldOutSizes.has(selectedSize)) return true
    setOptionRequiredOpen(true)
    return false
  }, [selectedSize, soldOutSizes])

  const closeOptionRequiredPopup = useCallback(() => {
    setOptionRequiredOpen(false)
    setOptionRequiredHintActive(true)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = sizeSectionRef?.current
        if (!target) return
        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        target.focus({ preventScroll: true })
      })
    })
  }, [sizeSectionRef])

  return {
    optionRequiredOpen,
    optionRequiredHintActive,
    closeOptionRequiredPopup,
    ensureOptionSelected,
  }
}
