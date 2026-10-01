import { describe, expect, it, vi } from "vitest";
import { createActionSession } from "../src/action-session.js";
function deferred<T>() {
 let resolve!: (value: T) => void;
 let reject!: (reason: unknown) => void;
 const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
 return { promise, resolve, reject };
}
describe("shared action session", () => {
 it("blocks simultaneous mutations before awaiting the first result", async () => {
  const session = createActionSession("old"); const request = deferred<string>();
  const first = session.run(() => request.promise); const duplicate = vi.fn(() => "duplicate");
  expect(await session.run(duplicate)).toEqual({ status: "blocked" }); expect(duplicate).not.toHaveBeenCalled();
  expect(session.getSnapshot()).toMatchObject({ status: "pending", value: "old" });
  request.resolve("saved"); await first;
  expect(session.getSnapshot()).toMatchObject({ status: "success", value: "saved" });
 });
 it("rolls back an optimistic failure and retries the captured proposal", async () => {
  const session = createActionSession(false); const request = deferred<boolean>();
  const task = vi.fn().mockImplementationOnce(() => request.promise).mockResolvedValueOnce(true);
  const options = { optimisticValue: true, retryable: true };
  const run = session.run(task, options); options.optimisticValue = false;
  expect(session.getSnapshot()).toMatchObject({ status: "pending", value: true });
  request.reject(new Error("offline")); await run;
  expect(session.getSnapshot()).toMatchObject({ status: "error", value: false });
  await session.retry(); expect(session.getSnapshot()).toMatchObject({ status: "success", value: true });
  expect(task).toHaveBeenCalledTimes(2);
 });
 it.each(["resolve", "reject"] as const)("ignores a stale %s after reset and a newer success", async settlement => {
  const session = createActionSession("old"); const request = deferred<string>();
  const stale = session.run(() => request.promise, { optimisticValue: "proposal" });
  session.reset("fresh"); await session.run(() => "latest");
  if (settlement === "resolve") request.resolve("stale"); else request.reject(new Error("stale"));
  expect(await stale).toEqual({ status: "ignored" });
  expect(session.getSnapshot()).toMatchObject({ status: "success", value: "latest" });
 });
 it("turns synchronous exceptions into retryable error state without throwing", async () => {
  const session = createActionSession(4); const error = new Error("bad input");
  expect(await session.run(() => { throw error; })).toMatchObject({ status: "error", error });
  expect(session.getSnapshot()).toMatchObject({ status: "error", value: 4 });
  session.reset(8); expect(await session.retry()).toEqual({ status: "blocked" });
 });
 it("does not retry mutations unless the product explicitly opts in", async () => {
  const session = createActionSession(0); const task = vi.fn(() => { throw new Error("ambiguous commit"); });
  await session.run(task); expect(await session.retry()).toEqual({ status: "blocked" }); expect(task).toHaveBeenCalledTimes(1);
 });
 it("keeps a stable external-store snapshot and removes subscriptions", async () => {
  const session = createActionSession(0); const listener = vi.fn(); const stop = session.subscribe(listener);
  expect(session.getSnapshot()).toBe(session.getSnapshot()); await session.run(() => 1);
  expect(listener).toHaveBeenCalledTimes(2); stop(); session.reset(0); expect(listener).toHaveBeenCalledTimes(2);
 });
 it("does not claim an undo succeeded until the inverse request succeeds", async () => {
  const session = createActionSession("visible"); await session.run(() => "archived");
  await session.run(() => Promise.reject(new Error("undo failed")));
  expect(session.getSnapshot()).toMatchObject({ status: "error", value: "archived" });
 });
 it("does not start a request if a subscriber resets the pending attempt", async () => {
  const session = createActionSession(0); const task = vi.fn(() => 1);
  session.subscribe(() => { if (session.getSnapshot().status === "pending") session.reset(2); });
  expect(await session.run(task)).toEqual({ status: "ignored" }); expect(task).not.toHaveBeenCalled();
 });
});
