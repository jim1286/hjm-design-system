export type ContentTransitionComparisonProps = { mode?: "tabs" | "steps" };
export const transitionOptions = [
  { value: "profile", label: "테마 따르기" }, { value: "fade", label: "나타남" },
  { value: "rise", label: "떠오름" }, { value: "slide", label: "옆으로" },
  { value: "scale", label: "확대" }, { value: "none", label: "즉시" },
] as const;
export type TransitionChoice = typeof transitionOptions[number]["value"];
export const transitionSections = [
  { id: "plan", label: "계획", title: "작은 계획부터", description: "오늘 남기고 싶은 기록을 정해 보세요.", body: "짧은 제목 하나로 시작해도 좋아요." },
  { id: "draft", label: "작성", title: "같은 초안을 이어가요", description: "선택과 전환 표현을 바꿔도 입력은 남아요.", body: "탭과 단계의 선택은 제품 상태가 관리해요. 전환은 현재 내용 하나의 표현만 담당해요. 이전 내용을 복제해 입력이나 행동을 두 개 만들지 않아요." },
  { id: "review", label: "확인", title: "마지막으로 확인해요", description: "완료 행동과 실패 후 재시도를 확인하세요.", body: "이 예제는 이 화면의 기록만 확인해요. 서버에 저장하지 않아요." },
] as const;
export const transitionCopy = {
  title: "내용 전환 비교", intro: "같은 내용과 초안을 테마·전환 표현별로 비교해요.",
  draft: "기록 초안", initial: "저녁 산책", theme: "현재 테마", nextTheme: "다음 테마",
  appearance: "전환 표현", tabs: "기록 단계", next: "다음", back: "이전",
  complete: "기록 확인", fail: "완료 실패 재현", failArmed: "다음 완료에서 실패 재현",
  failed: "확인하지 못했어요. 초안은 남아 있어요.", done: "기록을 확인했어요", restart: "다시 비교",
} as const;
