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

// The largest step is level3 (24); level1/2 were removed as display sizes (2026-10-17 user decision, "글자 너무 커").
export const headingExample = [
  { id: "hero", level: "level3", semanticLevel: 1, label: "랜딩 대표 제목" },
  { id: "section", level: "level4", semanticLevel: 2, label: "섹션을 여는 제목" },
  { id: "body", level: "level5", semanticLevel: 3, label: "본문 안의 제목" },
  { id: "card", level: "level4", semanticLevel: 4, label: "구획 크기지만 문서상 4단계인 카드 제목" },
  { id: "smallest", level: "level5", semanticLevel: 5, label: "가장 작은 단계" },
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
  policyLinks: ["개인정보 처리방침", "이용약관"],
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
  // 2026-10-18 showItemLabels: a recipient picker shows names under the faces (BurnTok share sheet).
  recipients: {
    label: "보낼 사람",
    items: [{ id: "seoyeon", photo: 0, label: "서연" }, { id: "minjun", photo: 1, label: "민준" }, { id: "jiwoo", photo: 2, label: "지우와 친구들" }],
    initial: ["seoyeon"],
  },
} as const;

// ---- 입력 (2026-10-17 review C): Web examples are the canonical copy; Native read English fixtures with different
// items, selection and disabled states, so the two renderers could not be compared.

export const fieldExample = {
  label: "이름",
  description: "필수 정보는 입력 아래에서 설명합니다.",
  value: "홍길동",
  error: "이름을 다시 확인해 주세요.",
} as const;

export const searchFieldExample = {
  label: "선수 검색",
  clearLabel: "검색어 지우기",
  busyLabel: "검색 중",
  value: "야구",
  description: "검색어 지우기 버튼도 키보드로 사용할 수 있습니다.",
} as const;

export const textAreaExample = {
  label: "설명",
  value: "여러 줄 입력 예시",
  description: "긴 설명도 레이아웃 안에서 줄바꿈됩니다.",
} as const;

export const passwordFieldExample = {
  label: "비밀번호",
  revealLabel: "비밀번호 보기",
  concealLabel: "비밀번호 숨기기",
  value: "hjm-password",
  description: "표시 전환은 값과 독립적으로 동작합니다.",
} as const;

export const otpFieldExample = {
  label: "인증번호",
  length: 6,
  value: "128",
  description: "여섯 자리를 한 번에 입력하거나 붙여넣을 수 있습니다.",
} as const;

export const otpPreviewExample = {
  intro: "한 번에 붙여넣어도, 한 글자씩 입력해도 같은 인증번호입니다.",
  cardLabel: "인증번호 · 카드형",
  underlineLabel: "인증번호 · 밑줄형",
  length: 6,
  error: "인증번호를 다시 확인해 주세요.",
  complete: "입력이 완료됐어요.",
  incomplete: "6자리 숫자를 입력해 주세요.",
  showError: "오류 상태 보기",
} as const;

export const numberFieldExample = {
  label: "수량",
  min: 0,
  max: 10,
  value: 2,
  decrementLabel: "수량 줄이기",
  incrementLabel: "수량 늘리기",
} as const;

export const sliderExample = {
  label: "완성도",
  min: 0,
  max: 100,
  value: 72,
  decrementLabel: "완성도 낮추기",
  incrementLabel: "완성도 높이기",
  valueText: (value: number) => `${value}%`,
} as const;

export const formExample = {
  label: "담당자 정보",
  field: { label: "담당자", clearLabel: "담당자 지우기", busyLabel: "찾는 중", value: "홍길동" },
  submit: "저장",
  result: "저장했어요",
  fallbackError: "저장하지 못했어요",
} as const;

export const datePickerExample = {
  label: "관람일",
  placeholder: "날짜를 선택하세요",
  clearLabel: "날짜 지우기",
  closeLabel: "달력 닫기",
  month: "2027-02",
  monthLabel: "2027년 2월",
  accessibleName: ({ date, isToday, isSelected }: { date: string; isToday: boolean; isSelected: boolean }) =>
    `${date}${isToday ? ", 오늘" : ""}${isSelected ? ", 선택됨" : ""}`,
} as const;

