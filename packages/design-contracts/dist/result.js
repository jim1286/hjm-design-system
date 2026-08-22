import { semanticColors } from "./semantic-colors.js";
import { fontWeight, spacing } from "./foundations.js";
export const resultDefaults = {
    status: "info",
};
function assertCopy(value, field) {
    if (value.trim().length === 0) {
        throw new TypeError(`Result ${field} must not be empty`);
    }
}
export function validateResultAction(action, field) {
    assertCopy(action.label, `${field}.label`);
    if (action.accessibilityLabel !== undefined) {
        assertCopy(action.accessibilityLabel, `${field}.accessibilityLabel`);
    }
    if (typeof action.onAction !== "function") {
        throw new TypeError(`Result ${field}.onAction must be a function`);
    }
}
export function validateResultDescriptor(descriptor) {
    if (descriptor.status !== "success" &&
        descriptor.status !== "failure" &&
        descriptor.status !== "info") {
        throw new TypeError(`Unsupported Result status: ${String(descriptor.status)}`);
    }
    assertCopy(descriptor.title, "title");
    if (descriptor.description !== undefined) {
        assertCopy(descriptor.description, "description");
    }
    const actions = descriptor.actions ?? [];
    if (actions.length > 2) {
        throw new RangeError("Result supports at most one primary and one secondary action");
    }
    actions.forEach((action, index) => {
        validateResultAction(action, index === 0 ? "primaryAction" : "secondaryAction");
    });
}
function resolveAction(action) {
    if (!action)
        return null;
    return {
        label: action.label,
        accessibilityLabel: action.accessibilityLabel ?? action.label,
        onAction: action.onAction,
    };
}
export function resolveResultDescriptor(descriptor) {
    validateResultDescriptor(descriptor);
    const actions = descriptor.actions ?? [];
    return {
        status: descriptor.status,
        title: descriptor.title,
        description: descriptor.description ?? null,
        primaryAction: resolveAction(actions[0]),
        secondaryAction: resolveAction(actions[1]),
    };
}
export const resultRecipe = {
    slots: [
        "root",
        "icon",
        "title",
        "description",
        "primaryAction",
        "secondaryAction",
    ],
    defaults: resultDefaults,
    tones: {
        success: {
            icon: semanticColors.feedback.success.foreground,
            iconBackground: semanticColors.feedback.success.badgeBackground,
        },
        failure: {
            icon: semanticColors.feedback.danger.foreground,
            iconBackground: semanticColors.feedback.danger.badgeBackground,
        },
        info: {
            icon: semanticColors.feedback.info.foreground,
            iconBackground: semanticColors.feedback.info.badgeBackground,
        },
    },
    iconSize: "xl",
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    title: {
        textVariant: "titleLarge",
        color: semanticColors.content.primary,
        fontWeight: fontWeight.bold,
    },
    description: {
        textVariant: "body",
        color: semanticColors.content.secondary,
    },
    actionsGap: spacing.sm,
};
//# sourceMappingURL=result.js.map