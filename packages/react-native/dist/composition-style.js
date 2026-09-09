/**
 * Layout-only keys that an app may use to place an HJM component in a screen.
 *
 * Color, typography, radius, height, opacity, transform, padding, gap, border,
 * and interaction-state properties are intentionally absent because the HJM
 * recipe or semantic product-theme adapter owns them.
 *
 * Width bounds and wrapping are placement, not appearance: a consumer decides how
 * much room a component may take in its own layout. Height stays out because the
 * recipe owns vertical rhythm.
 *
 * @see https://github.com/jim1286/hjm-design-system/blob/main/packages/design-contracts/docs/consumer-policy.md#31-react-native-legacy-style-compatibility-boundary
 */
export const hjmCompositionStyleKeys = [
    "alignSelf",
    "flex",
    "flexBasis",
    "flexGrow",
    "flexShrink",
    "flexWrap",
    "margin",
    "marginBottom",
    "marginEnd",
    "marginHorizontal",
    "marginStart",
    "marginTop",
    "marginVertical",
    "maxWidth",
    "minWidth",
    "width",
];
//# sourceMappingURL=composition-style.js.map