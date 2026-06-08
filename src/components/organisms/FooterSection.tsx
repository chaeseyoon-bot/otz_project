import { Fragment, useRef, useState } from 'react'
import { useHorizontalMouseDragScroll } from '../../hooks/useHorizontalMouseDragScroll'
import { figmaAsset } from '../../lib/figmaAssetUrl'
import { mainImageAsset } from '../../lib/mainImagesAssetUrl'

const LINKS_TOP = ['브랜드스토리', '멤버십혜택', '공지사항', '대량주문문의']
const LINKS_BOTTOM = ['개인정보처리방침', '이용약관', '자주 묻는 질문 FAQ']

/** 공정거래위원회 사업자정보 조회 (등록번호 113-85-19030) */
const FTC_BUSINESS_VERIFY_URL = 'https://www.ftc.go.kr/bizCommPopView.do?wrkr_no=1138501903'

const CHEVRON_DOWN = mainImageAsset('icon_chevron.svg')

const socialInstagram = mainImageAsset('social_01.svg')
const socialKakao = mainImageAsset('social_02.svg')
const socialYoutube = mainImageAsset('social_03.svg')
const socialFacebook = mainImageAsset('social_04.svg')

const logoOtz = figmaAsset('icons/OTZ_LOGO.svg')

/** Figma footer (Light #F6F6F6, Body/Small #999 13px, Text Default #666 14px, divider #E6E6E6) */
export function FooterSection() {
  const [businessInfoOpen, setBusinessInfoOpen] = useState(false)
  const topLinksRef = useRef<HTMLDivElement>(null)
  const bottomLinksRef = useRef<HTMLDivElement>(null)
  useHorizontalMouseDragScroll(topLinksRef)
  useHorizontalMouseDragScroll(bottomLinksRef)

  return (
    <footer className="relative z-10">
      {/* Mobile — unchanged */}
      <div className="bg-[#F6F6F6] px-[30px] pb-[50px] pt-[15px] lg:hidden">
        <div className="flex items-center justify-between rounded-[5px] bg-white px-[15px] py-[14px] text-[14px] font-normal leading-[1.4] tracking-[-0.02em] text-[#666666]">
          <span className="whitespace-nowrap">고객센터 1566-8221</span>
          <span className="whitespace-nowrap">평일 10:00~ 17:00</span>
        </div>

        <div className="pt-[30px]">
          <div className="flex flex-col items-center gap-[12px]">
            <div
              ref={topLinksRef}
              className="flex w-full max-w-full cursor-grab flex-nowrap justify-center gap-[8.333px] overflow-x-auto scroll-smooth touch-pan-x snap-x snap-mandatory text-[13px] font-normal leading-[1.4] tracking-[-0.02em] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden active:cursor-grabbing"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {LINKS_TOP.map((item, index) => (
                <Fragment key={item}>
                  {index > 0 ? (
                    <span className="shrink-0 select-none text-[#E6E6E6]" aria-hidden>
                      |
                    </span>
                  ) : null}
                  <span className="shrink-0 whitespace-nowrap text-[#999999]">{item}</span>
                </Fragment>
              ))}
            </div>

            <div
              ref={bottomLinksRef}
              className="flex w-full max-w-full cursor-grab flex-nowrap justify-center gap-[8.333px] overflow-x-auto scroll-smooth touch-pan-x snap-x snap-mandatory text-[13px] font-normal leading-[1.4] tracking-[-0.02em] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden active:cursor-grabbing"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {LINKS_BOTTOM.map((item, index) => (
                <Fragment key={item}>
                  {index > 0 ? (
                    <span className="shrink-0 select-none text-[#E6E6E6]" aria-hidden>
                      |
                    </span>
                  ) : null}
                  <span
                    className={`shrink-0 whitespace-nowrap ${index === 0 ? 'text-[#666666]' : 'text-[#999999]'}`}
                  >
                    {item}
                  </span>
                </Fragment>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-[20px] pb-[20px] pt-[20px]">
            <div className="h-px w-full shrink-0 bg-[#E6E6E6]" aria-hidden />

            <div
              className={`flex w-full flex-col items-stretch ${businessInfoOpen ? 'gap-[12px]' : 'gap-[4px] pr-[5px]'}`}
            >
              <button
                type="button"
                id="footer-business-toggle"
                aria-expanded={businessInfoOpen}
                aria-controls="footer-business-details"
                onClick={() => setBusinessInfoOpen((open) => !open)}
                className="flex w-full cursor-pointer items-center justify-center gap-[10px] border-0 bg-transparent pl-[10px] text-left text-[14px] font-bold leading-[1.4] tracking-[-0.02em] text-[#1a1a1a] outline-none select-none focus-visible:ring-2 focus-visible:ring-[#666666] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F6F6]"
              >
                <span className="whitespace-nowrap">오찌닷컴 사업자정보</span>
                <span
                  className={`inline-block h-[5px] w-[8.333px] shrink-0 bg-[length:contain] bg-center bg-no-repeat transition-transform duration-200 ease-out ${
                    businessInfoOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                  style={{ backgroundImage: `url(${CHEVRON_DOWN})` }}
                  aria-hidden
                />
              </button>

              {businessInfoOpen ? (
                <div
                  id="footer-business-details"
                  role="region"
                  aria-labelledby="footer-business-toggle"
                  className="flex flex-col gap-[3px] text-center text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-[#999999]"
                >
                  <div className="flex flex-wrap items-center justify-center gap-x-[10px] gap-y-[3px]">
                    <span className="whitespace-nowrap">(주)이랜드월드패션사업부</span>
                    <span className="whitespace-nowrap">대표이사 : 조동주</span>
                  </div>
                  <p>
                    사업자등록번호 : 113-85-19030 [
                    <a
                      href={FTC_BUSINESS_VERIFY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-solid underline-offset-2"
                    >
                      사업자정보확인
                    </a>
                    ]
                  </p>
                  <p>통신판매번호신고번호 : 2025-서울강서-2203</p>
                  <div className="flex flex-col gap-[3px]">
                    <p>주소 : 서울 강서구 마곡동로 146 이랜드패션사업부</p>
                    <p>개인정보보호책임자 : 김태위</p>
                    <p>호스팅 서비스 제공자 : 카페24(주)</p>
                    <p>
                      E-mail :{' '}
                      <a href="mailto:webmaster@otzstore.com" className="underline decoration-solid underline-offset-2">
                        webmaster@otzstore.com
                      </a>
                    </p>
                  </div>
                  <div className="pt-[20px]">
                    <p className="text-center text-[11px] font-normal leading-[1.2] tracking-[-0.04em] text-[#999999]">
                      본 사이트 내 모든 이미지 및 컨텐츠 등은 저작권법 제 4조의 의한 저작물로써 소유권은 (주)이랜드월드패션사업부에 있으며, 무단 도용 시 법적인 제재를 받을 수 있습니다.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-center gap-[16.667px] py-[20px]">
            <img src={socialInstagram} alt="instagram" className="h-[18.75px] w-[18.75px]" />
            <img src={socialKakao} alt="kakao" className="h-[19.792px] w-[21.591px]" />
            <img src={socialYoutube} alt="youtube" className="h-[13.542px] w-[19.345px]" />
            <img src={socialFacebook} alt="facebook" className="h-[18.75px] w-[18.797px]" />
          </div>

          <p className="text-center text-[13px] font-medium leading-[1.2] tracking-[-0.02em] text-[#999999]">
            Copyright ⓒ ㈜이랜드월드 All Right Reserved.
          </p>
        </div>
      </div>

      {/* PC — Figma 2673:8667 / Footer PC */}
      <div className="hidden w-full border-t border-lightGray bg-white lg:block">
        <div className="mx-auto w-full max-w-[1400px] px-[30px] pb-[50px] pt-[50px] lg:px-0">
          <div className="flex w-full flex-col gap-8">
            <div className="flex w-full min-w-0 items-start justify-between gap-8">
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2.5">
                  <div className="flex h-8 w-[102px] items-center">
                    <img src={logoOtz} alt="OTZ" className="h-[26px] w-auto max-w-[98px]" />
                  </div>
                  <div className="flex w-full min-w-0 flex-col items-start pt-5">
                    <p className="m-0 text-[18px] font-medium leading-[1.2] tracking-[-0.02em] text-black">
                      1566-8221
                    </p>
                    <p className="m-0 pt-[5px] text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault">
                      평일 AM 10:00 - PM 05:00 / 점심 PM 12:00 - PM 01:00 / 토요일, 일요일, 공휴일 휴무
                    </p>
                    <div className="flex w-full max-w-[573px] flex-col gap-1 pt-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="m-0 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault">
                          (주)이랜드월드패션사업부　대표이사 : 조동주　사업자등록번호 : 113-85-19030
                        </p>
                        <a
                          href={FTC_BUSINESS_VERIFY_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault underline decoration-solid underline-offset-2"
                        >
                          [사업자정보확인]
                        </a>
                      </div>
                      <p className="m-0 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault">
                        통신판매업신고번호 : 2025-서울강서-2203　주소 : 서울 강서구 마곡동로 146 이랜드패션사업부
                      </p>
                      <p className="m-0 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-textDefault">
                        개인정보보호책임자 : 김태위　E-mail :{' '}
                        <a
                          href="mailto:webmaster@otzstore.com"
                          className="underline decoration-solid underline-offset-2"
                        >
                          webmaster@otzstore.com
                        </a>
                        　호스팅 서비스 제공자 : 카페24(주)
                      </p>
                    </div>
                    <div className="flex flex-col gap-0.5 pt-4">
                      <p className="m-0 text-[13px] font-medium leading-[1.2] tracking-[-0.02em] text-textDefault">
                        COPYRIGHT by ㈜이랜드월드. ALL RIGHT RESERVED
                      </p>
                      <p className="m-0 text-[13px] font-normal leading-[1.4] tracking-[-0.02em] text-subtleText">
                        본 사이트 내 모든 이미지 및 컨텐츠 등은 저작권법 제 4조의 의한 저작물로써 소유권은 ㈜이랜드월드패션사업부 에게 있으며, 무단 도용 시 법적인 제재를 받을 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 gap-20">
                <div className="flex flex-col gap-4">
                  <p className="m-0 text-[14px] font-bold leading-[1.4] tracking-[-0.02em] text-dark">MORE</p>
                  <nav className="flex flex-col gap-2.5 text-[13px] font-medium leading-[1.2] tracking-[-0.02em] text-textDefault">
                    <a href="#" className="hover:text-dark">
                      브랜드스토리
                    </a>
                    <a href="#" className="hover:text-dark">
                      멤버십혜택
                    </a>
                  </nav>
                </div>
                <div className="flex flex-col gap-4">
                  <p className="m-0 text-[14px] font-bold leading-[1.4] tracking-[-0.02em] text-dark">SUPPORT</p>
                  <nav className="flex flex-col gap-2.5 text-[13px] font-medium leading-[1.2] tracking-[-0.02em] text-textDefault">
                    <a href="#" className="hover:text-dark">
                      공지사항
                    </a>
                    <a href="#" className="hover:text-dark">
                      대량주문문의
                    </a>
                    <a href="#" className="hover:text-dark">
                      자주 묻는 질문 FAQ
                    </a>
                  </nav>
                </div>
              </div>
            </div>

            <div className="flex w-full flex-wrap items-center justify-between gap-4 border-t border-light2 py-[20px]">
              <div className="flex flex-wrap items-center gap-5">
                <a
                  href="#"
                  className="text-[13px] font-medium leading-[1.2] tracking-[-0.02em] text-textDefault hover:text-dark"
                >
                  이용약관
                </a>
                <a
                  href="#"
                  className="text-[13px] font-medium leading-[1.2] tracking-[-0.02em] text-black hover:opacity-80"
                >
                  개인정보처리방침
                </a>
                <a
                  href="#"
                  className="text-[13px] font-medium leading-[1.2] tracking-[-0.02em] text-textDefault hover:text-dark"
                >
                  이메일무단수집거부
                </a>
              </div>
              <div className="flex items-center gap-[16.667px]">
                <a href="#" className="inline-flex shrink-0" aria-label="instagram">
                  <img src={socialInstagram} alt="" className="h-[18.75px] w-[18.75px]" draggable={false} />
                </a>
                <a href="#" className="inline-flex shrink-0" aria-label="kakao">
                  <img src={socialKakao} alt="" className="h-[19.792px] w-[21.591px]" draggable={false} />
                </a>
                <a href="#" className="inline-flex shrink-0" aria-label="youtube">
                  <img src={socialYoutube} alt="" className="h-[13.542px] w-[19.345px]" draggable={false} />
                </a>
                <a href="#" className="inline-flex shrink-0" aria-label="facebook">
                  <img src={socialFacebook} alt="" className="h-[18.75px] w-[18.797px]" draggable={false} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
