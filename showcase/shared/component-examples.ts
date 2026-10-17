// One copy and composition source for the component stories that Web (preview-registry, patterns/*) and Native
// (component-examples) both render. 2026-10-17 UI review: each renderer had its own hard-coded copy, so the same
// story read in Korean on Web and in English placeholders on Native, with different item counts and order.
// Renderers keep only platform adapters (onClick/onPress, glyph rendering, landmarks).

export const textExample = {
  title: "명확한 제목",
  body: "조용한 본문 위계",
  caption: "보조 정보는 한 단계 낮게 표시합니다.",
} as const;

export const iconExample = {
  label: "의미 아이콘",
  items: [
    { name: "home", label: "홈" },
    { name: "success", label: "성공", tone: "success" },
    { name: "warning", label: "경고", tone: "warning" },
    { name: "forward", label: "다음" },
  ],
} as const;

export const surfaceExample = {
  title: "배경 영역 제목",
  body: "제품이 색·간격·모서리를 임의로 덮지 않는 의미 기반 컨테이너입니다.",
} as const;

export const stackExample = ["첫 번째 항목", "두 번째 항목", "세 번째 항목"] as const;

export const containerExample = "읽기 폭과 좌우 여백을 웹·앱에서 같은 계약으로 유지합니다.";

export const aspectRatioExample = "16:9 미디어 영역";

export const gridExample = [
  { id: "first", title: "첫 번째", body: "화면 폭에 맞춰 열 수가 바뀌어요" },
  { id: "second", title: "두 번째", body: "왼쪽부터 줄 단위로 채워요" },
  { id: "third", title: "세 번째", body: "카드 사이 간격은 공통 값을 써요" },
] as const;

export const layoutExample = {
  header: "제품 헤더",
  body: "하나의 본문 영역 안에 놓이는 제품 내용입니다.",
  skipLink: "본문으로 건너뛰기",
} as const;

export const sectionExample = {
  title: "앱 정보",
  description: "현재 앱의 핵심 기능을 간결하게 설명합니다.",
  body: "배고픔을 기록하고 흐름을 확인하세요.",
} as const;

export const dividerExample = { above: "위쪽 내용", below: "아래쪽 내용" } as const;

export const topExample = {
  eyebrow: "2026년 9월",
  titles: { large: "화면의 첫 제목입니다", medium: "시트 안의 첫 제목입니다" },
  description: "TopBar와 달리 본문이라 스크롤과 함께 올라가고, 큰 글자에서도 잘리지 않아요.",
  body: "본문이 여기서 이어집니다.",
  sizeLabel: "제목 크기",
  sizes: [
    { value: "large", label: "큰 제목" },
    { value: "medium", label: "보통 제목" },
  ],
} as const;

export const headingExample = [
  { id: "hero", level: "level1", label: "랜딩 히어로 제목" },
  { id: "section", level: "level2", label: "섹션을 여는 큰 제목" },
  { id: "body", level: "level3", label: "본문 안의 제목" },
  { id: "card", level: "level2", semanticLevel: 4, label: "크게 보이지만 문서상 4단계인 카드 제목" },
  { id: "smallest", level: "level5", label: "가장 작은 단계" },
] as const;

export const buttonExample = {
  primary: { label: "저장", result: "저장을 눌렀어요" },
  secondary: { label: "취소", result: "취소를 눌렀어요" },
  disabled: "저장할 수 없음",
} as const;

export const iconButtonExample = [
  { icon: "favorite", label: "좋아요", tone: "secondary", result: "좋아요를 눌렀어요" },
  { icon: "close", label: "닫기", tone: "ghost", result: "닫기를 눌렀어요" },
] as const;

export const linkExample = { label: "컴포넌트 문서로 이동", href: "/components" } as const;

export const bottomCtaExample = {
  description: "설정은 나중에 바꿀 수 있어요.",
  primary: { label: "계속하기", result: "계속하기를 눌렀어요" },
  secondary: { label: "나중에", result: "나중에를 눌렀어요" },
} as const;

/*
  Logos are product assets, so the examples pass a one-letter mark through the logo slot. Apple keeps an empty
  mark: a dark letter on the black Apple button is invisible, and real products supply the provider's own artwork.
*/
export const authExample = {
  hero: { title: "어떤 계정으로 시작할까요", description: "쓰던 계정으로 바로 시작할 수 있어요." },
  pendingLabel: "로그인 중",
  footer: "개인정보 처리방침 · 이용약관",
  providers: [
    { id: "google", label: "Google", mark: "G" },
    { id: "kakao", label: "카카오", mark: "K" },
    { id: "naver", label: "네이버", mark: "N" },
    { id: "apple", label: "Apple", mark: "" },
  ],
} as const;

/** Preview-only completion delay; products clear pending from the real authentication result. */
export const authPreviewDelayMs = 1200;

export const floatingActionExample = {
  body: "기록 목록에서 새로운 순간을 남겨요.",
  label: "새 기록",
  result: (count: number) => `새 기록을 ${count}번 눌렀어요`,
} as const;

export const imageChoiceExample = {
  label: "프로필 사진",
  items: [0, 1, 2].map(index => ({ id: String(index), photo: index, label: `예제 사진 ${index + 1}` })),
  initial: "0",
  result: (label: string) => `${label}을 골랐어요`,
} as const;
