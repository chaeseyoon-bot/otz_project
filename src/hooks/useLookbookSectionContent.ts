import { useMemo } from 'react'
import { resolveLookbookSection, type ResolvedLookbookSection } from '../lib/homeMainContentResolver'
import { useAdminHomeMainConfig } from './useAdminHomeMainConfig'

export function useLookbookSectionContent(): ResolvedLookbookSection {
  const { lookbookSection, updatedAt } = useAdminHomeMainConfig()

  return useMemo(
    () => resolveLookbookSection(lookbookSection),
    [lookbookSection, updatedAt],
  )
}
