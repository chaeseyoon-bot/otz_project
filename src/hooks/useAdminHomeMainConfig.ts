import { useHomeMainConfigContext } from '../contexts/HomeMainConfigContext'
import type { AdminHomeMainConfig } from '../lib/adminHomeMainConfig'

/** Shared admin-saved home main config (localStorage + App-level context). */
export function useAdminHomeMainConfig(): AdminHomeMainConfig {
  return useHomeMainConfigContext().config
}
