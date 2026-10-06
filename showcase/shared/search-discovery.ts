/**
 * Shared fixture and rules for `배포/화면/검색/검색 결과와 필터` (Web and Native; `기본 흐름/검색과 필터`
 * and 공통 화면/검색 were merged into it on 2026-10-06 because they rendered this same preview). Until 2026-10-06 the
 * two previews kept separate arrays (3 and 24 items) and different filter rules, so the same story could show different results per platform.
 * All copy and records are Showcase-owned examples, not product defaults and not reference-app copy.
 * Since 2026-10-06 the screen behavior (phases, commit routing, recent/suggested sections, filter sheet draft,
 * empty causes, announcements) is SearchScreen's public API; this file only plays the product's data layer.
 */

export type DiscoveryKind = "note" | "photo" | "place";
export type DiscoveryPeriod = "all" | "week" | "month" | "year";
export type DiscoverySort = "relevance" | "newest" | "oldest";
export type DiscoveryFilters = Readonly<{
  kinds: readonly DiscoveryKind[];
  period: DiscoveryPeriod;
  photoOnly: boolean;
  savedOnly: boolean;
}>;
export type DiscoveryEntry = Readonly<{
  id: string;
  title: string;
  excerpt: string;
  kind: DiscoveryKind;
  /** Calendar date (YYYY-MM-DD). Sorting and periods use this, never the id order. */
  createdAt: string;
  hasPhoto: boolean;
  saved: boolean;
  keywords: readonly string[];
}>;
export type FilterScope = "all" | "kind" | "period";
export type AppliedFilterKey = "photoOnly" | "savedOnly" | "period" | `kind:${DiscoveryKind}`;

/** Fixed "today" keeps period filters and date labels deterministic in stories and tests. */
export const discoveryToday = "2026-10-06";

export const discoveryKinds: readonly { id: DiscoveryKind; label: string }[] = [
  { id: "note", label: "기록" },
  { id: "photo", label: "사진" },
  { id: "place", label: "장소" },
];
export const discoveryPeriods: readonly { id: DiscoveryPeriod; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "week", label: "이번 주" },
  { id: "month", label: "이번 달" },
  { id: "year", label: "올해" },
];
export const discoverySorts: readonly { id: DiscoverySort; label: string }[] = [
  { id: "relevance", label: "관련도순" },
  { id: "newest", label: "최신순" },
  { id: "oldest", label: "오래된순" },
];
export const discoveryTopics = ["산책", "카페", "책", "아침", "정원"] as const;
export const discoveryPageSize = 8;
export const recentSearchLimit = 10;

type Row = [title: string, excerpt: string, kind: DiscoveryKind, createdAt: string, hasPhoto: boolean, saved: boolean, keywords: string];
const rows: readonly Row[] = [
  ["산책길에서 찾은 작은 여유", "바쁜 하루에도 잠깐 멈출 수 있는 곳", "photo", "2026-10-06", true, true, "산책 공원"],
  ["저녁 산책 코스 메모", "강변을 따라 걷는 40분", "note", "2026-10-05", false, false, "산책 강변"],
  ["좋아하는 동네 카페", "오래 앉아 책을 읽고 싶은 오후", "place", "2026-10-04", true, true, "카페 책"],
  ["비 온 뒤 산책", "젖은 낙엽 냄새가 좋았던 길", "photo", "2026-10-02", true, false, "산책 비"],
  ["주말에 읽고 싶은 책", "서점에서 고른 세 권", "note", "2026-10-01", false, true, "책 주말"],
  ["나만의 아침 루틴", "창문을 열고 물 한 잔", "note", "2026-09-30", false, false, "아침 루틴"],
  ["아침 산책과 커피 한 잔", "동네 한 바퀴 뒤의 첫 잔", "note", "2026-09-28", false, true, "산책 아침 카페"],
  ["베란다 작은 정원", "허브 두 화분으로 시작했어요", "photo", "2026-09-25", true, true, "정원 식물"],
  ["산책하며 들은 노래", "오늘 걸으며 고른 재생 목록", "note", "2026-09-20", false, false, "산책 음악"],
  ["창가 자리가 좋은 카페", "햇살이 오래 머무는 곳", "place", "2026-09-18", true, false, "카페"],
  ["숲길 산책로", "그늘이 길게 이어지는 길", "place", "2026-09-14", true, false, "산책 숲"],
  ["책갈피에 남긴 문장", "다시 읽고 싶은 한 줄", "note", "2026-09-09", false, false, "책 문장"],
  ["강아지와 산책", "처음 가 본 공원", "photo", "2026-08-30", true, true, "산책 공원"],
  ["정원 가꾸기 일지", "물 주는 날을 적어 둬요", "note", "2026-08-22", false, false, "정원 기록"],
  ["아침 햇살 사진", "커튼 사이로 들어온 빛", "photo", "2026-08-02", true, false, "아침 빛"],
  ["산책 지도 만들기", "자주 걷는 길을 한 장에", "note", "2026-07-11", false, false, "산책 지도"],
  ["동네 도서관", "조용한 2층 열람실", "place", "2026-06-15", true, true, "책 도서관"],
  ["바닷가 산책", "파도 소리를 녹음했어요", "photo", "2026-05-03", true, false, "산책 바다 여행"],
  ["카페 투어 계획", "이번 달 가 볼 곳 다섯 군데", "note", "2026-04-19", false, false, "카페 계획"],
  ["식물원 나들이", "온실 안의 초록", "photo", "2026-03-28", true, false, "정원 식물원 여행"],
  ["새벽 시장", "이른 아침의 활기", "place", "2026-02-07", true, false, "아침 시장"],
  ["겨울 산책", "입김이 보이던 아침", "photo", "2025-12-21", true, false, "산책 겨울 아침"],
  ["산책 모임 첫날", "다섯 명이 함께 걸었어요", "note", "2025-11-08", false, true, "산책 모임"],
  ["책 모임 후기", "같은 책, 다른 문장", "note", "2025-10-30", false, true, "책 모임"],
];
export const discoveryEntries: readonly DiscoveryEntry[] = rows.map(([title, excerpt, kind, createdAt, hasPhoto, saved, keywords], index) => ({
  id: String(index + 1), title, excerpt, kind, createdAt, hasPhoto, saved, keywords: keywords.split(" "),
}));

