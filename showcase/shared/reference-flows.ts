// Shared demo contracts: source decisions and product-owned boundaries are in
// docs/plans/reference-library-design-2026-10-03.md. No persistence/network is implied.
export const records = [
  { id: "walk", title: "비 온 뒤의 산책", category: "일상", saved: true, body: "천천히 걷다 보니 평소 지나치던 나무가 보였다. 오늘은 이 장면을 남겨 둔다.", image: true },
  { id: "book", title: "책에서 만난 한 문장", category: "독서", saved: false, body: "빨리 끝내기보다 오래 생각하고 싶은 문장을 골랐다. 다음에 읽을 때의 생각도 궁금하다.", image: false },
  { id: "trip", title: "바다가 보이는 자리", category: "여행", saved: true, body: "창문 너머의 바다를 한참 바라봤다. 특별한 일정 없이 보낸 오후도 좋은 기록이 된다.", image: true },
] as const;
export const categories = ["일상", "독서", "여행"] as const;
export type Filters = { categories: string[]; savedOnly: boolean };
export const emptyFilters = (): Filters => ({ categories: [], savedOnly: false });
export function filterRecords(query: string, filters: Filters) {
  const terms = query.normalize("NFKC").trim().toLocaleLowerCase("ko-KR").split(/\s+/).filter(Boolean);
  return records.filter(record => (!filters.categories.length || filters.categories.includes(record.category))
    && (!filters.savedOnly || record.saved)
    && terms.every(term => `${record.title} ${record.body}`.normalize("NFKC").toLocaleLowerCase("ko-KR").includes(term)));
}
// Service introduction feature rows: copy comes from a table (product: id → i18n key), not from template-built numbers.
export const introFeatures = [
  { id: "short", order: "01", title: "한 줄이면 충분해요", body: "생각이 사라지기 전에 짧게 남겨요." },
  { id: "topic", order: "02", title: "내가 정한 주제로", body: "일상·독서·여행을 내 방식으로 모아요." },
  { id: "reread", order: "03", title: "다시 읽기 쉽게", body: "제목과 본문에서 기억을 찾아요." },
] as const;
export const comparisonModeCopy = { list: "목록 중심", reading: "읽기 중심", image: "이미지 중심" } as const;
export type ComparisonMode = keyof typeof comparisonModeCopy;
export type EditorKind = "first" | "settings" | "review";
export type Draft = { title: string; category: string; enabled: boolean };
export const initialDraft = (kind: EditorKind): Draft => ({ title: kind === "settings" ? "나의 기록" : "", category: "일상", enabled: true });
export function draftError(draft: Draft) { return draft.title.trim() ? undefined : "이름이나 내용을 입력해 주세요."; }
export function sameDraft(a: Draft, b: Draft) { return a.title === b.title && a.category === b.category && a.enabled === b.enabled; }
export const editorCopy = {
  first: { title: "첫 기록을 남겨 볼까요", intro: "작은 장면 하나로 시작해요. 중간에 멈춰도 여기서 이어 쓸 수 있어요.", field: "남기고 싶은 기록", submit: "기록 저장", complete: "첫 기록을 저장했어요" },
  settings: { title: "나에게 맞는 기록", intro: "이름과 알림을 바꾸고, 변경한 내용만 저장해요.", field: "기록장 이름", submit: "변경 내용 저장", complete: "변경 내용을 저장했어요" },
  review: { title: "선택한 내용을 확인해요", intro: "기록의 이름과 분류를 확인하고 확정해요. 각 항목은 다시 수정할 수 있어요.", field: "기록 이름", submit: "이 내용으로 확정", complete: "선택한 내용을 확정했어요" },
} as const;
export const scopeCopy = "미리보기 전용 · 저장과 초안은 이 화면이 열려 있는 동안만 유지됩니다. 서버 요청은 없어요.";
export const flowSteps = [{ id: "purpose", label: "주제" }, { id: "write", label: "기록" }, { id: "review", label: "확인" }];
export const stepLabels = { pending: "대기", current: "현재", complete: "완료", error: "확인 필요" };
export const stepName = ({ position, total, label }: { position: number; total: number; label: string }) => `${total}단계 중 ${position}, ${label}`;
