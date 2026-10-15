import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page } from "vitest/browser";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CohortRetentionTable, ConversionFunnel, CorrelationMatrix, HistogramExplorer, ImportFieldMapping, TargetSummary } from "../src/data-workflows.js";
import { HjmProvider } from "../src/provider.js";
import { compositionBrandFixtures } from "../../../showcase/shared/composition-brand-fixtures.js";
import "../src/styles.css";
let host: HTMLDivElement, root: Root;
beforeEach(() => { (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); host.style.width = "375px"; document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

it("blocks ambiguous CSV mappings and preserves the exact import snapshot after failure", async () => {
  const importRows = vi.fn().mockRejectedValue(new Error("offline"));
  const render = (duplicate: boolean) => <HjmProvider><ImportFieldMapping label="CSV 연결" sources={[{ id: "a", label: "원본 이름" }, { id: "b", label: "원본 메일" }]} targets={[{ id: "name", label: "이름", required: true }]}
    mapping={{ a: "name", b: duplicate ? "name" : null }} onMappingChange={() => undefined} onImport={importRows} importLabel="가져오기" skipLabel="건너뛰기" errorLabel="가져오기 실패" validationLabel={() => "중복 필드를 확인하세요"} /></HjmProvider>;
  await act(async () => root.render(render(true)));
  expect(host.querySelector<HTMLButtonElement>('button[type="button"][disabled]')).not.toBeNull();
  await act(async () => root.render(render(false)));
  await act(async () => page.getByRole("button", { name: "가져오기", exact: true }).click());
  expect(importRows).toHaveBeenCalledWith({ a: "name", b: null });
  expect(host.querySelector('[role="alert"]')?.textContent).toBe("가져오기 실패");
  expect(host.textContent).toContain("이름");
});

it("renders observed zero, future absence and self-correlation without hiding the diagonal", async () => {
  await act(async () => root.render(<HjmProvider><CohortRetentionTable label="잔존율" cohortColumnLabel="가입 주" periods={["0주", "1주", "2주"]} cohorts={[{ id: "a", label: "10월", size: 10, retained: [10, 0] }]} formatRate={rate => `${rate * 100}%`} missingLabel="미관측" />
    <CorrelationMatrix label="상관" variableColumnLabel="변수" data={{ variables: [{ id: "a", label: "사용" }, { id: "b", label: "만족" }], values: [[1, -.8], [-.8, 1]] }} formatValue={value => value.toFixed(2)} missingLabel="미관측" /></HjmProvider>));
  expect(host.textContent).toContain("100%"); expect(host.textContent).toContain("0%"); expect(host.textContent).toContain("미관측");
  const tables = host.querySelectorAll("table");
  expect([...tables[1]!.querySelectorAll("td")].filter(cell => cell.textContent === "1.00")).toHaveLength(2);
  expect([...tables[1]!.querySelectorAll("td")].filter(cell => cell.textContent === "-0.80")).toHaveLength(2);
});

it("changes funnel detail from selected real stages and never divides by a zero target", async () => {
  await act(async () => root.render(<HjmProvider><ConversionFunnel label="구매 흐름" stages={[{ id: "visit", label: "방문", count: 100 }, { id: "buy", label: "구매", count: 20, reason: "사용자 응답" }]} formatCount={String} missingLabel="없음" detailLabel={stage => `${stage.label} ${stage.lost ?? 0}명 이탈 ${stage.reason ?? ""}`} />
    <TargetSummary label="목표" actual={12} target={0} formatActual={String} summaryLabel={summary => summary.ratio === null ? "목표 미설정" : String(summary.ratio)} /></HjmProvider>));
  await act(async () => page.getByRole("button", { name: "구매", exact: true }).click());
  expect(host.textContent).toContain("80명 이탈 사용자 응답");
  expect(host.textContent).toContain("목표 미설정"); expect(host.querySelector("progress")).toBeNull();
});

it("rebuilds histogram labels and counts from the same supplied samples", async () => {
  function Demo() { const [count, setCount] = useState(2); return <HistogramExplorer label="응답 시간" samples={[0, .5, 1, 2, null]} domain={[0, 2]} binCount={count} binCounts={[2, 4]} onBinCountChange={setCount}
    binLabel={bin => `${bin.lower}–${bin.upper}`} binCountLabel={n => `${n}구간`} formatCount={String} missingLabel="미관측" summaryLabel={h => `${h.bins.length}구간 / ${h.observed}관측 / ${h.missing}누락`} />; }
  await act(async () => root.render(<HjmProvider><Demo /></HjmProvider>));
  expect(host.textContent).toContain("2구간 / 4관측 / 1누락");
  await act(async () => page.getByRole("button", { name: "4구간", exact: true }).click());
  expect(host.textContent).toContain("4구간 / 4관측 / 1누락");
  expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth);
});

it("inherits two product palettes and preserves all six layouts at narrow widths in both themes", async () => {
  for (const palette of Object.values(compositionBrandFixtures)) for (const theme of ["light", "dark"] as const) {
    await act(async () => root.render(<HjmProvider theme={theme} brandPalette={palette}>
      <ImportFieldMapping label="열 연결" sources={[{ id: "a", label: "이름" }]} targets={[{ id: "name", label: "이름", required: true }]} mapping={{ a: "name" }} onMappingChange={() => undefined} onImport={() => undefined} importLabel="가져오기" skipLabel="건너뛰기" errorLabel="실패" validationLabel={() => "확인"} />
      <ConversionFunnel label="전환" stages={[{ id: "a", label: "열기", count: 10 }]} formatCount={String} missingLabel="없음" detailLabel={s => s.label} />
      <CohortRetentionTable label="잔존율" cohortColumnLabel="가입" periods={["0주", "1주"]} cohorts={[{ id: "a", label: "1주", size: 10, retained: [10, 0] }]} formatRate={String} missingLabel="미관측" />
      <CorrelationMatrix label="상관" variableColumnLabel="변수" data={{ variables: [{ id: "a", label: "방문" }], values: [[1]] }} formatValue={String} missingLabel="미관측" />
      <TargetSummary label="목표" actual={24} target={20} formatActual={String} summaryLabel={s => String(s.ratio)} />
      <HistogramExplorer label="분포" samples={[1, 2, null]} binCount={2} binCounts={[2, 4]} onBinCountChange={() => undefined} binLabel={b => String(b.lower)} binCountLabel={String} formatCount={String} missingLabel="미관측" summaryLabel={h => String(h.observed)} />
    </HjmProvider>));
    const button = [...host.querySelectorAll("button")].find(node => node.textContent === "가져오기")!;
    const hex = palette[theme].primary, rgb = [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16));
    await expect.poll(() => getComputedStyle(button).backgroundColor).toBe(`rgb(${rgb.join(", ")})`);
    expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth);
  }
});
