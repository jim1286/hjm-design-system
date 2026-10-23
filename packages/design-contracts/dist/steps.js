import { control, fontWeight, glyph, motion, spacing, stroke } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
export function validateStepsPresentation(presentation, overviewLabel) {
    if (!["focus", "compact", "vertical"].includes(presentation))
        throw new TypeError(`Unsupported Steps presentation: ${presentation}`);
    if (presentation === "compact" && !overviewLabel?.trim())
        throw new TypeError("Compact Steps requires a localized overviewLabel");
}
export const stepsDefaults = {
    presentation: "focus",
    currentStepStatus: "current",
};
function assertNonEmpty(value, field) {
    if (value.trim().length === 0) {
        throw new TypeError(`Steps ${field} must not be empty`);
    }
}
export function validateStepItemDescriptor(step) {
    assertNonEmpty(step.id, "item id");
    if (step.id !== step.id.trim()) {
        throw new TypeError("Steps item id must not start or end with whitespace");
    }
    assertNonEmpty(step.label, "item label");
    if (step.description !== undefined) {
        assertNonEmpty(step.description, "item description");
    }
}
export function validateStepsDescriptor(descriptor) {
    if (descriptor.navigationMode !== undefined && descriptor.navigationMode !== "linear" && descriptor.navigationMode !== "free") {
        throw new TypeError(`Unsupported Steps navigationMode: ${String(descriptor.navigationMode)}`);
    }
    if (descriptor.steps.length < 2) {
        throw new RangeError("Steps must contain at least two steps");
    }
    const ids = new Set();
    for (const step of descriptor.steps) {
        validateStepItemDescriptor(step);
        if (ids.has(step.id)) {
            throw new TypeError(`Duplicate Steps item id: ${step.id}`);
        }
        ids.add(step.id);
    }
    if (!ids.has(descriptor.currentStepId)) {
        throw new RangeError(`Steps currentStepId does not match any step id: ${String(descriptor.currentStepId)}`);
    }
    if (descriptor.currentStepStatus !== undefined &&
        descriptor.currentStepStatus !== "current" &&
        descriptor.currentStepStatus !== "error" &&
        descriptor.currentStepStatus !== "complete") {
        throw new TypeError(`Unsupported Steps currentStepStatus: ${String(descriptor.currentStepStatus)}`);
    }
}
export function validateStepsStatusLabels(labels) {
    if (labels === null || typeof labels !== "object") {
        throw new TypeError("Steps statusLabels must be an object");
    }
    for (const key of ["pending", "current", "complete", "error"]) {
        const value = labels[key];
        if (typeof value !== "string" || value.trim().length === 0) {
            throw new TypeError(`Steps statusLabels.${key} must not be empty`);
        }
    }
}
/** A step is visually and semantically "reached" once it is no longer waiting. */
export function isStepReached(status) {
    return status !== "pending";
}
/**
 * Derives every step's status from its position relative to the single
 * cursor, then attaches the order-preserving accessible name and the
 * supplementary status announcement. Throws on a malformed descriptor,
 * labels bag, or composer instead of silently rendering an inconsistent flow.
 */
export function resolveStepsDescriptor(descriptor, options) {
    validateStepsDescriptor(descriptor);
    validateStepsStatusLabels(options.statusLabels);
    if (typeof options.composeAccessibleName !== "function") {
        throw new TypeError("Steps composeAccessibleName must be a function");
    }
    const currentStepStatus = descriptor.currentStepStatus ?? stepsDefaults.currentStepStatus;
    const total = descriptor.steps.length;
    const cursorIndex = descriptor.steps.findIndex((step) => step.id === descriptor.currentStepId);
    return descriptor.steps.map((step, index) => {
        const status = index < cursorIndex
            ? "complete"
            : index > cursorIndex
                ? "pending"
                : currentStepStatus;
        const position = index + 1;
        const accessibleName = options.composeAccessibleName({
            position,
            total,
            label: step.label,
        });
        if (typeof accessibleName !== "string" || accessibleName.trim().length === 0) {
            throw new TypeError("Steps composeAccessibleName must return a non-empty string");
        }
        return {
            ...step,
            status,
            position,
            total,
            accessibleName,
            statusLabel: options.statusLabels[status],
            revisitable: index < cursorIndex,
        };
    });
}
export const stepsRecipe = {
    slots: [
        "root",
        "step",
        "indicator",
        "marker",
        "connector",
        "label",
        "description",
    ],
    gap: spacing.xs,
    // Spint review (2026-10-21): keep endpoint marks inset and give illustrated marks breathing room.
    paddingInline: spacing.md,
    indicator: {
        size: glyph.xl,
        // Illustrated product marks retain the space approved in the Spint review.
        customSize: glyph.xxl,
        borderWidth: stroke.default,
        activeBorderWidth: stroke.strong,
        /** null means the renderer shows the step's own position number instead of a glyph. */
        marks: {
            pending: null,
            current: null,
            complete: "check",
            error: "error",
        },
        border: {
            pending: semanticColors.border.default,
            current: semanticColors.content.primary,
            complete: semanticColors.border.control,
            error: semanticColors.feedback.danger.border,
        },
        background: {
            pending: null,
            current: semanticColors.content.primary,
            complete: null,
            error: semanticColors.feedback.danger.badgeBackground,
        },
        content: {
            pending: semanticColors.content.secondary,
            current: semanticColors.canvas,
            complete: semanticColors.content.primary,
            error: semanticColors.feedback.danger.foreground,
        },
    },
    connector: {
        height: stroke.default,
        tone: {
            reached: semanticColors.content.primary,
            unreached: semanticColors.border.default,
        },
    },
    label: {
        textVariant: "label",
        fontWeight: fontWeight.medium,
        color: {
            pending: semanticColors.content.secondary,
            current: semanticColors.content.primary,
            complete: semanticColors.content.primary,
            error: semanticColors.feedback.danger.foreground,
        },
    },
    description: {
        textVariant: "caption",
        color: semanticColors.content.secondary,
    },
    /** A revisitable step is one button over its marker and label; the shared touch minimum applies to the whole cell. */
    press: {
        minTouchTarget: control.minTouchTarget,
    },
    // User selected the focus proposal on 2026-10-23: neutral current fill, quieter completed rail.
    transitionDuration: motion.normal,
    segmentHeight: spacing.xxs,
};
//# sourceMappingURL=steps.js.map