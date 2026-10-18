// Shared copy for the BottomNavigation layout, filled Tabs and PageIndicator examples (HJM 1.31.0). Both showcases
// render these through the public renderer APIs; only the copy and fixtures live here.

export const prominentDestinationExample = {
  label: "주요 탐색",
  initial: "trail",
  items: [
    { id: "trail", label: "발자국", icon: { name: "home" } },
    { id: "write", label: "쓰기", icon: { name: "add" }, prominent: true },
    { id: "nest", label: "내 정보", icon: { name: "user" } },
  ],
} as const;

export const appIconDockExample = {
  label: "자주 쓰는 앱",
  initial: "home",
  items: [
    { id: "home", label: "도구함", icon: { name: "home" } },
    { id: "messages", label: "메시지", icon: { name: "notifications" } },
    { id: "favorites", label: "즐겨찾기", icon: { name: "favorite" } },
    { id: "account", label: "내 계정", icon: { name: "user" } },
  ],
} as const;

export const overlayInsetExample = {
  title: "오늘의 기록",
  count: 12,
  row: (index: number) => `${index}번째 기록`,
  last: "마지막 기록도 떠 있는 막대 위에서 끝납니다",
} as const;

export const filledTabsExample = {
  label: "보낸 편지",
  initial: "people",
  items: [
    { id: "travelling", label: "여행 중" },
    { id: "people", label: "만난 사람" },
    { id: "keepsakes", label: "기념품" },
  ],
  panel: (label: string) => `${label} 목록이 여기에 나옵니다.`,
} as const;

export const pageIndicatorExample = {
  label: "홈 화면 페이지",
  count: 4,
  pageName: ({ position, total }: { position: number; total: number }) => `${total}쪽 중 ${position}쪽`,
  labels: { previous: "이전 페이지", next: "다음 페이지" },
  page: (position: number) => `${position}쪽 도구`,
} as const;
