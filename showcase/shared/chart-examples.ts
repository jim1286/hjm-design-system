// Shared Web/Native showcase fixtures for the chart family and stat DataTable (2026-10-14).
// Example data only — products pass their own series, labels and formatters.
export const chartCopy = {
  line: "월별 타격생산성",
  bar: "월별 홈런",
  horizontal: "구단별 홈런",
  stacked: "월별 안타 구성",
  pie: "구종 비율",
  radar: "능력치",
  scatter: "타율과 홈런",
  sparkline: "최근 흐름",
  missing: "기록 없음",
  high: "최고",
  low: "최저",
  x: "타율",
  y: "홈런",
  table: "타자 기록",
  sortColumn: (header: string, direction: { direction: "ascending" | "descending" } | null) => `${header}, ${direction ? (direction.direction === "descending" ? "높은 순 정렬됨" : "낮은 순 정렬됨") : "정렬하려면 누르세요"}`,
  total: "평균",
  // A period switch is a single choice between two views, so both Storybooks use a SegmentedControl; a full-width
  // primary button per chart put two primaries on one surface (2026-10-17 review E16).
  period: "기간",
  periods: [{ value: "all", label: "전체 기간" }, { value: "recent", label: "최근 3개월" }],
} as const;

export const months = ["3월", "4월", "5월", "6월", "7월", "8월", "9월"];
export const opsSeries = [{ id: "ops", label: "OPS", values: [0.812, 0.905, null, 0.948, 1.021, 0.887, 0.934] }];
export const comparisonSeries = [
  { id: "a", label: "선수 A", values: [0.812, 0.905, 0.871, 0.948, 1.021, 0.887, 0.934] },
  { id: "b", label: "선수 B", values: [0.745, 0.802, 0.866, 0.83, 0.912, 0.951, 0.903] },
];
export const homeRunSeries = [{ id: "hr", label: "홈런", values: [2, 6, 4, 7, 5, 8, 4] }];
export const hitMixSeries = [
  { id: "single", label: "단타", values: [18, 22, 20, 25, 19, 23, 21] },
  { id: "double", label: "2루타", values: [4, 6, 5, 7, 3, 6, 5] },
  { id: "homer", label: "홈런", values: [2, 6, 4, 7, 5, 8, 4] },
];
export const teams = ["삼성", "KT", "LG", "KIA", "두산", "NC", "한화", "SSG", "롯데", "키움"];
export const teamHomeRuns = [{ id: "hr", label: "홈런", values: [168, 151, 142, 137, 129, 121, 118, 115, 103, 97] }];
export const pitchMix = [
  { id: "ff", label: "직구", value: 48 },
  { id: "sl", label: "슬라이더", value: 22 },
  { id: "ch", label: "체인지업", value: 15 },
  { id: "cu", label: "커브", value: 10 },
  { id: "etc", label: "기타", value: 5 },
];
export const ratingAxes = ["컨택", "파워", "선구안", "클러치", "수비", "주루"];
export const ratingSeries = [
  { id: "a", label: "선수 A", values: [84, 92, 78, 81, 70, 66] },
  { id: "b", label: "선수 B", values: [79, 71, 88, 76, 85, 82] },
];
export const scatterPoints = [
  { id: "1", label: "구자욱", x: 0.361, y: 28 }, { id: "2", label: "레이예스", x: 0.351, y: 19 },
  { id: "3", label: "오스틴", x: 0.34, y: 36 }, { id: "4", label: "최원준", x: 0.339, y: 12 },
  { id: "5", label: "박성한", x: 0.33, y: 9 }, { id: "6", label: "김지찬", x: 0.327, y: 4 },
  { id: "7", label: "박민우", x: 0.322, y: 7 }, { id: "8", label: "노시환", x: 0.288, y: 32 },
];
export const tableColumns = [
  { id: "name", header: "선수", pinned: "start" as const },
  { id: "team", header: "팀" },
  { id: "avg", header: "타율", align: "end" as const, sortable: true, sortDescFirst: true },
  { id: "hr", header: "홈런", align: "end" as const, sortable: true, sortDescFirst: true },
  { id: "rbi", header: "타점", align: "end" as const, sortable: true, sortDescFirst: true },
  { id: "ops", header: "OPS", align: "end" as const, sortable: true, sortDescFirst: true },
  { id: "so", header: "삼진", align: "end" as const, sortable: true },
];
export const tableRows: Record<string, Record<string, string>> = {
  koo: { name: "구자욱", team: "삼성", avg: ".361", hr: "28", rbi: "104", ops: "1.006", so: "71" },
  rey: { name: "레이예스", team: "롯데", avg: ".351", hr: "19", rbi: "111", ops: ".912", so: "64" },
  aus: { name: "오스틴", team: "LG", avg: ".340", hr: "36", rbi: "113", ops: "1.083", so: "88" },
  choi: { name: "최원준", team: "KT", avg: ".339", hr: "12", rbi: "61", ops: ".861", so: "79" },
  rook: { name: "신인", team: "키움", avg: "—", hr: "0", rbi: "2", ops: "—", so: "5" },
};
export const formatRate = (value: number) => value.toFixed(3).replace(/^0\./, ".");
export const formatCount = (value: number) => String(Math.round(value));