export const filePickerExample = {
  label: "첨부 이미지",
  buttonLabel: "파일 선택",
  dropzoneLabel: "이미지를 여기에 놓으세요",
  hint: "PNG 또는 JPG, 최대 4개",
  result: "파일을 선택했어요",
} as const;

export const checkboxExample = { label: "동의합니다", description: "선택 상태와 설명이 함께 노출됩니다.", checked: true } as const;

export const radioExample = { label: "기본 배송지", description: "하나만 고를 수 있어요.", checked: true } as const;

export const checkboxGroupExample = {
  label: "알림 받을 방법",
  initial: ["email"],
  items: [
    { id: "email", label: "이메일" },
    { id: "push", label: "앱 푸시" },
    { id: "sms", label: "문자 (지금은 사용할 수 없음)", disabled: true },
  ],
} as const;

export const radioGroupExample = {
  label: "배송 방법",
  initial: "standard",
  items: [
    { value: "standard", label: "일반 배송" },
    { value: "express", label: "빠른 배송" },
    { value: "dawn", label: "새벽 배송 (지금은 사용할 수 없음)", disabled: true },
  ],
} as const;

export const switchExample = { label: "알림 받기", checked: true } as const;

export const segmentedControlExample = {
  label: "보기 방식",
  initial: "list",
  items: [{ value: "list", label: "목록" }, { value: "grid", label: "격자" }],
} as const;

export const chipExample = {
  label: "기록 필터",
  items: [{ id: "photo", label: "사진 있음" }, { id: "favorite", label: "즐겨찾기" }],
  initial: ["photo"],
} as const;

export const selectExample = {
  label: "언어",
  placeholder: "언어 선택",
  emptySelectionLabel: "선택 안 함",
  dismissLabel: "닫기",
  initial: "ko",
  items: [{ id: "ko", label: "한국어", textValue: "한국어" }, { id: "en", label: "English", textValue: "English" }],
} as const;

export const comboboxExample = {
  label: "도시",
  placeholder: "도시 이름을 입력하세요",
  clearLabel: "도시 지우기",
  dismissLabel: "닫기",
  emptyMessage: "검색 결과가 없습니다",
  loadingMessage: "검색 중",
  selectionRequiredMessage: "도시를 선택하세요",
  items: [{ id: "seoul", label: "서울" }, { id: "busan", label: "부산" }],
} as const;

export const toggleGroupExample = {
  title: "여러 개를 함께 켜기",
  description: "한 번에 하나만 고를 때는 구간 선택을 써요.",
  style: {
    label: "글자 꾸미기",
    initial: ["bold"],
    items: [
      { id: "bold", label: "굵게" },
      { id: "italic", label: "기울임" },
      { id: "underline", label: "밑줄" },
      { id: "strike", label: "취소선", disabled: true },
    ],
  },
  empty: "꾸미지 않음",
  filters: {
    label: "기록 필터",
    items: [{ id: "photo", label: "사진 있음" }, { id: "long", label: "긴 글" }, { id: "favorite", label: "즐겨찾기" }],
  },
} as const;

/** Labels in item order, so the status reads "굵게 + 밑줄" instead of internal ids. */
export function toggleGroupStatus(pressed: ReadonlySet<string>): string {
  return toggleGroupExample.style.items.filter(item => pressed.has(item.id)).map(item => item.label).join(" + ") || toggleGroupExample.empty;
}

export const tagsInputExample = {
  title: "태그로 모아두기",
  description: "목록에 없는 말도 직접 만들 수 있어요.",
  label: "태그",
  fieldDescription: "Enter로 추가하고, 빈 칸에서 지우기를 두 번 누르면 마지막 태그가 지워져요.",
  placeholder: "태그를 적어보세요",
  initial: ["산책"],
  maxTags: 5,
  removeLabel: (tag: string) => `${tag} 지우기`,
  duplicate: (tag: string) => `${tag}은(는) 이미 있어요`,
  limit: "태그는 5개까지 넣을 수 있어요",
} as const;

