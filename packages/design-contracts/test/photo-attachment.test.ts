import { describe, expect, it } from "vitest";
import { resolvePhotoAttachmentActions, resolvePhotoAttachmentPreviewSize, validatePhotoAttachment } from "../src/image.js";

describe("photo attachment", () => {
  it("offers add without a photo and replace/remove with one", () => {
    expect(resolvePhotoAttachmentActions({ hasPhoto: false })).toEqual({
      choose: { label: "add", disabled: false, loading: false }, remove: { visible: false, disabled: false }, preview: { visible: false },
    });
    expect(resolvePhotoAttachmentActions({ hasPhoto: true }).choose.label).toBe("replace");
  });

  it("locks choose and remove while picking or uploading, and unlocks after an upload error", () => {
    const picking = resolvePhotoAttachmentActions({ hasPhoto: true, picking: true });
    expect(picking.choose).toEqual({ label: "replace", disabled: true, loading: true });
    expect(picking.remove.disabled).toBe(true);
    const uploading = resolvePhotoAttachmentActions({ hasPhoto: true, upload: "uploading" });
    expect([uploading.choose.disabled, uploading.choose.loading, uploading.remove.disabled]).toEqual([true, false, true]);
    const failed = resolvePhotoAttachmentActions({ hasPhoto: true, upload: "error" });
    expect([failed.choose.disabled, failed.remove.disabled, failed.preview.visible]).toEqual([false, false, true]);
  });

  it("keeps the preview viewable while the host locks editing", () => {
    const locked = resolvePhotoAttachmentActions({ hasPhoto: true, disabled: true });
    expect([locked.choose.disabled, locked.remove.disabled, locked.preview.visible]).toEqual([true, true, true]);
  });

  it("caps tall previews and rejects unsized photos or empty labels", () => {
    expect(resolvePhotoAttachmentPreviewSize({ uri: "a", width: 1000, height: 500 })).toEqual({ width: 1000, height: 500, fit: "cover" });
    expect(resolvePhotoAttachmentPreviewSize({ uri: "a", width: 600, height: 2000 })).toEqual({ width: 600, height: 800, fit: "cover" });
    const labels = { add: "Add", replace: "Replace", remove: "Remove", preview: "View" };
    expect(() => validatePhotoAttachment(labels, { uri: "a", width: 0, height: 1 })).toThrow(TypeError);
    expect(() => validatePhotoAttachment({ ...labels, remove: " " }, null)).toThrow(TypeError);
  });
});
