import { backdrop, motionPreset, spacing } from "./foundations.js";
import { floatingSurfaceContract } from "./component-contracts.js";
/**
 * The only fixed policy this contract has: outside dismiss is never allowed.
 * There is no `dismissible`/`escapeDismiss` bag to configure, unlike Popover
 * — Escape and the Skip action always work (the brief's "탈출" requirement is
 * non-negotiable), so there is nothing left to make optional.
 */
export const tourBehaviorDefaults = {
    outsideDismiss: false,
};
function assertNonEmpty(value, field) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new TypeError(`Tour ${field} must not be empty`);
    }
}
const placements = new Set(["top", "bottom", "start", "end"]);
const aligns = new Set(["start", "center", "end"]);
export function validateTourStepDescriptor(step) {
    assertNonEmpty(step.id, "step id");
    if (step.id !== step.id.trim()) {
        throw new TypeError("Tour step id must not start or end with whitespace");
    }
    assertNonEmpty(step.anchorId, "step anchorId");
    assertNonEmpty(step.title, "step title");
    assertNonEmpty(step.description, "step description");
    if (step.placement !== undefined && !placements.has(step.placement)) {
        throw new TypeError(`Unsupported Tour step placement: ${String(step.placement)}`);
    }
    if (step.align !== undefined && !aligns.has(step.align)) {
        throw new TypeError(`Unsupported Tour step align: ${String(step.align)}`);
    }
}
export function validateTourLabels(labels) {
    if (labels === null || typeof labels !== "object") {
        throw new TypeError("Tour labels must be an object");
    }
    for (const field of ["next", "previous", "skip", "done"]) {
        const value = labels[field];
        if (typeof value !== "string" || value.trim().length === 0) {
            throw new TypeError(`Tour labels.${field} must not be empty`);
        }
    }
}
/**
 * Duplicate `anchorId` values across steps are accepted on purpose (see the
 * type doc above) — only `id` must be unique. A validator that rejected
 * repeated anchors would block a legitimate two-part explanation of one
 * element.
 */
export function validateTourDescriptor(descriptor) {
    assertNonEmpty(descriptor.accessibilityLabel, "accessibilityLabel");
    if (!Array.isArray(descriptor.steps) || descriptor.steps.length === 0) {
        throw new RangeError("Tour must contain at least one step");
    }
    validateTourLabels(descriptor.labels);
    const ids = new Set();
    for (const step of descriptor.steps) {
        validateTourStepDescriptor(step);
        if (ids.has(step.id)) {
            throw new TypeError(`Duplicate Tour step id: ${step.id}`);
        }
        ids.add(step.id);
    }
    if (!ids.has(descriptor.currentStepId)) {
        throw new RangeError(`Tour currentStepId does not match any step id: ${String(descriptor.currentStepId)}`);
    }
}
const openStateKeys = new Set(["open", "defaultOpen", "onOpenChange"]);
export function validateTourOpenState(state) {
    if (state === null || typeof state !== "object") {
        throw new TypeError("Tour open state must be an object");
    }
    const runtime = state;
    for (const key of Object.keys(runtime)) {
        if (!openStateKeys.has(key)) {
            throw new TypeError(`Unsupported Tour open state field: ${key}`);
        }
    }
    const hasOpen = Object.prototype.hasOwnProperty.call(runtime, "open");
    const hasDefaultOpen = Object.prototype.hasOwnProperty.call(runtime, "defaultOpen");
    if (hasOpen) {
        if (typeof runtime.open !== "boolean") {
            throw new TypeError("Tour open must be a boolean");
        }
        if (hasDefaultOpen) {
            throw new TypeError("Controlled Tour must not provide defaultOpen");
        }
        if (typeof runtime.onOpenChange !== "function") {
            throw new TypeError("Controlled Tour must provide onOpenChange");
        }
        return;
    }
    if (hasDefaultOpen && typeof runtime.defaultOpen !== "boolean") {
        throw new TypeError("Tour defaultOpen must be a boolean");
    }
    if (runtime.onOpenChange !== undefined && typeof runtime.onOpenChange !== "function") {
        throw new TypeError("Tour onOpenChange must be a function");
    }
}
/**
 * Resolves every step eagerly (not just the current one) so a renderer can
 * pre-render adjacent step cards without re-deriving position/total, mirroring
 * `resolveStepsDescriptor`. Throws if the composer returns an empty
 * announcement instead of silently leaving screen reader users with nothing.
 */
