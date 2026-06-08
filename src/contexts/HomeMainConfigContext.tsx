import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  HOME_MAIN_CONFIG_UPDATED_EVENT,
  loadAdminHomeMainConfig,
  saveAdminHomeMainConfig,
  type AdminHomeMainConfig,
} from '../lib/adminHomeMainConfig'

type SaveInput = Omit<AdminHomeMainConfig, 'version' | 'updatedAt'>

interface HomeMainConfigContextValue {
  config: AdminHomeMainConfig
  saveConfig: (input: SaveInput) => AdminHomeMainConfig
  reloadConfig: () => void
}

const HomeMainConfigContext = createContext<HomeMainConfigContextValue | null>(null)

export function HomeMainConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState(loadAdminHomeMainConfig)

  const reloadConfig = useCallback(() => {
    setConfig(loadAdminHomeMainConfig())
  }, [])

  const saveConfig = useCallback((input: SaveInput) => {
    const next = saveAdminHomeMainConfig(input)
    setConfig(next)
    return next
  }, [])

  useEffect(() => {
    const refresh = () => reloadConfig()

    window.addEventListener(HOME_MAIN_CONFIG_UPDATED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)

    return () => {
      window.removeEventListener(HOME_MAIN_CONFIG_UPDATED_EVENT, refresh)
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

  return <HomeMainConfigContext.Provider value={value}>{children}</HomeMainConfigContext.Provider>
}

export function useHomeMainConfigContext(): HomeMainConfigContextValue {
  const context = useContext(HomeMainConfigContext)
  if (!context) {
    throw new Error('useHomeMainConfigContext must be used within HomeMainConfigProvider')
  }
  return context
}