export const defaultDiscoveryFilters: DiscoveryFilters = { kinds: [], period: "all", photoOnly: false, savedOnly: false };

export const discoveryCopy = {
  screenTitle: "검색",
  back: "뒤로",
  queryLabel: "기록 검색",
  clear: "검색어 지우기",
  recentTitle: "최근 검색",
  recentClearAll: "전체 삭제",
  recentRemove: (query: string) => `‘${query}’ 최근 검색 삭제`,
  topicsTitle: "자주 찾는 주제",
  commitRow: (query: string) => `‘${query}’ 검색`,
  suggestionCount: (count: number) => (count ? `제안 ${count}개` : "제안 없음"),
  filter: "필터",
  filterLabel: (count: number) => (count ? `필터 ${count}` : "필터"),
  filterAccessible: (count: number) => (count ? `필터, ${count}개 적용됨` : "필터"),
  photoOnly: "사진 있음",
  savedOnly: "저장함",
  kindTitle: "종류",
  periodTitle: "기간",
  conditionTitle: "조건",
  photoOnlyRow: "사진 있는 기록만",
  savedOnlyRow: "저장한 기록만",
  facetChange: "바꾸기",
  resultCount: (count: number) => `결과 ${count}개`,
  sortLabel: "정렬",
  sortTrigger: (label: string) => `정렬: ${label}`,
  removeFilter: (label: string) => `${label} 필터 해제`,
  clearFilters: "모두 해제",
  sheetReset: "초기화",
  sheetApply: (count: number) => (count ? `${count}개 결과 보기` : "결과 없음"),
  close: "닫기",
  loadMore: { loadMore: "더 보기", loading: "더 불러오는 중", retry: "다시 시도", complete: "모든 결과를 봤어요" },
  loadingLabel: "검색 결과를 불러오는 중",
  emptyFilterTitle: "조건에 맞는 기록이 없어요",
  emptyFilterBody: "필터를 줄이면 더 많은 기록을 볼 수 있어요.",
  emptyQueryTitle: (query: string) => `‘${query}’에 맞는 기록이 없어요`,
  emptyQueryBody: "다른 단어로 찾거나 아래 주제를 눌러 보세요.",
  errorTitle: "결과를 새로 불러오지 못했어요",
  errorBody: "연결을 확인한 뒤 다시 시도해 주세요. 이전 결과는 그대로 둘게요.",
  retry: "다시 시도",
  restrictedTitle: "로그인하고 내 기록을 찾아보세요",
  restrictedBody: "검색은 내 계정의 기록에서만 해요.",
  login: "로그인",
  railLabel: "검색 조건",
  failNext: "다음 검색 실패",
  failNextArmed: "다음 검색 실패 예약됨",
  detailTitle: "기록",
  home: "이야기",
  reopen: "검색 다시 열기",
  fixture: "직접 만든 예제 기록을 기기 안에서 찾아요.",
} as const;

