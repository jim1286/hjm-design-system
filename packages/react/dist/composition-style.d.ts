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
export declare const hjmCompositionStyleKeys: readonly ["alignSelf", "flex", "flexBasis", "flexGrow", "flexShrink", "flexWrap", "margin", "marginBlock", "marginBottom", "marginInline", "marginInlineEnd", "marginInlineStart", "marginTop", "maxInlineSize", "maxWidth", "minInlineSize", "minWidth", "width"];
export type HjmCompositionStyleKey = (typeof hjmCompositionStyleKeys)[number];
type HjmControlledStyleKey = Exclude<keyof CSSProperties, HjmCompositionStyleKey>;
type HjmControlledStyleExclusions = Readonly<{
    [Key in HjmControlledStyleKey]?: never;
}>;
/**
 * Canonical, layout-only style accepted by HJM component roots.
 *
 * Every public Web component with an in-flow root takes `layoutStyle` (2026-10-06
 * sweep; `test/composition-style.ssr.test.tsx` renders them), including the
 * `./screens`, `./screen-flows` and `./saved-items` screens through ScreenLayout
 * (ListDetailScreen and SavedItemsScreen place their outer two-pane host). The
 * exceptions have no in-flow box to place: providers (HjmProvider, OverlayStackProvider,
 * ToastProvider), viewport/portal layers (Dialog, AlertDialog, Sheet, PhotoSourceSheet,
 * SidePanel, Popover, Tour, CommandPalette, Toast, Celebration), and recipe-pinned or
 * hidden elements (FloatingActionButton, SkipNav, VisuallyHidden). Most of their props
 * types carry the reason. CommandPalette's and PhotoSourceSheet's are recorded only here:
 * both render a modal portal surface.
 */
export type HjmCompositionStyle = Readonly<Pick<CSSProperties, HjmCompositionStyleKey>> & HjmControlledStyleExclusions;
/** React DOM form of `HjmCompositionStyle`. */
export type HjmCompositionStyleProp = HjmCompositionStyle;
export {};
//# sourceMappingURL=composition-style.d.ts.map