export const dateRangeExample = {
  title: "기간으로 골라보기",
  description: "시작일을 누르고 종료일을 누르면 돼요.",
  month: "2026-09",
  monthLabel: "2026년 9월",
  rangeLabels: { start: "시작일", end: "종료일", between: "기간 안" },
  status: (start: string | null, end: string | null) =>
    start === null ? "기간을 골라 주세요" : end === null ? `${start}부터 …` : `${start} ~ ${end}`,
} as const;

export const mentionsExample = {
  title: "함께한 사람을 적어요",
  description: "@를 입력하면 이름을 골라 넣을 수 있어요.",
  label: "오늘의 기록",
  fieldDescription: "이름 앞에 @를 붙이면 후보가 나와요.",
  emptyMessage: "찾는 사람이 없어요",
  listLabel: "사람 후보",
  save: "기록 저장하기",
  savedList: "저장한 기록",
  emptySaved: { title: "아직 저장한 기록이 없어요", description: "적고 나서 저장하면 여기에 남아요." },
  people: [
    { id: "mina", label: "미나", description: "같이 걷는 사람" },
    { id: "minsu", label: "민수", description: "저녁을 차린 사람" },
    { id: "jun", label: "준", description: "사진을 찍는 사람" },
  ],
} as const;

export const transferListExample = {
  title: "모아볼 기록 고르기",
  description: "담고 싶은 기록을 모아둔 기록으로 옮겨요.",
  initialTarget: ["view"],
  records: [
    { id: "walk", label: "느리게 걸었던 오후", textValue: "느리게 걸었던 오후" },
    { id: "meal", label: "함께 먹은 저녁", textValue: "함께 먹은 저녁" },
    { id: "view", label: "창밖으로 본 풍경", textValue: "창밖으로 본 풍경" },
    { id: "rain", label: "비 오던 아침", textValue: "비 오던 아침" },
    { id: "locked", label: "잠긴 기록", textValue: "잠긴 기록", disabled: true },
  ],
  // Direction is drawn by TransferList (it depends on the panel layout), so the labels carry no arrows.
  labels: { source: "전체 기록", target: "모아둔 기록", toTarget: "담기", toSource: "빼기", selectAll: "모두 선택", empty: "여기에는 아직 없어요" },
  moved: (labels: readonly string[], direction: "toTarget" | "toSource") =>
    `${labels.join(", ")}${direction === "toTarget" ? "을(를) 담았어요" : "을(를) 뺐어요"}`,
} as const;

export const agreementExample = {
  top: { eyebrow: "가입", title: "기록을 시작할까요", description: "이메일과 약관 동의만 있으면 돼요." },
  emailLabel: "이메일",
  accessibilityLabel: "가입 약관 동의",
  allLabel: "전체 동의하기",
  requiredLabel: "(필수)",
  optionalLabel: "(선택)",
  items: [
    { id: "terms", label: "서비스 이용약관", required: true, detail: { label: "전문 보기", href: "#terms" } },
    { id: "privacy", label: "개인정보 처리방침", required: true, detail: { label: "전문 보기", href: "#privacy" } },
    { id: "age", label: "만 14세 이상입니다", required: true },
    { id: "marketing", label: "마케팅 정보 수신", description: "새 소식과 이벤트를 알려드려요. 언제든 끌 수 있어요.", detail: { label: "전문 보기" } },
  ],
  missing: (labels: readonly string[]) => `${labels.join(", ")}에 동의해 주세요`,
  submit: "가입하고 시작하기",
  joined: { title: "가입했어요", description: "이제 첫 기록을 남겨보세요." },
} as const;

export const ratingExample = {
  title: "오늘의 경험은 어땠나요?",
  description: "별 1개부터 5개 사이에서 골라주세요.",
  label: "내 점수",
  initial: 3,
  clearLabel: "점수 지우기",
  save: "점수 저장",
  saved: (score: number) => `${score}점으로 저장했어요`,
  valueLabel: (value: number | null) => value === null ? "아직 고르지 않았어요" : `5점 만점에 ${value}점`,
  // Interactive ratings take whole scores; halves exist only in read-only averages (resolveRating contract).
  half: { label: "평균 점수", value: 3.5 },
  average: { label: "평균 만족도", value: 4.3, hint: "예시 응답 120개" },
} as const;

