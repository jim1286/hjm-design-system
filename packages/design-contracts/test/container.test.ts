import { describe, expect, it } from "vitest";

import {
  containerRecipe,
  resolveContainerDescriptor,
  validateContainerDescriptor,
} from "../src/container.js";

describe("Container contract", () => {
  it("resolves the shared content width and logical gutter defaults", () => {
    expect(resolveContainerDescriptor()).toEqual({
      size: "content",
      gutter: "regular",
      maxWidth: containerRecipe.maxWidths.content,
      paddingInline: containerRecipe.gutters.regular,
    });
  });

  it("supports reading and fluid regions without arbitrary widths", () => {
    expect(resolveContainerDescriptor({ size: "reading", gutter: "compact" })).toMatchObject({
      maxWidth: 720,
      paddingInline: 16,
    });
    expect(resolveContainerDescriptor({ size: "full", gutter: "none" })).toMatchObject({
      maxWidth: null,
      paddingInline: 0,
    });
  });

  it("rejects unsupported public axes", () => {
    expect(() => validateContainerDescriptor({ size: "desktop" as "content" })).toThrow(
      /Unsupported Container size/,
    );
    expect(() => validateContainerDescriptor({ gutter: "huge" as "regular" })).toThrow(
      /Unsupported Container gutter/,
    );
  });
});
