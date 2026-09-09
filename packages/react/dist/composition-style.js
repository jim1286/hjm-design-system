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
];
//# sourceMappingURL=composition-style.js.map