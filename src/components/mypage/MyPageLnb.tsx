import { MY_PAGE_MENU_SECTIONS } from '../../data/myPageContent'

/** Figma 3169:10963 — PC my page left navigation. */
export function MyPageLnb() {
  return (
    <aside className="hidden w-[200px] shrink-0 lg:block" aria-label="마이페이지 메뉴">
      <div className="border-b-2 border-dark pb-[26px] pt-[5px]">
        <h1 className="m-0 text-h4 text-dark">마이페이지</h1>
      </div>

      <nav className="mt-6 flex flex-col gap-10">
        {MY_PAGE_MENU_SECTIONS.map((section) => (
          <div key={section.id} className="flex flex-col gap-6">
            <h2 className="m-0 border-b border-lightGray pb-6 text-bodyBold1 text-dark">{section.title}</h2>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {section.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="w-full border-0 bg-transparent p-0 text-left text-bodyRegular2 text-textDefault hover:text-dark"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
