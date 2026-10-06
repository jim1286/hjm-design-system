import { collectionItemContract, fieldFrameContract, floatingSurfaceContract, } from "./component-contracts.js";
import { backdrop, motionPreset, spacing } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
export const commandPaletteBehaviorDefaults = {
    dismissible: true,
    outsideDismiss: true,
    escapeDismiss: true,
};
export function canDismissCommandPalette(reason, policy = commandPaletteBehaviorDefaults) {
    if (reason === "programmatic" || reason === "activation")
        return true;
    if (!policy.dismissible)
        return false;
    if (reason === "outside")
        return policy.outsideDismiss;
    if (reason === "escape")
        return policy.escapeDismiss;
    return true;
}
function assertNonEmpty(value, field) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new TypeError(`CommandPalette ${field} must not be empty`);
    }
}
export function validateCommandPaletteDescriptor(descriptor) {
    if (descriptor === null || typeof descriptor !== "object") {
        throw new TypeError("CommandPalette descriptor must be an object");
    }
    assertNonEmpty(descriptor.accessibilityLabel, "accessibilityLabel");
    assertNonEmpty(descriptor.searchPlaceholder, "searchPlaceholder");
    for (const f of ["emptyMessage", "closeLabel"]) {
        const v = descriptor[f];
        if (v !== undefined)
            assertNonEmpty(v, f);
    }
}
// Anatomy only; reuses Dialog/Menu chrome tokens. Rationale: docs/command-palette.md
// "HJM 기본값" (moved out of JSDoc 2026-10-06 because dist keeps comments and the
// behaviors bundle that re-exports this module sits at its byte budget).
export const commandPaletteRecipe = {
    slots: [
        "backdrop",
        "positioner",
        "content",
        "searchField",
        "viewport",
        "section",
        "sectionLabel",
        "item",
        "leading",
        "copy",
        "label",
        "description",
        "shortcut",
        "emptyState",
    ],
    backdrop: backdrop.modal,
    content: {
        background: floatingSurfaceContract.background,
        border: floatingSurfaceContract.border,
        borderWidth: floatingSurfaceContract.borderWidth,
        radius: "lg",
        shadow: floatingSurfaceContract.shadow,
        maxWidth: 560,
        maxHeight: 420,
    },
    searchField: {
        minHeight: fieldFrameContract.minHeight,
        paddingHorizontal: fieldFrameContract.paddingHorizontal,
        borderColor: fieldFrameContract.border,
    },
    item: collectionItemContract,
    sectionLabel: {
        color: semanticColors.content.secondary,
        textVariant: "label",
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
    emptyState: {
        color: semanticColors.content.secondary,
        textVariant: "body",
        paddingVertical: spacing.xl,
    },
    transition: { enter: motionPreset.enter, exit: motionPreset.exit },
};
export const commandPaletteBehaviorScenarios = [
    "activating-a-result-always-closes-the-palette-regardless-of-dismiss-policy",
    "escape-and-outside-close-without-running-any-command",
    "sections-merge-recents-static-commands-and-search-results-without-a-new-data-model",
    "keyboard-navigation-and-typeahead-reuse-the-shared-collection-helpers-unchanged",
    "local-vs-external-filtering-reuses-comboboxcollectionstate-staleness-guard-unchanged",
    "empty-result-state-is-announced-once-not-per-section",
    "no-global-shortcut-binding-is-owned-here-the-product-decides-the-trigger-key",
    "activate-after-dismiss-lets-a-command-open-the-next-overlay-only-once-exit-completes",
];
//# sourceMappingURL=command-palette.js.map