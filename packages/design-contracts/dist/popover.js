import { floatingSurfaceContract } from "./component-contracts.js";
import { motionPreset, spacing } from "./foundations.js";
export const popoverDescriptorDefaults = {
    placement: "bottom",
    align: "start",
};
export const popoverBehaviorDefaults = {
    dismissible: true,
    outsideDismiss: true,
    escapeDismiss: true,
    focusOutDismiss: true,
};
const placements = new Set(["top", "bottom", "start", "end"]);
const alignments = new Set(["start", "center", "end"]);
const descriptorKeys = new Set(["placement", "align", "accessibilityLabel"]);
const openStateKeys = new Set(["open", "defaultOpen", "onOpenChange"]);
function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
function rejectUnknownKeys(value, allowed, field) {
    for (const key of Object.keys(value)) {
        if (!allowed.has(key)) {
            throw new TypeError(`Unsupported Popover ${field} field: ${key}`);
        }
    }
}
export function validatePopoverDescriptor(descriptor) {
    if (!isObject(descriptor)) {
        throw new TypeError("Popover descriptor must be an object");
    }
    rejectUnknownKeys(descriptor, descriptorKeys, "descriptor");
    if (descriptor.placement !== undefined &&
        !placements.has(descriptor.placement)) {
        throw new TypeError(`Unsupported Popover placement: ${String(descriptor.placement)}`);
    }
    if (descriptor.align !== undefined && !alignments.has(descriptor.align)) {
        throw new TypeError(`Unsupported Popover align: ${String(descriptor.align)}`);
    }
    if (descriptor.accessibilityLabel !== undefined) {
        if (typeof descriptor.accessibilityLabel !== "string" ||
            descriptor.accessibilityLabel.trim().length === 0) {
            throw new TypeError("Popover accessibilityLabel must not be empty");
        }
        if (descriptor.accessibilityLabel !== descriptor.accessibilityLabel.trim()) {
            throw new TypeError("Popover accessibilityLabel must not start or end with whitespace");
        }
    }
}
export function resolvePopoverDescriptor(descriptor) {
    validatePopoverDescriptor(descriptor);
    return {
        placement: descriptor.placement ?? popoverDescriptorDefaults.placement,
        align: descriptor.align ?? popoverDescriptorDefaults.align,
        ...(descriptor.accessibilityLabel !== undefined
            ? { accessibilityLabel: descriptor.accessibilityLabel }
            : {}),
    };
}
export function validatePopoverOpenState(state) {
    if (!isObject(state)) {
        throw new TypeError("Popover open state must be an object");
    }
    rejectUnknownKeys(state, openStateKeys, "open state");
    const runtime = state;
    const hasOpen = Object.prototype.hasOwnProperty.call(runtime, "open");
    const hasDefaultOpen = Object.prototype.hasOwnProperty.call(runtime, "defaultOpen");
    if (hasOpen) {
        if (typeof runtime.open !== "boolean") {
            throw new TypeError("Popover open must be a boolean");
        }
        if (hasDefaultOpen) {
            throw new TypeError("Controlled Popover must not provide defaultOpen");
        }
        if (typeof runtime.onOpenChange !== "function") {
            throw new TypeError("Controlled Popover must provide onOpenChange");
        }
        return;
    }
    if (hasDefaultOpen && typeof runtime.defaultOpen !== "boolean") {
        throw new TypeError("Popover defaultOpen must be a boolean");
    }
    if (runtime.onOpenChange !== undefined &&
        typeof runtime.onOpenChange !== "function") {
        throw new TypeError("Popover onOpenChange must be a function");
    }
}
/**
 * Resolves an attempted close without platform knowledge, mirroring
 * canDismissSheet. Programmatic close is always an owner override.
 */
export function canDismissPopover(reason, policy = popoverBehaviorDefaults) {
    if (reason === "programmatic")
        return true;
    if (!policy.dismissible)
        return false;
    if (reason === "outside-pointer")
        return policy.outsideDismiss;
    if (reason === "outside-focus")
        return policy.focusOutDismiss;
    if (reason === "escape")
        return policy.escapeDismiss;
    return true;
}
/**
 * Positioning boundary is identical to Tooltip's: HJM owns preferred
 * placement, spacing, and motion; DOM measurement, portal, flip/shift, and
 * RTL logical-to-physical translation stay in the product Web renderer's
 * private AnchoredOverlay (see docs/tooltip.md "Positioning boundary"). This
 * module never exposes that internal tool, so Popover cannot regress Tooltip's
 * "no public collision/portal API" boundary.
 */
export const popoverRecipe = {
    slots: ["trigger", "content", "arrow", "closeAction"],
    surface: floatingSurfaceContract,
    arrow: { size: spacing.xxs, offset: spacing.xxs },
    sideOffset: spacing.xs,
    collisionPadding: spacing.xs,
    minWidth: 240,
    maxWidth: 360,
    transition: { enter: motionPreset.enter, exit: motionPreset.exit },
};
/**
 * Literal scenario names for behaviorRegistry.popover (lead wires into
 * src/behaviors.ts). Kept here, not there, so this module stays self-contained
 * per the authoring brief.
 */
export const popoverBehaviorScenarios = [
    "focus-enters-surface-on-open",
    "escape-closes-and-restores-trigger-focus",
    "outside-pointer-close-does-not-cancel-the-original-interaction",
    "tabbing-past-last-focusable-child-closes-without-trapping",
    "controlled-owner-programmatic-close-always-wins",
    "close-action-inside-content-closes-exactly-once",
    "trigger-while-open-does-not-reopen",
    "one-visible-popover-per-trigger",
];
//# sourceMappingURL=popover.js.map