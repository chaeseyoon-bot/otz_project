import {
  MY_PAGE_ORDER_STEPS,
  type MyPageOrderStatus,
} from '../../data/myPageContent'
import { figmaAsset } from '../../lib/figmaAssetUrl'

const iconChevronLeft = figmaAsset('icons/chevron-left.svg')

interface MyPageOrderStatusSectionProps {
  status: MyPageOrderStatus
  variant: 'mobile' | 'pc'
  className?: string
}

/** Figma 3223:24043 / mobile order status — shared MO·PC. */
export function MyPageOrderStatusSection({
  status,
  variant,
  className,
}: MyPageOrderStatusSectionProps) {
  const isPc = variant === 'pc'

  return (
    <section className={className}>
      <div
        className={`flex items-center gap-2 border-b border-lightGray ${isPc ? 'pb-6' : 'pb-4'}`}
      >
        <h2 className={`m-0 text-dark ${isPc ? 'text-bodyBold1' : 'text-bodyBold2'}`}>
          주문처리 현황
        </h2>
        <span className={isPc ? 'text-bodySmall text-subtleText' : 'text-bodySmall1 text-subtleText'}>
          (최근 3개월 기준)
        </span>
      </div>

      {isPc ? (
        <div className="flex items-center py-10">
          {MY_PAGE_ORDER_STEPS.map((step, index) => (
            <div key={step.key} className="contents">
              <div className="flex flex-1 flex-col items-center gap-2">
                <span className="text-h1 leading-[1.2] text-[#1b1d1c]">{status[step.key]}</span>
                <span className="text-[16px] font-normal leading-[1.4] tracking-tight2 text-textDefault">
                  {step.label}
                </span>
              </div>
              {index < MY_PAGE_ORDER_STEPS.length - 1 ? (
                <img
                  src={iconChevronLeft}
                  alt=""
                  aria-hidden
                  className="size-8 shrink-0 -scale-y-100 rotate-180 object-contain"
                  draggable={false}
                />
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-4 gap-2">
          {MY_PAGE_ORDER_STEPS.map((step) => (
            <div key={step.key} className="flex flex-col items-center gap-2">
              <span className="text-h4 text-dark">{status[step.key]}</span>
              <span className="text-bodyRegular2 text-textDefault">{step.label}</span>
            </div>
          ))}
        </div>
      )}

      <div
        className={`grid grid-cols-3 border border-lightGray ${
          isPc ? 'h-16' : 'mt-6 h-14'
        }`}
      >
        <div
          className={`flex items-center justify-center gap-2 border-r border-lightGray text-dark ${
            isPc ? 'text-bodyRegular1' : 'text-bodyRegular2'
          }`}
        >
          <span>취소 :</span>
          <span className={isPc ? 'text-bodyBold2' : 'text-bodyBold3'}>{status.cancelled}</span>
        </div>
        <div
          className={`flex items-center justify-center gap-2 border-r border-lightGray text-dark ${
            isPc ? 'text-bodyRegular1' : 'text-bodyRegular2'
          }`}
        >
          <span>교환 :</span>
          <span className={isPc ? 'text-bodyBold2' : 'text-bodyBold3'}>{status.exchanged}</span>
        </div>
        <div
          className={`flex items-center justify-center gap-2 text-dark ${
            isPc ? 'text-bodyRegular1' : 'text-bodyRegular2'
          }`}
        >
          <span>반품 :</span>
          <span className={isPc ? 'text-bodyBold2' : 'text-bodyBold3'}>{status.returned}</span>
        </div>
      </div>
    </section>
  )
}
