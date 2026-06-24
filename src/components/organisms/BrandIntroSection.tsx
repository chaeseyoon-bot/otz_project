import { useMemo } from 'react'
import {
  BrandIntroMobileSlide,
  BrandIntroLogoOverlay,
  BrandIntroSubtractOverlay,
} from '../molecules/BrandIntroMobileSlide'
import { useAdminHomeMainConfig } from '../../hooks/useAdminHomeMainConfig'
import { resolveBrandIntro } from '../../lib/homeMainContentResolver'

/** Brand intro banner only (admin tab 3). */
export function BrandIntroSection() {
  const { brandBanner } = useAdminHomeMainConfig()
  const brandIntro = useMemo(() => resolveBrandIntro(brandBanner), [brandBanner])

  return (
    <section className="w-full">
      <div className="bg-white px-[15px] pt-10 lg:hidden">
        <article className="relative h-[431px] w-full max-w-[345px] overflow-hidden">
          <BrandIntroMobileSlide imageUrl={brandIntro.imageUrl} body={brandIntro.body} />
        </article>
      </div>

      <div className="hidden w-full bg-light py-[64px] lg:block">
        <div className="mx-auto min-w-0 max-w-[1400px] px-4">
          <div className="relative isolate mx-auto aspect-[690/862] w-full max-w-[690px] overflow-hidden">
            <img
              src={brandIntro.imageUrl}
              alt="OTZ"
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
            <BrandIntroSubtractOverlay layout="desktop" />
            <BrandIntroLogoOverlay layout="desktop" />
            <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end px-10 pb-10 text-center text-bodyMedium1 text-white">
              {brandIntro.body.split('\n').map((line, lineIndex) => (
                <p key={lineIndex} className="mb-0 last:mb-0">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
