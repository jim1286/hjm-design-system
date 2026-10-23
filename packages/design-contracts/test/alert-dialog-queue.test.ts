import { expect, it } from "vitest";
import { createAlertDialogQueue, type AlertDialogRequest } from "../src/alert-dialog.js";

const ask = (title: string): AlertDialogRequest => ({ mode: "confirm", title, description: "설명", confirmLabel: "확인", cancelLabel: "취소" });

it("shows one request at a time in arrival order and settles each promise with its own result", async () => {
  const queue = createAlertDialogQueue<null>();
  const first = queue.enqueue(ask("첫째"), null, "/a");
  const second = queue.enqueue(ask("둘째"), null, "/a");
  expect(queue.getSnapshot().map((entry) => entry.request.title)).toEqual(["첫째", "둘째"]);
  const [head, next] = queue.getSnapshot();
  // Only the dialog on screen can settle.
  expect(queue.settle(next!.id, { outcome: "confirmed" })).toBe(false);
  expect(queue.settle(head!.id, { outcome: "confirmed" })).toBe(true);
  expect(queue.settle(head!.id, { outcome: "confirmed" })).toBe(false);
  expect(queue.getSnapshot().map((entry) => entry.request.title)).toEqual(["둘째"]);
  queue.settle(next!.id, { outcome: "cancelled", reason: "escape" });
  await expect(first).resolves.toEqual({ outcome: "confirmed" });
  await expect(second).resolves.toEqual({ outcome: "cancelled", reason: "escape" });
});

it("interrupts requests from a departed scope, including a late call from it, and everything while inactive", async () => {
  const queue = createAlertDialogQueue<null>();
  const left = queue.enqueue(ask("이전 화면"), null, "/a");
  queue.retainScope("/b");
  await expect(left).resolves.toEqual({ outcome: "cancelled", reason: "interrupted" });
  const late = queue.enqueue(ask("늦은 호출"), null, "/a");
  const current = queue.enqueue(ask("현재 화면"), null, "/b");
  queue.retainScope("/b");
  await expect(late).resolves.toEqual({ outcome: "cancelled", reason: "interrupted" });
  expect(queue.getSnapshot().map((entry) => entry.request.title)).toEqual(["현재 화면"]);
  queue.setActive(false);
  await expect(current).resolves.toEqual({ outcome: "cancelled", reason: "interrupted" });
  await expect(queue.enqueue(ask("렌더러 없음"), null, "/b")).resolves.toEqual({ outcome: "cancelled", reason: "interrupted" });
  queue.setActive(true);
  void queue.enqueue(ask("다시 마운트"), null, "/b");
  expect(queue.getSnapshot()).toHaveLength(1);
});

it("resolves the caller before notifying the renderer, and rejects invalid requests synchronously", async () => {
  const queue = createAlertDialogQueue<null>();
  const order: string[] = [];
  const result = queue.enqueue(ask("확인"), null, undefined);
  void result.then(() => order.push("caller"));
  queue.subscribe(() => { queueMicrotask(() => order.push("renderer")); });
  queue.settle(queue.getSnapshot()[0]!.id, { outcome: "confirmed" });
  await result; await Promise.resolve();
  expect(order).toEqual(["caller", "renderer"]);
  expect(() => queue.enqueue({ ...ask("x"), title: " " }, null, undefined)).toThrow(TypeError);
});
