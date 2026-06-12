import { useEffect, useState } from 'react'
import { EditorialMobileDetailContent } from '../components/organisms/EditorialMobileDetailContent'
import { EditorialMobileDetailHeader } from '../components/organisms/EditorialMobileDetailHeader'
import { EditorialPcDetailContent } from '../components/organisms/EditorialPcDetailContent'
import { useEditorialConfigContext } from '../contexts/EditorialConfigContext'
import { fetchEditorialEventDetail, type EditorialEventDetail } from '../data/editorialEventDetails'
import { navigateSpa } from '../lib/spaNavigation'

export interface EditorialDetailPageProps {
  editorialId: string
}

/** Figma 2644:60528 (PC) — editorial list item detail. */
export function EditorialDetailPage({ editorialId }: EditorialDetailPageProps) {
  const { config } = useEditorialConfigContext()
  const [detail, setDetail] = useState<EditorialEventDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    fetchEditorialEventDetail(editorialId)
      .then((resolved) => {
        if (cancelled) return
        if (!resolved) {
          navigateSpa('/editorial')
          return
        }
        setDetail(resolved)
        window.scrollTo(0, 0)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [editorialId, config.updatedAt])

  if (isLoading) {
    return (
      <main className="bg-white px-[15px] py-20">
        <p className="m-0 text-center text-[14px] text-subtleText">에디토리얼을 불러오는 중…</p>
      </main>
    )
  }

  if (!detail) {
    return null
  }

  return (
    <>
      <main className="hidden bg-white lg:block">
        <EditorialPcDetailContent detail={detail} />
      </main>
      <main className="bg-white lg:hidden">
        <EditorialMobileDetailHeader />
        <EditorialMobileDetailContent detail={detail} />
      </main>
    </>
  )
}
