import {
  createDefaultHomeMainConfig,
  type AdminHomeMainConfig,
} from './adminHomeMainConfig'
import {
  buildHomeBannerSectionPayload,
  mergeHomeBannerRowsIntoConfig,
  type AdminHomeMainTabId,
  type HomeBannerRow,
} from './homeBannerSections'
import { deepRewriteHomeBannerUrls } from './homeBannersAssetUrl'
import { isSupabaseConfigured, supabase } from './supabase'

type ConfigSlice = Omit<AdminHomeMainConfig, 'version' | 'updatedAt'>

export async function fetchHomeBannerRows(): Promise<HomeBannerRow[]> {
  if (!isSupabaseConfigured) return []

  const { data, error } = await supabase
    .from('home_banners')
    .select('id, section_id, image_url, link_url, metadata, created_at')
    .order('section_id', { ascending: true })

  if (error) {
    console.error('[homeBannersApi] fetch failed:', error.message)
    return []
  }

  return (data ?? []).map((row) =>
    deepRewriteHomeBannerUrls(row as HomeBannerRow),
  ) as HomeBannerRow[]
}

export async function loadHomeMainConfigFromSupabase(): Promise<AdminHomeMainConfig | null> {
  const rows = await fetchHomeBannerRows()
  if (rows.length === 0) return null

  const defaults = createDefaultHomeMainConfig()
  return mergeHomeBannerRowsIntoConfig(defaults, rows)
}

/** Upsert one admin section row keyed by `section_id`. */
export async function upsertHomeBannerSection(
  tabId: AdminHomeMainTabId,
  config: ConfigSlice,
): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase 환경 변수가 설정되지 않았습니다.' }
  }

  const payload = buildHomeBannerSectionPayload(tabId, config)

  // Some Supabase schemas mark image_url NOT NULL; metadata is the source of truth for
  // multi-slot sections (quick menu, curation, etc.) that may have no top-level image yet.
  const imageUrl = payload.image_url?.trim() ?? ''
  const linkUrl = payload.link_url?.trim() ?? ''

  const { error } = await supabase.from('home_banners').upsert(
    {
      section_id: payload.section_id,
      image_url: imageUrl,
      link_url: linkUrl,
      metadata: payload.metadata,
    },
    { onConflict: 'section_id' },
  )

  if (error) {
    console.error('[homeBannersApi] upsert failed:', error.message)
    if (/row-level security/i.test(error.message)) {
      return {
        ok: false,
        message:
          '저장 권한이 없습니다. Supabase SQL Editor에서 `scripts/sql/home-banners-table.sql`을 실행해 주세요.',
      }
    }
    if (/image_url/i.test(error.message) && /null/i.test(error.message)) {
      return {
        ok: false,
        message:
          'image_url 컬럼이 NOT NULL로 설정되어 있습니다. Supabase SQL Editor에서 `scripts/sql/home-banners-table.sql`을 다시 실행해 image_url을 nullable로 바꿔 주세요.',
      }
    }
    return { ok: false, message: error.message }
  }

  return { ok: true, message: '저장되었습니다.' }
}
