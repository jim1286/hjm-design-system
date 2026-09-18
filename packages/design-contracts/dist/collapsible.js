import { motionPreset, spacing } from "./foundations.js";
export function validateCollapsibleOpenState(state) {
    const hasOpen = Object.prototype.hasOwnProperty.call(state, "open");
    const hasDefault = Object.prototype.hasOwnProperty.call(state, "defaultOpen");
    if (hasOpen && hasDefault) {
        throw new TypeError("Collapsible must not provide both open and defaultOpen");
    }
    if (hasOpen && typeof state.onOpenChange !== "function") {
        throw new TypeError("Controlled Collapsible must provide onOpenChange");
    }
}
export const collapsibleRecipe = {
    slots: ["root", "trigger", "content"],
    gap: spacing.xs,
    /** 열고 닫는 것은 같은 자리의 작은 변화라 `enter`/`exit` tier를 쓴다. */
    transition: { enter: motionPreset.enter, exit: motionPreset.exit },
};
export const collapsibleBehavior = {
    controlled: ["open", "defaultOpen", "onOpenChange"],
    stateAxes: {
        availability: ["enabled", "disabled"],
        value: ["open", "closed"],
    },
    web: {
        roles: ["button", "region"],
        keyboard: ["Enter", "Space"],
        focus: "native",
    },
    native: { roles: ["button"], states: ["expanded", "disabled"], actions: ["toggle"] },
    scenarios: [
        "the-trigger-reports-aria-expanded-and-points-at-the-region-it-controls",
        "closed-content-is-removed-from-the-accessibility-tree-not-only-hidden-visually",
        "one-disclosure-has-no-neighbours-so-there-is-no-group-keyboard-model-here",
        "accordion-keeps-the-multi-item-case-including-the-one-open-at-a-time-policy",
    ],
};
//# sourceMappingURL=collapsible.js.map