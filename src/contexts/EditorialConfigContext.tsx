import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  EDITORIAL_CONFIG_UPDATED_EVENT,
  loadAdminEditorialConfig,
  saveAdminEditorialConfig,
  type AdminEditorialConfig,
} from '../lib/adminEditorialConfig'

type SaveInput = Omit<AdminEditorialConfig, 'version' | 'updatedAt'>

interface EditorialConfigContextValue {
  config: AdminEditorialConfig
  saveConfig: (input: SaveInput) => AdminEditorialConfig
  reloadConfig: () => void
}

const EditorialConfigContext = createContext<EditorialConfigContextValue | null>(null)

export function EditorialConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState(loadAdminEditorialConfig)

  const reloadConfig = useCallback(() => {
    setConfig(loadAdminEditorialConfig())
  }, [])

  const saveConfig = useCallback((input: SaveInput) => {
    const next = saveAdminEditorialConfig(input)
    setConfig(next)
    return next
  }, [])

  useEffect(() => {
    const refresh = () => reloadConfig()

    window.addEventListener(EDITORIAL_CONFIG_UPDATED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)

    return () => {
      window.removeEventListener(EDITORIAL_CONFIG_UPDATED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [reloadConfig])

  const value = useMemo(
    () => ({
      config,
      saveConfig,
      reloadConfig,
    }),
    [config, saveConfig, reloadConfig],
  )

  return <EditorialConfigContext.Provider value={value}>{children}</EditorialConfigContext.Provider>
}

export function useEditorialConfigContext(): EditorialConfigContextValue {
  const context = useContext(EditorialConfigContext)
  if (!context) {
    throw new Error('useEditorialConfigContext must be used within EditorialConfigProvider')
  }
  return context
}
