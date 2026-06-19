import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  EDITORIAL_CONFIG_UPDATED_EVENT,
  getEffectiveEditorialConfig,
  saveAdminEditorialConfig,
  type AdminEditorialConfig,
} from '../lib/adminEditorialConfig'
import { hydrateEditorialConfig } from '../lib/editorialConfigApi'

type SaveInput = Omit<AdminEditorialConfig, 'version' | 'updatedAt'>

interface EditorialConfigContextValue {
  config: AdminEditorialConfig
  saveConfig: (input: SaveInput) => AdminEditorialConfig
  reloadConfig: () => void
}

const EditorialConfigContext = createContext<EditorialConfigContextValue | null>(null)

export function EditorialConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState(getEffectiveEditorialConfig)

  const reloadConfig = useCallback(() => {
    setConfig(getEffectiveEditorialConfig())
  }, [])

  const saveConfig = useCallback((input: SaveInput) => {
    const next = saveAdminEditorialConfig(input)
    setConfig(next)
    return next
  }, [])

  useEffect(() => {
    void hydrateEditorialConfig().then(setConfig)
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
