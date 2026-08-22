import { describe, expect, expectTypeOf, it } from "vitest";

import {
  ACCENTS,
  THEMES,
  accentFill,
  behaviorRegistry,
  bottomNavigationBehaviorDefaults,
  bottomNavigationRecipe,
  componentCatalog,
  resolveBottomNavigationConfiguration,
  resolveBottomNavigationActivation,
  resolveBottomNavigationDescriptor,
  resolveBottomNavigationItem,
  semanticColors,
  resolveColorReference,
  validateBottomNavigationConfiguration,
  validateBottomNavigationDescriptor,
  type BottomNavigationDescriptor,
  type BottomNavigationIconDescriptor,
  type BottomNavigationItemDescriptor,
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

function contrast(a: string, b: string): number {
  const first = luminance(a);
  const second = luminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

const descriptor = {
  accessibilityLabel: "주요 탐색",
  selectedKey: "home",
  items: [
    { id: "home", label: "홈", icon: { name: "home" } },
    {
      id: "messages",
      label: "메시지",
      accessibilityLabel: "받은 메시지",
      icon: { name: "notifications", decorative: true },
      badge: {
        count: 128,
        max: 99,
        accessibilityLabel: "읽지 않은 메시지 128개",
      },
    },
    {
      id: "profile",
      label: "내 정보",
      icon: { name: "user" },
      disabled: true,
    },
  ],
} as const satisfies BottomNavigationDescriptor<string>;

describe("BottomNavigation semantic contract", () => {
  it("only accepts decorative icon descriptors", () => {
    expectTypeOf<BottomNavigationItemDescriptor["icon"]>().toEqualTypeOf<
      BottomNavigationIconDescriptor
    >();

    const informativeIcon = {
      ...descriptor,
      items: [
        {
          id: "home",
          label: "홈",
          icon: {
            name: "home",
            decorative: false,
            accessibilityLabel: "홈 아이콘",
          },
        },
        descriptor.items[1],
      ],
    } as unknown as BottomNavigationDescriptor<string>;

    expect(() => validateBottomNavigationDescriptor(informativeIcon)).toThrow(
      "icon must be decorative",
    );

    const appearanceOverride = {
      name: "home",
      tone: "danger",
    };
    // @ts-expect-error BottomNavigation owns icon appearance.
    const invalidIcon: BottomNavigationIconDescriptor = appearanceOverride;
    expect(() =>
      resolveBottomNavigationItem({
        id: "home",
        label: "홈",
        icon: invalidIcon,
      }),
    ).toThrow(/item icon field: tone/);
  });

  it("combines item and badge copy once and hides the badge subtree", () => {
    const resolved = resolveBottomNavigationDescriptor(descriptor);
    expect(resolved.items[0]).toMatchObject({
      resolvedAccessibilityLabel: "홈",
      badge: null,
    });
    expect(resolved.items[1]).toMatchObject({
      resolvedAccessibilityLabel: "받은 메시지, 읽지 않은 메시지 128개",
      badge: {
        visibleLabel: "99+",
        hiddenFromAccessibility: true,
      },
    });
    expect(resolved.items[1]?.badge).not.toHaveProperty("accessibilityLabel");
  });

  it("uses the visible label as the base name and ignores a zero badge", () => {
    const resolved = resolveBottomNavigationItem({
      id: "messages",
      label: "메시지",
      icon: { name: "notifications" },
      badge: {
        count: 0,
        accessibilityLabel: "읽지 않은 메시지 없음",
      },
    });
    expect(resolved.badge).toBeNull();
    expect(resolved.resolvedAccessibilityLabel).toBe("메시지");
  });

  it("returns a canonical icon and keeps the visible label in the accessible name", () => {
    const sourceIcon = { name: "home" } as const;
    expect(
      resolveBottomNavigationItem({
        id: "home",
        label: "홈",
        accessibilityLabel: "주요 홈",
        icon: sourceIcon,
      }).icon,
    ).toEqual({ name: "home", decorative: true });
    expect(
      resolveBottomNavigationItem({
        id: "home",
        label: "홈",
        icon: sourceIcon,
      }).icon,
    ).not.toBe(sourceIcon);
    expect(() =>
      resolveBottomNavigationItem({
        id: "home",
        label: "홈",
        accessibilityLabel: "첫 화면",
        icon: sourceIcon,
      }),
    ).toThrow(/must include the visible label/);
  });

  it("returns route intent without mutating router-owned selection", () => {
    expect(resolveBottomNavigationActivation(descriptor, "messages")).toEqual({
      key: "messages",
      reason: "navigate",
    });
    expect(resolveBottomNavigationActivation(descriptor, "home")).toEqual({
      key: "home",
      reason: "reselect",
    });
    expect(resolveBottomNavigationActivation(descriptor, "profile")).toBeNull();
    expect(resolveBottomNavigationActivation(descriptor, "unknown")).toBeNull();
    expect(descriptor.selectedKey).toBe("home");
  });

  it("requires two to six unique destinations and one enabled selected key", () => {
    expect(() =>
      validateBottomNavigationDescriptor({
        accessibilityLabel: "주요 탐색",
        selectedKey: "home",
        items: [{ id: "home", label: "홈", icon: { name: "home" } }],
      }),
    ).toThrow("2 to 6 destinations");

    expect(() =>
      validateBottomNavigationDescriptor({
        accessibilityLabel: "주요 탐색",
        selectedKey: "home",
        items: Array.from({ length: 7 }, (_, index) => ({
          id: index === 0 ? "home" : `item-${index}`,
          label: `항목 ${index}`,
          icon: { name: "home" as const },
        })),
      }),
    ).toThrow("2 to 6 destinations");

    expect(() =>
      validateBottomNavigationDescriptor({
        accessibilityLabel: "주요 탐색",
        selectedKey: "missing",
        items: descriptor.items,
      }),
    ).toThrow("selectedKey must exist");

    expect(() =>
      validateBottomNavigationDescriptor({
        accessibilityLabel: "주요 탐색",
        selectedKey: "profile",
        items: descriptor.items,
      }),
    ).toThrow("selected destination must be enabled");

    expect(() =>
      validateBottomNavigationDescriptor({
        accessibilityLabel: "주요 탐색",
        selectedKey: "home",
        items: [descriptor.items[0], descriptor.items[0]],
      }),
    ).toThrow("Duplicate BottomNavigation item id");
  });

  it("rejects ambiguous labels and malformed counter values", () => {
    expect(() =>
      validateBottomNavigationDescriptor({
        accessibilityLabel: " ",
        selectedKey: "home",
        items: descriptor.items,
      }),
    ).toThrow("accessibilityLabel must not be empty");

    for (const count of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() =>
        resolveBottomNavigationItem({
          id: "messages",
          label: "메시지",
          icon: { name: "notifications" },
          badge: { count, accessibilityLabel: "읽지 않음" },
        }),
      ).toThrow("count must be a non-negative safe integer");
    }

    expect(() =>
      resolveBottomNavigationItem({
        id: "messages",
        label: "메시지",
        icon: { name: "notifications" },
        badge: { count: 1, max: 0, accessibilityLabel: "읽지 않음" },
      }),
    ).toThrow("max must be a positive safe integer");
  });

  it("rejects malformed runtime objects and non-boolean disabled values", () => {
    expect(() =>
      validateBottomNavigationDescriptor(
        null as unknown as BottomNavigationDescriptor<string>,
      ),
    ).toThrow("descriptor must be an object");

    expect(() =>
      validateBottomNavigationDescriptor({
        accessibilityLabel: "주요 탐색",
        selectedKey: "home",
        items: "items" as unknown as readonly BottomNavigationItemDescriptor[],
      }),
    ).toThrow("items must be an array");

    expect(() =>
      validateBottomNavigationDescriptor({
        accessibilityLabel: "주요 탐색",
        selectedKey: "home",
        items: [
          {
            id: "home",
            label: "홈",
            icon: { name: "home" },
            disabled: "false",
          } as unknown as BottomNavigationItemDescriptor,
          descriptor.items[1],
        ],
      }),
    ).toThrow("disabled must be a boolean");

    expect(() =>
      validateBottomNavigationDescriptor({
        accessibilityLabel: "주요 탐색",
        selectedKey: "home",
        items: [
          null as unknown as BottomNavigationItemDescriptor,
          descriptor.items[1],
        ],
      }),
    ).toThrow("item must be an object");

    expect(() =>
      resolveBottomNavigationItem({
        id: "messages",
        label: "메시지",
        icon: null,
      } as unknown as BottomNavigationItemDescriptor),
    ).toThrow("icon must be an object");

    expect(() =>
      resolveBottomNavigationItem({
        id: "messages",
        label: "메시지",
        icon: { name: "notifications" },
        badge: null,
      } as unknown as BottomNavigationItemDescriptor),
    ).toThrow("badge must be an object");

    expect(() =>
      validateBottomNavigationConfiguration(
        { keyboardBehaviour: "remain" } as never,
        4,
      ),
    ).toThrow(/configuration field: keyboardBehaviour/);
    expect(() =>
      validateBottomNavigationDescriptor({
        ...descriptor,
        onPress() {},
      } as never),
    ).toThrow(/descriptor field: onPress/);
    expect(() =>
      resolveBottomNavigationItem({
        id: "messages",
        label: "메시지",
        icon: { name: "notifications" },
        route: "/messages",
      } as never),
    ).toThrow(/item field: route/);
    expect(() =>
      resolveBottomNavigationItem({
        id: "messages",
        label: "메시지",
        icon: { name: "notifications" },
        badge: {
          count: 1,
          accessibilityLabel: "읽지 않음 1개",
          live: true,
        },
      } as never),
    ).toThrow(/badge field: live/);
  });
});

describe("BottomNavigation visual and behavior contracts", () => {
  it("keeps essential labels readable and selection non-color-only", () => {
    expect(bottomNavigationRecipe.colors.idle).toEqual(
      semanticColors.content.secondary,
    );
    expect(bottomNavigationRecipe.colors.selectedLabel).toEqual(
      bottomNavigationRecipe.colors.selectedIcon,
    );
    expect(bottomNavigationRecipe.colors).not.toHaveProperty(
      "selectedIndicator",
    );
    expect(bottomNavigationRecipe.indicator).toEqual({
      minWidth: 40,
      minHeight: 28,
      radius: "full",
      visual: "none",
      background: null,
      border: null,
      borderWidth: 0,
    });
    expect(bottomNavigationRecipe.label.selectedFontWeight).not.toBe(
      bottomNavigationRecipe.label.fontWeight,
    );
    expect(bottomNavigationRecipe.icon.selectedEmphasis).toEqual({
      minimumAdaptations: 1,
      strokeWidth: { idle: 2, selected: 3 },
      scale: { idle: 1, selected: 1.06 },
    });
    expect(
      bottomNavigationRecipe.icon.selectedEmphasis.strokeWidth.selected,
    ).not.toBe(
      bottomNavigationRecipe.icon.selectedEmphasis.strokeWidth.idle,
    );
    expect(
      bottomNavigationRecipe.icon.selectedEmphasis.scale.selected,
    ).not.toBe(bottomNavigationRecipe.icon.selectedEmphasis.scale.idle);
    expect(bottomNavigationRecipe.states.selectedNonColorEvidence).toEqual({
      target: "icon-and-label",
      label: "font-weight",
      icon: "emphasis",
    });
    expect(bottomNavigationRecipe.states.selectedFocusSeparation).toEqual({
      selectedTarget: "icon-and-label",
      focusTarget: "item",
      minimumGap: 2,
    });
  });

  it("keeps every persistent inactive label readable on navigation surfaces", () => {
    for (const themeName of ["light", "dark"] as const) {
      const theme = THEMES[themeName];
      const palette = {
        theme,
        statusAccents: ACCENTS[themeName],
        statusAccentFills: accentFill,
      };
      const idle = resolveColorReference(
        bottomNavigationRecipe.colors.idle,
        palette,
      );
      for (const background of [theme.bg, theme.surface]) {
        expect(contrast(idle, background)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("supports additive safe area, large text, RTL, and minimum targets", () => {
    expect(bottomNavigationRecipe.safeArea).toEqual({
      mode: "additive",
      minimumBottomPadding: 8,
    });
    expect(bottomNavigationRecipe.keyboard).toEqual({
      defaultBehavior: "hide",
      movesAboveKeyboard: false,
    });
    expect(bottomNavigationRecipe.largeText).toEqual({
      allowFontScaling: true,
      maxFontSizeMultiplier: 1.4,
      fixedItemHeight: false,
      labelWraps: true,
    });
    expect(bottomNavigationRecipe.direction).toEqual({
      itemOrder: "logical",
      badgeAnchor: "inline-end",
    });
    for (const density of Object.values(bottomNavigationRecipe.density)) {
      expect(density.itemMinHeight).toBeGreaterThanOrEqual(44);
      expect(density.itemMinWidth).toBeGreaterThanOrEqual(44);
    }
  });

  it("reserves but does not model a centered sibling action", () => {
    expect(bottomNavigationRecipe.slots).not.toContain("action");
    expect(bottomNavigationRecipe.distributions["center-gap"]).toEqual({
      centerGap: 68,
      requiresEvenItemCount: true,
    });
    expect(behaviorRegistry.bottomNavigation.scenarios).toContain(
      "centered-sibling-action-is-excluded-from-destination-collection",
    );
  });

  it("validates and resolves one shared visual/behavior configuration", () => {
    expect(resolveBottomNavigationConfiguration({}, 3)).toEqual({
      presentation: "bar",
      distribution: "equal",
      density: "regular",
      direction: "ltr",
      keyboardBehavior: "hide",
    });
    expect(
      resolveBottomNavigationConfiguration(
        {
          presentation: "floating",
          distribution: "center-gap",
          density: "compact",
          direction: "rtl",
          keyboardBehavior: "remain",
        },
        4,
      ),
    ).toEqual({
      presentation: "floating",
      distribution: "center-gap",
      density: "compact",
      direction: "rtl",
      keyboardBehavior: "remain",
    });
    expect(() =>
      validateBottomNavigationConfiguration({ distribution: "center-gap" }, 3),
    ).toThrow("requires an even destination count");
    expect(() =>
      validateBottomNavigationConfiguration(
        { presentation: "card" } as never,
        4,
      ),
    ).toThrow("Unsupported BottomNavigation presentation");
    for (const [configuration, field] of [
      [{ distribution: "spread" }, "distribution"],
      [{ density: "dense" }, "density"],
      [{ direction: "auto" }, "direction"],
      [{ keyboardBehavior: "lift" }, "keyboardBehavior"],
    ] as const) {
      expect(() =>
        validateBottomNavigationConfiguration(configuration as never, 4),
      ).toThrow(`Unsupported BottomNavigation ${field}`);
    }
    expect(() =>
      validateBottomNavigationConfiguration(
        null as never,
        4,
      ),
    ).toThrow("configuration must be an object");
  });

  it("fixes adaptive Web and Native navigation semantics", () => {
    const behavior = behaviorRegistry.bottomNavigation;
    expect(behavior.controlled).toEqual([]);
    expect(behavior.inputs).toContain("selectedKey");
    expect(behavior.events).toEqual(["onActivate", "onLongPress"]);
    expect(behavior.web).toEqual({
      roles: ["navigation", "list", "link"],
      keyboard: ["Tab", "Enter"],
      focus: "native",
    });
    expect(behavior.native).toEqual({
      roles: ["tab", "button"],
      states: ["disabled", "selected"],
      actions: ["activate", "longpress"],
    });
    expect(behavior.scenarios).toEqual(
      expect.arrayContaining([
        "web-current-link-uses-aria-current-page",
        "native-emits-tab-press-and-respects-default-prevented-before-navigation",
        "native-forwards-tab-long-press",
        "native-ios-may-use-button-plus-selected-when-tab-role-is-not-reliably-supported",
        "badge-subtree-is-hidden-and-item-uses-one-resolved-accessibility-name",
        "selected-content-and-focus-indicator-remain-simultaneously-visible",
        "selected-state-uses-icon-emphasis-and-label-weight-not-color-alone",
        "safe-area-padding-is-additive",
        "two-hundred-percent-text-wraps-without-fixed-item-height",
        "rtl-order-and-badge-anchor-follow-logical-direction",
      ]),
    );
    expect(bottomNavigationBehaviorDefaults).toEqual({
      direction: "ltr",
      keyboardBehavior: "hide",
      minItems: 2,
      maxItems: 6,
    });
  });

  it("promotes the adaptive catalog entry after paired product evidence", () => {
    expect(componentCatalog).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "BottomTabs" })]),
    );
    expect(componentCatalog).toEqual(
      expect.arrayContaining([
        {
          name: "BottomNavigation",
          category: "navigation",
          platform: "adaptive",
          status: "beta",
          surfaceStatus: { web: "planned", native: "beta" },
          recipe: "bottomNavigationRecipe",
          behavior: "bottomNavigation",
        },
      ]),
    );
  });
});
