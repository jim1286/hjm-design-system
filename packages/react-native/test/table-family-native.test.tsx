import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { expect, it } from "vitest";
import { ComparisonTable, DataTable, LineScore, MatrixTable } from "../src/data-table.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function render(node: React.ReactNode) {
  let tree!: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider>{node}</HjmNativeProvider>); });
  return tree;
}
const hosts = (tree: ReactTestRenderer, test: (props: Record<string, unknown>) => boolean) => tree.root.findAll(n => typeof n.type === "string" && test(n.props as Record<string, unknown>));
const texts = (tree: ReactTestRenderer) => hosts(tree, () => true).map(n => n.props.children).filter(child => typeof child === "string" || typeof child === "number");

it("draws header bands, labeled row groups, indented sub-rows and heat", () => {
  const data: Record<string, Record<string, string>> = { a: { name: "홍창기", avg: ".330", sb: "20" }, b: { name: "대타", avg: ".200", sb: "1" } };
  const tree = render(<DataTable columns={[{ id: "name", header: "선수", pinned: "start" }, { id: "avg", header: "타율" }, { id: "sb", header: "도루" }]}
    rows={[{ id: "a" }, { id: "b", depth: 1 }]} rowGroups={[{ id: "start", label: "선발", rows: ["a"] }, { id: "bench", label: "교체", rows: ["b"] }]}
    columnGroups={[{ id: "bat", header: "타격", columns: ["avg"] }, { id: "run", header: "주루", columns: ["sb"] }]}
    cellStyle={(row, column) => column === "avg" && row === "a" ? { heat: { side: "high", strength: 3 }, tone: "leader" } : null}
    labels={{ table: "기록", sortColumn: header => header }} renderCell={(row, column) => data[row]![column]!} maxBodyHeight={200} />);
  try {
    const all = texts(tree);
    expect(all).toEqual(expect.arrayContaining(["타격", "주루", "선발", "교체"]));
    expect(all.indexOf("선발")).toBeLessThan(all.indexOf("교체"));
    const indented = hosts(tree, props => (props.style as { paddingLeft?: number } | undefined)?.paddingLeft !== undefined && (props.style as { paddingLeft: number }).paddingLeft > 12);
    expect(indented.length).toBeGreaterThan(0);
    const heat = hosts(tree, props => (props.style as { opacity?: number } | undefined)?.opacity === 0.42);
    expect(heat).toHaveLength(1);
  } finally { act(() => tree.unmount()); }
});

it("pads the line score to nine innings, extends for extra innings and announces totals per team", () => {
  const tree = render(<LineScore accessibilityLabel="점수" totals={["R", "H", "E", "B"]} currentPeriod={10}
    teams={[{ id: "a", name: "LG", periods: [0, 1, 0, 0, 2, 0, 0, 0, 0, 1], totals: { R: 4, H: 9, E: 0, B: 3 } }, { id: "h", name: "KIA", periods: [1, 0, 0, 2, 0, 0, 0, 0, 0], totals: { R: 3, H: 7, E: 1, B: 2 } }]} />);
  try {
    expect(texts(tree)).toEqual(expect.arrayContaining(["10", "R", "B"]));
    expect(hosts(tree, props => props.accessibilityLabel === "LG R 4, H 9, E 0, B 3")).toHaveLength(1);
  } finally { act(() => tree.unmount()); }
});

it("blanks the matrix diagonal and names each cell by both teams", () => {
  const tree = render(<MatrixTable accessibilityLabel="상대 전적" ids={["LG", "KIA"]} labelOf={id => id} getCell={(row) => ({ label: row === "LG" ? "9-7" : "7-9", tone: row === "LG" ? "positive" : "negative" })} />);
  try {
    expect(hosts(tree, props => props.accessibilityLabel === "LG 대 KIA 9-7")).toHaveLength(1);
    expect(hosts(tree, props => typeof props.accessibilityLabel === "string" && (props.accessibilityLabel as string).startsWith("LG 대 LG"))).toHaveLength(0);
  } finally { act(() => tree.unmount()); }
});

it("labels comparison rows with both sides", () => {
  const tree = render(<ComparisonTable accessibilityLabel="비교" sides={[{ name: "LG", color: "#C30452" }, { name: "KIA", color: "#EA0029" }]}
    rows={[{ id: "era", label: "평균자책", values: [3.2, 4.1], display: ["3.20", "4.10"], lowerIsBetter: true }]} />);
  try {
    expect(hosts(tree, props => props.accessibilityLabel === "평균자책 LG 3.20, KIA 4.10")).toHaveLength(1);
  } finally { act(() => tree.unmount()); }
});


it("hides repeated side headings while retaining season identity in spoken rows", () => {
  const tree = render(<ComparisonTable accessibilityLabel="비교" showSideNames={false}
    sides={[{ name: "구자욱 2026", color: "#1769db" }, { name: "구자욱 2024", color: "#8B95A1" }]}
    rows={[{ id: "avg", label: "타율", values: [0.371, 0.343], display: [".371", ".343"] }]} />);
  try {
    expect(texts(tree)).not.toContain("구자욱 2026");
    expect(texts(tree)).not.toContain("구자욱 2024");
    expect(texts(tree)).toEqual(expect.arrayContaining(["타율", ".371", ".343"]));
    expect(hosts(tree, props => props.accessibilityLabel === "타율 구자욱 2026 .371, 구자욱 2024 .343")).toHaveLength(1);
  } finally { act(() => tree.unmount()); }
});