export function normalizeDiscoveryQuery(query: string): string {
  return query.normalize("NFKC").trim().toLocaleLowerCase("ko-KR");
}

function terms(query: string): string[] {
  return normalizeDiscoveryQuery(query).split(/\s+/).filter(Boolean);
}

function weekStart(today: string): string {
  const date = new Date(`${today}T00:00:00Z`);
  const offset = (date.getUTCDay() + 6) % 7; // Monday-based week.
  date.setUTCDate(date.getUTCDate() - offset);
  return date.toISOString().slice(0, 10);
}

export function matchesPeriod(createdAt: string, period: DiscoveryPeriod, today = discoveryToday): boolean {
  if (period === "all") return true;
  if (createdAt > today) return false;
  if (period === "week") return createdAt >= weekStart(today);
  if (period === "month") return createdAt.slice(0, 7) === today.slice(0, 7);
  return createdAt.slice(0, 4) === today.slice(0, 4);
}

function relevance(entry: DiscoveryEntry, query: string): number {
  const normalized = normalizeDiscoveryQuery(query);
  return (normalizeDiscoveryQuery(entry.title).includes(normalized) ? 2 : 0) + (entry.keywords.some(keyword => normalizeDiscoveryQuery(keyword) === normalized) ? 1 : 0);
}

export function searchDiscovery(query: string, filters: DiscoveryFilters, sort: DiscoverySort): DiscoveryEntry[] {
  const wanted = terms(query);
  if (!wanted.length) return [];
  const matched = discoveryEntries.filter(entry => {
    const haystack = normalizeDiscoveryQuery(`${entry.title} ${entry.excerpt} ${entry.keywords.join(" ")}`);
    return wanted.every(term => haystack.includes(term))
      && (!filters.kinds.length || filters.kinds.includes(entry.kind))
      && matchesPeriod(entry.createdAt, filters.period)
      && (!filters.photoOnly || entry.hasPhoto)
      && (!filters.savedOnly || entry.saved);
  });
  const byDate = (a: DiscoveryEntry, b: DiscoveryEntry) => b.createdAt.localeCompare(a.createdAt);
  if (sort === "newest") return matched.sort(byDate);
  if (sort === "oldest") return matched.sort((a, b) => -byDate(a, b));
  return matched.sort((a, b) => relevance(b, query) - relevance(a, query) || byDate(a, b));
}

/** Count the sheet CTA shows for a draft; equals the result count after applying that draft. */
export function countDiscovery(query: string, filters: DiscoveryFilters): number {
  return searchDiscovery(query, filters, "relevance").length;
}

export type DiscoverySuggestion = Readonly<{ text: string; start: number; end: number }>;
/** Prefix matches first, then earlier and shorter matches. Match range drives the strong highlight. */
export function suggestDiscovery(query: string, limit = 6): DiscoverySuggestion[] {
  const needle = normalizeDiscoveryQuery(query);
  if (!needle) return [];
  const candidates = [...new Set(discoveryEntries.flatMap(entry => [...entry.keywords, entry.title]))];
  return candidates
    .map(text => ({ text, start: normalizeDiscoveryQuery(text).indexOf(needle) }))
    .filter(candidate => candidate.start >= 0 && normalizeDiscoveryQuery(candidate.text) !== needle)
    .sort((a, b) => a.start - b.start || a.text.length - b.text.length || a.text.localeCompare(b.text, "ko"))
    .slice(0, limit)
    .map(({ text, start }) => ({ text, start, end: start + needle.length }));
}

/** First match of the first query term in `text`, for the strong highlight on result titles. */
export function highlightRange(text: string, query: string): Readonly<{ start: number; end: number }> | null {
  const [first] = terms(query);
  if (!first) return null;
  const start = normalizeDiscoveryQuery(text).indexOf(first);
  return start < 0 ? null : { start, end: start + first.length };
}

/** Only committed searches are recorded: most recent first, case-insensitive dedupe, capped. */
export function commitRecentSearch(recents: readonly string[], query: string, limit = recentSearchLimit): string[] {
  const value = query.trim();
  if (!value) return [...recents];
  const key = normalizeDiscoveryQuery(value);
  return [value, ...recents.filter(item => normalizeDiscoveryQuery(item) !== key)].slice(0, limit);
}

