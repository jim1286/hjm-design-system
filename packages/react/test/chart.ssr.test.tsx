import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { BarChart, LineChart, PieChart } from "../src/chart.js";
import { chartRecipe } from "@hjmds/design-contracts/components/chart";

// Server markup uses the `width` fallback because ResizeObserver only runs in the browser.
it("renders charts on the server with the fallback width and the text alternative", () => {
  const series = [{ id: "ops", label: "OPS", values: [0.8, null, 0.9] }];
  const line = renderToString(<LineChart categories={["3월", "4월", "5월"]} series={series} accessibilityLabel="OPS" formatValue={(v) => v.toFixed(3)} missingLabel="기록 없음" />);
  expect(line).toContain('width="320"');
  expect(line).toContain("OPS: 3월 0.800, 4월 기록 없음, 5월 0.900");
  const bar = renderToString(<BarChart categories={["가", "나"]} series={[{ id: "a", label: "A", values: [1, 2] }]} width={200} accessibilityLabel="A" formatValue={String} missingLabel="-" />);
  expect(bar).toContain('width="200"');
  const pie = renderToString(<PieChart data={[{ id: "a", label: "가", value: 1 }]} accessibilityLabel="비율" formatValue={String} />);
  expect(pie).toContain('role="img"');
});

it.each([false, true])("keeps nearby extreme labels apart in a fixed domain (invert=%s)", invert => {
  const markup = renderToString(<LineChart categories={["첫날", "다음날"]} series={[{ id: "rank", label: "순위", values: invert ? [1, 1.1] : [9.9, 10] }]}
    domain={[1, 10]} invert={invert} extremes={{ high: "max", low: "min" }} accessibilityLabel="순위" formatValue={String} missingLabel="—" />);
  const labels = [...markup.matchAll(/<text[^>]*class="[^"]*hjm-chart__extreme"[^>]*y="([^"]+)"[^>]*>(max|min) [^<]+<\/text>/g)];
  expect(labels).toHaveLength(2);
  const y = new Map(labels.map(label => [label[2], Number(label[1])]));
  expect(y.get(invert ? "max" : "min")! - y.get(invert ? "min" : "max")!).toBeGreaterThanOrEqual(26);
});

it.each(["none", "dotted"] as const)("renders disconnected vertical drops without changing missing values (%s)", missingConnection => {
  const markup = renderToString(<LineChart categories={["앞", "2022", "2023", "2024", "2025", "뒤"]}
    series={[{ id: "record", label: "기록", values: [null, 2, null, null, 4, null] }]} missingConnection={missingConnection}
    accessibilityLabel="시즌 기록" formatValue={String} missingLabel="기록 없음" />);
  expect([...markup.matchAll(/stroke-dasharray="1 5"/g)]).toHaveLength(missingConnection === "dotted" ? 2 : 0);
  if (missingConnection === "dotted") {
    const lines = [...markup.matchAll(/<line[^>]*stroke-dasharray="1 5"[^>]*>/g)].map(match => match[0]);
    expect(lines).toHaveLength(2);
    const floor = chartRecipe.heights.regular - chartRecipe.insets.plot.bottom;
    const { left, right } = chartRecipe.insets.plot;
    lines.forEach((line, index) => {
      const attr = (name: string) => Number(line.match(new RegExp(`${name}="([^"]+)"`))![1]);
      expect(attr("x1")).toBe(attr("x2"));
      expect(attr("y2")).toBe(floor);
      expect(attr("x1")).toBeCloseTo(left + (320 - left - right) * (index === 0 ? 1 : 4) / 5);
    });
  }
  expect(markup).toContain("2023 기록 없음, 2024 기록 없음");
});


it("bridges only interior missing intervals while keeping their values absent", () => {
  const markup = renderToString(<LineChart categories={["前", "A", "missing", "B", "後"]}
    series={[{ id: "record", label: "기록", values: [null, 2, null, 4, null] }]} missingConnection="bridge"
    accessibilityLabel="추이" formatValue={String} missingLabel="미수집" />);
  const bridges = [...markup.matchAll(/<line[^>]*data-missing-bridge="true"[^>]*>/g)];
  expect(bridges).toHaveLength(1);
  const attr = (name: string) => Number(bridges[0]![0].match(new RegExp(`${name}="([^\"]+)"`))![1]);
  expect(attr("x2")).toBeGreaterThan(attr("x1"));
  expect(attr("y2")).toBeLessThan(attr("y1"));
  expect(bridges[0]![0]).toContain('stroke-dasharray="1 5"');
  expect(markup).toContain("前 미수집, A 2, missing 미수집, B 4, 後 미수집");
});
