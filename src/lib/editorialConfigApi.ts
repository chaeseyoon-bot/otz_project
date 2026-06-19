import {
  normalizeEditorialConfig,
  setEditorialConfigCache,
  EDITORIAL_CONFIG_UPDATED_EVENT,
  mirrorAdminEditorialConfigLocally,
  createDefaultEditorialConfig,
  type AdminEditorialConfig,
} from './adminEditorialConfig'
import { isSupabaseConfigured, supabase } from './supabase'

const CONFIG_ROW_ID = 'default'

export async function loadEditorialConfigFromSupabase(): Promise<AdminEditorialConfig | null> {
  if (!isSupabaseConfigured) return null

  const { data, error } = await supabase
    .from('editorial_config')
    .select('metadata, updated_at')
    .eq('id', CONFIG_ROW_ID)
    .maybeSingle()

  if (error) {
    console.error('[editorialConfigApi] fetch failed:', error.message)
    return null
  }

  if (!data?.metadata || typeof data.metadata !== 'object') return null

  const raw = data.metadata as Partial<AdminEditorialConfig>
  const normalized = normalizeEditorialConfig({
    ...raw,
    updatedAt: typeof data.updated_at === 'string' ? data.updated_at : raw.updatedAt,
  })

  return normalized.events.length ? normalized : null
}

export async function upsertEditorialConfig(
  config: AdminEditorialConfig,
): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase 환경 변수가 설정되지 않았습니다.' }
  }

  const payload = normalizeEditorialConfig({
    ...config,
    updatedAt: config.updatedAt ?? new Date().toISOString(),
  })

  const { error } = await supabase.from('editorial_config').upsert(
    {
      id: CONFIG_ROW_ID,
      metadata: payload,
      updated_at: payload.updatedAt ?? new Date().toISOString(),
    },
    { onConflict: 'id' },
  )

  if (error) {
    console.error('[editorialConfigApi] upsert failed:', error.message)
    if (/row-level security/i.test(error.message)) {
      return {
        ok: false,
        message:
          '저장 권한이 없습니다. Supabase SQL Editor에서 `scripts/sql/editorial-config-table.sql`을 실행해 주세요.',
      }
    }
    if (/relation.*does not exist/i.test(error.message)) {
      return {
        ok: false,
        message:
          'editorial_config 테이블이 없습니다. Supabase SQL Editor에서 `scripts/sql/editorial-config-table.sql`을 실행해 주세요.',
      }
    }
    return { ok: false, message: error.message }
  }

  setEditorialConfigCache(payload)
  mirrorAdminEditorialConfigLocally(payload)
  window.dispatchEvent(new CustomEvent(EDITORIAL_CONFIG_UPDATED_EVENT))
  return { ok: true, message: '저장되었습니다.' }
}

/** Loads config from Supabase — single source of truth for admin + storefront. */
export async function hydrateEditorialConfig(): Promise<AdminEditorialConfig> {
  const remote = await loadEditorialConfigFromSupabase()

  if (remote) {
    setEditorialConfigCache(remote)
    mirrorAdminEditorialConfigLocally(remote)
    window.dispatchEvent(new CustomEvent(EDITORIAL_CONFIG_UPDATED_EVENT))
    return remote
  }

  const empty = createDefaultEditorialConfig()
  setEditorialConfigCache(empty)
  window.dispatchEvent(new CustomEvent(EDITORIAL_CONFIG_UPDATED_EVENT))
  return empty
}
