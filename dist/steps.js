import { glyph, spacing, stroke } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
export const stepsDefaults = {
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
        descriptor.currentStepStatus !== "error") {
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
    indicator: {
        size: glyph.md,
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
            current: semanticColors.content.brand,
            complete: semanticColors.feedback.success.border,
            error: semanticColors.feedback.danger.border,
        },
        background: {
            pending: null,
            current: null,
            complete: semanticColors.feedback.success.badgeBackground,
            error: semanticColors.feedback.danger.badgeBackground,
        },
        content: {
            pending: semanticColors.content.secondary,
            current: semanticColors.content.brand,
            complete: semanticColors.feedback.success.foreground,
            error: semanticColors.feedback.danger.foreground,
        },
    },
    connector: {
        height: stroke.default,
        tone: {
            reached: semanticColors.content.brand,
            unreached: semanticColors.border.default,
        },
    },
    label: {
        textVariant: "label",
        fontWeight: "600",
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
};
//# sourceMappingURL=steps.js.map