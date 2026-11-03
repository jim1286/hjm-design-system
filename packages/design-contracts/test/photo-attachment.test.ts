import { describe, expect, it } from "vitest";
import { resolvePhotoAttachmentActions, resolvePhotoAttachmentPreviewSize, validatePhotoAttachment } from "../src/image.js";

describe("photo attachment", () => {
  it("offers choose without a photo and only the preview and remove with one", () => {
    expect(resolvePhotoAttachmentActions({ hasPhoto: false })).toEqual({
      choose: { visible: true, disabled: false, loading: false }, remove: { visible: false, disabled: false }, preview: { visible: false },
    });
    const attached = resolvePhotoAttachmentActions({ hasPhoto: true });
    expect([attached.choose.visible, attached.remove.visible, attached.preview.visible]).toEqual([false, true, true]);
  });

  it("locks choose while picking and remove while the host submits, keeping the viewer", () => {
    expect(resolvePhotoAttachmentActions({ hasPhoto: false, picking: true }).choose).toEqual({ visible: true, disabled: true, loading: true });
    const locked = resolvePhotoAttachmentActions({ hasPhoto: true, disabled: true });
    expect([locked.remove.disabled, locked.preview.visible]).toEqual([true, true]);
  });

  it("caps tall previews and rejects unsized photos or empty labels", () => {
    expect(resolvePhotoAttachmentPreviewSize({ uri: "a", width: 1000, height: 500 })).toEqual({ width: 1000, height: 500, fit: "cover" });
    expect(resolvePhotoAttachmentPreviewSize({ uri: "a", width: 600, height: 2000 })).toEqual({ width: 600, height: 800, fit: "cover" });
    const labels = { add: "Photo", remove: "Remove photo", preview: "View photo" };
    expect(() => validatePhotoAttachment(labels, { uri: "a", width: 0, height: 1 })).toThrow(TypeError);
    expect(() => validatePhotoAttachment({ ...labels, remove: " " }, null)).toThrow(TypeError);
  });
});
