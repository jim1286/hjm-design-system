import { focusIndicatorContract } from "./component-contracts.js";
import { layout as layoutFoundation, spacing } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
function assertNonEmpty(value, field) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new TypeError(`Layout ${field} must not be empty`);
    }
}
/**
 * Cross-platform structure validation. This deliberately does not require a
 * skip link: Native has no page-landmark or bypass-link equivalent.
 */
export function validateLayoutRegions(descriptor) {
    if (descriptor.sidebar !== undefined) {
        const { role, mode, label } = descriptor.sidebar;
        if (role !== "navigation" && role !== "complementary") {
            throw new TypeError(`Unsupported Layout sidebar role: ${String(role)}`);
        }
        if (mode !== "persistent" && mode !== "overlay") {
            throw new TypeError(`Unsupported Layout sidebar mode: ${String(mode)}`);
        }
        assertNonEmpty(label, "sidebar.label");
    }
    if (descriptor.skipLinkLabel !== undefined) {
        assertNonEmpty(descriptor.skipLinkLabel, "skipLinkLabel");
    }
}
/** Web landmark validation, including the WCAG 2.4.1 bypass-link invariant. */
export function validateLayoutWebDescriptor(descriptor) {
    validateLayoutRegions(descriptor);
    const needsSkipLink = descriptor.hasHeader === true || descriptor.sidebar !== undefined;
    if (needsSkipLink && descriptor.skipLinkLabel === undefined) {
        throw new TypeError("Layout requires skipLinkLabel when a header or sidebar region precedes main");
    }
}
/**
 * @deprecated Use `validateLayoutRegions` for shared/Native structure or
 * `validateLayoutWebDescriptor` for a Web app shell.
 */
export function validateLayoutDescriptor(descriptor) {
    validateLayoutWebDescriptor(descriptor);
}
/**
 * Web-only translation: real landmark elements exist there. Native has no
 * landmark-role equivalent at all (`accessibilityRole` covers headings and
 * controls, not page regions) — RN renderers instead rely on visual/DOM
 * order plus `accessibilityViewIsModal` for the overlay sidebar case. That
 * asymmetry is documented, not papered over with a fake mapping.
 */
export function resolveLayoutWebLandmarks(descriptor) {
    validateLayoutWebDescriptor(descriptor);
    const roles = [];
    if (descriptor.hasHeader)
        roles.push("banner");
    if (descriptor.sidebar)
        roles.push(descriptor.sidebar.role);
    roles.push("main");
    if (descriptor.hasFooter)
        roles.push("contentinfo");
    return roles;
}
/**
 * Skip link is hidden until it matters — visible only on keyboard focus.
 * A skip link visible at rest fights identity.md's "조용한 화면 위에 중요한
 * 순간만 선명하게": for a mouse/touch user it is noise every screen, for a
 * keyboard user it is the first landmark on the page.
 */
export const layoutRecipe = {
    slots: ["root", "skipLink", "header", "sidebar", "main", "footer"],
    defaults: {},
    main: {
        maxWidth: layoutFoundation.contentMaxWidth,
        paddingHorizontal: layoutFoundation.pagePadding.regular,
    },
    sidebar: {
        width: 280,
    },
    skipLink: {
        visibility: "focus-only",
        background: semanticColors.action.brand.background,
        color: semanticColors.action.brand.content,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    states: { focus: focusIndicatorContract },
};
/**
 * `controlled: []` on purpose: an overlay sidebar's open/dismiss lifecycle
 * is a `SidePanel` (`src/side-panel.ts`) composed as-is. Redeclaring
 * `open`/`defaultOpen`/`onOpenChange`/`dismissPolicy` here would be the same
 * mistake DataTable avoided with Pagination/LoadMore — two places owning
 * one piece of state that will drift the first time either one changes.
 */
export const layoutBehavior = {
    controlled: [],
    inputs: ["hasHeader", "hasFooter", "sidebar", "skipLinkLabel"],
    configuration: {
        "sidebar.mode": ["persistent", "overlay"],
        "sidebar.role": ["navigation", "complementary"],
    },
    stateAxes: {},
    web: {
        roles: ["banner", "navigation", "complementary", "main", "contentinfo"],
        keyboard: ["Tab"],
        focus: "native",
    },
    native: { roles: [], states: [], actions: [] },
    scenarios: [
        "exactly-one-main-landmark-exists-per-layout",
        "web-skip-link-is-required-whenever-a-header-or-sidebar-precedes-main",
        "sidebar-role-navigation-or-complementary-is-chosen-independent-of-persistent-or-overlay-mode",
        "overlay-sidebar-reuses-sidepanel-open-state-and-dismiss-policy-unchanged",
        "header-and-footer-content-is-not-owned-here-compose-topbar-and-bottomnavigation",
        "skip-link-is-visually-hidden-until-keyboard-focus-reaches-it",
        "native-has-no-landmark-role-equivalent-translation-relies-on-order-and-accessibilityviewismodal",
    ],
};
//# sourceMappingURL=layout.js.map