export const previewResetLabel = "예시 다시 시작";

// ---- 탐색·오버레이 (2026-10-17 review D): Native showed English placeholders ("Account", "Recent", "More actions",
// "Load more", "Open sheet") with different items and debug lines, so neither renderer could be compared.

export const tabsExample = {
  label: "선수 정보",
  items: [
    { id: "first", label: "첫 번째", panel: "첫 번째 패널 내용" },
    { id: "second", label: "두 번째", panel: "두 번째 패널 내용" },
  ],
} as const;

export const stepsExample = {
  steps: [{ id: "account", label: "계정" }, { id: "profile", label: "프로필" }, { id: "confirm", label: "확인" }],
  currentStepId: "profile",
  statusLabels: { pending: "예정", current: "현재", complete: "완료", error: "오류" },
  accessibleName: ({ position, total, label }: { position: number; total: number; label: string }) => `${total}단계 중 ${position}단계, ${label}`,
} as const;

export const topBarExample = { title: "알림 설정", back: "뒤로", done: "완료" } as const;

export const menuExample = {
  triggerLabel: "작업 더보기",
  label: "선수 작업",
  dismissLabel: "닫기",
  items: [{ id: "rename", label: "이름 바꾸기" }, { id: "share", label: "공유하기" }, { id: "delete", label: "삭제", tone: "danger" }],
  result: (label: string) => `${label}을(를) 골랐어요`,
} as const;

export const bottomNavigationExample = {
  label: "주요 탐색",
  initial: "home",
  items: [{ id: "home", label: "홈", icon: { name: "home" } }, { id: "profile", label: "프로필", icon: { name: "user" } }],
} as const;

/** LoadMore appends real rows; the footer's own status/complete state reports the result (no separate status line). */
export const loadMoreExample = {
  listLabel: "불러온 기록",
  pageSize: 3,
  totalPages: 3,
  item: (index: number) => `${index}번째 산책 기록`,
  labels: { loadMore: "더 보기", loading: "불러오는 중", retry: "다시 시도", complete: "모두 불러왔습니다" },
} as const;

export const paginationExample = {
  label: "산책 기록 페이지",
  listLabel: "산책 기록 목록",
  total: 125,
  pageSize: 5,
  title: "걸었던 날을 모아봤어요",
  description: "산책 기록 125개",
  item: (index: number) => `${index}번째 산책 기록`,
  itemDescription: "걷다가 만난 풍경을 담았어요.",
  range: (start: number, end: number) => `${start}–${end}번째 기록`,
  labels: { previous: "이전 페이지", next: "다음 페이지" },
  accessibleName: ({ page, totalPages, current }: { page: number; totalPages: number; current: boolean }) =>
    `${totalPages}페이지 중 ${page}페이지${current ? ", 현재 페이지" : "로 이동"}`,
} as const;

export const sheetExample = {
  trigger: "필터 열기",
  title: "필터",
  closeLabel: "필터 닫기",
  description: "화면 크기와 방향에 맞춰 배치되는 보조 작업 영역입니다.",
  body: "조건을 선택한 뒤 적용하세요.",
  apply: "적용",
} as const;

export const tooltipExample = {
  label: "도움말",
  content: "자세한 도움말",
  hint: "도움말 버튼에 초점을 두거나 가리키면 설명이 보여요.",
} as const;

// ---- 데이터 표시 (2026-10-17 review E): Native showed English placeholders ("Live", "Generated app", "Morning loop",
// "Cancel") with different counts and tones, plus debug lines ("Selected row: None"), so neither renderer could be compared.

export const qrCodeExample = { href: "https://example.com/한글", label: "공유 페이지 QR 코드", fallback: "공유 페이지 열기" } as const;

export const badgeExample = [{ label: "진행 중" }, { label: "완료", tone: "success" }] as const;

export const tagExample = [{ label: "내야수" }, { label: "등록 선수", tone: "success" }, { label: "2026 시즌" }] as const;

export const avatarExample = { name: "홍길동" } as const;

export const cardExample = {
  title: "오늘의 산책 기록",
  description: "골목길을 따라 40분 걸었어요.",
  action: "자세히",
  result: "산책 기록을 열었어요",
} as const;

