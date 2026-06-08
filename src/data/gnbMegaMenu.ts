/** Shared GNB mega / mobile drawer category data (Figma mega + mobile 2685:3458). */
export type GnbMegaMenuGroup = { title: string; items: readonly string[] }

export const GNB_MEGA_MENU_GROUPS: readonly GnbMegaMenuGroup[] = [
  {
    title: 'SHOES',
    items: ['메리제인', '스니커즈', '샌들', '슬라이드', '클로그', '부츠/레인부츠', '젤리슈즈', '쪼리/플립플랍'],
  },
  {
    title: 'ACC',
    items: ['가방', '모자', '워머/양말', '장갑/머플러', '헤어', '기타'],
  },
  {
    title: 'COLLECTION',
    items: [
      '로미타',
      '로마리',
      '3300',
      '토피',
      '툴레아',
      '필그림',
      '말리부',
      '피스모',
      '피스모어',
      '벌루니',
      '머피스',
      '비들',
      '콜터빌',
    ],
  },
] as const
