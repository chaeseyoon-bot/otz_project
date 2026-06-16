import {
  normalizeAdminArchiveDetailConfig,
  setArchiveDetailConfigCache,
  ARCHIVE_DETAIL_CONFIG_UPDATED_EVENT,
  type AdminArchiveDetailConfig,
} from './adminArchiveDetailConfig'
import { isSupabaseConfigured, supabase } from './supabase'

const CONFIG_ROW_ID = 'default'

export async function loadArchiveDetailConfigFromSupabase(): Promise<AdminArchiveDetailConfig | null> {
  if (!isSupabaseConfigured) return null

  const { data, error } = await supabase
    .from('archive_lookbooks_config')
    .select('metadata, updated_at')
    .eq('id', CONFIG_ROW_ID)
    .maybeSingle()

  if (error) {
    console.error('[archiveLookbooksApi] fetch failed:', error.message)
    return null
  }

  if (!data?.metadata || typeof data.metadata !== 'object') return null

  const raw = data.metadata as Partial<AdminArchiveDetailConfig>
  const normalized = normalizeAdminArchiveDetailConfig({
    ...raw,
    updatedAt: typeof data.updated_at === 'string' ? data.updated_at : raw.updatedAt,
  })

  return normalized.lookbooks.length ? normalized : null
}

export async function upsertArchiveDetailConfig(
  config: AdminArchiveDetailConfig,
): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase 환경 변수가 설정되지 않았습니다.' }
  }

  const payload = normalizeAdminArchiveDetailConfig(config)

  const { error } = await supabase.from('archive_lookbooks_config').upsert(
    {
      id: CONFIG_ROW_ID,
      metadata: payload,
      updated_at: payload.updatedAt ?? new Date().toISOString(),
    },
    { onConflict: 'id' },
  )

  if (error) {
    console.error('[archiveLookbooksApi] upsert failed:', error.message)
    if (/row-level security/i.test(error.message)) {
      return {
        ok: false,
        message:
          '저장 권한이 없습니다. Supabase SQL Editor에서 `scripts/sql/archive-lookbooks-table.sql`을 실행해 주세요.',
      }
    }
    if (/relation.*does not exist/i.test(error.message)) {
      return {
        ok: false,
        message:
          'archive_lookbooks_config 테이블이 없습니다. Supabase SQL Editor에서 `scripts/sql/archive-lookbooks-table.sql`을 실행해 주세요.',
      }
    }
    return { ok: false, message: error.message }
  }

  setArchiveDetailConfigCache(payload)
  window.dispatchEvent(new CustomEvent(ARCHIVE_DETAIL_CONFIG_UPDATED_EVENT))
  return { ok: true, message: '저장되었습니다.' }
}

/** Loads remote config into memory cache for storefront + admin resolvers. */
export async function hydrateArchiveDetailConfig(): Promise<AdminArchiveDetailConfig> {
  const remote = await loadArchiveDetailConfigFromSupabase()
  if (remote) {
    setArchiveDetailConfigCache(remote)
    return remote
  }

  const { loadAdminArchiveDetailConfig } = await import('./adminArchiveDetailConfig')
  const local = loadAdminArchiveDetailConfig()
  setArchiveDetailConfigCache(remote ?? local)
  window.dispatchEvent(new CustomEvent(ARCHIVE_DETAIL_CONFIG_UPDATED_EVENT))
  return remote ?? local
}