/** Rows lead with an Avatar so the List's indented separator starts under the text, as its default assumes. */
export const listExample = {
  label: "선수 목록",
  items: [
    { id: "hong", title: "홍길동", description: "내야수" },
    { id: "kim", title: "김하늘", description: "외야수" },
  ],
} as const;

export const listRowExample = { title: "홍길동", description: "선수 상세 보기", result: "선수 상세를 열었어요" } as const;

export const counterBadgeExample = {
  count: 3,
  bellLabel: "알림 3개",
  inbox: "받은 편지함",
  inboxCount: "읽지 않은 편지 12개",
  inboxValue: 12,
} as const;

export const statisticExample = { id: "orders", label: "오늘 주문", value: "128", trend: { direction: "up", label: "어제보다 12% 증가" } } as const;

export const timelineExample = {
  items: [
    { id: "created", label: "아이디어 생성", timestamp: "10:00", tone: "info" },
    { id: "completed", label: "실행 완료", timestamp: "10:12", description: "결과를 저장했습니다.", tone: "success", emphasized: true },
  ],
  accessibleName: ({ position, total, label }: { position: number; total: number; label: string }) => `${total}개 중 ${position}번째, ${label}`,
} as const;

export const descriptionListExample = {
  label: "선수 정보",
  items: [{ id: "status", label: "상태", value: "준비됨" }, { id: "owner", label: "담당", value: "홍길동" }],
} as const;

export const imageExample = { label: "산 능선 사진", width: 320, height: 180 } as const;

export const uploadItemExample = {
  descriptor: { id: "photo", name: "profile-photo.png", sizeLabel: "1.2 MB", state: { status: "uploading", progress: 0.64, progressLabel: "1.2 MB 중 64% 업로드" } },
  labels: { pending: "대기 중", uploading: "업로드 중", success: "업로드 완료", cancel: "업로드 취소", retry: "다시 시도" },
  result: "업로드를 취소했어요",
} as const;

export const accordionExample = {
  label: "자주 묻는 질문",
  items: [{ id: "shipping", title: "언제 도착하나요?", panel: "내일 도착할 예정입니다." }],
} as const;

export const collapsibleExample = { trigger: "배송 정보 더 보기", body: "주문 다음 날 도착합니다. 도착 전날 알림을 보내드려요." } as const;

export const assetExample = {
  title: "이미지·영상 표시",
  description: "아이콘·사진·움직이는 그림·영상을 같은 액자 규칙으로 맞춰요.",
  groupLabel: "오늘 도착한 편지들",
  group: [
    { id: "icon", kind: "icon", glyph: "◇" },
    { id: "forest", kind: "image", glyph: "🌲", label: "숲 사진" },
    { id: "fox", kind: "lottie", glyph: "🦊", label: "달리는 여우", playable: true },
  ],
  sizes: [
    { id: "moon", kind: "image", size: "small", shape: "circle", glyph: "🌙", label: "작은 원형" },
    { id: "sun", kind: "image", size: "medium", shape: "square", glyph: "🌞", label: "중간 정사각" },
    { id: "intro", kind: "video", size: "xlarge", glyph: "🎬", label: "소개 영상", playable: true },
  ],
} as const;

/** Expression names are shown in Korean; the raw pose id ("idle") used to be printed under the avatar (review E12). */
export const animatedBlobatarExample = {
  name: "미리보기",
  seed: "hjm-motion-demo",
  expressionLabel: "표정",
  motion: "움직임",
  expressions: [
    { value: "idle", label: "기본" },
    { value: "happy", label: "기쁨" },
    { value: "sad", label: "슬픔" },
    { value: "surprised", label: "놀람" },
    { value: "wink", label: "윙크" },
    { value: "sleepy", label: "졸림" },
    { value: "thinking", label: "생각" },
  ],
} as const;

export const animatedStatisticTools = { decrease: "줄이기", increase: "늘리기", reset: "0으로", step: 125 } as const;

export const voiceNoteTools = { loading: "불러오는 중 상태", error: "오류 상태" } as const;

