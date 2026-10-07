export const profileOptions = [
  { id: "retro", label: "레트로" }, { id: "paper", label: "종이" }, { id: "forest", label: "숲" },
  { id: "minimal", label: "미니멀" }, { id: "editorial", label: "에디토리얼" }, { id: "brutalist", label: "브루탈리즘" },
  { id: "glass", label: "유리" }, { id: "aurora", label: "오로라" }, { id: "terminal", label: "터미널" }, { id: "clay", label: "클레이" },
] as const;
export const profileCopy = {
  title: "테마 조합", intro: "같은 기록·도구·저장 행동을 10가지 표현으로 비교해요. 테마를 바꿔도 입력과 선택을 유지해요.",
  choose: "표현 선택", compare: "10개 테마 한눈에 보기", show: "비교 펼치기", hide: "비교 접기",
  product: "앱 테마 적용", productNote: "앱의 브랜드·구성·화면 설정을 참고 테마와 조합해요. 입력과 선택은 유지해요.",
  screen: "오늘의 기록", description: "산책과 독서, 작은 기록을 모아 보세요.", tools: "기록 도구", name: "기록 이름", initial: "저녁 산책",
  filter: "기록 기간", day: "오늘", week: "이번 주", save: "미리보기 기록 저장", retry: "다시 저장", fail: "저장 실패 재현",
  idle: "저장 전", pending: "기록 저장 중", saved: "미리보기 기록을 저장했어요", failed: "저장에 실패했어요. 입력을 유지했어요.",
  walk: "산책", read: "독서", rest: "휴식", walkBody: "공원을 걸으며 생각을 정리했어요.", readBody: "좋아하는 문장을 한 줄 남겼어요.", restBody: "잠시 쉬어가는 시간을 기록했어요.",
  limitation: "질감은 기기와 접근성 설정에 맞춰 표시해요. 효과를 사용할 수 없어도 내용과 입력은 유지돼요.",
  material: "표면 질감 비교", materialTitle: "배경 위의 기록 카드", materialBody: "뒤의 무늬를 통해 유리의 흐림과 클레이의 깊이를 비교해 보세요.", materialDraft: "질감 카드 초안",
  headingScale: "제목 크기 비교", codeTitle: "테마가 적용된 코드", codeSource: 'const 기록 = { 제목: "저녁 산책", 완료: true };\n',
  tabs: "탭 선택 표시 비교", tabsLabel: "기록 탭", tabsEntry: "기록", tabsHistory: "보관함",
  tabsDraft: "탭 안 초안", tabsHistoryBody: "보관한 기록을 이곳에서 확인해요.", tabsAppearance: "탭 표시 방식",
  tabsInherit: "테마 따르기", tabsStandard: "밑줄", tabsSlide: "이동", tabsGooey: "늘어남",
  tabsNote: "테마와 표시 방식을 바꿔도 선택한 탭과 초안을 유지해요.",
  saveActions: "기록 저장 행동", popover: "팝오버 열기",
  chrome: "입력·알림·오버레이 비교", dialog: "대화상자 열기", sheet: "패널 열기", close: "닫기",
  overlayTitle: "기록 편집", overlayDraft: "오버레이 초안", nextTheme: "다음 테마",
  chromeNotice: "테마를 바꿔도 초안은 유지돼요.", toastCopy: "미리보기 기록을 저장했어요.",
  liquidToast: "물방울 알림의 테마 비교",
  assets: "자산 액자 비교", assetRounded: "테마의 둥근 모서리", assetSquare: "명시한 정사각", assetCircle: "명시한 원형",
  assetNote: "같은 기존 확인 그림으로 액자를 비교해요. 그림의 재질·각도는 바뀌지 않아요.",
};
export const profileHeadingSamples = [
  { level: "level1", label: "큰 제목" }, { level: "level2", label: "주 제목" },
  { level: "level3", label: "구역 제목" }, { level: "level4", label: "카드 제목" },
  { level: "level5", label: "작은 제목" },
] as const;
