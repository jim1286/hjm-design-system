// Shared Web/Native showcase fixtures for the DataTable family (2026-10-14): header bands, row groups,
// percentile heat, bounded height, line score, head-to-head matrix and comparison rows.
// Example data only (KBO-style, not official records) — products pass their own rows and copy.

export const tableFamilyCopy = {
  hitters: "타자 기록",
  lineup: "LG 타순",
  percentile: "타자 백분위",
  league: "리그 타자 전체",
  lineScore: "LG 대 KIA 경기 점수",
  liveScore: "삼성 대 두산 경기 점수, 11회 진행 중",
  matrix: "구단 상대 전적",
  comparison: "선발 투수 비교",
  batting: "타격",
  running: "주루",
  starters: "선발",
  substitutes: "교체",
  sortColumn: (header: string, direction: { direction: "ascending" | "descending" } | null) => `${header}, ${direction ? (direction.direction === "descending" ? "높은 순 정렬됨" : "낮은 순 정렬됨") : "정렬하려면 누르세요"}`,
} as const;

/* ---------------------------------------------- Hitter table ----------------------------------- */

export const hitterColumns = [
  { id: "name", header: "선수", pinned: "start" as const },
  { id: "team", header: "팀" },
  { id: "avg", header: "타율", align: "end" as const },
  { id: "hr", header: "홈런", align: "end" as const },
  { id: "rbi", header: "타점", align: "end" as const },
  { id: "ops", header: "OPS", align: "end" as const },
  { id: "sb", header: "도루", align: "end" as const },
  { id: "cs", header: "도루자", align: "end" as const },
];

/** 타격 | 주루 header bands; 선수·팀 stay ungrouped (placeholder bands). */
export const hitterColumnGroups = [
  { id: "batting", header: tableFamilyCopy.batting, columns: ["avg", "hr", "rbi", "ops"] },
  { id: "running", header: tableFamilyCopy.running, columns: ["sb", "cs"] },
];

export type HitterRow = Readonly<{ id: string; name: string; team: string; avg: number; hr: number; rbi: number; ops: number; sb: number; cs: number }>;

export const hitters: readonly HitterRow[] = [
  { id: "kdy", name: "김도영", team: "KIA", avg: 0.347, hr: 38, rbi: 109, ops: 1.067, sb: 40, cs: 6 },
  { id: "koo", name: "구자욱", team: "삼성", avg: 0.343, hr: 33, rbi: 115, ops: 1.044, sb: 13, cs: 3 },
  { id: "aus", name: "오스틴", team: "LG", avg: 0.319, hr: 32, rbi: 132, ops: 0.957, sb: 12, cs: 2 },
  { id: "rey", name: "레이예스", team: "롯데", avg: 0.352, hr: 15, rbi: 111, ops: 0.904, sb: 5, cs: 2 },
  { id: "roh", name: "노시환", team: "한화", avg: 0.272, hr: 24, rbi: 89, ops: 0.818, sb: 6, cs: 4 },
  { id: "kim", name: "김혜성", team: "키움", avg: 0.326, hr: 11, rbi: 75, ops: 0.841, sb: 30, cs: 4 },
  { id: "par", name: "박해민", team: "LG", avg: 0.263, hr: 6, rbi: 47, ops: 0.677, sb: 43, cs: 9 },
  { id: "ksh", name: "김성윤", team: "삼성", avg: 0.243, hr: 2, rbi: 25, ops: 0.629, sb: 15, cs: 6 },
  { id: "yang", name: "양의지", team: "두산", avg: 0.314, hr: 17, rbi: 94, ops: 0.858, sb: 3, cs: 1 },
  { id: "kang", name: "강백호", team: "KT", avg: 0.289, hr: 26, rbi: 96, ops: 0.840, sb: 6, cs: 2 },
  { id: "choi", name: "최정", team: "SSG", avg: 0.291, hr: 37, rbi: 107, ops: 0.978, sb: 5, cs: 1 },
  { id: "dav", name: "데이비슨", team: "NC", avg: 0.306, hr: 46, rbi: 119, ops: 1.003, sb: 1, cs: 0 },
];

export const formatRate = (value: number) => value.toFixed(3).replace(/^0\./, ".");

