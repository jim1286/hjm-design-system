import { describe, expect, it, vi } from "vitest";

import {
  carouselBehavior,
  carouselRecipe,
  getCarouselNavigationTarget,
  getPageIndicatorTarget,
  resolvePageIndicator,
  isCarouselAutoplayActive,
  resolveCarouselDescriptor,
  validateCarouselAutoplayConfig,
  validateCarouselDescriptor,
  validateCarouselSlide,
  type CarouselDescriptor,
} from "../src/carousel.js";

const slides: CarouselDescriptor["slides"] = [
  { id: "g1", label: "8/17 두산 vs LG" },
  { id: "g2", label: "8/18 두산 vs LG" },
  { id: "g3", label: "8/19 두산 vs LG" },
];

const descriptor: CarouselDescriptor = { slides, currentKey: "g2" };

const composeAccessibleName = ({
  position,
  total,
  label,
}: {
  position: number;
  total: number;
  label: string;
}) => `${total}개 중 ${position}번째: ${label}`;

describe("Carousel descriptor validation", () => {
  it("accepts a well-formed slide", () => {
    expect(() => validateCarouselSlide({ id: "g1", label: "8/17" })).not.toThrow();
  });

  it("accepts a single-slide descriptor", () => {
    expect(() =>
      validateCarouselDescriptor({ slides: [slides[0]!], currentKey: "g1" }),
    ).not.toThrow();
  });

  it("rejects an empty slide list", () => {
    expect(() =>
      validateCarouselDescriptor({ slides: [], currentKey: "g1" } as never),
    ).toThrow(/at least one/);
  });

  it("rejects duplicate, empty, and padded slide identity", () => {
    expect(() =>
      validateCarouselDescriptor({
        slides: [slides[0]!, slides[0]!],
        currentKey: "g1",
      }),
    ).toThrow(/Duplicate/);
    expect(() => validateCarouselSlide({ id: " ", label: "A" })).toThrow(/id/);
    expect(() => validateCarouselSlide({ id: " a ", label: "A" })).toThrow(
      /whitespace/,
    );
    expect(() => validateCarouselSlide({ id: "a", label: "" })).toThrow(/label/);
  });

  it("rejects a currentKey absent from the slides", () => {
    expect(() =>
      validateCarouselDescriptor({ slides, currentKey: "missing" as never }),
    ).toThrow(/currentKey/);
  });

  it("rejects a non-positive or non-finite autoplay interval", () => {
    expect(() =>
      validateCarouselAutoplayConfig({ intervalMs: 0 }),
    ).toThrow(/intervalMs/);
    expect(() =>
      validateCarouselAutoplayConfig({ intervalMs: -100 }),
    ).toThrow(/intervalMs/);
    expect(() =>
      validateCarouselAutoplayConfig({ intervalMs: Number.NaN }),
    ).toThrow(/finite/);
    expect(() => validateCarouselAutoplayConfig({ intervalMs: 5000 })).not.toThrow();
  });

  it("validates an attached autoplay config as part of the descriptor", () => {
    expect(() =>
      validateCarouselDescriptor({ ...descriptor, autoplay: { intervalMs: 0 } }),
    ).toThrow(/intervalMs/);
  });
});

describe("Carousel position resolution", () => {
  it("marks exactly one slide current and every other slide inert", () => {
    const resolved = resolveCarouselDescriptor(descriptor, { composeAccessibleName });
    expect(resolved.filter((slide) => slide.current)).toHaveLength(1);
    expect(resolved.find((slide) => slide.current)?.id).toBe("g2");
    expect(resolved.filter((slide) => slide.inert)).toHaveLength(2);
    expect(resolved.find((slide) => slide.id === "g2")?.inert).toBe(false);
  });

  it("attaches position and total in slide order", () => {
    const resolved = resolveCarouselDescriptor(descriptor, { composeAccessibleName });
    expect(resolved.map((slide) => slide.position)).toEqual([1, 2, 3]);
    expect(resolved.every((slide) => slide.total === 3)).toBe(true);
  });

  it("composes the accessible name from order and label", () => {
    const composer = vi.fn(composeAccessibleName);
    const resolved = resolveCarouselDescriptor(descriptor, {
      composeAccessibleName: composer,
    });
    expect(composer).toHaveBeenCalledWith({
      position: 2,
      total: 3,
      label: "8/18 두산 vs LG",
    });
    expect(resolved[1]?.accessibleName).toBe("3개 중 2번째: 8/18 두산 vs LG");
  });

  it("rejects a composer that is missing or returns empty copy", () => {
    expect(() =>
      resolveCarouselDescriptor(descriptor, {
        composeAccessibleName: undefined as never,
      }),
    ).toThrow(/composeAccessibleName/);
    expect(() =>
      resolveCarouselDescriptor(descriptor, { composeAccessibleName: () => "  " }),
    ).toThrow(/composeAccessibleName/);
  });
});