export function kindLabel(kind: DiscoveryKind): string {
  return discoveryKinds.find(item => item.id === kind)!.label;
}
export function periodLabel(period: DiscoveryPeriod): string {
  return discoveryPeriods.find(item => item.id === period)!.label;
}
export function sortLabel(sort: DiscoverySort): string {
  return discoverySorts.find(item => item.id === sort)!.label;
}
export function dateLabel(createdAt: string, today = discoveryToday): string {
  const [year, month, day] = createdAt.split("-").map(Number) as [number, number, number];
  return createdAt.slice(0, 4) === today.slice(0, 4) ? `${month}월 ${day}일` : `${year}년 ${month}월 ${day}일`;
}
export function entryDescription(entry: DiscoveryEntry): string {
  return `${kindLabel(entry.kind)} · ${dateLabel(entry.createdAt)}`;
}

/** Visible applied conditions in rail order: quick toggles, period, kinds. */
export function appliedFilterChips(filters: DiscoveryFilters): { key: AppliedFilterKey; label: string }[] {
  return [
    ...(filters.photoOnly ? [{ key: "photoOnly" as const, label: discoveryCopy.photoOnly }] : []),
    ...(filters.savedOnly ? [{ key: "savedOnly" as const, label: discoveryCopy.savedOnly }] : []),
    ...(filters.period !== "all" ? [{ key: "period" as const, label: `${discoveryCopy.periodTitle}: ${periodLabel(filters.period)}` }] : []),
    ...filters.kinds.map(kind => ({ key: `kind:${kind}` as const, label: `${discoveryCopy.kindTitle}: ${kindLabel(kind)}` })),
  ];
}
export function appliedFilterCount(filters: DiscoveryFilters): number {
  return appliedFilterChips(filters).length;
}
export function removeDiscoveryFilter(filters: DiscoveryFilters, key: AppliedFilterKey): DiscoveryFilters {
  if (key === "photoOnly") return { ...filters, photoOnly: false };
  if (key === "savedOnly") return { ...filters, savedOnly: false };
  if (key === "period") return { ...filters, period: "all" };
  const kind = key.slice("kind:".length) as DiscoveryKind;
  return { ...filters, kinds: filters.kinds.filter(item => item !== kind) };
}
export function toggleDiscoveryKind(filters: DiscoveryFilters, kind: DiscoveryKind, selected: boolean): DiscoveryFilters {
  const next = new Set(filters.kinds);
  if (selected) next.add(kind); else next.delete(kind);
  // Keep the fixture's kind order so the applied chips do not reshuffle as the user taps.
  return { ...filters, kinds: discoveryKinds.map(item => item.id).filter(id => next.has(id)) };
}
/** Section sheets reset only their own section; the full sheet resets everything. */
export function resetDiscoveryFilters(filters: DiscoveryFilters, scope: FilterScope): DiscoveryFilters {
  if (scope === "kind") return { ...filters, kinds: [] };
  if (scope === "period") return { ...filters, period: "all" };
  return defaultDiscoveryFilters;
}
export function isDiscoveryFilterDefault(filters: DiscoveryFilters, scope: FilterScope): boolean {
  if (scope === "kind") return !filters.kinds.length;
  if (scope === "period") return filters.period === "all";
  return appliedFilterCount(filters) === 0;
}
export function kindFacetLabel(filters: DiscoveryFilters): string {
  return filters.kinds.length ? `${discoveryCopy.kindTitle}: ${filters.kinds.map(kindLabel).join(", ")}` : discoveryCopy.kindTitle;
}
export function periodFacetLabel(filters: DiscoveryFilters): string {
  return filters.period === "all" ? discoveryCopy.periodTitle : `${discoveryCopy.periodTitle}: ${periodLabel(filters.period)}`;
}

/** Story entry points share these seeds so Web and Native open the same state. */
export type DiscoveryView = "idle" | "typing" | "results" | "filtered" | "sheet" | "empty" | "loading" | "error" | "restricted";
export function discoverySeed(view: DiscoveryView): Readonly<{ query: string; committed: string; filters: DiscoveryFilters; recents: readonly string[] }> {
  const recents = ["카페", "아침", "정원"];
  if (view === "idle" || view === "restricted") return { query: "", committed: "", filters: defaultDiscoveryFilters, recents };
  if (view === "typing") return { query: "산", committed: "", filters: defaultDiscoveryFilters, recents };
  if (view === "filtered" || view === "sheet") return { query: "산책", committed: "산책", filters: { ...defaultDiscoveryFilters, photoOnly: true, period: "year" }, recents: ["산책", ...recents] };
  // Filter-caused zero: the only place with 산책 is not saved.
  if (view === "empty") return { query: "산책", committed: "산책", filters: { ...defaultDiscoveryFilters, kinds: ["place"], savedOnly: true }, recents: ["산책", ...recents] };
  return { query: "산책", committed: "산책", filters: defaultDiscoveryFilters, recents: ["산책", ...recents] };
}
