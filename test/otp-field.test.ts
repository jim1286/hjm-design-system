import { describe, expect, it } from "vitest";

import {
  getOtpFieldSlotValues,
  otpFieldBehavior,
  otpFieldRecipe,
  resolveOtpFieldDescriptor,
  resolveOtpFieldValue,
  validateOtpFieldDescriptor,
} from "../src/otp-field.js";

describe("OtpField descriptor validation", () => {
  it("accepts an empty, partial, and full value", () => {
    expect(() => validateOtpFieldDescriptor({ length: 6, value: "" })).not.toThrow();
    expect(() => validateOtpFieldDescriptor({ length: 6, value: "12" })).not.toThrow();
    expect(() => validateOtpFieldDescriptor({ length: 6, value: "123456" })).not.toThrow();
  });

  it("rejects fewer than two slots", () => {
    expect(() => validateOtpFieldDescriptor({ length: 1, value: "" })).toThrow(
      /at least two/,
    );
    expect(() => validateOtpFieldDescriptor({ length: 0, value: "" })).toThrow(
      /at least two/,
    );
  });

  it("rejects a non-integer length", () => {
    expect(() => validateOtpFieldDescriptor({ length: 4.5, value: "" })).toThrow(
      /integer/,
    );
  });

  it("rejects a value containing non-digit characters", () => {
    expect(() => validateOtpFieldDescriptor({ length: 6, value: "12a4" })).toThrow(
      /digits only/,
    );
  });

  it("rejects a committed value longer than length as malformed state", () => {
    expect(() => validateOtpFieldDescriptor({ length: 4, value: "12345" })).toThrow(
      /longer than length/,
    );
  });
});

describe("getOtpFieldSlotValues / resolveOtpFieldDescriptor", () => {
  it("fills slots densely from the start and leaves the rest empty", () => {
    expect(getOtpFieldSlotValues({ length: 6, value: "123" })).toEqual([
      "1",
      "2",
      "3",
      "",
      "",
      "",
    ]);
  });

  it("reports every slot empty for an empty value", () => {
    expect(getOtpFieldSlotValues({ length: 4, value: "" })).toEqual(["", "", "", ""]);
  });

  it("marks complete only when value length equals the slot count", () => {
    expect(resolveOtpFieldDescriptor({ length: 4, value: "123" }).complete).toBe(false);
    expect(resolveOtpFieldDescriptor({ length: 4, value: "1234" }).complete).toBe(true);
  });
});

describe("resolveOtpFieldValue — the one edit-path function", () => {
  const length = 6;

  it("passes through a well-formed digit string unchanged", () => {
    expect(resolveOtpFieldValue(length, "123456")).toBe("123456");
  });

  it("strips non-digit characters instead of rejecting the input", () => {
    expect(resolveOtpFieldValue(length, "12-34 56")).toBe("123456");
    expect(resolveOtpFieldValue(length, "abc123def456")).toBe("123456");
  });

  it("truncates overflow instead of throwing", () => {
    expect(resolveOtpFieldValue(length, "1234567890")).toBe("123456");
  });

  it("handles a paste landing in the middle of the existing text", () => {
    // Native text editing already merged "12" + pasted "99" + "34" into one
    // raw string before this function ever sees it — this is what a
    // paste-into-the-middle-of-the-value boundary case looks like once it
    // reaches HJM: an arbitrary already-assembled string to sanitize and clamp.
    expect(resolveOtpFieldValue(length, "129934")).toBe("129934");
    expect(resolveOtpFieldValue(4, "129934")).toBe("1299");
  });

  it("treats a fully non-digit paste as clearing to empty", () => {
    expect(resolveOtpFieldValue(length, "abcdef")).toBe("");
  });

  it("rejects an invalid length rather than silently clamping to it", () => {
    expect(() => resolveOtpFieldValue(1, "123")).toThrow(/at least two/);
    expect(() => resolveOtpFieldValue(4.5, "123")).toThrow(/integer/);
  });
});

describe("OtpField visual and behavior identity", () => {
  it("has exactly one controlled value axis, no per-slot controlled state", () => {
    expect(otpFieldBehavior.controlled).toEqual(["value", "defaultValue", "onValueChange"]);
  });

  it("has one web role for the whole field, not one per slot", () => {
    expect(otpFieldBehavior.web.roles).toEqual(["textbox"]);
  });

  it("announces the field as one accessible unit per its own scenario list", () => {
    expect(otpFieldBehavior.scenarios).toContain(
      "one-accessible-name-and-value-for-the-whole-field-never-per-slot-announcement",
    );
  });

  it("reuses Field's border tokens for each decorative slot box", () => {
    expect(otpFieldRecipe.slot.radius).toBe("md");
  });
});
