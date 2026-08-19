import { describe, expect, it } from "vitest";
import {
  filePickerBehavior,
  filePickerDefaults,
  filePickerRecipe,
  filePickerTriggerDefaults,
  matchesFilePickerAccept,
  resolveFilePickerDescriptor,
  resolveFilePickerSelection,
  validateFilePickerCandidate,
  validateFilePickerDescriptor,
  validateFilePickerTriggers,
  type FilePickerCandidate,
} from "../src/file-picker.js";

function candidate(overrides: Partial<FilePickerCandidate> = {}): FilePickerCandidate {
  return {
    id: "file-1",
    name: "photo.png",
    mimeType: "image/png",
    sizeBytes: 1024,
    ...overrides,
  };
}

describe("FilePicker descriptor", () => {
  it("defaults to single mode and rejects unsupported modes", () => {
    expect(resolveFilePickerDescriptor({}).mode).toBe(filePickerDefaults.mode);
    expect(() => validateFilePickerDescriptor({ mode: "any" as never })).toThrow(/mode/);
  });

  it("rejects empty, duplicate, and malformed accept patterns", () => {
    expect(() => validateFilePickerDescriptor({ accept: [] })).toThrow(/accept/);
    expect(() =>
      validateFilePickerDescriptor({ accept: ["image/png", "IMAGE/PNG"] }),
    ).toThrow(/Duplicate/);
    expect(() => validateFilePickerDescriptor({ accept: ["not a pattern"] })).toThrow(
      /pattern/,
    );
    expect(() => validateFilePickerDescriptor({ accept: [".pdf", "image/*", "*/*"] })).not.toThrow();
  });

  it("rejects non-positive maxSizeBytes and non-integer maxCount", () => {
    expect(() => validateFilePickerDescriptor({ maxSizeBytes: 0 })).toThrow(/maxSizeBytes/);
    expect(() => validateFilePickerDescriptor({ maxSizeBytes: -1 })).toThrow(/maxSizeBytes/);
    expect(() =>
      validateFilePickerDescriptor({ mode: "multiple", maxCount: 1.5 }),
    ).toThrow(/maxCount/);
    expect(() =>
      validateFilePickerDescriptor({ mode: "multiple", maxCount: 0 }),
    ).toThrow(/maxCount/);
  });

  it("rejects maxCount on single mode instead of silently ignoring it", () => {
    expect(() => validateFilePickerDescriptor({ mode: "single", maxCount: 3 })).toThrow(
      /maxCount/,
    );
  });
});

describe("FilePicker candidate validation", () => {
  it("rejects empty identity and invalid size", () => {
    expect(() => validateFilePickerCandidate(candidate({ id: " " }))).toThrow(/id/);
    expect(() => validateFilePickerCandidate(candidate({ name: "" }))).toThrow(/name/);
    expect(() => validateFilePickerCandidate(candidate({ sizeBytes: -1 }))).toThrow(
      /sizeBytes/,
    );
    expect(() => validateFilePickerCandidate(candidate({ sizeBytes: Number.NaN }))).toThrow(
      /sizeBytes/,
    );
    expect(() => validateFilePickerCandidate(candidate({ mimeType: "" }))).not.toThrow();
  });
});

describe("matchesFilePickerAccept", () => {
  it("matches MIME wildcards, exact types, and extensions case-insensitively", () => {
    expect(matchesFilePickerAccept(candidate(), ["image/*"])).toBe(true);
    expect(matchesFilePickerAccept(candidate(), ["IMAGE/PNG"])).toBe(true);
    expect(matchesFilePickerAccept(candidate(), ["video/*"])).toBe(false);
    expect(
      matchesFilePickerAccept(candidate({ name: "report.PDF", mimeType: "" }), [".pdf"]),
    ).toBe(true);
    expect(matchesFilePickerAccept(candidate(), undefined)).toBe(true);
    expect(matchesFilePickerAccept(candidate(), [])).toBe(true);
  });

  it("never matches a MIME pattern against an unknown MIME type", () => {
    expect(matchesFilePickerAccept(candidate({ mimeType: "" }), ["image/*"])).toBe(false);
    expect(matchesFilePickerAccept(candidate({ mimeType: "" }), ["*/*"])).toBe(true);
  });
});

