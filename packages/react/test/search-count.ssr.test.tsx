import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { SearchScreen } from "../src/screen-flows.js";

it("hides only the visual count and retains announcements and body states", () => {
  const render = (count: number | null, hidden = true) => renderToStaticMarkup(<HjmProvider><SearchScreen title="검색" queryLabel="검색어" queryClearLabel="지우기" query="구" committedQuery="구" onSubmit={() => {}} onQueryChange={() => {}} onSearch={() => {}} resultSummary={{ count, countVisibility: hidden ? "hidden" : "visible", countLabel: n => `total:${n}`, loadingLabel: "검색 로딩", empty: { title: "결과 없음" } }}><span>선수 결과</span></SearchScreen></HjmProvider>);
  // The hidden status announces the total; only the visible text disappears.
  expect(render(24)).not.toMatch(/<span class="hjm-text"[^>]*>total:24<\/span>/);
  expect(render(24)).toContain("total:24");
  expect(render(24)).toContain("선수 결과");
  expect(render(24, false)).toMatch(/<span class="hjm-text"[^>]*>total:24<\/span>/);
  expect(render(0)).toContain("결과 없음");
  expect(render(null)).toContain("검색 로딩");
  expect(render(null)).not.toContain("선수 결과");
});
