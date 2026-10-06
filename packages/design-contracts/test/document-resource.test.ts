import { describe, expect, it } from "vitest";
import { createActionSession } from "../src/action-session.js";
import { resolveDocumentResource, type DocumentResourceDescriptor, type DocumentSaveState } from "../src/document-resource.js";

const resource: DocumentResourceDescriptor = {
  id: "guide:revision-2", name: "사용 안내.pdf", formatLabel: "PDF", sizeLabel: "2.5 MB",
  preview: { status: "ready" }, save: { status: "idle" },
};

describe("document resource candidate", () => {
  it("preserves file metadata through preview failure without blocking independent saving", () => {
    const resolved = resolveDocumentResource({ ...resource, preview: { status: "error", message: "그림을 표시할 수 없습니다", retryable: true } });
    expect(resolved.metadata).toEqual(["PDF", "2.5 MB"]);
    expect(resolved.name).toBe(resource.name);
    expect(resolved.canPreview).toBe(false);
    expect(resolved.canRetryPreview).toBe(true);
    expect(resolved.canSave).toBe(true);
  });
  it("does not label browser initiation or user cancellation as a completed save", () => {
    for (const status of ["idle", "pending", "started", "cancelled"] as const) {
      expect(resolveDocumentResource({ ...resource, save: { status } }).saved).toBe(false);
    }
    expect(resolveDocumentResource({ ...resource, save: { status: "saved" } }).saved).toBe(true);
  });
  it("keeps pending save separate from preview and requires explicit permission to retry failures", () => {
    const pending = resolveDocumentResource({ ...resource, save: { status: "pending" } });
    expect(pending.canSave).toBe(false);
    expect(pending.canPreview).toBe(true);
    for (const retryable of [false, true]) {
      const failed = resolveDocumentResource({ ...resource, save: { status: "error", message: "저장 결과를 확인하세요", retryable } });
      expect(failed.canSave).toBe(false);
      expect(failed.canRetrySave).toBe(retryable);
    }
  });
  it("disables every action without hiding independent error messages", () => {
    const resolved = resolveDocumentResource({ ...resource, disabled: true,
      preview: { status: "error", message: "미리보기 오류", retryable: true },
      save: { status: "error", message: "저장 오류", retryable: true } });
    expect([resolved.canPreview, resolved.canRetryPreview, resolved.canSave, resolved.canRetrySave]).toEqual([false, false, false, false]);
    expect(resolved.preview).toHaveProperty("message", "미리보기 오류");
    expect(resolved.save).toHaveProperty("message", "저장 오류");
  });
  it("does not invent missing metadata and returns detached immutable state", () => {
    const source = { id: "local:1", name: "보고서", preview: { status: "none" as const }, save: { status: "idle" as const } };
    const resolved = resolveDocumentResource(source);
    source.name = "다른 문서";
    expect(resolved.name).toBe("보고서");
    expect(resolved.metadata).toEqual([]);
    expect(Object.isFrozen(resolved.preview)).toBe(true);
    expect(Object.isFrozen(resolved.save)).toBe(true);
    expect(Object.isFrozen(resolved.metadata)).toBe(true);
  });
  it("rejects unsupported states and error messages without retry policy", () => {
    for (const patch of [ { name: " " }, { sizeLabel: "" }, { disabled: "yes" },
      { preview: { status: "success" } }, { save: { status: "error", message: "오류" } },
      { save: { status: "error", message: "", retryable: true } } ]) {
      expect(() => resolveDocumentResource({ ...resource, ...patch } as DocumentResourceDescriptor)).toThrow(TypeError);
    }
  });
  it.each(["resolve", "reject"] as const)("uses the existing action session to ignore stale %s across document replacement", async settlement => {
    let resolve!: (value: DocumentSaveState) => void, reject!: (error: Error) => void;
    const pending = new Promise<DocumentSaveState>((yes, no) => { resolve = yes; reject = no; });
    const session = createActionSession<DocumentSaveState>({ status: "idle" });
    const first = session.run(() => pending);
    // Entity change/unmount detaches results; it does not promise OS cancellation.
    session.reset({ status: "idle" });
    await session.run(() => ({ status: "started" }));
    if (settlement === "resolve") resolve({ status: "saved" }); else reject(new Error("old document"));
    expect(await first).toEqual({ status: "ignored" });
    expect(session.getSnapshot().value).toEqual({ status: "started" });
  });
});
