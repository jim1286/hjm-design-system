import type { CSSProperties } from "react";

/**
 * Layout-only keys that an app may use to place an HJM component in a page.
 *
 * Color, typography, radius, height, opacity, transform, padding, gap, border,
 * and interaction-state properties are intentionally absent because the HJM
 * recipe or semantic product-theme adapter owns them.
 *
 * Mirrors React Native's `hjmCompositionStyleKeys`, mapping the physical
 * direction keys (`marginHorizontal`, `marginStart`) onto CSS logical
 * properties so placement keeps the same meaning under RTL.
 *
 * @see ../../react-native/src/composition-style.ts
 */
export const hjmCompositionStyleKeys = [
  "alignSelf",
  "flex",
  "flexBasis",
  "flexGrow",
  "flexShrink",
  "flexWrap",
  "margin",
  "marginBlock",
  "marginBottom",
  "marginInline",
  "marginInlineEnd",
  "marginInlineStart",
  "marginTop",
  "maxInlineSize",
  "maxWidth",
  "minInlineSize",
  "minWidth",
  "width",
] as const satisfies readonly (keyof CSSProperties)[];

export type HjmCompositionStyleKey = (typeof hjmCompositionStyleKeys)[number];

type HjmControlledStyleKey = Exclude<keyof CSSProperties, HjmCompositionStyleKey>;

type HjmControlledStyleExclusions = Readonly<{
  [Key in HjmControlledStyleKey]?: never;
}>;

/** Canonical, layout-only style accepted by HJM component roots. */
export type HjmCompositionStyle = Readonly<Pick<CSSProperties, HjmCompositionStyleKey>> &
  HjmControlledStyleExclusions;

/** React DOM form of `HjmCompositionStyle`. */
export type HjmCompositionStyleProp = HjmCompositionStyle;
