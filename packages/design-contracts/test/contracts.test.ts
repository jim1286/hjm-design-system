import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, expectTypeOf, it } from "vitest";
import type { ComponentCatalogEntry } from "../src/catalog.js";
import * as designSystem from "../src/index.js";
import {
  ACCENTS,
  THEMES,
  accordionRecipe,
  accentColor,
  accentFill,
  accentTint,
  backdrop,
  alertDialogBehaviorDefaults,
  alertDialogRecipe,
  badgeRecipe,
  behaviorRegistry,
  breakpoint,
  brandGradient,
  buttonRecipe,
  chipRecipe,
  comboboxBehaviorDefaults,
  comboboxRecipe,
  componentCatalog,
  canDismissAlertDialog,
  canDismissSheet,
  collectionValidationDefaults,
  control,
  counterBadgeRecipe,
  createAlertDialogSession,
  createSheetLifecycle,
  dialogRecipe,
  easing,
  fieldRecipe,
  fontFamily,
  fontWeight,
  type FontWeightValue,
  flattenCollectionItems,
  getCollectionNavigationIntent,
  getCollectionNavigationTarget,
  getCollectionTypeaheadMatch,
  formatCounterBadgeCount,
  getCheckboxNextState,
  getAlertDialogInitialFocus,
  getRadioNavigationTarget,
  getSelectionNavigationIntent,
  getTabNavigationIntent,
  getTabNavigationTarget,
  fieldFrameContract,
  floatingSurfaceContract,
  focusIndicatorContract,
  iconButtonRecipe,
  heading,
  isComboboxResultCurrent,
  isThemePreference,
  layer,
  layout,
  letterSpacing,
  listRowRecipe,
  loadMoreRecipe,
  menuRecipe,
  motionPreset,
  numeric,
  noticeRecipe,
  onAccentFill,
  onBrandGradient,
  opacity,
  overlay,
  progressRecipe,
  radius,
  recipeRegistry,
  resolveColorReference,
  resolveControlAccessibleName,
  resolveComboboxSelectedItem,
  resolveCollectionItem,
  resolveSelectSelectedItem,
  reconcileCheckboxSelection,
  reconcileRadioSelection,
  reconcileSelectSelection,
  radioGroupBehaviorDefaults,
  resolveInitialRadioValue,
  resolveRadioTabStop,
  resolveInitialTabValue,
  searchFieldRecipe,
  selectBehaviorDefaults,
  selectRecipe,
  scrim,
  semanticColors,
  segmentedControlRecipe,
  selectionControlRecipe,
  selectionGroupBehaviorDefaults,
  selectionGroupRecipe,
  sheetBehaviorDefaults,
  sheetRecipe,
  spacing,
  solidAccentColor,
  spring,
  stateLayer,
  stroke,
  surfaceRecipe,
  switchRecipe,
  tabsRecipe,
  themeColor,
  toastRecipe,
  tooltipRecipe,
  typography,
  withAlpha,
  toggleCheckboxSelection,
  validateCheckboxSelection,
  validateCollection,
  validateRadioSelection,
  validateSelectionItems,
  validateAlertDialogRequest,
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

function composite(foreground: string, background: string, alpha: number): string {
  const channels = (hex: string) =>
    [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
  const fg = channels(foreground);
  const bg = channels(background);
  return `#${fg
    .map((value, index) =>
      Math.round(value * alpha + (bg[index] ?? 0) * (1 - alpha))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

type FontWeightField = "fontWeight" | "selectedFontWeight" | "checkedFontWeight";
type RecipeFontWeightViolation<Value> = Value extends readonly unknown[]
  ? RecipeFontWeightViolation<Value[number]>
  : Value extends object
    ? {
        [Key in keyof Value]-?: Key extends FontWeightField
          ? Exclude<Value[Key], undefined> extends FontWeightValue
            ? never
            : Key
          : RecipeFontWeightViolation<NonNullable<Value[Key]>>;
      }[keyof Value]
    : never;

describe("platform-neutral public contract", () => {
  it("keeps platform imports out of runtime source", () => {
    const sourceDirectory = fileURLToPath(new URL("../src/", import.meta.url));
    const files = readdirSync(sourceDirectory).filter((file) => file.endsWith(".ts"));
    for (const file of files) {
      const path = fileURLToPath(new URL(`../src/${file}`, import.meta.url));
      const source = readFileSync(path, "utf8");
      expect(source).not.toMatch(
        /from\s+["'](?:react|react-native|react-dom|expo|next(?:\/|["']))/,
      );
    }
  });

  it("does not expose application storage or domain names", () => {
    expect(designSystem).not.toHaveProperty("THEME_STORAGE_KEY");
    const publicNamesAndValues = `${Object.keys(designSystem).join("|")}|${JSON.stringify(
      designSystem,
    )}`.toLowerCase();
    expect(publicNamesAndValues).not.toMatch(
      /burntok|yajalal|samsung|hanwha|player_movement/,
    );
    expect(Object.keys(ACCENTS.light)).toEqual([
      "info",
      "success",
      "warning",
      "attention",
    ]);
  });

  it("keeps recipe font weights on the shared foundation scale", () => {
    const sourceDirectory = fileURLToPath(new URL("../src/", import.meta.url));
    const files = readdirSync(sourceDirectory).filter(
      (file) => file.endsWith(".ts") && file !== "foundations.ts",
    );
    for (const file of files) {
      const path = fileURLToPath(new URL(`../src/${file}`, import.meta.url));
      const source = readFileSync(path, "utf8");
      expect(source).not.toMatch(
        /(?:fontWeight|selectedFontWeight|checkedFontWeight):\s*["'](?:400|500|600|700|800)["']/,
      );
      expect(source).not.toMatch(
        /(?:fontWeight|selectedFontWeight|checkedFontWeight)\??:\s*string/,
      );
      expect(source).not.toMatch(/emphasis:\s*Record<[^;]+,\s*string>/);
    }
  });

  it("validates theme preferences without owning persistence", () => {
    expect(isThemePreference("system")).toBe(true);
    expect(isThemePreference("dark")).toBe(true);
    expect(isThemePreference("sepia")).toBe(false);
  });
});

describe("color and accessibility contracts", () => {
  it("keeps light and dark semantic color keys in sync", () => {
    expect(Object.keys(THEMES.light)).toEqual(Object.keys(THEMES.dark));
  });

  it("keeps action label contrast at WCAG AA", () => {
    for (const theme of Object.values(THEMES)) {
      expect(contrast(theme.onPrimary, theme.primary)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(theme.onDanger, theme.dangerFill)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps body text readable on every surface", () => {
    for (const theme of Object.values(THEMES)) {
      for (const foreground of ["text", "textBody", "textMuted"] as const) {
        for (const background of ["bg", "surface", "surfaceAlt"] as const) {
          expect(contrast(theme[foreground], theme[background])).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("keeps the text ramp ordered from strong to weak", () => {
    for (const theme of Object.values(THEMES)) {
      const ramp = ["text", "textBody", "textMuted", "textSub", "textWeak"] as const;
      const ratios = ramp.map((key) => contrast(theme[key], theme.bg));
      expect(ratios).toEqual([...ratios].sort((a, b) => b - a));
    }
  });

  it("keeps generic accent labels readable on tinted badges", () => {
    for (const themeName of ["light", "dark"] as const) {
      for (const tone of Object.values(ACCENTS[themeName])) {
        for (const surface of ["bg", "surface"] as const) {
          const background = THEMES[themeName][surface];
          expect(contrast(tone, background)).toBeGreaterThanOrEqual(4.5);
          expect(
            contrast(tone, composite(tone, background, accentTint.base)),
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("keeps solid accent labels readable", () => {
    expect(Object.keys(accentFill)).toEqual(Object.keys(ACCENTS.light));
    for (const fill of Object.values(accentFill)) {
      expect(contrast(onAccentFill, fill)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps semantic feedback text readable on tinted feedback surfaces", () => {
    for (const themeName of ["light", "dark"] as const) {
      const theme = THEMES[themeName];
      for (const accent of Object.values(ACCENTS[themeName])) {
        expect(contrast(accent, composite(accent, theme.bg, 0.1))).toBeGreaterThanOrEqual(
          4.5,
        );
      }
      expect(
        contrast(theme.danger, composite(theme.danger, theme.bg, 0.1)),
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps compact badge labels readable over every possible parent surface", () => {
    for (const themeName of ["light", "dark"] as const) {
      const theme = THEMES[themeName];
      for (const surface of ["bg", "surface", "surfaceAlt"] as const) {
        const parent = theme[surface];
        for (const tone of ["info", "success", "warning", "attention"] as const) {
          const foreground = ACCENTS[themeName][tone];
          expect(contrast(foreground, composite(foreground, parent, 0.1))).toBeGreaterThanOrEqual(
            4.5,
          );
        }
        expect(
          contrast(theme.danger, composite(theme.danger, parent, 0.1)),
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("pins the cross-platform brand gradient", () => {
    for (const stop of [brandGradient.from, brandGradient.to]) {
      expect(stop).toMatch(/^#[0-9a-f]{6}$/);
    }
    expect(contrast(onBrandGradient, brandGradient.to)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(onBrandGradient, brandGradient.from)).toBeGreaterThanOrEqual(4.5);
  });

  it("applies alpha only to valid inputs", () => {
    expect(withAlpha("#0369a1", 0.3)).toBe("rgba(3, 105, 161, 0.3)");
    expect(() => withAlpha("blue", 1)).toThrow(TypeError);
    expect(() => withAlpha("#0369a1", Number.NaN)).toThrow(RangeError);
    expect(() => withAlpha("#0369a1", 1.1)).toThrow(RangeError);
  });
});

describe("foundation and recipe contracts", () => {
  it("uses monotonic spacing, radius, and typography scales", () => {
    expect(Object.values(spacing)).toEqual(
      [...Object.values(spacing)].sort((a, b) => a - b),
    );
    expect(Object.values(radius)).toEqual(
      [...Object.values(radius)].sort((a, b) => a - b),
    );
    const sizes = Object.values(typography).map((value) => value.fontSize);
    expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
    for (const variant of Object.values(typography)) {
      expect(variant.lineHeight).toBeGreaterThan(variant.fontSize);
    }
  });

  it("publishes additive family, weight, tracking, numeric, and heading tokens", () => {
    expect(fontFamily.ui).toContain("Pretendard");
    expect(fontFamily.code.at(-1)).toBe("monospace");
    expect(fontWeight).toEqual({
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      heavy: "800",
    });
    expectTypeOf<FontWeightValue>().toEqualTypeOf<
      "400" | "500" | "600" | "700" | "800"
    >();
    expectTypeOf(fontWeight.bold).toMatchTypeOf<FontWeightValue>();
    expectTypeOf<"650">().not.toMatchTypeOf<FontWeightValue>();
    expectTypeOf<
      RecipeFontWeightViolation<typeof recipeRegistry>
    >().toEqualTypeOf<never>();
    expect(Object.values(letterSpacing)).toEqual(
      [...Object.values(letterSpacing)].sort((a, b) => a - b),
    );
    expect(numeric).toEqual({
      proportional: "proportional-nums",
      tabular: "tabular-nums",
    });
    expect(heading.level3).toBe(typography.heading);
    expect(heading.level4).toBe(typography.titleLarge);
    expect(heading.level5).toBe(typography.title);
    expect(heading.level1.fontSize).toBeGreaterThan(heading.level2.fontSize);
    expect(heading.level2.fontSize).toBeGreaterThan(heading.level3.fontSize);
  });

  it("keeps every interactive control at least 44 units tall", () => {
    expect(control.minTouchTarget).toBeGreaterThanOrEqual(44);
    for (const size of Object.keys(control.buttonHeight) as Array<
      keyof typeof control.buttonHeight
    >) {
      expect(control.buttonHeight[size] + control.buttonHitSlop[size] * 2).toBeGreaterThanOrEqual(
        control.minTouchTarget,
      );
    }
    expect(fieldRecipe.minHeight).toBeGreaterThanOrEqual(control.minTouchTarget);
  });

  it("defines the complete button API", () => {
    expect(Object.keys(buttonRecipe.tones)).toEqual([
      "primary",
      "secondary",
      "ghost",
      "danger",
      "link",
    ]);
    expect(Object.keys(buttonRecipe.sizes)).toEqual(["small", "medium", "large"]);
    for (const size of Object.values(buttonRecipe.sizes)) {
      expect(typography).toHaveProperty(size.textVariant);
    }
  });

  it("points every recipe color key at a semantic color", () => {
    const isColor = (key: string | null) => key === null || key in THEMES.light;
    for (const tone of Object.values(buttonRecipe.tones)) {
      expect(isColor(tone.background)).toBe(true);
      expect(isColor(tone.content)).toBe(true);
      expect(isColor(tone.border)).toBe(true);
    }
    for (const tone of Object.values(surfaceRecipe)) {
      expect(isColor(tone.background)).toBe(true);
      expect(isColor(tone.border)).toBe(true);
      expect(tone.borderAlpha).toBeGreaterThan(0);
      expect(tone.borderAlpha).toBeLessThanOrEqual(1);
    }
    for (const state of Object.values(fieldRecipe.states)) {
      expect(isColor(state.border)).toBe(true);
    }
  });

  it("uses one strong modal scrim contract", () => {
    const alpha = Number(/rgba\([^)]*,\s*([\d.]+)\)$/.exec(scrim)?.[1]);
    expect(alpha).toBe(overlay.scrim);
    expect(alpha).toBeGreaterThanOrEqual(0.5);
    expect(overlay.veil).toBeLessThan(overlay.scrim);
  });
});

describe("expanded cross-platform component contracts", () => {
  it("defines deterministic checkbox and radio selection helpers", () => {
    const items = [
      { id: "a", label: "Alpha" },
      { id: "b", label: "Beta", disabled: true },
      { id: "c", label: "Gamma" },
    ] as const;

    expect(() =>
      validateSelectionItems([
        { id: "a", label: "Alpha" },
        { id: "a", label: "Again" },
      ]),
    ).toThrow(TypeError);
    expect(() => validateSelectionItems([{ id: "", label: "Alpha" }])).toThrow(
      TypeError,
    );
    expect(() => validateSelectionItems([{ id: "a", label: "   " }])).toThrow(
      TypeError,
    );
    expect(() =>
      validateSelectionItems([{ id: "a", label: "Alpha", description: "" }]),
    ).toThrow(TypeError);
    expect(resolveControlAccessibleName("Theme", undefined, "RadioGroup")).toBe(
      "Theme",
    );
    expect(
      resolveControlAccessibleName("Theme", "Theme choice", "RadioGroup"),
    ).toBe("Theme choice");
    expect(() =>
      resolveControlAccessibleName("", undefined, "RadioGroup"),
    ).toThrow(TypeError);
    expect(() =>
      resolveControlAccessibleName(undefined, "   ", "Select"),
    ).toThrow(TypeError);
    expect(() =>
      resolveControlAccessibleName(undefined, undefined, "Combobox"),
    ).toThrow(TypeError);
    expect(getCheckboxNextState("mixed")).toBe(true);
    expect(getCheckboxNextState("mixed", "uncheck")).toBe(false);

    const selected = new Set(["a"] as const);
    const added = toggleCheckboxSelection(items, selected, "c");
    expect([...selected]).toEqual(["a"]);
    expect([...added]).toEqual(["a", "c"]);
    expect(toggleCheckboxSelection(items, added, "b")).not.toBe(added);
    expect([...toggleCheckboxSelection(items, added, "b")]).toEqual(["a", "c"]);
    expect(() => toggleCheckboxSelection(items, new Set(["unknown"]), "a")).toThrow(
      RangeError,
    );
    expect(() => validateCheckboxSelection(items, new Set(["unknown"]))).toThrow(
      RangeError,
    );
    expect([...reconcileCheckboxSelection(items, new Set(["a", "unknown"]))]).toEqual([
      "a",
    ]);
    const alreadyValid = new Set(["a"] as const);
    expect(reconcileCheckboxSelection(items, alreadyValid)).toBe(alreadyValid);

    expect(resolveInitialRadioValue(items, null, false)).toBeNull();
    expect(resolveInitialRadioValue(items, null, true)).toBe("a");
    expect(resolveInitialRadioValue(items, "b", true)).toBe("b");
    expect(validateRadioSelection(items, null)).toBeUndefined();
    expect(() => validateRadioSelection(items, "unknown")).toThrow(RangeError);
    expect(resolveRadioTabStop(items, "b")).toBe("a");
    expect(resolveRadioTabStop(items, "c")).toBe("c");
    expect(() => resolveInitialRadioValue(items, "unknown", false)).toThrow(RangeError);
    expect(reconcileRadioSelection(items, "unknown", true)).toBe("a");
    expect(getSelectionNavigationIntent("ArrowRight", "horizontal", "rtl")).toBe(
      "previous",
    );
    expect(getSelectionNavigationIntent("ArrowDown", "horizontal", "ltr")).toBeUndefined();
    expect(getRadioNavigationTarget(items, "a", "next")).toBe("c");
    expect(getRadioNavigationTarget(items, "a", "previous")).toBe("c");
    expect(getRadioNavigationTarget(items, "a", "previous", false)).toBe("a");
  });

  it("locks the HJM selection-group anatomy and state grammar", () => {
    expect(selectionGroupRecipe.defaults).toEqual({
      orientation: "vertical",
      presentation: "card",
    });
    expect(selectionGroupRecipe.orientations).toEqual({
      vertical: { direction: "column", gap: { plain: 4, card: 8, grouped: 0 } },
      horizontal: { direction: "row", gap: { plain: 12, card: 16, grouped: 0 } },
    });
    expect(selectionControlRecipe.defaults).toEqual({
      kind: "checkbox",
      size: "medium",
      presentation: "card",
    });
    expect(selectionControlRecipe.indicators.checkbox).toEqual({
      checked: "check",
      mixed: "dash",
    });
    expect(selectionControlRecipe.indicators.radio).toEqual({
      checked: "dot",
      mixed: null,
    });
    expect(selectionControlRecipe.states.focus).toBe(focusIndicatorContract);
    expect(selectionControlRecipe.states.invalidBorder).toBe(
      semanticColors.border.danger,
    );
    expect(selectionGroupRecipe.label).toBeDefined();
  });

  it("keeps new component recipes above legacy theme keys", () => {
    const source = readFileSync(
      fileURLToPath(new URL("../src/component-recipes.ts", import.meta.url)),
      "utf8",
    );
    expect(source).not.toMatch(/\b(?:themeColor|accentColor)\s*\(/);
    expect(source).toContain("semanticColors.");
  });

  it("keeps the component catalog unique and honest about implemented recipes", () => {
    const names = componentCatalog.map((component) => component.name);
    expect(new Set(names).size).toBe(names.length);

    for (const component of componentCatalog) {
      const contract: ComponentCatalogEntry = component;
      const hasRecipe = contract.recipe !== undefined;
      const hasNonVisualEvidence = contract.nonVisualEvidence !== undefined;
      if (component.status !== "planned") {
        expect(hasRecipe || hasNonVisualEvidence, component.name).toBe(true);
      }
      if (hasNonVisualEvidence) {
        expect(contract).toMatchObject({
          category: "provider",
          nonVisualEvidence: "provider-adapter",
        });
        expect(contract.recipe, component.name).toBeUndefined();
      }
      if ("recipe" in component && component.recipe) {
        expect(recipeRegistry).toHaveProperty(component.recipe);
      }
      if ("behavior" in component && component.behavior) {
        expect(behaviorRegistry).toHaveProperty(component.behavior);
      }
    }
  });

  it("keeps the documentation version aligned with package.json", async () => {
    const packageJson = JSON.parse(
      readFileSync(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"),
    ) as { version: string };
    const { designSystemVersion } = await import("../src/version.js");
    expect(designSystemVersion).toBe(packageJson.version);
  });

  it("keeps behavior contracts executable by both renderer test suites", () => {
    for (const behavior of Object.values(behaviorRegistry)) {
      expect(
        behavior.controlled.length +
          ("inputs" in behavior ? behavior.inputs.length : 0) +
          ("events" in behavior ? behavior.events.length : 0),
      ).toBeGreaterThan(0);
      expect(behavior.web).toHaveProperty("roles");
      expect(behavior.web).toHaveProperty("keyboard");
      expect(behavior.native).toHaveProperty("roles");
      expect(behavior.native).toHaveProperty("states");
      expect(behavior.scenarios.length).toBeGreaterThanOrEqual(3);
      expect(new Set(behavior.scenarios).size).toBe(behavior.scenarios.length);
    }
    expect(behaviorRegistry.menu.web.keyboard).toContain("Typeahead");
    expect(behaviorRegistry.menu.controlled).toContain("onAction");
    expect(behaviorRegistry.menu.controlled).toContain("onActionAfterDismiss");
    expect(behaviorRegistry.menu.controlled).toContain("selection");
    expect(behaviorRegistry.menu.controlled).toContain("asyncState");
    expect(behaviorRegistry.menu.native.dismiss).not.toContain("swipe");
    expect(behaviorRegistry.menu.scenarios).toContain(
      "multiple-selection-keeps-menu-open",
    );
    expect(behaviorRegistry.alertDialog.web.dismiss).not.toContain("outside");
    expect(behaviorRegistry.alertDialog.native.dismiss).toEqual(["back"]);
    expect(behaviorRegistry.alertDialog.controlled).toEqual([
      "open",
      "defaultOpen",
      "onOpenChange",
    ]);
    expect(behaviorRegistry.alertDialog.native.roles).toEqual(["alertdialog"]);
    expect(behaviorRegistry.alertDialog.scenarios).toEqual(
      expect.arrayContaining([
        "busy-blocks-every-dismiss-and-duplicate-confirm",
        "result-settles-once-after-exit",
        "unmount-settles-interrupted",
        "focus-restores-after-every-close-path",
      ]),
    );
    expect(behaviorRegistry.sheet.scenarios).toEqual(
      expect.arrayContaining([
        "busy-blocks-dismiss",
        "dismiss-reason-is-reported",
        "programmatic-owner-close-is-always-allowed",
        "swipe-requires-enabled-policy-and-gesture-capability",
        "successor-surface-opens-after-exit",
        "nested-modal-surfaces-are-forbidden",
      ]),
    );
    expect(behaviorRegistry.sheet.controlled).toContain("dismissPolicy");
    expect(behaviorRegistry.sheet.defaults).toBe(sheetBehaviorDefaults);
    expect(behaviorRegistry.sheet.native.dismiss).not.toContain("swipe");
    expect(behaviorRegistry.select.web.focus).toBe("activeDescendant");
    expect(behaviorRegistry.select.scenarios).toContain(
      "highlighted-option-is-distinct-from-committed-selection",
    );
    expect(behaviorRegistry.combobox.controlled).toEqual(
      expect.arrayContaining(["selectedKey", "inputValue", "open"]),
    );
    expect(behaviorRegistry.combobox.scenarios).toContain(
      "ime-composition-does-not-prematurely-filter-or-commit",
    );
    expect(behaviorRegistry.searchField.scenarios).toContain("clear-has-name");
    expect(behaviorRegistry.chip.web.roles).toEqual(["button", "radio", "checkbox"]);
    expect(behaviorRegistry.chip.native.states).toContain("checked");
    expect(behaviorRegistry.chip.scenarios).toContain(
      "selection-indicator-is-not-color-only",
    );
    expect(behaviorRegistry.disclosureGroup.web.focus).toBe("native");
    expect(behaviorRegistry.disclosureGroup.native.actions).toEqual(["activate"]);
    expect(behaviorRegistry.checkbox.controlled).toEqual([
      "checked",
      "defaultChecked",
      "onCheckedChange",
    ]);
    expect(behaviorRegistry.checkbox.scenarios).toContain(
      "mixed-is-announced-and-activates-to-default",
    );
    expect(behaviorRegistry.checkboxGroup.web.focus).toBe("native");
    expect(behaviorRegistry.checkboxGroup.web.keyboard).not.toContain("ArrowDown");
    expect(behaviorRegistry.checkboxGroup.defaults).toBe(selectionGroupBehaviorDefaults);
    expect(behaviorRegistry.checkboxGroup.scenarios).toContain("change-emits-a-fresh-set");
    expect(behaviorRegistry.radioGroup.web.focus).toBe("roving");
    expect(behaviorRegistry.radioGroup.web.keyboard).toContain("ArrowDown");
    expect(behaviorRegistry.radioGroup.defaults).toBe(radioGroupBehaviorDefaults);
    expect(behaviorRegistry.radioGroup.scenarios).toContain(
      "orientation-direction-and-loop-control-navigation",
    );
    expect(behaviorRegistry.chip.scenarios).toContain(
      "single-mode-composes-radio-group-behavior",
    );
    expect(behaviorRegistry.tabs.controlled).toEqual([
      "value",
      "defaultValue",
      "onValueChange",
    ]);
    expect(behaviorRegistry.tabs.defaults).toEqual({
      activationMode: "manual",
      mountPolicy: "active",
      panelMode: "keyed",
      orientation: "horizontal",
      direction: "ltr",
      loop: true,
    });
    expect(behaviorRegistry.tabs.web.keyboard).toEqual(
      expect.arrayContaining([
        "Enter",
        "Space",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
      ]),
    );
    expect(behaviorRegistry.tabs.scenarios).toEqual(
      expect.arrayContaining([
        "automatic-activation-only-for-instant-panels",
        "manual-activation-keeps-focus-and-selection-distinct",
        "always-mount-makes-inactive-panels-inert",
        "web-tablist-has-accessible-name",
        "every-tab-controls-an-existing-panel",
        "active-panel-labelled-by-selected-tab",
        "dynamic-panel-preserves-host-instance",
        "native-focus-does-not-select-without-activate",
      ]),
    );
    expect(behaviorRegistry.tabs.native.roles).toEqual(["tab"]);
  });

  it("keeps future Select and Combobox state axes independent", () => {
    const select: import("../src/index.js").SelectSelection<"a" | "b"> = {
      selectedKey: "a",
      onSelectionChange: () => undefined,
    };
    const combobox: import("../src/index.js").ComboboxInput = {
      inputValue: "alp",
      onInputValueChange: () => undefined,
    };
    const item: import("../src/index.js").SelectItemDescriptor<"a"> = {
      id: "a",
      label: "Alpha",
      textValue: "alpha",
    };
    const menuItem: import("../src/index.js").MenuItemDescriptor<"danger"> = {
      id: "danger",
      label: "Delete",
      textValue: "delete",
      tone: "danger",
      shortcut: "⌘⌫",
    };
    // @ts-expect-error A Menu descriptor cannot bypass the Select-only boundary.
    const invalidSelectItem: import("../src/index.js").SelectItemDescriptor<"danger"> =
      menuItem;

    expect(select.selectedKey).toBe("a");
    expect(combobox.inputValue).toBe("alp");
    expect(item.textValue).toBe("alpha");
    expect(invalidSelectItem.tone).toBe("danger");
    const externalCombobox: import("../src/index.js").ComboboxState<"a"> = {
      label: "Search players",
      selectedKey: null,
      onSelectionChange: () => undefined,
      inputValue: "alpha",
      onInputValueChange: () => undefined,
      open: true,
      onOpenChange: () => undefined,
      filtering: "external",
      asyncState: { status: "loading", message: "Loading" },
      queryValue: "alpha",
      resultQuery: "alpha",
      onCommit: (_key, reason) => {
        expect(["selection", "clear"]).toContain(reason);
      },
    };
    const localWithExternalQuery = {
      label: "Local search",
      selectedKey: null,
      onSelectionChange: () => undefined,
      inputValue: "alpha",
      onInputValueChange: () => undefined,
      open: false,
      onOpenChange: () => undefined,
      filtering: "local" as const,
      queryValue: "orphan",
    };
    // @ts-expect-error Canonical query metadata belongs to external filtering only.
    const invalidLocalCombobox: import("../src/index.js").ComboboxState<"a"> =
      localWithExternalQuery;
    expect(isComboboxResultCurrent(
      externalCombobox.queryValue,
      externalCombobox.resultQuery,
    )).toBe(true);
    expect(invalidLocalCombobox.queryValue).toBe("orphan");
    expect(isComboboxResultCurrent("new query", "old query")).toBe(false);
    expect(behaviorRegistry.combobox.inputs).toContain("asyncState");
    expect(behaviorRegistry.combobox.events).toEqual(["onCommit"]);
    expect(behaviorRegistry.combobox.native.roles).toEqual([
      "button",
      "text",
      "dialog",
      "radio",
    ]);
    expect(behaviorRegistry.select.defaults).toBe(selectBehaviorDefaults);
    expect(behaviorRegistry.combobox.defaults).toBe(comboboxBehaviorDefaults);
    expect(behaviorRegistry.select.inputs).toEqual(["asyncState", "selectedItem"]);
    expect(behaviorRegistry.select.scenarios).toContain(
      "controlled-owner-may-defer-a-selection-close-request",
    );
    expect(behaviorRegistry.combobox.scenarios).toContain(
      "stale-external-results-do-not-replace-current-query",
    );
    expect(behaviorRegistry.combobox.scenarios).toContain(
      "committed-item-survives-transient-result-pages",
    );

    const nullableSingle: import("../src/index.js").SingleSelectionModel<"a"> = {
      mode: "single",
      selectedKey: "a",
      onSelectionChange: (key) => {
        expect(key === "a" || key === null).toBe(true);
      },
    };
    nullableSingle.onSelectionChange(null);

    const invalidMixedSelection = {
      mode: "single",
      selectedKey: "a",
      // @ts-expect-error controlled collection selection cannot also set a default
      defaultSelectedKey: "a",
      onSelectionChange: () => undefined,
    } satisfies import("../src/index.js").SingleSelectionModel<"a">;
    expect(invalidMixedSelection.mode).toBe("single");
  });

  it("keeps an external Combobox selection outside transient result pages", () => {
    const current = {
      id: "player-1",
      label: "김도영",
      textValue: "김도영 KIA 내야수",
    } as const;
    const results = {
      items: [
        { id: "player-2", label: "문동주", textValue: "문동주 한화 투수" },
      ],
    } as const;

    expect(resolveComboboxSelectedItem(results, "player-1", current)).toBe(current);
    expect(
      resolveComboboxSelectedItem(
        { items: [{ ...current, label: "Stale Kim" }] },
        "player-1",
        current,
      ),
    ).toBe(current);
    expect(() => resolveComboboxSelectedItem(results, "player-1")).toThrow(
      "Selected combobox item is unavailable",
    );
    expect(() => resolveComboboxSelectedItem(results, null, current)).toThrow(
      "selectedItem requires a selectedKey",
    );
    expect(() =>
      resolveComboboxSelectedItem(results, "player-1", {
        ...current,
        id: "player-2",
      }),
    ).toThrow("selectedItem id must match selectedKey");
    expect(() =>
      resolveComboboxSelectedItem(results, "player-1", {
        ...current,
        label: " ",
      }),
    ).toThrow("label must not be empty");
  });

  it("validates and reconciles future collection-backed controls", () => {
    const sections = [
      {
        id: "recent",
        label: "Recent",
        items: [
          { id: "a", label: "Alpha", textValue: "alpha" },
          { id: "b", label: "Beta", textValue: "beta", disabled: true },
        ],
      },
      {
        id: "more",
        accessibilityLabel: "More options",
        items: [{ id: "c", label: "Charlie", textValue: "charlie" }],
      },
    ] as const;
    const source = { sections } as const;

    expect(collectionValidationDefaults).toEqual({
      requireItemLabel: true,
      requireTextValue: true,
      requireSectionName: true,
    });
    expect(() => validateCollection(source)).not.toThrow();
    expect(flattenCollectionItems(source).map((item) => item.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
    expect(resolveCollectionItem(source, "c")?.label).toBe("Charlie");
    expect(resolveCollectionItem(source, "missing" as "a")).toBeNull();
    expect(getCollectionNavigationTarget(source, "a", "next")).toBe("c");
    expect(getCollectionNavigationTarget(source, "c", "next")).toBe("a");
    expect(getCollectionNavigationTarget(source, "c", "next", false)).toBe("c");
    expect(getCollectionNavigationTarget(source, null, "previous", false)).toBe("c");
    expect(getCollectionTypeaheadMatch(source, "ch", { startsAfterKey: "a" })).toBe(
      "c",
    );
    expect(getCollectionTypeaheadMatch(source, "be")).toBeUndefined();
    expect(getCollectionNavigationIntent("ArrowDown")).toBe("next");
    expect(getCollectionNavigationIntent("ArrowUp")).toBe("previous");
    expect(getCollectionNavigationIntent("Home")).toBe("first");
    expect(getCollectionNavigationIntent("End")).toBe("last");
    expect(getCollectionNavigationIntent("ArrowLeft")).toBeUndefined();
    expect(
      getCollectionTypeaheadMatch(
        {
          items: [
            { id: "accent", label: "Éclair", textValue: "Éclair" },
            { id: "hangul", label: "가나다", textValue: "가나다" },
            { id: "space", label: "Alpha", textValue: "   Alpha" },
          ],
        },
        "e",
        { locale: "fr" },
      ),
    ).toBe("accent");
    expect(
      getCollectionTypeaheadMatch(
        { items: [{ id: "hangul", label: "가나다", textValue: "가나다" }] },
        "가",
        { locale: "ko" },
      ),
    ).toBe("hangul");
    expect(
      getCollectionTypeaheadMatch(
        { items: [{ id: "space", label: "Alpha", textValue: "   Alpha" }] },
        "a",
      ),
    ).toBe("space");
    expect(reconcileSelectSelection(source, "b")).toBe("b");
    expect(reconcileSelectSelection(source, "missing" as "a")).toBeNull();
    expect(
      reconcileSelectSelection(source, "missing" as "a", {
        disallowEmptySelection: true,
      }),
    ).toBe("a");

    const committed = {
      id: "remote" as const,
      label: "Remote",
      textValue: "remote",
    };
    expect(
      reconcileSelectSelection({ items: [] }, committed.id, {
        asyncState: { status: "loading", message: "Loading" },
        selectedItem: committed,
      }),
    ).toBe("remote");
    expect(
      reconcileSelectSelection({ items: [] }, committed.id, {
        asyncState: { status: "error", message: "Retry" },
      }),
    ).toBe("remote");
    expect(resolveSelectSelectedItem({ items: [] }, committed.id, committed)).toBe(
      committed,
    );
    expect(
      resolveSelectSelectedItem(
        { items: [{ ...committed, label: "Stale Remote" }] },
        committed.id,
        committed,
      ),
    ).toBe(committed);
    expect(
      reconcileSelectSelection({ items: [] }, committed.id, {
        asyncState: { status: "empty", message: "Empty" },
        selectedItem: committed,
      }),
    ).toBeNull();
    expect(
      reconcileSelectSelection({ items: [] }, committed.id, {
        asyncState: { status: "idle" },
        selectedItem: committed,
      }),
    ).toBeNull();
    expect(() =>
      reconcileSelectSelection({ items: [] }, "remote", {
        selectedItem: { ...committed, id: "other" },
      }),
    ).toThrow("selectedItem id must match selectedKey");

    expect(() =>
      validateCollection({
        sections: [
          ...sections,
          {
            id: "duplicate-key-section",
            label: "Duplicate",
            items: [{ id: "a", label: "Again", textValue: "again" }],
          },
        ],
      }),
    ).toThrow(/duplicate item id/);
    expect(() =>
      validateCollection({
        sections: [
          { id: "same", label: "One", items: [] },
          { id: "same", label: "Two", items: [] },
        ],
      }),
    ).toThrow(/duplicate section id/);
    expect(() =>
      validateCollection({
        items: [{ id: "blank", label: "Blank", textValue: " " }],
      }),
    ).toThrow(/textValue/);
    expect(() =>
      validateCollection({
        items: [{ id: " ", label: "Blank key", textValue: "blank" }],
      }),
    ).toThrow(/item id/);
    expect(() =>
      validateCollection({
        sections: [{ id: "", label: "Blank key", items: [] }],
      }),
    ).toThrow(/section id/);
    expect(() =>
      validateCollection({
        sections: [{ id: "unnamed", accessibilityLabel: " ", items: [] }],
      }),
    ).toThrow(/name/);
    expect(() =>
      validateCollection({
        sections: [
          {
            id: "visible-fallback",
            label: "Visible section",
            accessibilityLabel: " ",
            items: [],
          },
        ],
      }),
    ).not.toThrow();

    const selectState: import("../src/index.js").SelectState<"a"> = {
      label: "Choice",
      selectedKey: "a",
      onSelectionChange: () => undefined,
      open: true,
      onOpenChange: (_open, reason) => {
        expect(reason).toBe("escape");
      },
    };
    selectState.onOpenChange(false, "escape");
  });

  it("defines a once-settled async AlertDialog contract", async () => {
    expect(alertDialogBehaviorDefaults).toEqual({
      initialFocus: { alert: "confirm", confirm: "cancel" },
      outsideDismiss: false,
      escapeOrBackOutcome: "cancelled",
      dismissWhileBusy: false,
    });
    expect(getAlertDialogInitialFocus("confirm")).toBe("cancel");
    expect(getAlertDialogInitialFocus("alert")).toBe("confirm");
    expect(canDismissAlertDialog("outside", false)).toBe(false);
    expect(canDismissAlertDialog("escape", false)).toBe(true);
    expect(canDismissAlertDialog("back", true)).toBe(false);

    let actionCalls = 0;
    let releaseAction!: () => void;
    const request = {
      mode: "confirm",
      title: "Delete item?",
      description: "This cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      tone: "danger",
      onConfirm: () => {
        actionCalls += 1;
        return new Promise<void>((resolve) => {
          releaseAction = resolve;
        });
      },
      fallbackErrorMessage: "Try again.",
    } as const;
    validateAlertDialogRequest(request);
    const session = createAlertDialogSession(request);
    let settled = false;
    void session.result.then(() => {
      settled = true;
    });
    const firstConfirm = session.confirm();
    expect(session.getSnapshot()).toEqual({ status: "busy" });
    expect(await session.confirm()).toBe(false);
    expect(session.cancel("escape")).toBe(false);
    expect(session.attemptOutsideDismiss()).toBe(false);
    expect(actionCalls).toBe(1);
    releaseAction();
    expect(await firstConfirm).toBe(true);
    expect(session.getSnapshot()).toMatchObject({ status: "closing" });
    expect(settled).toBe(false);
    expect(session.completeExit()).toBe(true);
    await expect(session.result).resolves.toEqual({ outcome: "confirmed" });
    expect(session.completeExit()).toBe(false);

    let attempts = 0;
    const retry = createAlertDialogSession({
      ...request,
      onConfirm: async () => {
        attempts += 1;
        if (attempts === 1) throw new Error("offline");
      },
      resolveErrorMessage: () => {
        throw new Error("broken catalog");
      },
    });
    expect(await retry.confirm()).toBe(false);
    expect(retry.getSnapshot()).toEqual({ status: "error", message: "Try again." });
    expect(await retry.confirm()).toBe(true);
    expect(attempts).toBe(2);
    expect(retry.completeExit()).toBe(true);

    const interrupted = createAlertDialogSession({
      mode: "alert",
      title: "Saved",
      description: "Your changes were saved.",
      confirmLabel: "OK",
    });
    expect(interrupted.interrupt()).toBe(true);
    await expect(interrupted.result).resolves.toEqual({
      outcome: "cancelled",
      reason: "interrupted",
    });
    expect(interrupted.interrupt()).toBe(false);
    expect(() =>
      validateAlertDialogRequest({
        mode: "alert",
        title: " ",
        description: "Message",
        confirmLabel: "OK",
      }),
    ).toThrow(TypeError);
    expect(() =>
      validateAlertDialogRequest({
        mode: "alert",
        title: "Delete",
        description: "This cannot be undone.",
        confirmLabel: "Delete",
        tone: "danger",
      } as never),
    ).toThrow(TypeError);
    expect(alertDialogRecipe).not.toHaveProperty("dismiss");
  });

  it("keeps Sheet dismissal policy separate from its visual recipe", () => {
    expect(sheetBehaviorDefaults).toEqual({
      dismissible: true,
      dismissWhileBusy: false,
      outsideDismiss: true,
      escapeOrBackDismiss: true,
      swipeDismiss: false,
    });
    expect(canDismissSheet("close-action", false)).toBe(true);
    expect(canDismissSheet("outside", false)).toBe(true);
    expect(canDismissSheet("escape", false)).toBe(true);
    expect(canDismissSheet("back", true)).toBe(false);
    expect(canDismissSheet("swipe", false)).toBe(false);

    const lockedPolicy: import("../src/index.js").SheetDismissPolicy = {
      ...sheetBehaviorDefaults,
      dismissible: false,
      swipeDismiss: true,
    };
    expect(canDismissSheet("close-action", false, lockedPolicy)).toBe(false);
    expect(canDismissSheet("swipe", false, lockedPolicy)).toBe(false);
    expect(canDismissSheet("programmatic", true, lockedPolicy)).toBe(true);

    const swipePolicy: import("../src/index.js").SheetDismissPolicy = {
      ...sheetBehaviorDefaults,
      swipeDismiss: true,
    };
    expect(canDismissSheet("swipe", false, swipePolicy)).toBe(true);

    const controlled: import("../src/index.js").SheetOpenState = {
      open: true,
      onOpenChange: (_open, detail) => {
        expect(detail.reason).toBe("outside");
      },
    };
    controlled.onOpenChange(false, { reason: "outside" });

    expect(sheetRecipe.defaults).toEqual({ placement: "bottom" });
    expect(sheetRecipe.defaults).not.toHaveProperty("dismissible");
    expect(sheetRecipe.content.borderWidth).toBe(stroke.default);
    expect(sheetRecipe.content.shadow).toBe(floatingSurfaceContract.shadow);
    expect(sheetRecipe.web.maxWidth).toBeGreaterThan(0);
    expect(sheetRecipe.safeArea).toEqual({
      edge: "bottom",
      mode: "additive",
      minimumPadding: spacing.sm,
    });
    expect(sheetRecipe.handle.visibleByDefault).toBe(false);
    expect(sheetRecipe.handle.showWhen).toBe("swipe-dismiss-enabled");
    for (const region of [sheetRecipe.title, sheetRecipe.body, sheetRecipe.footer]) {
      expect(typography).toHaveProperty(region.textVariant);
      expect(region.gap).toBeGreaterThan(0);
    }
    expect(sheetRecipe.transition.enter.reducedMotion).toBe("opacity");
    expect(sheetRecipe.transition.exit.reducedMotion).toBe("instant");
  });

  it("settles every persistent native Sheet cycle once", () => {
    const lifecycle = createSheetLifecycle(true);
    expect(lifecycle.requestClose("outside", false)).toBe(true);
    expect(lifecycle.requestClose("back", false)).toBe(false);
    const first = lifecycle.beginDismiss();
    expect(first).toBe(1);
    expect(lifecycle.completeDismiss(first!)).toBe(true);
    expect(lifecycle.completeDismiss(first!)).toBe(false);

    const second = lifecycle.open();
    expect(second).toBe(2);
    expect(lifecycle.requestClose("back", true)).toBe(false);
    expect(lifecycle.requestClose("programmatic", true)).toBe(true);
    expect(lifecycle.beginDismiss()).toBe(second);
  });

  it("keeps every compact control at a 44-unit effective target", () => {
    for (const size of Object.values(iconButtonRecipe.sizes)) {
      expect(size.diameter + size.hitSlop * 2).toBeGreaterThanOrEqual(
        control.minTouchTarget,
      );
    }
    for (const size of Object.values(chipRecipe.sizes)) {
      expect(size.height + size.hitSlop * 2).toBeGreaterThanOrEqual(
        control.minTouchTarget,
      );
    }
    for (const size of Object.values(segmentedControlRecipe.sizes)) {
      expect(size.minHeight + size.hitSlop * 2).toBeGreaterThanOrEqual(
        control.minTouchTarget,
      );
    }
    expect(segmentedControlRecipe.adaptive).toEqual({
      largeTextLayout: "stacked",
      stackAtFontScale: 1.6,
    });
    for (const size of Object.values(tabsRecipe.sizes)) {
      expect(size.minHeight).toBeGreaterThanOrEqual(control.minTouchTarget);
    }
    for (const size of Object.values(selectionControlRecipe.sizes)) {
      expect(size.rowMinHeight).toBeGreaterThanOrEqual(control.minTouchTarget);
      expect(size.control + size.hitSlop * 2).toBeGreaterThanOrEqual(
        control.minTouchTarget,
      );
    }
    for (const size of Object.values(searchFieldRecipe.sizes)) {
      expect(size.minHeight).toBeGreaterThanOrEqual(control.minTouchTarget);
      expect(size.clearDiameter + size.clearHitSlop * 2).toBeGreaterThanOrEqual(
        control.minTouchTarget,
      );
    }
    expect(searchFieldRecipe.focusRingWidth).toBeGreaterThanOrEqual(stroke.focus);
    for (const density of Object.values(accordionRecipe.density)) {
      expect(density.triggerMinHeight).toBeGreaterThanOrEqual(
        control.minTouchTarget,
      );
    }
    for (const density of Object.values(menuRecipe.density)) {
      expect(density.minHeight).toBeGreaterThanOrEqual(control.minTouchTarget);
    }
    expect(switchRecipe.rowMinHeight).toBeGreaterThanOrEqual(control.minTouchTarget);
    expect(badgeRecipe.borderWidth).toBe(stroke.default);
  });

  it("moves tab focus with wrapping while skipping disabled tabs", () => {
    const tabs = [
      { id: "one", label: "One" },
      { id: "two", label: "Two", disabled: true },
      { id: "three", label: "Three" },
    ] as const;
    expect(getTabNavigationTarget(tabs, "one", "next")).toBe("three");
    expect(getTabNavigationTarget(tabs, "three", "next")).toBe("one");
    expect(getTabNavigationTarget(tabs, "one", "previous")).toBe("three");
    expect(getTabNavigationTarget(tabs, "three", "first")).toBe("one");
    expect(getTabNavigationTarget(tabs, "one", "last")).toBe("three");
    expect(getTabNavigationTarget(tabs, "one", "previous", false)).toBe("one");
    expect(getTabNavigationIntent("ArrowLeft", "horizontal", "ltr")).toBe(
      "previous",
    );
    expect(getTabNavigationIntent("ArrowLeft", "horizontal", "rtl")).toBe("next");
    expect(getTabNavigationIntent("ArrowUp", "horizontal", "ltr")).toBeUndefined();
    expect(getTabNavigationIntent("ArrowUp", "vertical", "ltr")).toBe("previous");
    expect(resolveInitialTabValue(tabs)).toBe("one");
    expect(() => resolveInitialTabValue(tabs, "two")).toThrow(RangeError);
    expect(() =>
      resolveInitialTabValue([
        { id: "one", label: "One" },
        { id: "one", label: "Duplicate" },
      ]),
    ).toThrow(TypeError);
  });

  it("resolves every recipe color reference in light and dark palettes", () => {
    const references: Array<Parameters<typeof resolveColorReference>[0]> = [];
    const visit = (value: unknown): void => {
      if (value === null || typeof value !== "object") return;
      if (
        "source" in value &&
        (value.source === "theme" ||
          value.source === "accent" ||
          value.source === "accentFill")
      ) {
        references.push(value as Parameters<typeof resolveColorReference>[0]);
        return;
      }
      for (const child of Object.values(value)) visit(child);
    };
    visit(recipeRegistry);

    expect(references.length).toBeGreaterThan(40);
    for (const themeName of ["light", "dark"] as const) {
      const palette = {
        theme: THEMES[themeName],
        statusAccents: ACCENTS[themeName],
        statusAccentFills: accentFill,
      };
      for (const reference of references) {
        expect(resolveColorReference(reference, palette)).toMatch(
          /^(?:#[0-9a-f]{6}|rgba\()/,
        );
      }
    }
  });

  it("resolves semantic theme and accent references for either renderer", () => {
    const palette = {
      theme: THEMES.light,
      statusAccents: ACCENTS.light,
      statusAccentFills: accentFill,
    };
    expect(resolveColorReference(themeColor("contentBrand"), palette)).toBe(
      THEMES.light.contentBrand,
    );
    expect(resolveColorReference(accentColor("success"), palette)).toBe(
      ACCENTS.light.success,
    );
    expect(resolveColorReference(solidAccentColor("success"), palette)).toBe(
      accentFill.success,
    );
    expect(resolveColorReference(accentColor("success", 0.15), palette)).toBe(
      withAlpha(ACCENTS.light.success, 0.15),
    );
    expect(() => themeColor("text", -0.1)).toThrow(RangeError);
    expect(() => accentColor("info", Number.NaN)).toThrow(RangeError);
    expect(resolveColorReference(semanticColors.canvas, palette)).toBe(THEMES.light.bg);
    expect(
      resolveColorReference(semanticColors.feedback.info.foreground, palette),
    ).toBe(ACCENTS.light.info);
    expect(() =>
      resolveColorReference(accentColor("info"), {
        theme: THEMES.light,
        statusAccents: {} as typeof ACCENTS.light,
        statusAccentFills: accentFill,
      }),
    ).toThrow(/Missing accent color/);
  });

  it("keeps segmented labels, selection, and focus visible in both themes", () => {
    for (const themeName of ["light", "dark"] as const) {
      const theme = THEMES[themeName];
      const palette = {
        theme,
        statusAccents: ACCENTS[themeName],
        statusAccentFills: accentFill,
      };
      const container = resolveColorReference(
        segmentedControlRecipe.container.background,
        palette,
      );
      const idleLabel = resolveColorReference(
        segmentedControlRecipe.item.idleContent,
        palette,
      );
      const selectedBorder = resolveColorReference(
        segmentedControlRecipe.item.selectedBorder,
        palette,
      );
      const focusRing = resolveColorReference(semanticColors.border.focus, palette);

      expect(contrast(idleLabel, container)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(selectedBorder, container)).toBeGreaterThanOrEqual(3);
      expect(segmentedControlRecipe.item.selectedBorderWidth).toBeGreaterThanOrEqual(2);
      for (const surface of ["bg", "surface", "surfaceAlt"] as const) {
        expect(contrast(focusRing, theme[surface])).toBeGreaterThanOrEqual(3);
      }
      const listTrailingText = resolveColorReference(
        listRowRecipe.trailing.textColor,
        palette,
      );
      for (const surface of ["bg", "surface", "surfaceAlt"] as const) {
        expect(contrast(listTrailingText, theme[surface])).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("keeps selection and progress boundaries visible without reusing action fill", () => {
    for (const themeName of ["light", "dark"] as const) {
      const theme = THEMES[themeName];
      const palette = {
        theme,
        statusAccents: ACCENTS[themeName],
        statusAccentFills: accentFill,
      };
      const backgrounds = [theme.bg, theme.surface, theme.surfaceAlt];
      // chipRecipe.states.idle.border is intentionally excluded here: it is
      // the shared hairline (`semanticColors.border.default`), which equals
      // `surfaceAlt` by design in both themes (same as `dividerRecipe.color`).
      // A resting chip's border is a quiet separator, not an interactive
      // boundary held to the 3:1 non-text contrast bar the way a selected or
      // focus indicator is — see chipRecipe's own comment for why it moved
      // off `content.secondary`.
      for (const reference of [
        chipRecipe.states.selected.border,
        selectionControlRecipe.states.idleBorder,
        selectionControlRecipe.states.checkedBorder,
        selectionControlRecipe.states.selectedBorder,
        selectionControlRecipe.states.invalidBorder,
        selectionControlRecipe.states.focus.color,
        sheetRecipe.handle.color,
        tabsRecipe.colors.indicator,
      ]) {
        const color = resolveColorReference(reference, palette);
        for (const background of backgrounds) {
          expect(contrast(color, background)).toBeGreaterThanOrEqual(3);
        }
      }

      expect(
        contrast(
          resolveColorReference(selectionControlRecipe.states.indicator, palette),
          resolveColorReference(
            selectionControlRecipe.states.checkedBackground,
            palette,
          ),
        ),
      ).toBeGreaterThanOrEqual(3);
      for (const state of Object.values(fieldRecipe.states)) {
        for (const background of backgrounds) {
          expect(contrast(theme[state.border], background)).toBeGreaterThanOrEqual(3);
        }
      }
      for (const reference of [
        searchFieldRecipe.colors.border,
        searchFieldRecipe.colors.focus,
        searchFieldRecipe.colors.invalid,
      ]) {
        const boundary = resolveColorReference(reference, palette);
        for (const background of backgrounds) {
          expect(contrast(boundary, background)).toBeGreaterThanOrEqual(3);
        }
      }

      const trackOn = resolveColorReference(switchRecipe.colors.trackOn, palette);
      const thumbOn = resolveColorReference(switchRecipe.colors.thumbOn, palette);
      expect(contrast(trackOn, theme.surface)).toBeGreaterThanOrEqual(3);
      expect(contrast(thumbOn, trackOn)).toBeGreaterThanOrEqual(3);
      expect(
        contrast(
          resolveColorReference(progressRecipe.tones.brand, palette),
          resolveColorReference(progressRecipe.track, palette),
        ),
      ).toBeGreaterThanOrEqual(3);
      for (const reference of [
        loadMoreRecipe.status.color,
        loadMoreRecipe.error.color,
        loadMoreRecipe.end.color,
        loadMoreRecipe.trigger.color,
      ]) {
        const content = resolveColorReference(reference, palette);
        for (const background of backgrounds) {
          expect(contrast(content, background)).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("gives selection chips a non-color indicator and a visible focus contract", () => {
    expect(chipRecipe.slots).toContain("indicator");
    expect(chipRecipe.selectionIndicator.glyph).toBe("xs");
    expect(chipRecipe.states.selected.content).toEqual(
      chipRecipe.selectionIndicator.color,
    );
    expect(chipRecipe.borderWidth).toBeGreaterThanOrEqual(1);
    expect(chipRecipe.focus.width).toBeGreaterThanOrEqual(2);
  });

  it("keeps adaptive menu width, danger, and collection affordances explicit", () => {
    expect(menuRecipe.minWidth).toBeGreaterThanOrEqual(220);
    expect(menuRecipe.maxWidth).toBeGreaterThan(menuRecipe.minWidth);
    expect(menuRecipe.maxHeight).toBeGreaterThanOrEqual(320);
    expect(menuRecipe.sideOffset).toBeGreaterThan(0);
    expect(menuRecipe.collisionPadding).toBeGreaterThan(0);
    expect(menuRecipe.leading.glyph).toBe("sm");
    expect(menuRecipe.leading.color).toEqual(
      menuRecipe.density.compact.description.color,
    );
    expect(menuRecipe.density.compact.focus.width).toBeGreaterThanOrEqual(2);
    expect(menuRecipe.density.compact.focus.color).toEqual(
      menuRecipe.indicator.color,
    );
    expect(menuRecipe.dangerIndicator.color).toEqual(menuRecipe.tones.danger);
    expect(menuRecipe.dangerIndicator.mark).toBe("alert");
    expect(menuRecipe.slots).toContain("dangerIndicator");
    expect(behaviorRegistry.menu.controlled).toContain("selection");
    expect(behaviorRegistry.menu.stateAxes.content).toContain("loadingMore");
  });

  it("keeps feedback recipes on generic semantic roles", () => {
    expect(badgeRecipe.defaults.variant).toBe("filled");
    expect(badgeRecipe.variants.filled.usesToneBackground).toBe(true);
    expect(badgeRecipe.variants.outline).toMatchObject({
      usesToneBackground: false,
      borderFallback: semanticColors.border.default,
    });
    expect(badgeRecipe.tones.strong.outlineContent).toBe(semanticColors.content.primary);
    expect(Object.keys(badgeRecipe.tones)).toEqual([
      "neutral",
      "strong",
      "brand",
      "info",
      "success",
      "warning",
      "attention",
      "danger",
    ]);
    expect(Object.keys(noticeRecipe.tones)).toEqual([
      "info",
      "success",
      "warning",
      "attention",
      "danger",
    ]);
    expect(JSON.stringify({ badgeRecipe, noticeRecipe })).not.toMatch(
      /burntok|yajalal|baseball|kbo|ai|rare|popular/i,
    );
  });

  it("treats ai as a generic icon role without adding a product tone", () => {
    expect(designSystem.semanticIconNames).toContain("ai");
    expect(Object.keys(badgeRecipe.tones)).not.toContain("ai");
    expect(Object.keys(noticeRecipe.tones)).not.toContain("ai");
  });

  it("separates numeric counters from status badges", () => {
    expect(counterBadgeRecipe.defaults.max).toBe(99);
    expect(counterBadgeRecipe.variants.floating.borderWidth).toBe(stroke.strong);
    expect(counterBadgeRecipe.variants.inline.border).toBeNull();
    expect(formatCounterBadgeCount(1)).toBe("1");
    expect(formatCounterBadgeCount(100)).toBe("99+");
    expect(formatCounterBadgeCount(12.9, 9)).toBe("9+");
    expect(formatCounterBadgeCount(0)).toBeNull();
    expect(formatCounterBadgeCount(Number.NaN)).toBeNull();

    for (const themeName of ["light", "dark"] as const) {
      const palette = {
        theme: THEMES[themeName],
        statusAccents: ACCENTS[themeName],
        statusAccentFills: accentFill,
      };
      for (const tone of Object.values(counterBadgeRecipe.tones)) {
        expect(
          contrast(
            resolveColorReference(tone.content, palette),
            resolveColorReference(tone.background, palette),
          ),
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("keeps essential field copy readable on every surface", () => {
    for (const theme of Object.values(THEMES)) {
      for (const key of [
        fieldRecipe.label.color,
        fieldRecipe.support.hintColor,
        fieldRecipe.placeholder.color,
      ]) {
        for (const surface of ["bg", "surface", "surfaceAlt"] as const) {
          expect(contrast(theme[key], theme[surface])).toBeGreaterThanOrEqual(4.5);
        }
      }
      for (const reference of [
        selectionGroupRecipe.label.color,
        selectionGroupRecipe.description.color,
        selectionControlRecipe.label.color,
        selectionControlRecipe.description.color,
      ]) {
        const palette = {
          theme,
          statusAccents: ACCENTS.light,
          statusAccentFills: accentFill,
        };
        const foreground = resolveColorReference(reference, palette);
        for (const surface of ["bg", "surface", "surfaceAlt"] as const) {
          expect(contrast(foreground, theme[surface])).toBeGreaterThanOrEqual(4.5);
        }
      }
      for (const reference of [
        selectionGroupRecipe.requiredIndicator.color,
        selectionGroupRecipe.error.color,
      ]) {
        const foreground = resolveColorReference(reference, {
          theme,
          statusAccents: ACCENTS.light,
          statusAccentFills: accentFill,
        });
        for (const surface of ["bg", "surface", "surfaceAlt"] as const) {
          expect(contrast(foreground, theme[surface])).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("reuses one focus, field, and floating-surface grammar", () => {
    expect(searchFieldRecipe.colors.focus).toBe(focusIndicatorContract.color);
    expect(searchFieldRecipe.focusRingWidth).toBe(focusIndicatorContract.width);
    expect(searchFieldRecipe.focusRingOffset).toBe(focusIndicatorContract.offset);
    expect(fieldFrameContract.borderWidth).toBe(stroke.default);
    expect(fieldRecipe.focusRingWidth).toBe(focusIndicatorContract.width);
    expect(fieldRecipe.focusRingOffset).toBe(focusIndicatorContract.offset);
    expect(selectionControlRecipe.states.focus).toBe(focusIndicatorContract);
    expect(menuRecipe.surface).toBe(floatingSurfaceContract);
    expect(selectRecipe.frame).toBe(fieldFrameContract);
    expect(comboboxRecipe.frame).toBe(fieldFrameContract);
    expect(comboboxRecipe.popover).toBe(selectRecipe.popover);
    expect(comboboxRecipe.density).toBe(selectRecipe.density);
    expect(comboboxRecipe.indicator).toBe(selectRecipe.indicator);
    expect(tooltipRecipe.surface.shadow).toBe(floatingSurfaceContract.shadow);
  });

  it("defines adaptive Select and Combobox visual contracts", () => {
    expect(selectRecipe.adaptive).toEqual({ web: "popover", native: "sheet" });
    expect(selectBehaviorDefaults.loop).toBe(false);
    expect(comboboxBehaviorDefaults.loop).toBe(false);
    expect(comboboxRecipe.adaptive).toBe(selectRecipe.adaptive);
    expect(selectRecipe.sizes.medium.minHeight).toBeGreaterThanOrEqual(
      control.minTouchTarget,
    );
    expect(comboboxRecipe.clear.diameter + comboboxRecipe.clear.hitSlop * 2).toBeGreaterThanOrEqual(
      control.minTouchTarget,
    );
    expect(selectRecipe.slots).toContain("busyIndicator");
    expect(selectRecipe.slots).not.toContain("clear");
    expect(selectRecipe.density.compact.minHeight).toBeGreaterThanOrEqual(
      control.minTouchTarget,
    );
    expect(selectRecipe.density.comfortable.focus).toBe(focusIndicatorContract);
    expect(selectRecipe.density.comfortable.selectedIndicator).toBe(
      selectRecipe.selectionIndicator.color,
    );
    expect(selectRecipe.optionLabel.selectedFontWeight).not.toBe(
      selectRecipe.optionLabel.fontWeight,
    );
    expect(selectRecipe.transition.web.exit.duration).toBeLessThanOrEqual(
      selectRecipe.transition.web.enter.duration,
    );
    expect(selectRecipe.transition.native).toEqual(sheetRecipe.transition);

    for (const themeName of ["light", "dark"] as const) {
      const palette = {
        theme: THEMES[themeName],
        statusAccents: ACCENTS[themeName],
        statusAccentFills: accentFill,
      };
      const surface = resolveColorReference(selectRecipe.frame.background, palette);
      for (const reference of [
        selectRecipe.value.color,
        selectRecipe.value.placeholderColor,
      ]) {
        expect(contrast(resolveColorReference(reference, palette), surface)).toBeGreaterThanOrEqual(
          4.5,
        );
      }
      for (const reference of [
        selectRecipe.frame.border,
        selectRecipe.states.focus.color,
        selectRecipe.states.invalidBorder,
        selectRecipe.selectionIndicator.color,
      ]) {
        expect(contrast(resolveColorReference(reference, palette), surface)).toBeGreaterThanOrEqual(
          3,
        );
      }
    }
  });

  it("keeps tooltip copy readable in both themes", () => {
    for (const themeName of ["light", "dark"] as const) {
      const palette = {
        theme: THEMES[themeName],
        statusAccents: ACCENTS[themeName],
        statusAccentFills: accentFill,
      };
      expect(
        contrast(
          resolveColorReference(tooltipRecipe.content.color, palette),
          resolveColorReference(tooltipRecipe.surface.background, palette),
        ),
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("defines anatomy and defaults for compound recipes", () => {
    for (const recipe of [
      buttonRecipe,
      fieldRecipe,
      iconButtonRecipe,
      menuRecipe,
      selectRecipe,
      comboboxRecipe,
      searchFieldRecipe,
      segmentedControlRecipe,
      selectionControlRecipe,
      tabsRecipe,
      dialogRecipe,
      sheetRecipe,
      toastRecipe,
    ]) {
      expect(recipe).toHaveProperty("slots");
      expect(recipe).toHaveProperty("defaults");
      expect(new Set(recipe.slots).size).toBe(recipe.slots.length);
    }
  });
});

describe("expanded foundation scales", () => {
  it("keeps interaction strengths bounded and ordered", () => {
    for (const value of [...Object.values(opacity), ...Object.values(stateLayer)]) {
      expect(value).toBeGreaterThan(0);
      expect(value).toBeLessThanOrEqual(1);
    }
    expect(stateLayer.hover).toBeLessThan(stateLayer.pressed);
    expect(opacity.disabled).toBeLessThan(opacity.pressed);
  });

  it("keeps curves, springs, strokes, breakpoints, and layers renderer-neutral", () => {
    for (const curve of Object.values(easing)) {
      expect(curve).toHaveLength(4);
      for (const coordinate of curve) {
        expect(coordinate).toBeGreaterThanOrEqual(0);
        expect(coordinate).toBeLessThanOrEqual(1);
      }
    }
    for (const value of Object.values(spring)) {
      expect(value.stiffness).toBeGreaterThan(0);
      expect(value.damping).toBeGreaterThan(0);
      expect(value.mass).toBeGreaterThan(0);
    }
    expect(Object.values(stroke)).toEqual(
      [...Object.values(stroke)].sort((a, b) => a - b),
    );
    expect(Object.values(breakpoint)).toEqual(
      [...Object.values(breakpoint)].sort((a, b) => a - b),
    );
    expect(Object.values(layer)).toEqual(
      [...Object.values(layer)].sort((a, b) => a - b),
    );
    expect(layout.rowHeight.singleLine).toBeGreaterThanOrEqual(control.minTouchTarget);
  });

  it("defines backdrop and reduced-motion behavior for every repeating or overlay motion", () => {
    expect(backdrop.modal.opacity).toBe(overlay.scrim);
    expect(backdrop.veil.opacity).toBe(overlay.veil);
    for (const preset of Object.values(motionPreset)) {
      expect(easing).toHaveProperty(preset.easing);
      expect(["instant", "opacity", "static"]).toContain(preset.reducedMotion);
    }
    for (const recipe of [sheetRecipe, dialogRecipe, alertDialogRecipe]) {
      expect(recipe.transition.enter).toHaveProperty("reducedMotion");
      expect(recipe.transition.exit).toHaveProperty("reducedMotion");
    }
    for (const transition of Object.values(toastRecipe.transition)) {
      expect(transition.enter).toHaveProperty("reducedMotion");
      expect(transition.exit).toHaveProperty("reducedMotion");
    }
    expect(recipeRegistry.skeletonRecipe.animation.reducedMotion).toBe("static");
    expect(recipeRegistry.spinnerRecipe.animation.reducedMotion).toBe("static");
  });
});
