import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { searchScreenRecipe } from "@hjmds/design-contracts/screen-patterns";
import { HjmNativeProvider } from "../src/provider.js";
import { SearchScreen } from "../src/screen-flows.js";
import { Text } from "../src/primitives.js";

let tree: ReactTestRenderer | undefined;
beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { act(() => tree?.unmount()); tree = undefined; vi.useRealTimers(); });

function screen(query: string, onSearch: (query: string, context: { signal: AbortSignal }) => void, debounceMs?: number) {
  return <HjmNativeProvider reducedMotion><SearchScreen title="검색" queryLabel="검색어" queryField={<Text>검색 입력 슬롯</Text>} query={query} onQueryChange={() => {}} onSearch={onSearch} {...(debounceMs === undefined ? {} : { debounceMs })}>{null}</SearchScreen></HjmNativeProvider>;
}

describe("SearchScreen shared debounce", () => {
  it("uses the recipe delay, cancels superseded timers and aborts requests on edit/unmount", () => {
    const calls: { query: string; signal: AbortSignal }[] = [];
    const search = (query: string, { signal }: { signal: AbortSignal }) => { calls.push({ query, signal }); };
    act(() => { tree = create(screen("old", search)); });
    act(() => { vi.advanceTimersByTime(searchScreenRecipe.debounceMs - 1); });
    expect(calls).toHaveLength(0);
    act(() => { tree!.update(screen("current", search)); });
    act(() => { vi.advanceTimersByTime(searchScreenRecipe.debounceMs); });
    expect(calls.map(call => call.query)).toEqual(["current"]);
    expect(calls[0]!.signal.aborted).toBe(false);
    act(() => { tree!.update(screen("next", search)); });
    expect(calls[0]!.signal.aborted).toBe(true);
    act(() => { vi.advanceTimersByTime(searchScreenRecipe.debounceMs); });
    expect(calls.map(call => call.query)).toEqual(["current", "next"]);
    act(() => { tree!.unmount(); }); tree = undefined;
    expect(calls[1]!.signal.aborted).toBe(true);
  });

  it.each([0, -10, 75])("honors finite custom delay %s", debounceMs => {
    const search = vi.fn();
    act(() => { tree = create(screen("query", search, debounceMs)); });
    expect(search).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(Math.max(0, debounceMs)); });
    expect(search).toHaveBeenCalledOnce();
  });
});


describe("SearchScreen hidden result count", () => {
  function results(count: number | null, hidden = true) {
    return <HjmNativeProvider reducedMotion><SearchScreen title="검색" queryLabel="검색어" queryField={<Text>입력</Text>} query="구" committedQuery="구" onSubmit={() => {}} onQueryChange={() => {}} onSearch={() => {}} resultSummary={{ count, countVisibility: hidden ? "hidden" : "visible", countLabel: n => `total:${n}`, loadingLabel: "검색 로딩", empty: { title: "결과 없음" } }}><Text>선수 결과</Text></SearchScreen></HjmNativeProvider>;
  }
  it("removes the visual total but preserves results and empty/loading states", () => {
    act(() => { tree = create(results(24)); });
    expect(JSON.stringify(tree!.toJSON())).not.toContain("total:24");
    expect(JSON.stringify(tree!.toJSON())).toContain("선수 결과");
    act(() => { tree!.update(results(24, false)); });
    expect(JSON.stringify(tree!.toJSON())).toContain("total:24");
    act(() => { tree!.update(results(0)); });
    expect(JSON.stringify(tree!.toJSON())).toContain("결과 없음");
    act(() => { tree!.update(results(null)); });
    expect(JSON.stringify(tree!.toJSON())).toContain("검색 로딩");
    expect(JSON.stringify(tree!.toJSON())).not.toContain("선수 결과");
  });
});
