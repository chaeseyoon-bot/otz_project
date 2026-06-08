export const MY_PAGE_PATH = '/mypage' as const

export function isMyPagePath(pathname: string) {
  return pathname === MY_PAGE_PATH || pathname.startsWith(`${MY_PAGE_PATH}/`)
}
