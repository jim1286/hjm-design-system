import { describe, expect, it } from "vitest";

import {
  ACCENTS,
  THEMES,
  accentFill,
  behaviorRegistry,
  componentCatalog,
  control,
  linkRecipe,
  resolveColorReference,
  resolveLinkDescriptor,
  validateLinkDescriptor,
  validateLinkDestination,
  type LinkDescriptor,
  type LinkDestination,
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

describe("Link destination contract", () => {
  it("separates root-relative app routes from supported external URLs", () => {
    for (const destination of [
      { kind: "internal", href: "/users/42" },
      { kind: "internal", href: "?tab=stats" },
      { kind: "internal", href: "#details" },
      { kind: "external", href: "https://example.com/help" },
      { kind: "external", href: "mailto:help@example.com" },
      { kind: "external", href: "tel:+821012345678" },
    ] as const satisfies readonly LinkDestination[]) {
      expect(() => validateLinkDestination(destination)).not.toThrow();
    }
    expect(() =>
      validateLinkDestination({ kind: "internal", href: "users/42" }),
    ).toThrow(/root-relative/);
    expect(() =>
      validateLinkDestination({ kind: "internal", href: "//example.com" }),
    ).toThrow(/root-relative/);
    expect(() =>
      validateLinkDestination({ kind: "internal", href: "/\\example.com" }),
    ).toThrow(/backslashes/);
    expect(() =>
      validateLinkDestination({
        kind: "external",
        href: "javascript:alert(1)",
      }),
    ).toThrow(/protocol/);
    expect(() =>
      validateLinkDestination({
        kind: "external",
        href: "https://user:secret@example.com",
      }),
    ).toThrow(/credentials/);
  });

  it("resolves one accessible name and decorative semantic icons", () => {
    expect(
      resolveLinkDescriptor({
        label: "프로필 보기",
        accessibilityLabel: "지민 프로필 보기",
        destination: { kind: "internal", href: "/u/jimin" },
        trailingIcon: { name: "chevronEnd" },
      }),
    ).toEqual({
      label: "프로필 보기",
      resolvedAccessibilityLabel: "지민 프로필 보기",
      destination: { kind: "internal", href: "/u/jimin" },
      leadingIcon: null,
      trailingIcon: { name: "chevronEnd", decorative: true },
    });
    expect(() =>
      validateLinkDescriptor({
        label: "Help",
        destination: { kind: "external", href: "https://example.com" },
        trailingIcon: {
          name: "info",
          decorative: false,
          accessibilityLabel: "Info",
        },
      } as never),
    ).toThrow(/decorative/);
    expect(() =>
      validateLinkDescriptor({
        label: "Profile",
        accessibilityLabel: "Account destination",
        destination: { kind: "internal", href: "/profile" },
      }),
    ).toThrow(/include the visible label/);
  });

  it("forbids action, disabled, download, and visited state structurally and at runtime", () => {
    const valid: LinkDescriptor = {
      label: "Profile",
      destination: { kind: "internal", href: "/profile" },
    };
    const actionLike = {
      label: "Profile",
      destination: { kind: "internal" as const, href: "/profile" },
      disabled: true,
    };
    // @ts-expect-error Links do not expose disabled application state.
    const disabledLink: LinkDescriptor = actionLike;
    const callbackLink: LinkDescriptor = {
      label: "Profile",
      destination: { kind: "internal", href: "/profile" },
      // @ts-expect-error Navigation callbacks cannot replace href semantics.
      onPress: () => undefined,
    };
    const downloadLink: LinkDescriptor = {
      label: "Export",
      destination: { kind: "external", href: "https://example.com/file" },
      // @ts-expect-error Download is a separate platform workflow.
      download: true,
    };
    expect(() => validateLinkDescriptor(actionLike as never)).toThrow(/disabled/);
    expect([valid, disabledLink, callbackLink, downloadLink]).toHaveLength(4);
  });

  it("rejects hidden platform fields and resolves only canonical values", () => {
    expect(() =>
      validateLinkDestination({
        kind: "internal",
        href: "/profile",
        disabled: undefined,
      } as never),
    ).toThrow(/disabled/);
    expect(() =>
      validateLinkDestination({
        kind: "internal",
        href: "/profile",
        replace: true,
      } as never),
    ).toThrow(/destination field: replace/);
    expect(() =>
      validateLinkDescriptor({
        label: "Profile",
        destination: { kind: "internal", href: "/profile" },
        target: "_blank",
      } as never),
    ).toThrow(/descriptor field: target/);
    expect(
      resolveLinkDescriptor({
        label: "Profile",
        destination: {
          kind: "internal",
          href: "/profile",
        },
      }),
    ).toEqual({
      label: "Profile",
      resolvedAccessibilityLabel: "Profile",
      destination: { kind: "internal", href: "/profile" },
      leadingIcon: null,
      trailingIcon: null,
    });
  });

  it("locks icon appearance and logical direction to the Link renderer", () => {
    for (const override of [
      { size: "xxxl" },
      { tone: "inverse" },
      { weight: "strong" },
      { directionality: "fixed" },
    ]) {
      expect(() =>
        validateLinkDescriptor({
          label: "Next",
          destination: { kind: "internal", href: "/next" },
          trailingIcon: { name: "chevronEnd", ...override },
        } as never),
      ).toThrow(/trailingIcon field/);
    }
    const oversized = {
      name: "chevronEnd" as const,
      size: "xxxl" as const,
    };
    const descriptor = {
      label: "Next",
      destination: { kind: "internal" as const, href: "/next" },
      trailingIcon: oversized,
    };
    // @ts-expect-error Link icons expose semantic identity, not appearance.
    const invalid: LinkDescriptor = descriptor;
    expect(invalid.trailingIcon?.name).toBe("chevronEnd");
  });
});

describe("Link visual and behavior contracts", () => {
  it("keeps inline meaning visible and standalone targets touch-safe", () => {
    expect(linkRecipe.variants.inline).toMatchObject({
      underline: "always",
      minHeight: null,
    });
    expect(linkRecipe.variants.standalone).toMatchObject({
      underline: "hover",
      minHeight: control.minTouchTarget,
    });
    expect(linkRecipe.icon).toEqual({ glyph: "xs", inheritsTone: true });
    expect(linkRecipe.states.focus.width).toBeGreaterThan(0);
  });

  it("keeps both approved tones readable on canvas and surface", () => {
    for (const themeName of ["light", "dark"] as const) {
      const palette = {
        theme: THEMES[themeName],
        statusAccents: ACCENTS[themeName],
        statusAccentFills: accentFill,
      };
      for (const reference of Object.values(linkRecipe.tones)) {
        const foreground = resolveColorReference(reference, palette);
        for (const background of [
          THEMES[themeName].bg,
          THEMES[themeName].surface,
        ]) {
          expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("promotes Link after the paired BurnTok destination slice lands", () => {
    expect(componentCatalog.find((entry) => entry.name === "Link")).toEqual({
      name: "Link",
      category: "action",
      platform: "adaptive",
      status: "beta",
      recipe: "linkRecipe",
      behavior: "link",
    });
    expect(behaviorRegistry.link.web).toEqual({
      roles: ["link"],
      keyboard: ["Tab", "Enter"],
      focus: "native",
    });
    expect(behaviorRegistry.link.native).toEqual({
      roles: ["link"],
      states: [],
      actions: ["activate"],
    });
    expect(behaviorRegistry.link.scenarios).toContain(
      "web-renders-a-real-anchor-and-preserves-modifier-context-navigation",
    );
  });
});
