import { describe, expect, it } from "vitest";

import {
  ACCENTS,
  THEMES,
  accentFill,
  behaviorRegistry,
  componentCatalog,
  layer,
  resolveColorReference,
  resolveTooltipDescriptor,
  tooltipBehaviorDefaults,
  tooltipDescriptorDefaults,
  tooltipRecipe,
  validateTooltipDescriptor,
  validateTooltipOpenState,
  type TooltipDescriptor,
  type TooltipOpenState,
} from "../src/index.js";

function luminance(hex: string): number {
  const channels = [1, 3, 5]
    .map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return (
    0.2126 * (channels[0] ?? 0) +
    0.7152 * (channels[1] ?? 0) +
    0.0722 * (channels[2] ?? 0)
  );
}

function contrast(foreground: string, background: string): number {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

describe("Tooltip semantic contract", () => {
  it("accepts only non-empty plain copy and supported logical placement", () => {
    expect(resolveTooltipDescriptor({ content: "Notifications" })).toEqual({
      content: "Notifications",
      placement: "top",
      align: "center",
    });
    expect(
      resolveTooltipDescriptor({
        content: "Rename",
        placement: "start",
        align: "end",
      }),
    ).toEqual({ content: "Rename", placement: "start", align: "end" });
    expect(() => validateTooltipDescriptor(null as never)).toThrow(/object/);
    expect(() => validateTooltipDescriptor({ content: " " })).toThrow(/content/);
    expect(() => validateTooltipDescriptor({ content: " padded " })).toThrow(
      /whitespace/,
    );
    expect(() =>
      validateTooltipDescriptor({ content: "Copy", onClick() {} } as never),
    ).toThrow(/descriptor field: onClick/);
    expect(() =>
      validateTooltipDescriptor({ content: "Copy", placement: "left" as never }),
    ).toThrow(/placement/);
    expect(() =>
      validateTooltipDescriptor({ content: "Copy", align: "wide" as never }),
    ).toThrow(/align/);
  });

  it("keeps controlled and uncontrolled open state mutually exclusive", () => {
    const controlled: TooltipOpenState = {
      open: false,
      onOpenChange: () => undefined,
    };
    const uncontrolled: TooltipOpenState = {
      defaultOpen: true,
      onOpenChange: () => undefined,
    };
    expect(() => validateTooltipOpenState(controlled)).not.toThrow();
    expect(() => validateTooltipOpenState(uncontrolled)).not.toThrow();
    expect(() =>
      validateTooltipOpenState({ open: true } as never),
    ).toThrow(/onOpenChange/);
    expect(() =>
      validateTooltipOpenState({ open: undefined } as never),
    ).toThrow(/open must be a boolean/);
    expect(() =>
      validateTooltipOpenState({
        open: false,
        defaultOpen: undefined,
        onOpenChange() {},
      } as never),
    ).toThrow(/must not provide defaultOpen/);
    expect(() =>
      validateTooltipOpenState({ defaultOpen: false, interactive: true } as never),
    ).toThrow(/open state field: interactive/);
    expect(() =>
      validateTooltipOpenState({
        open: true,
        defaultOpen: true,
        onOpenChange: () => undefined,
      } as never),
    ).toThrow(/defaultOpen/);

    const valid: TooltipDescriptor = { content: "More information" };
    // @ts-expect-error Tooltip content is plain copy, never arbitrary UI.
    const interactiveContent: TooltipDescriptor = { content: { type: "button" } };
    // @ts-expect-error Controlled state must provide its change callback.
    const missingControlledCallback: TooltipOpenState = { open: true };
    expect([valid, interactiveContent, missingControlledCallback]).toHaveLength(3);
  });
});

describe("Tooltip visual and behavior contracts", () => {
  it("separates behavior timing from the visual recipe", () => {
    expect(tooltipDescriptorDefaults).toEqual({
      placement: "top",
      align: "center",
    });
    expect(tooltipBehaviorDefaults).toEqual({
      pointerOpenDelayMs: 500,
      focusOpenDelayMs: 0,
      skipDelayMs: 300,
      hoverable: true,
      touchHover: false,
      oneVisiblePerProvider: true,
    });
    expect(tooltipRecipe.defaults).toBe(tooltipDescriptorDefaults);
    expect(tooltipRecipe).not.toHaveProperty("delay");
  });

  it("defines collision, arrow, layering, and reduced-motion inputs", () => {
    expect(tooltipRecipe.layer).toBe(layer.tooltip);
    expect(layer.tooltip).toBeGreaterThan(layer.modal);
    expect(layer.tooltip).toBeLessThan(layer.toast);
    expect(tooltipRecipe.arrow).toMatchObject({ width: 10, height: 5 });
    expect(tooltipRecipe.positioning).toEqual({
      sideOffset: 4,
      collisionPadding: 12,
    });
    expect(tooltipRecipe.transition.enter.reducedMotion).toBeDefined();
    expect(tooltipRecipe.transition.exit.reducedMotion).toBeDefined();
  });

  it("keeps tooltip copy readable in light and dark", () => {
    for (const themeName of ["light", "dark"] as const) {
      const palette = {
        theme: THEMES[themeName],
        statusAccents: ACCENTS[themeName],
        statusAccentFills: accentFill,
      };
      const surface = resolveColorReference(
        tooltipRecipe.surface.background,
        palette,
      );
      const content = resolveColorReference(tooltipRecipe.content.color, palette);
      expect(contrast(content, surface)).toBeGreaterThanOrEqual(4.5);
      expect(
        resolveColorReference(tooltipRecipe.arrow.color, palette),
      ).toBe(surface);
    }
  });

  it("promotes the Web-only catalog after the BurnTok product slice lands", () => {
    expect(componentCatalog.find((entry) => entry.name === "Tooltip")).toEqual({
      name: "Tooltip",
      category: "overlay",
      platform: "web",
      status: "beta",
      surfaceStatus: { web: "beta", native: "unsupported" },
      recipe: "tooltipRecipe",
      behavior: "tooltip",
    });
    expect(behaviorRegistry.tooltip.defaults).toBe(tooltipBehaviorDefaults);
    expect(behaviorRegistry.tooltip.native).toEqual({
      roles: [],
      states: [],
      actions: [],
    });
    expect(behaviorRegistry.tooltip.scenarios).toEqual(
      expect.arrayContaining([
        "trigger-content-hover-and-pointer-corridor-keep-open",
        "escape-dismisses-and-suppresses-reopen-until-input-reset",
        "existing-aria-describedby-is-preserved",
        "one-tooltip-is-visible-per-provider",
        "touch-pointer-hover-is-ignored",
      ]),
    );
  });
});
