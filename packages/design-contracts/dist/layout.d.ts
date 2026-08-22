/**
 * `Layout` (alias `AppShell`) does NOT own header or footer chrome — that is
 * already `TopBar` (native, beta) and `BottomNavigation` (adaptive, beta).
 * What is left after subtracting those: ordered regions, a sidebar that is
 * either always-visible chrome or a dismissible overlay, and Web-only
 * landmark composition (one `main` plus a required skip link whenever
 * repeated navigation precedes it). The overlay case reuses `SidePanel`
 * unchanged — see docs/layout.md for why this module does not redeclare
 * open/dismiss state.
 */
export type LayoutSidebarRole = "navigation" | "complementary";
export type LayoutSidebarMode = "persistent" | "overlay";
export type LayoutSidebarDescriptor = Readonly<{
    /** Primary site navigation vs. supplementary content (filters, related items) — independent of `mode`. */
    role: LayoutSidebarRole;
    /** `persistent`: always-visible landmark. `overlay`: a `SidePanel` — Layout does not re-contract its open/dismiss lifecycle. */
    mode: LayoutSidebarMode;
    label: string;
}>;
export type LayoutDescriptor = Readonly<{
    hasHeader?: boolean;
    hasFooter?: boolean;
    sidebar?: LayoutSidebarDescriptor;
    /** Web-only: required whenever a header or sidebar precedes `main` (WCAG 2.4.1 bypass blocks). */
    skipLinkLabel?: string;
}>;
/**
 * Cross-platform structure validation. This deliberately does not require a
 * skip link: Native has no page-landmark or bypass-link equivalent.
 */
export declare function validateLayoutRegions(descriptor: LayoutDescriptor): void;
/** Web landmark validation, including the WCAG 2.4.1 bypass-link invariant. */
export declare function validateLayoutWebDescriptor(descriptor: LayoutDescriptor): void;
/**
 * @deprecated Use `validateLayoutRegions` for shared/Native structure or
 * `validateLayoutWebDescriptor` for a Web app shell.
 */
export declare function validateLayoutDescriptor(descriptor: LayoutDescriptor): void;
export type LayoutLandmarkRole = "banner" | "navigation" | "complementary" | "main" | "contentinfo";
/**
 * Web-only translation: real landmark elements exist there. Native has no
 * landmark-role equivalent at all (`accessibilityRole` covers headings and
 * controls, not page regions) — RN renderers instead rely on visual/DOM
 * order plus `accessibilityViewIsModal` for the overlay sidebar case. That
 * asymmetry is documented, not papered over with a fake mapping.
 */
export declare function resolveLayoutWebLandmarks(descriptor: LayoutDescriptor): readonly LayoutLandmarkRole[];
/**
 * Skip link is hidden until it matters — visible only on keyboard focus.
 * A skip link visible at rest fights identity.md's "조용한 화면 위에 중요한
 * 순간만 선명하게": for a mouse/touch user it is noise every screen, for a
 * keyboard user it is the first landmark on the page.
 */
export declare const layoutRecipe: {
    readonly slots: readonly ["root", "skipLink", "header", "sidebar", "main", "footer"];
    readonly defaults: {};
    readonly main: {
        readonly maxWidth: 1200;
        readonly paddingHorizontal: 20;
    };
    readonly sidebar: {
        readonly width: 280;
    };
    readonly skipLink: {
        readonly visibility: "focus-only";
        readonly background: Readonly<{
            source: "theme";
            key: "primary";
            alpha?: number;
        }>;
        readonly color: Readonly<{
            source: "theme";
            key: "onPrimary";
            alpha?: number;
        }>;
        readonly paddingHorizontal: 16;
        readonly paddingVertical: 12;
    };
    readonly states: {
        readonly focus: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly width: 2;
            readonly offset: 2;
        };
    };
};
/**
 * `controlled: []` on purpose: an overlay sidebar's open/dismiss lifecycle
 * is a `SidePanel` (`src/side-panel.ts`) composed as-is. Redeclaring
 * `open`/`defaultOpen`/`onOpenChange`/`dismissPolicy` here would be the same
 * mistake DataTable avoided with Pagination/LoadMore — two places owning
 * one piece of state that will drift the first time either one changes.
 */
export declare const layoutBehavior: {
    readonly controlled: readonly [];
    readonly inputs: readonly ["hasHeader", "hasFooter", "sidebar", "skipLinkLabel"];
    readonly configuration: {
        readonly "sidebar.mode": readonly ["persistent", "overlay"];
        readonly "sidebar.role": readonly ["navigation", "complementary"];
    };
    readonly stateAxes: {};
    readonly web: {
        readonly roles: readonly ["banner", "navigation", "complementary", "main", "contentinfo"];
        readonly keyboard: readonly ["Tab"];
        readonly focus: "native";
    };
    readonly native: {
        readonly roles: readonly [];
        readonly states: readonly [];
        readonly actions: readonly [];
    };
    readonly scenarios: readonly ["exactly-one-main-landmark-exists-per-layout", "web-skip-link-is-required-whenever-a-header-or-sidebar-precedes-main", "sidebar-role-navigation-or-complementary-is-chosen-independent-of-persistent-or-overlay-mode", "overlay-sidebar-reuses-sidepanel-open-state-and-dismiss-policy-unchanged", "header-and-footer-content-is-not-owned-here-compose-topbar-and-bottomnavigation", "skip-link-is-visually-hidden-until-keyboard-focus-reaches-it", "native-has-no-landmark-role-equivalent-translation-relies-on-order-and-accessibilityviewismodal"];
};
//# sourceMappingURL=layout.d.ts.map