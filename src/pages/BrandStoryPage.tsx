import { useLayoutEffect } from 'react'
import { BrandStoryMobileContent } from '../components/organisms/BrandStoryMobileContent'
import { BrandStoryMobileHeader } from '../components/organisms/BrandStoryMobileHeader'
import { BrandStoryPcContent } from '../components/organisms/BrandStoryPcContent'

/** Figma 2898:5238 (PC) / 2898:6093 (MO) — Brand story. */
export function BrandStoryPage() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <BrandStoryMobileHeader />
      <main className="bg-white lg:w-full">
        <BrandStoryMobileContent />
        <BrandStoryPcContent />
      </main>
    </>
  )
}
