// Collection flow fixture shared by Web and Native. Each record carries its own group, and its date
// copy is derived from that group, so a "오늘" heading never sits above an older date (2026-10-17 S6 review).
export type CollectionFlowGroup = "today" | "week";
export const collectionFlowGroupLabels: Readonly<Record<CollectionFlowGroup, string>> = { today: "오늘", week: "지난 7일" };
export type CollectionFlowEntry = Readonly<{ id: string; title: string; type: string; body: string; group: CollectionFlowGroup; description: string }>;
const titles = ["산책길에서 찾은 작은 여유", "주말에 읽고 싶은 책", "나만의 아침 루틴", "좋아하는 동네 카페"] as const;
// Fixture "today" is 10월 5일; newest first.
const todayTimes = ["오후 8:40", "오후 3:25", "오후 12:05", "오전 9:10"] as const;
const total = 24;
const weekCount = total - todayTimes.length;
function weekDate(index: number) {
  // Spread the older records over the seven days before today (10월 4일 … 9월 28일), newest first.
  const day = 4 - Math.floor((index * 7) / weekCount);
  return day >= 1 ? `10월 ${day}일` : `9월 ${30 + day}일`;
}
export const collectionFlowEntries: readonly CollectionFlowEntry[] = Array.from({ length: total }, (_, i) => {
  const group: CollectionFlowGroup = i < todayTimes.length ? "today" : "week";
  const when = group === "today" ? `오늘 · ${todayTimes[i]}` : weekDate(i - todayTimes.length);
  return { id: String(i + 1), title: titles[i % titles.length]!, type: i % 2 ? "기록" : "사진", body: "바쁜 하루에도 잠깐 멈출 수 있는 곳이 있더라고요.", group, description: `${when} · ${i + 1}번째 이야기` };
});
/** A group heading belongs above the first visible record of each group, after filtering. */
export const startsCollectionFlowGroup = (visible: readonly CollectionFlowEntry[], index: number) => index === 0 || visible[index - 1]!.group !== visible[index]!.group;
