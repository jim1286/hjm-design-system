import type { SortableItem } from "../../packages/design-contracts/src/interaction-adapters.js";

/** Korean copy shared by the Web and Native interaction-adapter compositions (2026-10-17 composition review). */
export const interactionSeed = [{ id: "forest", label: "숲길" }, { id: "sea", label: "바닷가" }, { id: "cafe", label: "작은 카페" }] as const satisfies readonly SortableItem[];
export const interactionSortLabels = {
  instructions: "스페이스로 잡고 화살표로 이동, 스페이스로 놓거나 Escape로 취소합니다.",
  dragStart: (item: SortableItem) => `${item.label} 이동 시작`, dragCancel: "이동을 취소했어요",
  handle: (item: SortableItem) => `${item.label} 순서 이동`,
  previous: (item: SortableItem) => `${item.label} 앞으로`,
  next: (item: SortableItem) => `${item.label} 뒤로`,
  position: (item: SortableItem, position: number, total: number) => `${item.label}, ${total}개 중 ${position}번째`,
};
// Result copy is chosen from a constant table, as the guide's `noteStatusKey` (template keys escape extraction).
export const interactionNoteStatus = { idle: "작업을 선택해 주세요", failed: "다시 시도해 주세요", archived: "보관했어요" } as const;
export type InteractionNoteStatus = keyof typeof interactionNoteStatus;
export const interactionCopy = {
  sections: { order: "즐겨찾기 순서", note: "목록 작업", transition: "내용 전환", cards: "카드 탐색", goal: "목표 달성" },
  favorites: "즐겨찾기",
  currentOrder: (labels: readonly string[]) => `현재 순서: ${labels.join(" → ")}`,
  noteRow: "오늘 걸었던 숲길", noteActions: "내 기록 작업", noteShowActions: "기록 작업 보기", archive: "보관", remove: "삭제",
  nextState: "다음 상태", record: { start: "새로운 기록을 시작해요", ready: "기록이 준비됐어요" },
  textTransition: { start: "나만의 하루 🌿", ready: "저장 완료 👨‍👩‍👧‍👦" },
  places: "추천 장소", previousPlace: "이전 장소", nextPlace: "다음 장소",
  celebrate: "기록 달성 축하", celebrated: (count: number) => `${count}번째 기록을 남겼어요`,
} as const;
