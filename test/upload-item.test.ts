import { describe, expect, it } from "vitest";
import { progressRecipe } from "../src/component-recipes.js";
import {
  getUploadItemAvailableAction,
  resolveUploadItemAnnouncement,
  uploadItemBehavior,
  uploadItemRecipe,
  validateUploadItemDescriptor,
  validateUploadItemLabels,
  validateUploadItemList,
  validateUploadItemState,
  type UploadItemDescriptor,
  type UploadItemLabels,
  type UploadItemState,
} from "../src/upload-item.js";

const labels: UploadItemLabels = {
  pending: "대기 중",
  uploading: "업로드 중",
  success: "업로드 완료",
  cancel: "취소",
  retry: "다시 시도",
};

function descriptor(state: UploadItemState, overrides: Partial<UploadItemDescriptor> = {}): UploadItemDescriptor {
  return { id: "upload-1", name: "photo.png", state, ...overrides };
}

describe("UploadItem state validation", () => {
  it("rejects an unsupported status", () => {
    expect(() => validateUploadItemState({ status: "unknown" } as never)).toThrow(/status/);
  });

  it("bounds uploading progress to null or 0..1", () => {
    expect(() => validateUploadItemState({ status: "uploading", progress: null })).not.toThrow();
    expect(() => validateUploadItemState({ status: "uploading", progress: 0.5 })).not.toThrow();
    expect(() => validateUploadItemState({ status: "uploading", progress: 1.5 })).toThrow(
      /progress/,
    );
    expect(() => validateUploadItemState({ status: "uploading", progress: -0.1 })).toThrow(
      /progress/,
    );
  });

  it("rejects an empty progressLabel or error message", () => {
    expect(() =>
      validateUploadItemState({ status: "uploading", progress: 0.5, progressLabel: " " }),
    ).toThrow(/progressLabel/);
    expect(() => validateUploadItemState({ status: "error", message: " " })).toThrow(/message/);
    expect(() => validateUploadItemState({ status: "error", message: "offline" })).not.toThrow();
  });
});

describe("UploadItem descriptor and list validation", () => {
  it("rejects empty id, name, and sizeLabel", () => {
    expect(() =>
      validateUploadItemDescriptor(descriptor({ status: "pending" }, { id: " " })),
    ).toThrow(/id/);
    expect(() =>
      validateUploadItemDescriptor(descriptor({ status: "pending" }, { name: "" })),
    ).toThrow(/name/);
    expect(() =>
      validateUploadItemDescriptor(descriptor({ status: "pending" }, { sizeLabel: " " })),
    ).toThrow(/sizeLabel/);
  });

  it("rejects duplicate ids across a rendered list", () => {
    const a = descriptor({ status: "pending" }, { id: "a" });
    const b = descriptor({ status: "success" }, { id: "a" });
    expect(() => validateUploadItemList([a, b])).toThrow(/Duplicate/);
    expect(() =>
      validateUploadItemList([a, descriptor({ status: "success" }, { id: "b" })]),
    ).not.toThrow();
  });

  it("rejects incomplete or blank labels", () => {
    expect(() => validateUploadItemLabels(labels)).not.toThrow();
    expect(() => validateUploadItemLabels({ ...labels, retry: " " })).toThrow(/labels.retry/);
    expect(() => validateUploadItemLabels({ pending: "x" } as never)).toThrow(/labels.uploading/);
  });
});

describe("getUploadItemAvailableAction", () => {
  it("allows cancel only while uploading and retry only while error", () => {
    expect(getUploadItemAvailableAction({ status: "pending" })).toBeNull();
    expect(getUploadItemAvailableAction({ status: "uploading", progress: 0.3 })).toBe("cancel");
    expect(getUploadItemAvailableAction({ status: "success" })).toBeNull();
    expect(getUploadItemAvailableAction({ status: "error", message: "offline" })).toBe("retry");
  });
});

describe("resolveUploadItemAnnouncement", () => {
  it("keeps the file name as a stable accessible label independent of status", () => {
    for (const state of [
      { status: "pending" },
      { status: "uploading", progress: 0.4 },
      { status: "success" },
      { status: "error", message: "offline" },
    ] as const) {
      expect(resolveUploadItemAnnouncement(descriptor(state), labels).label).toBe("photo.png");
    }
  });

  it("prefers a product progressLabel over the computed percent", () => {
    expect(
      resolveUploadItemAnnouncement(
        descriptor({ status: "uploading", progress: 0.4, progressLabel: "1.6MB / 4MB" }),
        labels,
      ).description,
    ).toBe("1.6MB / 4MB");
  });

  it("falls back to a rounded percent, then to the static label when indeterminate", () => {
    expect(
      resolveUploadItemAnnouncement(descriptor({ status: "uploading", progress: 0.4 }), labels)
        .description,
    ).toBe("40%");
    expect(
      resolveUploadItemAnnouncement(
        descriptor({ status: "uploading", progress: null }),
        labels,
      ).description,
    ).toBe(labels.uploading);
  });

  it("reports the state's own error message rather than a generic label", () => {
    expect(
      resolveUploadItemAnnouncement(descriptor({ status: "error", message: "offline" }), labels)
        .description,
    ).toBe("offline");
  });
});

describe("UploadItem visual and behavior contract", () => {
  it("reuses the shared Progress recipe defaults instead of a new bar", () => {
    expect(uploadItemRecipe.progress.size).toBe(progressRecipe.defaults.size);
    expect(uploadItemRecipe.progress.tone).toBe(progressRecipe.defaults.tone);
    expect(Object.keys(progressRecipe.tones)).toContain(uploadItemRecipe.progress.errorTone);
  });

  it("keeps cancel/retry targets touch-safe", () => {
    expect(uploadItemRecipe.action.minTarget).toBeGreaterThanOrEqual(44);
  });

  it("maps status onto the common content axis without loadingMore or empty", () => {
    expect(uploadItemBehavior.stateAxes.content).toEqual(["idle", "loading", "complete", "error"]);
  });
});
