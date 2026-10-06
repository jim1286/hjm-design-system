import { afterEach, expect, it, vi } from "vitest";
import { createActionSession } from "@hjmds/design-contracts/action-session";
import { createDocumentResourceExample } from "../../shared/document-resource-example";
afterEach(() => vi.useRealTimers());
it("retries a synthetic failure once and does not duplicate host exports", async () => {
  vi.useFakeTimers();
  const host = vi.fn().mockResolvedValue({ status: "started" });
  const example = createDocumentResourceExample(createActionSession, host);
  const failed = example.save("a.txt");
  expect(await example.save("a.txt")).toEqual({ status: "blocked" });
  await vi.runAllTimersAsync(); await failed;
  expect(host).not.toHaveBeenCalled();
  const retry = example.retry(); await vi.runAllTimersAsync(); await retry;
  expect(host).toHaveBeenCalledOnce();
  expect(example.session.getSnapshot().value).toEqual({ status: "started" });
});
it("does not initiate an old host export after replacing the document during demo latency", async () => {
  vi.useFakeTimers();
  const host = vi.fn();
  const example = createDocumentResourceExample(createActionSession, host);
  const pending = example.save("old.txt");
  example.reset(); await vi.runAllTimersAsync();
  expect(await pending).toEqual({ status: "ignored" });
  expect(host).not.toHaveBeenCalled();
  expect(example.session.getSnapshot()).toEqual({ status: "idle", value: { status: "idle" } });
});
it("invalidates the host guard if the file changes while native availability is pending", async () => {
  vi.useFakeTimers();
  let release!: () => void;
  let isCurrent!: () => boolean;
  const ready = new Promise<void>(resolve => { release = resolve; });
  const accepted = vi.fn();
  const host = vi.fn(async (_name: string, _body: string, current: () => boolean) => {
    isCurrent = current;
    await ready;
    if (!current()) throw new Error("detached");
    accepted();
    return { status: "started" as const };
  });
  const example = createDocumentResourceExample(createActionSession, host);
  const failed = example.save("a.txt"); await vi.runAllTimersAsync(); await failed;
  const pending = example.retry(); await vi.runAllTimersAsync();
  expect(isCurrent()).toBe(true);
  example.reset(); expect(isCurrent()).toBe(false);
  release(); expect(await pending).toEqual({ status: "ignored" });
  expect(accepted).not.toHaveBeenCalled();
});
