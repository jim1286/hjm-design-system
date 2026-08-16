import { control, radius, spacing, typography } from "./foundations.js";
/** Typed recipe; platform renderers translate the same intent to their own primitives. */
export const buttonRecipe = {
    slots: ["root", "leading", "label", "trailing", "spinner"],
    defaults: { tone: "primary", size: "medium" },
    tones: {
        primary: { background: "primary", content: "onPrimary", border: null },
        secondary: { background: "surfaceAlt", content: "text", border: "border" },
        ghost: { background: null, content: "textMuted", border: null },
        danger: { background: "dangerFill", content: "onDanger", border: null },
    },
    sizes: {
        small: {
            height: control.buttonHeight.small,
            hitSlop: control.buttonHitSlop.small,
            paddingHorizontal: spacing.sm,
            textVariant: "label",
        },
        medium: {
            height: control.buttonHeight.medium,
            hitSlop: control.buttonHitSlop.medium,
            paddingHorizontal: spacing.md,
            textVariant: "body",
        },
        large: {
            height: control.buttonHeight.large,
            hitSlop: control.buttonHitSlop.large,
            paddingHorizontal: spacing.lg,
            textVariant: "bodyLarge",
        },
    },
    opacity: {
        disabled: 0.5,
        pressed: 0.86,
    },
};
export const surfaceRecipe = {
    default: {
        background: "surface",
        border: "border",
        borderAlpha: 1,
        elevated: false,
    },
    raised: {
        background: "bg",
        border: "border",
        borderAlpha: 1,
        elevated: true,
    },
    accent: {
        background: "surfaceAccent",
        border: "primary",
        borderAlpha: 0.3,
        elevated: false,
    },
};
export const fieldRecipe = {
    slots: [
        "root",
        "label",
        "control",
        "leading",
        "input",
        "trailing",
        "hint",
        "error",
    ],
    defaults: { variant: "surface", shape: "medium" },
    variants: {
        surface: { background: "surface" },
        inset: { background: "bg" },
    },
    shapes: {
        medium: "md",
        large: "lg",
        full: "full",
    },
    states: {
        idle: { border: "textMuted" },
        focused: { border: "contentBrand" },
        invalid: { border: "danger" },
    },
    minHeight: control.minTouchTarget,
    multilineMinHeight: 80,
    borderWidth: 1,
    focusRingWidth: 2,
    focusRingOffset: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textVariant: "body",
    label: {
        color: "textBody",
        textVariant: "body",
        fontWeight: "600",
        gap: spacing.xs,
    },
    support: {
        hintColor: "textMuted",
        errorColor: "danger",
        textVariant: "label",
        gap: 6,
    },
    placeholder: { color: "textMuted" },
    disabledOpacity: 0.6,
};
export { accordionRecipe, alertDialogRecipe, avatarRecipe, badgeRecipe, bottomNavigationRecipe, bottomCtaRecipe, chipRecipe, comboboxRecipe, counterBadgeRecipe, dialogRecipe, dividerRecipe, emptyStateRecipe, formatCounterBadgeCount, iconButtonRecipe, iconRecipe, linkRecipe, listRecipe, listRowRecipe, loadMoreRecipe, menuRecipe, noticeRecipe, progressRecipe, searchFieldRecipe, selectRecipe, selectionGroupRecipe, sectionRecipe, segmentedControlRecipe, selectionControlRecipe, sheetRecipe, skeletonRecipe, spinnerRecipe, stackRecipe, statisticRecipe, switchRecipe, tabsRecipe, textRecipe, toastRecipe, tooltipRecipe, topBarRecipe, } from "./component-recipes.js";
//# sourceMappingURL=recipes.js.map