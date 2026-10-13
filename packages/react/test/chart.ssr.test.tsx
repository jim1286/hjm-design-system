import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { BarChart, LineChart, PieChart } from "../src/chart.js";

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