// 상태와 알림 · 제공자 (2026-10-17 review F: Native showed English placeholders and different compositions).
export const resultExample = {
  status: "success",
  title: "저장했어요",
  description: "변경 사항이 모든 기기에 반영되었습니다.",
  action: "확인",
  actionResult: "확인했어요",
} as const;

export const noticeExample = { title: "저장 전 확인", description: "입력한 내용을 다시 확인해 주세요." } as const;

export const progressExample = { label: "업로드", value: 64, valueText: "64%" } as const;

// Skeleton preview (2026-10-17): single shapes, then the list-row and card placeholders screens use while loading.
// One busy label per preview; the bars themselves are hidden from assistive tech.
export const skeletonExample = {
  label: "미리보기 불러오는 중",
  sections: { shapes: "모양", listRow: "목록 행", card: "카드" },
  textLines: 3,
  rowLines: 2,
  rowCount: 3,
  cardLines: 2,
  buttonWidth: "40%",
} as const;

export const spinnerExample = { label: "불러오는 중" } as const;

export const bottomInfoExample = {
  title: "행동 아래의 조건",
  description: "상태를 알리는 Notice와 다른 자리입니다.",
  action: "가입하고 시작하기",
  consent: ["가입하면 이용약관과 개인정보 처리방침에 동의하는 것으로 봅니다."],
  conditions: ["결제 수수료는 결제 시점에 확정됩니다.", "환불은 결제일로부터 7일 이내에 가능합니다."],
} as const;

export const designSystemProviderExample = {
  title: "적용된 환경과 상태 색",
  theme: "테마",
  direction: "글자 방향",
  textScale: "글자 배율",
  reducedMotion: "동작 줄이기",
  palette: "상태 색",
} as const;

// Web-only utilities (catalog: Native unsupported).
export const skipNavExample = {
  label: "본문으로 바로가기",
  app: "기록 앱",
  menuLabel: "주요 메뉴",
  menu: [{ id: "records", label: "내 기록" }, { id: "archive", label: "보관함" }, { id: "settings", label: "설정" }],
  mainLabel: "본문",
  mainTitle: "오늘의 기록",
  mainBody: "건너뛰기 링크를 누르면 메뉴를 지나 이 영역으로 초점이 옮겨집니다.",
  hint: "Tab 키로 처음 초점을 옮기면 화면 위에 나타납니다.",
  focusTool: "건너뛰기 링크에 초점 주기",
} as const;

export const visuallyHiddenExample = {
  button: "알림",
  context: "읽지 않은 알림 3개",
  hint: "추가 맥락은 화면에는 보이지 않고 접근성 트리에 남습니다.",
} as const;

export const toastExample = {
  saved: { id: "showcase-saved", title: "저장했어요", description: "카드를 누르면 저장한 항목을 열어요.", closeLabel: "닫기", pressLabel: "저장한 항목 열기", pressResult: "저장한 항목을 열었어요" },
  reply: { id: "showcase-reply", title: "새 답장이 도착했어요", description: "카드를 누르면 답장을 열어요.", closeLabel: "답장 알림 닫기", pressLabel: "답장 열기", pressResult: "답장을 열었어요" },
  dismissed: "알림을 닫았어요",
  showSaved: "저장 알림 띄우기",
  showReply: "답장 알림 띄우기",
  showAgain: "다시 띄우기",
} as const;

/** Screen-shell story (common-shell.md): one screen tool in `actions`, one primary action in `footer`, a short body list. */
export const screenShellExample = {
  title: "내 소식",
  intro: "나에게 도착한 이야기를 여기에서 확인해요.",
  settingsLabel: "소식 설정",
  settingsDetail: "소식 설정 예제 · 받을 소식을 고르는 화면을 연결하는 자리예요.",
  primaryLabel: "이야기 남기기",
  primaryDetail: "이야기 작성 예제 · 새 이야기를 쓰는 화면을 연결하는 자리예요.",
  items: [
    { id: "photo", title: "서연님이 사진을 올렸어요", description: "방금 전" },
    { id: "reply", title: "민준님이 내 이야기에 답글을 남겼어요", description: "10분 전" },
    { id: "follow", title: "지우님이 회원님을 구독하기 시작했어요", description: "어제" },
  ],
} as const;