export function resolveTourDescriptor(descriptor, options) {
    validateTourDescriptor(descriptor);
    if (typeof options.composeAnnouncement !== "function") {
        throw new TypeError("Tour composeAnnouncement must be a function");
    }
    const total = descriptor.steps.length;
    const cursorIndex = descriptor.steps.findIndex((step) => step.id === descriptor.currentStepId);
    const steps = descriptor.steps.map((step, index) => {
        const position = index + 1;
        const announcement = options.composeAnnouncement({
            position,
            total,
            title: step.title,
            description: step.description,
        });
        if (typeof announcement !== "string" || announcement.trim().length === 0) {
            throw new TypeError("Tour composeAnnouncement must return a non-empty string");
        }
        return { ...step, position, total, announcement };
    });
    return {
        accessibilityLabel: descriptor.accessibilityLabel,
        steps,
        // Safe: validateTourDescriptor already confirmed currentStepId matches a step.
        currentStep: steps[cursorIndex],
        isFirstStep: cursorIndex === 0,
        isLastStep: cursorIndex === total - 1,
    };
}
/**
 * Pure decision, no stateful session: Tour has no async side effect to guard
 * (unlike AlertDialog's confirm), so there is no busy/error phase to own —
 * only "what step comes next," which is exactly what a renderer needs to call
 * `onStepChange`/`onOpenChange` itself. This follows Popover's lighter
 * pattern rather than AlertDialog's session, since nothing here needs
 * exactly-once side-effect guarding, only the ordinary exactly-once event
 * delivery a renderer's own callback already provides.
 */
export function resolveTourAdvance(descriptor, reason) {
    validateTourDescriptor(descriptor);
    if (reason !== "next" && reason !== "previous") {
        throw new TypeError(`Unsupported Tour advance reason: ${String(reason)}`);
    }
    const cursorIndex = descriptor.steps.findIndex((step) => step.id === descriptor.currentStepId);
    if (reason === "previous") {
        if (cursorIndex === 0)
            return { type: "no-op" };
        // Safe: cursorIndex > 0 here, so cursorIndex - 1 is always in bounds.
        return { type: "step", stepId: descriptor.steps[cursorIndex - 1].id };
    }
    if (cursorIndex === descriptor.steps.length - 1) {
        return { type: "close", reason: "complete" };
    }
    // Safe: cursorIndex is not the last index here, so cursorIndex + 1 is in bounds.
    return { type: "step", stepId: descriptor.steps[cursorIndex + 1].id };
}
/**
 * The step card reuses the same anchored floating-surface anatomy as
 * Tooltip/Popover instead of declaring new chrome. The backdrop reuses the
 * stronger `backdrop.modal` veil (not `backdrop.veil`) because Tour, like
 * Dialog/Sheet, blocks background interaction while open — `veil` is used
 * where the surface underneath stays reachable, which Tour's fixed
 * `outsideDismiss: false` policy says it does not.
 */
export const tourRecipe = {
    slots: [
        "backdrop",
        "card",
        "title",
        "description",
        "counter",
        "previousAction",
        "nextAction",
        "skipAction",
    ],
    card: floatingSurfaceContract,
    backdrop: backdrop.modal,
    maxWidth: 320,
    gap: spacing.sm,
    sideOffset: spacing.xs,
    /**
     * `context` (320ms, opacity under Reduce Motion): moving from one step's
     * card/highlight to the next is a jump between unrelated parts of the
     * screen, the same "큰 화면 요소와 맥락 전환" tier Sheet/Dialog use, not a
     * small in-place state change.
     */
    transition: { enter: motionPreset.context, exit: motionPreset.exit },
};
/**
 * Literal scenario names for behaviorRegistry.tour (lead wires into
 * src/behaviors.ts). Kept here, not there, so this module stays
 * self-contained per the authoring brief.
 */
export const tourBehaviorScenarios = [
    "focus-moves-to-the-step-card-on-every-step-change-not-the-anchor",
    "background-is-inert-while-a-tour-is-open",
    "escape-and-skip-always-exit-regardless-of-step",
    "outside-pointer-does-not-dismiss",
    "next-on-the-last-step-closes-with-reason-complete",
    "previous-on-the-first-step-is-a-no-op",
    "controlled-owner-programmatic-close-always-wins",
    "unmount-or-route-change-settles-as-interrupted-exactly-once",
    "reduced-motion-crossfades-the-card-without-traveling-between-anchors",
];
//# sourceMappingURL=tour.js.map