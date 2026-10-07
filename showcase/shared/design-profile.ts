export const profileOptions = [
  { id: "retro", label: "레트로" }, { id: "paper", label: "종이" }, { id: "forest", label: "숲" },
  { id: "minimal", label: "미니멀" }, { id: "editorial", label: "에디토리얼" }, { id: "brutalist", label: "브루탈리즘" },
  { id: "glass", label: "유리" }, { id: "aurora", label: "오로라" }, { id: "terminal", label: "터미널" }, { id: "clay", label: "클레이" },
] as const;
export const profileCopy = {
  title: "테마 조합", intro: "같은 기록·도구·저장 행동을 10가지 표현으로 비교해요. 테마를 바꿔도 입력과 선택을 유지해요.",
  choose: "표현 선택", compare: "10개 테마 한눈에 보기", show: "비교 펼치기", hide: "비교 접기",
  screen: "오늘의 기록", description: "산책과 독서, 작은 기록을 모아 보세요.", tools: "기록 도구", name: "기록 이름", initial: "저녁 산책",
  filter: "기록 기간", day: "오늘", week: "이번 주", save: "미리보기 기록 저장", retry: "다시 저장", fail: "저장 실패 재현",
  idle: "저장 전", pending: "기록 저장 중", saved: "미리보기 기록을 저장했어요", failed: "저장에 실패했어요. 입력을 유지했어요.",
  walk: "산책", read: "독서", rest: "휴식", walkBody: "공원을 걸으며 생각을 정리했어요.", readBody: "좋아하는 문장을 한 줄 남겼어요.", restBody: "잠시 쉬어가는 시간을 기록했어요.",
  limitation: "유리는 현재 단색 표면과 빛 효과로 표시해요. 실제 배경 흐림과 클레이 안쪽 그림자는 추가 구현이 필요해요.",
  headingScale: "제목 크기 비교",
};
export const profileHeadingSamples = [
  { level: "level1", label: "큰 제목" }, { level: "level2", label: "주 제목" },
  { level: "level3", label: "구역 제목" }, { level: "level4", label: "카드 제목" },
  { level: "level5", label: "작은 제목" },
] as const;