describe("Carousel navigation clamps instead of looping", () => {
  it("moves to the adjacent slide for next and previous", () => {
    expect(getCarouselNavigationTarget(descriptor, "next")).toBe("g3");
    expect(getCarouselNavigationTarget(descriptor, "previous")).toBe("g1");
  });

  it("jumps directly to the first and last slide", () => {
    expect(getCarouselNavigationTarget(descriptor, "first")).toBe("g1");
    expect(getCarouselNavigationTarget(descriptor, "last")).toBe("g3");
  });

  it("clamps at the last slide instead of wrapping to the first", () => {
    const atEnd: CarouselDescriptor = { slides, currentKey: "g3" };
    expect(getCarouselNavigationTarget(atEnd, "next")).toBe("g3");
  });

  it("clamps at the first slide instead of wrapping to the last", () => {
    const atStart: CarouselDescriptor = { slides, currentKey: "g1" };
    expect(getCarouselNavigationTarget(atStart, "previous")).toBe("g1");
  });
});

describe("Carousel autoplay guards", () => {
  const autoplay = { intervalMs: 6000 };

  it("is never active without an explicit config", () => {
    expect(
      isCarouselAutoplayActive(undefined, { reducedMotion: false, paused: false }),
    ).toBe(false);
  });

  it("is active only once every guard clears", () => {
    expect(
      isCarouselAutoplayActive(autoplay, { reducedMotion: false, paused: false }),
    ).toBe(true);
  });

  it("never runs under reduced motion, even while otherwise idle", () => {
    expect(
      isCarouselAutoplayActive(autoplay, { reducedMotion: true, paused: false }),
    ).toBe(false);
  });

  it("pauses while hovered, focused, or dragged", () => {
    expect(
      isCarouselAutoplayActive(autoplay, { reducedMotion: false, paused: true }),
    ).toBe(false);
  });

  it("rejects a non-positive interval even when checking activity", () => {
    expect(() =>
      isCarouselAutoplayActive({ intervalMs: 0 }, { reducedMotion: false, paused: false }),
    ).toThrow(/intervalMs/);
  });
});

describe("Carousel visual identity", () => {
  it("has no loop configuration surface anywhere in the contract", () => {
    expect(carouselBehavior.controlled).not.toContain("loop");
    expect(Object.keys(carouselRecipe)).not.toContain("loop");
  });

  it("keeps dot and control hit targets touch-safe", () => {
    expect(carouselRecipe.dot.hitTarget).toBeGreaterThanOrEqual(44);
    expect(carouselRecipe.sizes.medium.controlHitTarget).toBeGreaterThanOrEqual(44);
  });

  it("keeps the previous/next glyphs as logical-direction chevrons, not left/right", () => {
    expect(carouselRecipe.control.icons.previous).toBe("chevronStart");
    expect(carouselRecipe.control.icons.next).toBe("chevronEnd");
  });
});

describe("PageIndicator", () => {
  const name = ({ position, total }: { position: number; total: number }) => `Page ${position} of ${total}`;
  it("resolves one named dot per page with the current one marked", () => {
    expect(resolvePageIndicator({ count: 3, currentIndex: 1 }, name).map((dot) => [dot.accessibleName, dot.current]))
      .toEqual([["Page 1 of 3", false], ["Page 2 of 3", true], ["Page 3 of 3", false]]);
  });
  it("rejects empty counts, out-of-range indices and empty names", () => {
    expect(() => resolvePageIndicator({ count: 0, currentIndex: 0 }, name)).toThrow(RangeError);
    expect(() => resolvePageIndicator({ count: 2, currentIndex: 2 }, name)).toThrow(RangeError);
    expect(() => resolvePageIndicator({ count: 2, currentIndex: 0 }, () => " ")).toThrow(TypeError);
  });
  it("clamps navigation like Carousel", () => {
    expect(getPageIndicatorTarget({ count: 3, currentIndex: 2 }, "next")).toBe(2);
    expect(getPageIndicatorTarget({ count: 3, currentIndex: 0 }, "previous")).toBe(0);
    expect(getPageIndicatorTarget({ count: 3, currentIndex: 0 }, "next")).toBe(1);
  });
});


describe("PageIndicator bounded windows", () => {
  const name = ({ position, total }: { position: number; total: number }) => `Page ${position} of ${total}`;
  it("keeps absolute positions and the current dot at both ends and in the middle", () => {
    for (const [currentIndex, expected] of [[0, [0, 1, 2, 3, 4]], [4, [2, 3, 4, 5, 6]], [8, [4, 5, 6, 7, 8]]] as const) {
      const dots = resolvePageIndicator({ count: 9, currentIndex, maxVisibleDots: 5 }, name);
      expect(dots.map(dot => dot.index)).toEqual(expected);
      expect(dots.filter(dot => dot.current).map(dot => dot.accessibleName)).toEqual([`Page ${currentIndex + 1} of 9`]);
    }
    expect(resolvePageIndicator({ count: 2, currentIndex: 1, maxVisibleDots: 5 }, name)).toHaveLength(2);
    expect(resolvePageIndicator({ count: 9, currentIndex: 8, maxVisibleDots: 1 }, name)[0]?.index).toBe(8);
    expect(getPageIndicatorTarget({ count: 9, currentIndex: 4, maxVisibleDots: 3 }, "last")).toBe(8);
  });
  it("rejects invalid windows rather than silently changing their size", () => {
    for (const maxVisibleDots of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => resolvePageIndicator({ count: 9, currentIndex: 0, maxVisibleDots }, name)).toThrow(/maxVisibleDots/);
    }
  });
});
