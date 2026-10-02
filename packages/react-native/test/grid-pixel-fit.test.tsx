import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { PixelRatio, View } from "react-native";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Grid, HjmNativeProvider, Text } from "../src/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function flattenStyle(style: unknown): Record<string, unknown> {
  if (!Array.isArray(style)) return (style ?? {}) as Record<string, unknown>;
  return Object.assign({}, ...style.map(flattenStyle));
}

afterEach(() => vi.restoreAllMocks());

describe("Native Grid device-pixel fit", () => {
  it("keeps every column on one row when exact widths round past the row", () => {
    // Regression from Utilverse 2026-10-02: a 411dp row on a 420dpi (2.625x) Android
    // wrapped the 4th column because fractional widths plus gaps exceeded the row.
    vi.spyOn(PixelRatio, "get").mockReturnValue(2.625);
    const availableWidth = 411.4285714285714;
    let renderer: ReactTestRenderer | undefined;
    act(() => {
      renderer = create(
        <HjmNativeProvider reducedMotion theme="light">
          <Grid availableWidth={availableWidth} columns={{ compact: 4 }} gap={{ compact: "xs" }}>
            <Text>a</Text><Text>b</Text><Text>c</Text><Text>d</Text>
          </Grid>
        </HjmNativeProvider>,
      );
    });
    const grid = renderer!.root.findAll((node) => node.type === View && flattenStyle(node.props.style).flexWrap === "wrap")[0]!;
    const gap = Number(flattenStyle(grid.props.style).columnGap);
    const widths = grid.findAll((node) => node.type === View && typeof flattenStyle(node.props.style).width === "number")
      .map((cell) => Number(flattenStyle(cell.props.style).width));
    expect(widths).toHaveLength(4);
    const used = widths.reduce((sum, width) => sum + width, 0) + gap * (widths.length - 1);
    expect(used).toBeLessThanOrEqual(availableWidth);
    for (const width of widths) expect(Number.isInteger(Math.round(width * 2.625 * 1e6) / 1e6)).toBe(true);
  });
});