describe("resolveFilePickerSelection", () => {
  it("keeps the rest of the batch selected when one file is rejected by type", () => {
    const result = resolveFilePickerSelection(
      [candidate({ id: "a" }), candidate({ id: "b", name: "doc.txt", mimeType: "text/plain" })],
      { mode: "multiple", accept: ["image/*"] },
    );
    expect(result.accepted.map((f) => f.id)).toEqual(["a"]);
    expect(result.rejected).toEqual([
      {
        file: candidate({ id: "b", name: "doc.txt", mimeType: "text/plain" }),
        reason: "unsupported-type",
        accept: ["image/*"],
      },
    ]);
  });

  it("rejects by size independently of type", () => {
    const result = resolveFilePickerSelection([candidate({ sizeBytes: 2048 })], {
      maxSizeBytes: 1024,
    });
    expect(result.accepted).toEqual([]);
    expect(result.rejected).toEqual([
      { file: candidate({ sizeBytes: 2048 }), reason: "too-large", maxSizeBytes: 1024 },
    ]);
  });

  it("treats single mode as an implicit one-file cap even for multi-file drops", () => {
    const result = resolveFilePickerSelection(
      [candidate({ id: "a" }), candidate({ id: "b" })],
      { mode: "single" },
    );
    expect(result.accepted.map((f) => f.id)).toEqual(["a"]);
    expect(result.rejected).toEqual([
      { file: candidate({ id: "b" }), reason: "count-exceeded", maxCount: 1 },
    ]);
  });

  it("accounts for files already selected in an earlier pick", () => {
    const result = resolveFilePickerSelection(
      [candidate({ id: "a" }), candidate({ id: "b" })],
      { mode: "multiple", maxCount: 3 },
      2,
    );
    expect(result.accepted.map((f) => f.id)).toEqual(["a"]);
    expect(result.rejected).toEqual([
      { file: candidate({ id: "b" }), reason: "count-exceeded", maxCount: 3 },
    ]);
  });

  it("rejects a negative or fractional existingCount", () => {
    expect(() => resolveFilePickerSelection([], {}, -1)).toThrow(/existingCount/);
    expect(() => resolveFilePickerSelection([], {}, 1.5)).toThrow(/existingCount/);
  });
});

describe("FilePicker trigger platform gate", () => {
  it("always requires a button trigger", () => {
    expect(() => validateFilePickerTriggers("web", [])).toThrow(/must not be empty/);
    expect(() => validateFilePickerTriggers("web", ["dropzone"])).toThrow(/button/);
  });

  it("forbids the dropzone trigger on native", () => {
    expect(() => validateFilePickerTriggers("native", ["button", "dropzone"])).toThrow(
      /Web-only/,
    );
    expect(() => validateFilePickerTriggers("native", ["button"])).not.toThrow();
  });

  it("keeps the documented default triggers in sync with the gate", () => {
    expect(() =>
      validateFilePickerTriggers("web", filePickerTriggerDefaults.web),
    ).not.toThrow();
    expect(() =>
      validateFilePickerTriggers("native", filePickerTriggerDefaults.native),
    ).not.toThrow();
  });
});

describe("FilePicker visual and behavior contract", () => {
  it("keeps the trigger touch target at least 44 units", () => {
    expect(filePickerRecipe.trigger.minHeight).toBeGreaterThanOrEqual(44);
  });

  it("does not expose an open/dismiss axis for the transient platform picker", () => {
    expect(filePickerBehavior.web).not.toHaveProperty("dismiss");
    expect(filePickerBehavior.native).not.toHaveProperty("dismiss");
  });
});
