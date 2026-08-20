import { describe, expect, it } from "vitest";
import { componentCatalog } from "../src/index.js";
import {
  imageDefaults,
  imageRecipe,
  nativeResizeModes,
  resolveImageAspectRatio,
  resolveImageDescriptor,
  resolveImageFallbackAccessibilityLabel,
  validateImageDescriptor,
  type ImageDescriptor,
} from "../src/image.js";

const decorative: ImageDescriptor = {
  src: "https://cdn.example.com/kbo/player-42.jpg",
  width: 400,
  height: 300,
};

const informative: ImageDescriptor = {
  src: "https://cdn.example.com/kbo/grade-chart.png",
  width: 800,
  height: 450,
  decorative: false,
  accessibilityLabel: "2026시즌 FA 등급별 보상 규정 표",
};

describe("Image descriptor", () => {
  it("accepts a decorative image and an informative image with alt copy", () => {
    expect(() => validateImageDescriptor(decorative)).not.toThrow();
    expect(() => validateImageDescriptor(informative)).not.toThrow();
  });

  it("rejects empty src and non-positive intrinsic dimensions", () => {
    expect(() => validateImageDescriptor({ ...decorative, src: " " })).toThrow(
      /src/,
    );
    expect(() => validateImageDescriptor({ ...decorative, width: 0 })).toThrow(
      /width/,
    );
    expect(() =>
      validateImageDescriptor({ ...decorative, height: Number.NaN }),
    ).toThrow(/height/);
  });

  it("rejects an unsupported fit", () => {
    expect(() =>
      validateImageDescriptor({ ...decorative, fit: "stretch" as never }),
    ).toThrow(/fit/);
  });

  it("mirrors Icon's decorative/informative split exactly", () => {
    expect(() =>
      validateImageDescriptor({
        ...decorative,
        decorative: false,
        accessibilityLabel: " ",
      } as never),
    ).toThrow(/accessibilityLabel/);
    expect(() =>
      validateImageDescriptor({
        ...informative,
        decorative: true,
      } as never),
    ).toThrow(/must not provide accessibilityLabel/);
  });

  it("resolves the normative cover fit default", () => {
    expect(resolveImageDescriptor(decorative)).toMatchObject({
      fit: "cover",
      decorative: true,
    });
    expect(imageDefaults.fit).toBe("cover");
  });
});

describe("Image layout and error fallback", () => {
  it("derives an aspect ratio from intrinsic dimensions", () => {
    expect(resolveImageAspectRatio(800, 400)).toBe(2);
  });

  it("rejects non-positive dimensions when deriving aspect ratio", () => {
    expect(() => resolveImageAspectRatio(0, 400)).toThrow(/width/);
    expect(() => resolveImageAspectRatio(800, -1)).toThrow(/height/);
  });

  it("keeps an informative image's accessible name on the error fallback", () => {
    const resolved = resolveImageDescriptor(informative);
    expect(resolveImageFallbackAccessibilityLabel(resolved)).toBe(
      informative.accessibilityLabel,
    );
  });

  it("never invents a generic 'broken image' name for a decorative picture", () => {
    const resolved = resolveImageDescriptor(decorative);
    expect(resolveImageFallbackAccessibilityLabel(resolved)).toBeUndefined();
  });

  it("translates the neutral 'fill' fit to RN's 'stretch' resizeMode", () => {
    expect(nativeResizeModes.fill).toBe("stretch");
    expect(nativeResizeModes.cover).toBe("cover");
    expect(nativeResizeModes.contain).toBe("contain");
  });
});

describe("Image visual identity", () => {
  it("never opens an interactive preview surface", () => {
    expect(imageRecipe.slots).toEqual([
      "root",
      "image",
      "placeholder",
      "fallbackIcon",
    ]);
    expect(imageRecipe).not.toHaveProperty("states");
    expect(imageRecipe).not.toHaveProperty("focus");
  });

  it("links the product-validated beta contract to the catalog entry", () => {
    expect(componentCatalog.find((entry) => entry.name === "Image")).toMatchObject({
      category: "data-display",
      platform: "shared",
      status: "beta",
    });
  });
});
