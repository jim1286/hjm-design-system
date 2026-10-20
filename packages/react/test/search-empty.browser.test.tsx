import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { SearchScreen } from "../src/screen-flows.js";
import "../src/styles.css";

it("centers an empty search in the remaining body below a pinned map/filter region", async () => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<HjmProvider><div style={{ height: 700, display: "flex", flexDirection: "column" }}><SearchScreen title="검색" queryLabel="검색어" queryClearLabel="지우기"
      children={null} searching={false} searchingLabel="검색 중" query="없는 장소" committedQuery="없는 장소" onSubmit={() => {}} onQueryChange={() => {}} onSearch={() => {}}
      layoutStyle={{ flex: 1 }} filtersRole="scope" filters={<div style={{ height: 200 }}>지도 필터</div>}
      resultSummary={{ count: 0, countVisibility: "hidden", countLabel: n => `${n}개`, loadingLabel: "검색 중", empty: { title: "검색 결과가 없어요" } }} />
    </div></HjmProvider>));
    const body = host.querySelector<HTMLElement>(".hjm-screen__body")!;
    const state = host.querySelector<HTMLElement>(".hjm-empty-state__title")!;
    const bounds = body.getBoundingClientRect(), message = state.getBoundingClientRect();
    expect(bounds.height).toBeGreaterThan(100);
    expect(Math.abs(message.top + message.height / 2 - (bounds.top + bounds.height / 2))).toBeLessThan(2);
    expect(Math.abs(message.left + message.width / 2 - (bounds.left + bounds.width / 2))).toBeLessThan(2);
  } finally { await act(async () => root.unmount()); host.remove(); }
});
