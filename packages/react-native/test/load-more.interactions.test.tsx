import { act, create } from "react-test-renderer";
import { beforeEach, expect, it, vi } from "vitest";
import type { LoadMoreHandle, LoadMoreProps } from "../src/navigation.js";
import { LoadMore } from "../src/navigation.js";
import { HjmNativeProvider } from "../src/provider.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };

export const loadMoreNativeActionCases = [{ componentId: "load-more" }] as const;

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

const labels = {
  loadMore: "더 보기",
  loading: "불러오는 중",
  retry: "다시 시도",
  complete: "모두 불러옴",
};

it("bridges FlatList viewport events, deduplicates the cursor, and exposes manual retry", async () => {
  expect(executedScenarioRegistry.executions.find(({ proofFile }) => proofFile === "test/load-more.interactions.test.tsx")?.scenarios.map(({ id }) => id)).toEqual(expect.arrayContaining(["native-actions", "long-copy"]));
  const onLoadMore = vi.fn(async () => undefined);
  const onRequestOutcome = vi.fn();
  const onRequestError = vi.fn();
  const ref = { current: null as LoadMoreHandle | null };
  let renderer: ReturnType<typeof create>;
  const renderState = (state: LoadMoreProps["descriptor"]["state"]) => (
    <HjmNativeProvider>
      <LoadMore
        ref={ref}
        descriptor={{ state, labels }}
        onLoadMore={onLoadMore}
        onRequestOutcome={onRequestOutcome}
        onRequestError={onRequestError}
      />
    </HjmNativeProvider>
  );

  act(() => { renderer = create(renderState({ status: "ready", requestKey: "cursor-2" })); });
  let firstOutcome: string | undefined;
  await act(async () => { firstOutcome = await ref.current!.onEndReached(); });
  expect(firstOutcome).toBe("started");
  expect(onLoadMore).toHaveBeenCalledWith({ requestKey: "cursor-2", reason: "viewport" });
  await act(async () => { await ref.current!.onEndReached(); });
  expect(onLoadMore).toHaveBeenCalledOnce();
  expect(onRequestOutcome).toHaveBeenCalledWith("already-requesting", "viewport");

  act(() => renderer!.update(renderState({ status: "loading", requestKey: "cursor-2" })));
  expect(renderer!.root.find((node) => node.props.accessibilityRole === "progressbar").props).toMatchObject({
    accessibilityLabel: labels.loading,
    accessibilityState: { busy: true },
  });

  act(() => renderer!.update(renderState({ status: "error", requestKey: "cursor-2", message: "연결을 확인해 주세요" })));
  const retry = renderer!.root.find((node) => node.props.accessibilityLabel === labels.retry);
  expect(retry.props.accessibilityRole).toBe("button");
  await act(async () => { await retry.props.onPress(); });
  expect(onLoadMore).toHaveBeenLastCalledWith({ requestKey: "cursor-2", reason: "retry" });

  act(() => renderer!.update(renderState({ status: "complete" })));
  expect(renderer!.root.findAll((node) => node.props.accessibilityLabel === labels.loadMore || node.props.accessibilityLabel === labels.retry)).toHaveLength(0);
  expect(onRequestError).not.toHaveBeenCalled();
  act(() => renderer!.unmount());
});

it("keeps long localized labels visible throughout the Native footer states", () => {
  const longLabels = {
    loadMore: "더 보기 — 현재 목록 다음 부분의 기록을 이어서 불러옵니다",
    loading: "목록의 다음 항목을 서버에서 가져오는 중입니다. 잠시 기다려 주세요",
    retry: "연결 상태를 확인한 뒤 다음 목록 페이지를 다시 요청합니다",
    complete: "현재 조건에 해당하는 목록 항목을 모두 확인했습니다. 새 항목이 추가되면 다시 방문해 주세요",
  };
  const renderState = (state: { status: "ready"; requestKey: string } | { status: "loading"; requestKey: string } | { status: "error"; requestKey: string; message: string } | { status: "complete" }) => (
    <HjmNativeProvider>
      <LoadMore descriptor={{ state, labels: longLabels }} onLoadMore={async () => undefined} />
    </HjmNativeProvider>
  );
  let renderer: ReturnType<typeof create>;
  act(() => { renderer = create(renderState({ status: "ready", requestKey: "long-copy" })); });
  expect(renderer!.root.find((node) => node.props.accessibilityLabel === longLabels.loadMore)).toBeTruthy();

  act(() => renderer!.update(renderState({ status: "loading", requestKey: "long-copy" })));
  expect(renderer!.root.find((node) => node.props.accessibilityLabel === longLabels.loading).props.accessibilityState.busy).toBe(true);

  act(() => renderer!.update(renderState({ status: "error", requestKey: "long-copy", message: "서버와 연결하지 못했습니다. 잠시 후 다시 시도해 주세요." })));
  expect(renderer!.root.find((node) => node.props.accessibilityLabel === longLabels.retry)).toBeTruthy();
  expect(renderer!.root.findAll((node) => node.children.includes("서버와 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.")).length).toBeGreaterThan(0);

  act(() => renderer!.update(renderState({ status: "complete" })));
  expect(renderer!.root.findAll((node) => node.children.includes(longLabels.complete))).not.toHaveLength(0);
  act(() => renderer!.unmount());
});