export function hitterCell(row: HitterRow, columnId: string): string {
  const value = row[columnId as keyof HitterRow];
  if (columnId === "avg" || columnId === "ops") return formatRate(value as number);
  return String(value);
}

/** Stats where a lower value is better flip the percentile direction (도루자). */
export const lowerIsBetterColumns = new Set(["cs"]);
/** Columns that carry percentile heat in the "백분위 색" story. */
export const heatColumns = ["avg", "hr", "rbi", "ops", "sb", "cs"] as const;

/* ---------------------------------------------- Lineup (row groups) ---------------------------- */

export type LineupRow = Readonly<{ id: string; order: string; name: string; position: string; ab: number; h: number; rbi: number; depth?: number }>;

export const lineupColumns = [
  { id: "order", header: "타순" },
  { id: "name", header: "선수" },
  { id: "position", header: "포지션" },
  { id: "ab", header: "타수", align: "end" as const },
  { id: "h", header: "안타", align: "end" as const },
  { id: "rbi", header: "타점", align: "end" as const },
];

export const lineup: readonly LineupRow[] = [
  { id: "l1", order: "1", name: "홍창기", position: "우익수", ab: 4, h: 2, rbi: 0 },
  { id: "l2", order: "2", name: "신민재", position: "2루수", ab: 4, h: 1, rbi: 1 },
  { id: "l3", order: "3", name: "오스틴", position: "1루수", ab: 5, h: 2, rbi: 2 },
  { id: "l4", order: "4", name: "문보경", position: "3루수", ab: 4, h: 1, rbi: 1 },
  { id: "l5", order: "5", name: "박동원", position: "포수", ab: 3, h: 0, rbi: 0 },
  { id: "l6", order: "6", name: "김현수", position: "지명타자", ab: 4, h: 1, rbi: 0 },
  { id: "l7", order: "7", name: "오지환", position: "유격수", ab: 3, h: 1, rbi: 1 },
  { id: "l8", order: "8", name: "문성주", position: "좌익수", ab: 3, h: 0, rbi: 0 },
  { id: "l9", order: "9", name: "박해민", position: "중견수", ab: 3, h: 1, rbi: 0 },
  { id: "s1", order: "8", name: "이영빈", position: "대타", ab: 1, h: 1, rbi: 1, depth: 1 },
  { id: "s2", order: "5", name: "김범석", position: "대타", ab: 1, h: 0, rbi: 0, depth: 1 },
];

