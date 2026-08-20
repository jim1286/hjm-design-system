import { floatingSurfaceContract, focusIndicatorContract } from "./component-contracts.js";
import { backdrop, control, fontWeight, motionPreset, shadow, spacing, } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
export const sidePanelBehaviorDefaults = {
    modal: true,
    dismissible: true,
    dismissWhileBusy: false,
    escapeDismiss: true,
    outsideDismiss: true,
};
/**
 * Same shape and role as `canDismissSheet`, kept as a separate function
 * because the two owning types are not generic over each other (`sheet.ts`
 * is a shared file this module must not edit) and the `modal` branch is
 * genuine new logic, not a copy.
 */
export function canDismissSidePanel(reason, busy, policy = sidePanelBehaviorDefaults) {
    if (reason === "programmatic")
        return true;
    if (!policy.dismissible)
        return false;
    if (busy && !policy.dismissWhileBusy)
        return false;
    if (reason === "outside")
        return policy.modal ? policy.outsideDismiss : false;
    if (reason === "escape")
        return policy.escapeDismiss;
    return true;
}
/**
 * No `createSidePanelLifecycle` counterpart to `createSheetLifecycle`: that
 * machinery exists solely to make Android's persistently-mounted native
 * Modal settle one visible cycle at a time. SidePanel is Web-only, where a
 * plain CSS `transitionend`/exit-callback (the same pattern `sheetRecipe`
 * and `dialogRecipe` already assume for Web) is the whole story — adding a
 * cycle counter here would solve a problem this platform does not have.
 */
export const sidePanelRecipe = {
    slots: ["backdrop", "positioner", "content", "header", "title", "body", "footer", "close"],
    defaults: { edge: "end", size: "regular" },
    sizes: { compact: 320, regular: 400, wide: 560 },
    backdrop: backdrop.modal,
    content: {
        background: semanticColors.canvas,
        border: semanticColors.border.default,
        borderWidth: floatingSurfaceContract.borderWidth,
        /** Flush to the viewport edge it docks to — unlike Sheet's floating `xl` radius. */
        radius: null,
        shadow: shadow.overlay,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,
    },
    header: { minHeight: control.minTouchTarget, gap: spacing.sm },
    title: {
        color: semanticColors.content.primary,
        textVariant: "title",
        fontWeight: fontWeight.bold,
    },
    body: {
        color: semanticColors.content.body,
        textVariant: "body",
        gap: spacing.md,
    },
    footer: {
        color: semanticColors.content.body,
        textVariant: "body",
        gap: spacing.sm,
        paddingTop: spacing.sm,
    },
    transition: { enter: motionPreset.enter, exit: motionPreset.exit },
    states: { focus: focusIndicatorContract },
};
/**
 * `web.focus` can only hold one value, but the real behavior branches on
 * `modal`: `"trap"` (default, modal) vs. no trap at all when `modal: false`.
 * The field records the default configuration; the non-modal case is a
 * documented exception in `docs/side-panel.md`, the same way this contract
 * records one representative value elsewhere and pushes edge cases to
 * `scenarios`.
 */
export const sidePanelBehavior = {
    controlled: ["open", "defaultOpen", "onOpenChange", "dismissPolicy"],
    defaults: sidePanelBehaviorDefaults,
    configuration: {
        edge: ["start", "end"],
        modal: ["true", "false"],
    },
    stateAxes: {
        availability: ["enabled", "busy"],
        value: ["open"],
    },
    web: {
        roles: ["dialog"],
        keyboard: ["Tab", "Escape"],
        focus: "trap",
        dismiss: ["escape", "outside"],
    },
    native: { roles: [], states: [], actions: [] },
    scenarios: [
        "edge-is-a-logical-start-or-end-direction-never-left-or-right",
        "modal-panels-trap-focus-and-lock-scroll-non-modal-panels-do-neither",
        "non-modal-panels-never-expose-outside-dismiss-the-type-forbids-it",
        "single-dismiss-callback-reports-the-concrete-reason",
        "busy-blocks-user-dismiss-programmatic-owner-close-is-always-allowed",
        "escape-dismisses-in-both-modal-and-non-modal-panels",
        "no-back-or-swipe-dismiss-reason-exists-on-this-web-only-platform",
        "reduced-motion-still-completes-the-exit-callback-once",
    ],
};
//# sourceMappingURL=side-panel.js.map