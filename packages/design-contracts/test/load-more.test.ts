import { describe, expect, it, vi } from "vitest";
import {
  behaviorRegistry,
  canRequestLoadMore,
  componentCatalog,
  control,
  createLoadMoreController,
  loadMoreBehaviorDefaults,
  loadMoreRecipe,
  validateLoadMoreDescriptor,
  validateLoadMoreLabels,
  validateLoadMoreState,
  type LoadMoreState,
} from "../src/index.js";

const ready = (requestKey = "cursor:20"): LoadMoreState => ({
  status: "ready",
  requestKey,
});

describe("LoadMore state and request gate", () => {
  it("validates stable request identity and visible error copy", () => {
    expect(() => validateLoadMoreState(ready(""))).toThrow(/requestKey/);
    expect(() => validateLoadMoreState(ready(" padded "))).toThrow(/whitespace/);
    expect(() =>
      validateLoadMoreState({ status: "error", requestKey: "next", message: " " }),
    ).toThrow(/message/);
    expect(() => validateLoadMoreState({ status: "complete" })).not.toThrow();
    expect(() => validateLoadMoreState({ status: "unknown" } as never)).toThrow(
      /status/,
    );
  });

  it("requires every renderer state message to be localized visible copy", () => {
    const labels = {
      loadMore: "Load more",
      loading: "Loading more",
      retry: "Retry",
      complete: "You are all caught up",
    } as const;
    expect(() => validateLoadMoreLabels(labels)).not.toThrow();
    expect(() => validateLoadMoreLabels({ ...labels, retry: " " })).toThrow(
      /labels.retry/,
    );
    expect(() => validateLoadMoreLabels({ loadMore: "More" } as never)).toThrow(
      /labels.loading/,
    );
    expect(() => validateLoadMoreDescriptor({ state: ready(), labels })).not.toThrow();
  });

  it("allows only state-appropriate request reasons", () => {
    expect(canRequestLoadMore(ready(), "automatic", "viewport")).toBe(true);
    expect(canRequestLoadMore(ready(), "manual", "viewport")).toBe(false);
    expect(canRequestLoadMore(ready(), "manual", "manual")).toBe(true);
    expect(
      canRequestLoadMore(
        { status: "error", requestKey: "cursor:20", message: "Try again" },
        "automatic",
        "retry",
      ),
    ).toBe(true);
    expect(
      canRequestLoadMore(
        { status: "loading", requestKey: "cursor:20" },
        "automatic",
        "manual",
      ),
    ).toBe(false);
    expect(canRequestLoadMore({ status: "complete" }, "automatic", "manual")).toBe(false);
    expect(() =>
      canRequestLoadMore(ready(), "automatic", "unexpected" as never),
    ).toThrow(/reason/);
  });

  it("deduplicates concurrent requests and clears the gate after settlement", async () => {
    let resolve!: () => void;
    const pending = new Promise<void>((done) => {
      resolve = done;
    });
    const onLoadMore = vi.fn(() => pending);
    const controller = createLoadMoreController({ onLoadMore });
    const before = controller.getSnapshot();
    expect(controller.getSnapshot()).toBe(before);

    const first = controller.request(ready(), "viewport");
    expect(controller.getSnapshot()).not.toBe(before);
    await expect(controller.request(ready(), "viewport")).resolves.toBe(
      "already-requesting",
    );
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    resolve();
    await expect(first).resolves.toBe("started");
    expect(controller.getSnapshot().inFlightRequestKey).toBeNull();
    await expect(controller.request(ready(), "manual")).resolves.toBe("started");
    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });

  it("releases a failed request for an explicit retry and rejects use after dispose", async () => {
    const failure = new Error("offline");
    const onLoadMore = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(failure)
      .mockResolvedValueOnce();
    const controller = createLoadMoreController({ mode: "manual", onLoadMore });
    await expect(controller.request(ready(), "manual")).rejects.toBe(failure);
    await expect(
      controller.request(
        { status: "error", requestKey: "cursor:20", message: "Offline" },
        "retry",
      ),
    ).resolves.toBe("started");
    expect(controller.dispose()).toBe(true);
    expect(controller.dispose()).toBe(false);
    await expect(controller.request(ready(), "manual")).rejects.toThrow(/disposed/);
  });

  it("reports blocked automatic and state requests without firing callbacks", async () => {
    const onLoadMore = vi.fn(async () => {});
    const controller = createLoadMoreController({ mode: "manual", onLoadMore });
    await expect(controller.request(ready(), "viewport")).resolves.toBe(
      "blocked-by-mode",
    );
    await expect(
      controller.request({ status: "complete" }, "manual"),
    ).resolves.toBe("blocked-by-state");
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it("requires the handler promise to cover the real page request lifetime", async () => {
    const controller = createLoadMoreController({
      onLoadMore: (() => undefined) as never,
    });
    await expect(controller.request(ready(), "viewport")).rejects.toThrow(
      /must return a Promise/,
    );
    expect(controller.getSnapshot().inFlightRequestKey).toBeNull();
  });
});

describe("LoadMore identity contract", () => {
  it("links the beta renderer contract proven by a product vertical slice", () => {
    expect(componentCatalog.find((entry) => entry.name === "LoadMore")).toMatchObject({
      platform: "shared",
      status: "beta",
      surfaceStatus: { web: "beta", native: "beta" },
      recipe: "loadMoreRecipe",
      behavior: "loadMore",
    });
    expect(behaviorRegistry.loadMore.defaults).toBe(loadMoreBehaviorDefaults);
    expect(behaviorRegistry.loadMore.inputs).toContain("labels");
  });

  it("keeps manual and retry actions touch-safe with a non-color async grammar", () => {
    expect(loadMoreRecipe.trigger.minHeight).toBeGreaterThanOrEqual(
      control.minTouchTarget,
    );
    expect(loadMoreRecipe.slots).toEqual([
      "root",
      "status",
      "spinner",
      "trigger",
      "error",
      "retry",
      "end",
    ]);
    expect(loadMoreRecipe.states.focus.width).toBeGreaterThan(0);
  });
});
