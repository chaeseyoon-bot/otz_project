import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  HOME_MAIN_CONFIG_UPDATED_EVENT,
  loadAdminHomeMainConfig,
  saveAdminHomeMainConfig,
  type AdminHomeMainConfig,
} from '../lib/adminHomeMainConfig'
import { loadHomeMainConfigFromSupabase } from '../lib/homeBannersApi'

type SaveInput = Omit<AdminHomeMainConfig, 'version' | 'updatedAt'>

interface HomeMainConfigContextValue {
  config: AdminHomeMainConfig
  saveConfig: (input: SaveInput) => AdminHomeMainConfig
  reloadConfig: () => Promise<void>
  isLoading: boolean
}

const HomeMainConfigContext = createContext<HomeMainConfigContextValue | null>(null)

async function resolveHomeMainConfig(): Promise<AdminHomeMainConfig> {
  const remote = await loadHomeMainConfigFromSupabase()
  return remote ?? loadAdminHomeMainConfig()
}

export function HomeMainConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState(loadAdminHomeMainConfig)
  const [isLoading, setIsLoading] = useState(true)

  const reloadConfig = useCallback(async () => {
    setIsLoading(true)
    try {
      const next = await resolveHomeMainConfig()
      setConfig(next)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveConfig = useCallback((input: SaveInput) => {
    const next = saveAdminHomeMainConfig(input)
    setConfig(next)
    return next
  }, [])

  useEffect(() => {
    void reloadConfig()
  }, [reloadConfig])

  useEffect(() => {
    const refresh = () => {
      void reloadConfig()
    }

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
      isLoading,
    }),
    [config, saveConfig, reloadConfig, isLoading],
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
