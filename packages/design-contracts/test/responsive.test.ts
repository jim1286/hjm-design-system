import { describe, expect, it } from "vitest";
import { breakpoint } from "../src/foundations.js";
import {
  resolveResponsiveValue,
  resolveWindowClass,
  validateResponsiveValue,
  windowClassOrder,
  type ResponsiveValue,
} from "../src/responsive.js";

describe("shared window classes", () => {
  it("uses every foundation breakpoint as an inclusive lower bound", () => {
    expect(resolveWindowClass(0)).toBe("compact");
    expect(resolveWindowClass(breakpoint.medium - 0.1)).toBe("compact");
    expect(resolveWindowClass(breakpoint.medium)).toBe("medium");
    expect(resolveWindowClass(breakpoint.expanded - 0.1)).toBe("medium");
    expect(resolveWindowClass(breakpoint.expanded)).toBe("expanded");
    expect(resolveWindowClass(breakpoint.wide - 0.1)).toBe("expanded");
    expect(resolveWindowClass(breakpoint.wide)).toBe("wide");
    expect(resolveWindowClass(10_000)).toBe("wide");
  });

  it("keeps the resolver order synchronized with the foundation scale", () => {
    expect(windowClassOrder).toEqual(Object.keys(breakpoint));
    expect(windowClassOrder.map((windowClass) => breakpoint[windowClass])).toEqual([
      0,
      600,
      960,
      1280,
    ]);
  });

  it("rejects a negative, non-number, or non-finite window width", () => {
    expect(() => resolveWindowClass(-1)).toThrow(/negative/);
    expect(() => resolveWindowClass(Number.NaN)).toThrow(/finite/);
    expect(() => resolveWindowClass(Number.POSITIVE_INFINITY)).toThrow(/finite/);
    expect(() => resolveWindowClass("600" as never)).toThrow(/finite/);
  });
});

describe("ResponsiveValue fallback", () => {
  const columns = {
    compact: 1,
    expanded: 3,
  } as const satisfies ResponsiveValue<number>;

  it("uses an exact override and otherwise inherits from the nearest narrower class", () => {
    expect(resolveResponsiveValue(columns, "compact")).toBe(1);
    expect(resolveResponsiveValue(columns, "medium")).toBe(1);
    expect(resolveResponsiveValue(columns, "expanded")).toBe(3);
    expect(resolveResponsiveValue(columns, "wide")).toBe(3);
  });

  it("requires compact so every supported class resolves to a value", () => {
    expect(() => validateResponsiveValue({ medium: 2 } as never)).toThrow(
      /compact baseline/,
    );
    expect(() => validateResponsiveValue(null as never)).toThrow(/must be an object/);
    expect(() => validateResponsiveValue([] as never)).toThrow(/must be an object/);
  });

  it("rejects misspelled classes rather than silently ignoring them", () => {
    expect(() =>
      validateResponsiveValue({ compact: 1, expended: 3 } as never),
    ).toThrow(/expended/);
    expect(() => resolveResponsiveValue(columns, "tablet" as never)).toThrow(
      /Unsupported window class/,
    );
  });

  it("keeps object payloads unambiguous and preserves their identity", () => {
    const compact = { columns: 1, label: "single" } as const;
    const expanded = { columns: 3, label: "multi" } as const;
    const value: ResponsiveValue<typeof compact | typeof expanded> = {
      compact,
      expanded,
    };

    expect(resolveResponsiveValue(value, "medium")).toBe(compact);
    expect(resolveResponsiveValue(value, "wide")).toBe(expanded);
  });
});