export const lineupGroups = [
  { id: "starters", label: tableFamilyCopy.starters, rows: ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9"] },
  { id: "substitutes", label: tableFamilyCopy.substitutes, rows: ["s1", "s2"] },
];

/** 25 league hitters for the fixed-header story: the 12 above plus generated depth players. */
export const leagueHitters: readonly HitterRow[] = [
  ...hitters,
  ...["LG", "KIA", "삼성", "두산", "KT", "SSG", "롯데", "한화", "NC", "키움", "LG", "KIA", "삼성"].map((team, index) => ({
    id: `bench-${index}`,
    name: `${team} 타자 ${index + 1}`,
    team,
    avg: 0.24 + ((index * 7) % 9) / 100,
    hr: (index * 5) % 17,
    rbi: 30 + ((index * 11) % 45),
    ops: 0.66 + ((index * 13) % 20) / 100,
    sb: (index * 3) % 14,
    cs: index % 5,
  })),
];

/* ---------------------------------------------- Line score ------------------------------------- */

export const lineScoreTotals = ["R", "H", "E", "B"] as const;

/** Final game: home KIA did not bat in the 9th (X). */
export const finalGame = [
  { id: "lg", name: "LG", periods: [0, 1, 0, 0, 2, 0, 0, 1, 0], totals: { R: 4, H: 9, E: 1, B: 3 } },
  { id: "kia", name: "KIA", periods: [2, 0, 0, 1, 0, 2, 0, 0, "X" as const], totals: { R: 5, H: 10, E: 0, B: 4 } },
];

/** Live extra-inning game, top of the 11th. */
export const liveGame = [
  { id: "ss", name: "삼성", periods: [0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 1], totals: { R: 5, H: 11, E: 0, B: 2 } },
  { id: "ds", name: "두산", periods: [1, 0, 0, 0, 3, 0, 0, 0, 0, 0], totals: { R: 4, H: 8, E: 1, B: 5 } },
];
export const liveGamePeriod = 11;

/* ---------------------------------------------- Head-to-head matrix ---------------------------- */

export const kboTeams = ["lg", "kia", "ss", "ds", "kt", "ssg", "lt", "hh", "nc", "kw"] as const;
export type KboTeam = (typeof kboTeams)[number];
export const kboTeamNames: Record<KboTeam, string> = { lg: "LG", kia: "KIA", ss: "삼성", ds: "두산", kt: "KT", ssg: "SSG", lt: "롯데", hh: "한화", nc: "NC", kw: "키움" };

/** Wins of the row team against later teams in `kboTeams` order (16 games each, draws fill the rest). */
const headToHeadWins: Record<KboTeam, readonly (readonly [number, number])[]> = {
  lg: [[3, 0], [8, 0], [9, 0], [7, 1], [9, 0], [9, 1], [10, 0], [10, 0], [11, 0]],
  kia: [[12, 0], [11, 0], [10, 0], [11, 0], [9, 0], [9, 0], [10, 0], [13, 0]],
  ss: [[8, 0], [9, 0], [10, 0], [7, 1], [8, 0], [8, 0], [10, 0]],
  ds: [[8, 0], [7, 0], [8, 1], [9, 0], [9, 0], [11, 0]],
  kt: [[8, 0], [9, 0], [7, 0], [9, 0], [10, 0]],
  ssg: [[8, 0], [7, 0], [8, 0], [9, 0]],
  lt: [[8, 0], [9, 1], [9, 0]],
  hh: [[8, 0], [9, 0]],
  nc: [[8, 0]],
  kw: [],
};

export type HeadToHead = Readonly<{ wins: number; losses: number; draws: number }>;

export function headToHead(row: KboTeam, column: KboTeam): HeadToHead | null {
  if (row === column) return null;
  const rowIndex = kboTeams.indexOf(row), columnIndex = kboTeams.indexOf(column);
  const [first, second] = rowIndex < columnIndex ? [row, columnIndex - rowIndex - 1] as const : [column, rowIndex - columnIndex - 1] as const;
  const [wins, draws] = headToHeadWins[first][second]!;
  const losses = 16 - wins - draws;
  return rowIndex < columnIndex ? { wins, losses, draws } : { wins: losses, losses: wins, draws };
}

/** Matrix cell: W-L(-D) label, heat by win rate (≥ .625 strong, ≤ .375 weak), leader tone on a sweep-like record. */
export function headToHeadCell(row: KboTeam, column: KboTeam) {
  const record = headToHead(row, column);
  if (!record) return null;
  const rate = record.wins / Math.max(1, record.wins + record.losses);
  const label = record.draws > 0 ? `${record.wins}-${record.losses}-${record.draws}` : `${record.wins}-${record.losses}`;
  const heat = rate >= 0.75 ? { side: "high" as const, strength: 3 as const } : rate >= 0.625 ? { side: "high" as const, strength: 2 as const }
    : rate <= 0.25 ? { side: "low" as const, strength: 3 as const } : rate <= 0.375 ? { side: "low" as const, strength: 2 as const } : null;
  return { label, heat, tone: rate >= 0.75 ? ("leader" as const) : null };
}

/* ---------------------------------------------- Comparison rows -------------------------------- */

export const comparisonSides = [
  { name: "LG 임찬규", color: "#C30452" },
  { name: "KIA 양현종", color: "#EA0029" },
] as const;

export const pitcherComparison = [
  { id: "era", label: "평균자책", values: [3.83, 4.10] as const, lowerIsBetter: true },
  { id: "w", label: "승", values: [10, 11] as const },
  { id: "ip", label: "이닝", values: [134.0, 171.1] as const, display: ["134", "171⅓"] as const },
  { id: "so", label: "탈삼진", values: [107, 129] as const },
  { id: "whip", label: "WHIP", values: [1.38, 1.30] as const, lowerIsBetter: true, display: ["1.38", "1.30"] as const },
  { id: "qs", label: "퀄리티 스타트", values: [11, 17] as const },
];
