import { useEffect, useMemo, useState } from 'react'
import { ArchiveDetailImageStack } from '../components/molecules/ArchiveDetailImageStack'
import { ArchiveMobileDetailHeader } from '../components/organisms/ArchiveMobileDetailHeader'
import { ArchivePcDetailContent } from '../components/organisms/ArchivePcDetailContent'
import { ARCHIVE_DETAIL_CONFIG_UPDATED_EVENT } from '../lib/adminArchiveDetailConfig'
import { getArchiveLookbookDetail } from '../lib/archiveLookbookDetailResolver'
import { navigateSpa } from '../lib/spaNavigation'

export interface ArchiveDetailPageProps {
  lookbookId: string
}

/** Figma 2679:10237 (MO) / 2679:10518 (PC) */
export function ArchiveDetailPage({ lookbookId }: ArchiveDetailPageProps) {
  const [detailVersion, setDetailVersion] = useState(0)
  const detail = useMemo(
    () => getArchiveLookbookDetail(lookbookId),
    [lookbookId, detailVersion],
  )

  useEffect(() => {
    const refresh = () => setDetailVersion((version) => version + 1)
    window.addEventListener(ARCHIVE_DETAIL_CONFIG_UPDATED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(ARCHIVE_DETAIL_CONFIG_UPDATED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  useEffect(() => {
    if (!detail) {
      navigateSpa('/archive')
      return
    }
    window.scrollTo(0, 0)
  }, [detail, lookbookId])

  if (!detail) {
    return null
  }

  return (
    <>
      <main className="bg-white lg:hidden">
        <ArchiveMobileDetailHeader />

        <section className="px-[15px] py-[15px]">
          <h1 className="m-0 text-[16px] font-medium leading-[1.4] tracking-[-0.04em] text-dark">
            {detail.title}
          </h1>
        </section>

        <section className="px-[10px] pb-10">
          <ArchiveDetailImageStack images={detail.mobileImages} />
        </section>
      </main>

      <main className="hidden bg-white lg:block">
        <ArchivePcDetailContent detail={detail} />
      </main>
    </>
  )
}
