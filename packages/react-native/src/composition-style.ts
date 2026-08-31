import type { StyleProp, ViewStyle } from "react-native";

/**
 * Layout-only keys that an app may use to place an HJM component in a screen.
 *
 * Color, typography, radius, height, opacity, transform, padding, gap, border,
 * and interaction-state properties are intentionally absent because the HJM
 * recipe or semantic product-theme adapter owns them.
 *
 * @see https://github.com/jim1286/hjm-design-system/blob/main/packages/design-contracts/docs/consumer-policy.md#31-react-native-legacy-style-compatibility-boundary
 */
export const hjmCompositionStyleKeys = [
  "alignSelf",
  "flex",
  "flexBasis",
  "flexGrow",
  "flexShrink",
  "margin",
  "marginBottom",
  "marginEnd",
  "marginHorizontal",
  "marginStart",
  "marginTop",
  "marginVertical",
  "width",
] as const satisfies readonly (keyof ViewStyle)[];

export type HjmCompositionStyleKey = (typeof hjmCompositionStyleKeys)[number];

type HjmControlledStyleKey = Exclude<keyof ViewStyle, HjmCompositionStyleKey>;

type HjmControlledStyleExclusions = Readonly<{
  [Key in HjmControlledStyleKey]?: never;
}>;

/** Canonical, layout-only style accepted by HJM component roots. */
export type HjmCompositionStyle = Readonly<Pick<ViewStyle, HjmCompositionStyleKey>> &
  HjmControlledStyleExclusions;

/** React Native array/registered-style form of `HjmCompositionStyle`. */
export type HjmCompositionStyleProp = StyleProp<HjmCompositionStyle>;
