import type { ColorReference } from "./color-references.js";
import type { TextVariant } from "./foundations.js";
import type { SemanticIconName } from "./icon.js";
import { glyph, spacing, stroke } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

/**
 * Ant Design Steps' full surface (navigation/clickable jump, dot type, custom
 * per-item icon, vertical orientation) is intentionally not reproduced. Both
 * known consumers (Yajalal onboarding, BurnTok sign-up) are single-cursor,
 * horizontal, back-button-driven wizards; see docs/steps.md for the per-axis
 * rationale.
 */
export type StepStatus = "pending" | "current" | "complete" | "error";

/** Only the cursor step can be "current" or "error"; every other step is derived. */
export type StepCursorStatus = Extract<StepStatus, "current" | "error">;

export type StepItemDescriptor<Id extends string = string> = Readonly<{
  id: Id;
  label: string;
  description?: string;
}>;

/**
 * A single stable cursor (`currentStepId`) is the source of truth instead of a
 * per-item status array, so "two current steps" or "a completed step past an
 * unresolved error" cannot be represented. Clickable jump is out of scope, so
 * the flow is always linear relative to the cursor.
 */
export type StepsDescriptor<Id extends string = string> = Readonly<{
  steps: readonly StepItemDescriptor<Id>[];
  currentStepId: Id;
  currentStepStatus?: StepCursorStatus;
}>;

export const stepsDefaults = {
  currentStepStatus: "current",
} as const satisfies Readonly<{ currentStepStatus: StepCursorStatus }>;

export type StepsStatusLabels = Readonly<{
  pending: string;
  current: string;
  complete: string;
  error: string;
}>;

export type StepsAccessibleNameInfo = Readonly<{
  position: number;
  total: number;
  label: string;
}>;

/**
 * Products own the exact phrase order and counter-word grammar (Korean
 * "3단계 중 2단계" does not translate structurally to English "step 2 of 3"),
 * so the resolver invokes this composer instead of assembling copy itself.
 */
export type ComposeStepsAccessibleName = (
  info: StepsAccessibleNameInfo,
) => string;

export type ResolvedStepDescriptor<Id extends string = string> =
  StepItemDescriptor<Id> &
    Readonly<{
      status: StepStatus;
      /** 1-indexed so position and label both preserve reading order for renderers. */
      position: number;
      total: number;
      /** Primary accessible name: order + label. Never says status by itself. */
      accessibleName: string;
      /** Supplementary status announcement (Web aria-describedby text / RN accessibilityHint). */
      statusLabel: string;
    }>;

export type ResolveStepsOptions = Readonly<{
  statusLabels: StepsStatusLabels;
  composeAccessibleName: ComposeStepsAccessibleName;
}>;

function assertNonEmpty(value: string, field: string): void {
  if (value.trim().length === 0) {
    throw new TypeError(`Steps ${field} must not be empty`);
  }
}

export function validateStepItemDescriptor<Id extends string>(
  step: StepItemDescriptor<Id>,
): void {
  assertNonEmpty(step.id, "item id");
  if (step.id !== step.id.trim()) {
    throw new TypeError("Steps item id must not start or end with whitespace");
  }
  assertNonEmpty(step.label, "item label");
  if (step.description !== undefined) {
    assertNonEmpty(step.description, "item description");
  }
}

export function validateStepsDescriptor<Id extends string>(
  descriptor: StepsDescriptor<Id>,
): void {
  if (descriptor.steps.length < 2) {
    throw new RangeError("Steps must contain at least two steps");
  }
  const ids = new Set<Id>();
  for (const step of descriptor.steps) {
    validateStepItemDescriptor(step);
    if (ids.has(step.id)) {
      throw new TypeError(`Duplicate Steps item id: ${step.id}`);
    }
    ids.add(step.id);
  }
  if (!ids.has(descriptor.currentStepId)) {
    throw new RangeError(
      `Steps currentStepId does not match any step id: ${String(descriptor.currentStepId)}`,
    );
  }
  if (
    descriptor.currentStepStatus !== undefined &&
    descriptor.currentStepStatus !== "current" &&
    descriptor.currentStepStatus !== "error"
  ) {
    throw new TypeError(
      `Unsupported Steps currentStepStatus: ${String(descriptor.currentStepStatus)}`,
    );
  }
}

export function validateStepsStatusLabels(labels: StepsStatusLabels): void {
  if (labels === null || typeof labels !== "object") {
    throw new TypeError("Steps statusLabels must be an object");
  }
  for (const key of ["pending", "current", "complete", "error"] as const) {
    const value = labels[key];
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new TypeError(`Steps statusLabels.${key} must not be empty`);
    }
  }
}

/** A step is visually and semantically "reached" once it is no longer waiting. */
export function isStepReached(status: StepStatus): boolean {
  return status !== "pending";
}

/**
 * Derives every step's status from its position relative to the single
 * cursor, then attaches the order-preserving accessible name and the
 * supplementary status announcement. Throws on a malformed descriptor,
 * labels bag, or composer instead of silently rendering an inconsistent flow.
 */
export function resolveStepsDescriptor<Id extends string>(
  descriptor: StepsDescriptor<Id>,
  options: ResolveStepsOptions,
): readonly ResolvedStepDescriptor<Id>[] {
  validateStepsDescriptor(descriptor);
  validateStepsStatusLabels(options.statusLabels);
  if (typeof options.composeAccessibleName !== "function") {
    throw new TypeError("Steps composeAccessibleName must be a function");
  }

  const currentStepStatus =
    descriptor.currentStepStatus ?? stepsDefaults.currentStepStatus;
  const total = descriptor.steps.length;
  const cursorIndex = descriptor.steps.findIndex(
    (step) => step.id === descriptor.currentStepId,
  );

  return descriptor.steps.map((step, index) => {
    const status: StepStatus =
      index < cursorIndex
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
      throw new TypeError(
        "Steps composeAccessibleName must return a non-empty string",
      );
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
  ] as const,
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
} as const satisfies {
  slots: readonly string[];
  gap: number;
  indicator: {
    size: number;
    borderWidth: number;
    activeBorderWidth: number;
    marks: Record<StepStatus, SemanticIconName | null>;
    border: Record<StepStatus, ColorReference>;
    background: Record<StepStatus, ColorReference | null>;
    content: Record<StepStatus, ColorReference>;
  };
  connector: {
    height: number;
    tone: Record<"reached" | "unreached", ColorReference>;
  };
  label: {
    textVariant: TextVariant;
    fontWeight: string;
    color: Record<StepStatus, ColorReference>;
  };
  description: {
    textVariant: TextVariant;
    color: ColorReference;
  };
};
