export type EditorialMainTabId = 'content' | 'product'

export interface EditorialMainTabProps {
  activeTab: EditorialMainTabId
  onTabChange: (tab: EditorialMainTabId) => void
}

const TABS: { id: EditorialMainTabId; label: string }[] = [
  { id: 'content', label: 'CONTENT' },
  { id: 'product', label: 'PRODUCT' },
]

/** Figma 143:5691 — CONTENT / PRODUCT tabs above editorial hero banner. */
export function EditorialMainTab({ activeTab, onTabChange }: EditorialMainTabProps) {
  return (
    <nav className="w-full bg-white" aria-label="에디토리얼 섹션">
      <div className="mx-auto flex max-w-[1400px] items-start justify-center gap-6 px-10 pt-6">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              className="flex flex-col items-center border-0 bg-transparent p-0"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onTabChange(tab.id)}
            >
              <span
                className={`px-1.5 text-[18px] leading-[1.4] tracking-[-0.02em] ${
                  isActive ? 'font-bold text-dark' : 'font-normal text-textDefault'
                }`}
              >
                {tab.label}
              </span>
              <span
                className={`mt-2.5 h-0.5 w-full ${isActive ? 'bg-dark' : 'bg-transparent'}`}
                aria-hidden
              />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
