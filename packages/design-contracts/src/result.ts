import { semanticColors } from "./semantic-colors.js";
import { fontWeight, spacing } from "./foundations.js";

/**
 * Web-page HTTP status vocabulary (403/404/500) does not belong in a
 * platform-neutral contract. Products/adapters translate those into
 * `failure` with their own localized copy.
 */
export type ResultStatus = "success" | "failure" | "info";

export const resultDefaults = {
  status: "info",
} as const satisfies Readonly<{ status: ResultStatus }>;

export type ResultActionDescriptor = Readonly<{
  label: string;
  accessibilityLabel?: string;
  onAction(): void;
}>;

/**
 * A flow terminus screen (success, failure, 404-equivalent). Unlike
 * `EmptyState`, which describes a place that can still be filled, Result
 * means this flow ends here — there is no pending content to wait for.
 *
 * `actions` holds at most one primary and one optional secondary action;
 * the first entry is the primary. A third action is refused, not silently
 * dropped, so a screen author notices instead of shipping a truncated row.
 */
export type ResultDescriptor = Readonly<{
  status: ResultStatus;
  title: string;
  description?: string;
  actions?: readonly ResultActionDescriptor[];
}>;

export type ResolvedResultActionDescriptor = Readonly<{
  label: string;
  accessibilityLabel: string;
  onAction(): void;
}>;

export type ResolvedResultDescriptor = Readonly<{
  status: ResultStatus;
  title: string;
  description: string | null;
  primaryAction: ResolvedResultActionDescriptor | null;
  secondaryAction: ResolvedResultActionDescriptor | null;
}>;

function assertCopy(value: string, field: string): void {
  if (value.trim().length === 0) {
    throw new TypeError(`Result ${field} must not be empty`);
  }
}

export function validateResultAction(
  action: ResultActionDescriptor,
  field: string,
): void {
  assertCopy(action.label, `${field}.label`);
  if (action.accessibilityLabel !== undefined) {
    assertCopy(action.accessibilityLabel, `${field}.accessibilityLabel`);
  }
  if (typeof action.onAction !== "function") {
    throw new TypeError(`Result ${field}.onAction must be a function`);
  }
}

export function validateResultDescriptor(descriptor: ResultDescriptor): void {
  if (
    descriptor.status !== "success" &&
    descriptor.status !== "failure" &&
    descriptor.status !== "info"
  ) {
    throw new TypeError(`Unsupported Result status: ${String(descriptor.status)}`);
  }
  assertCopy(descriptor.title, "title");
  if (descriptor.description !== undefined) {
    assertCopy(descriptor.description, "description");
  }
  const actions = descriptor.actions ?? [];
  if (actions.length > 2) {
    throw new RangeError(
      "Result supports at most one primary and one secondary action",
    );
  }
  actions.forEach((action, index) => {
    validateResultAction(action, index === 0 ? "primaryAction" : "secondaryAction");
  });
}

function resolveAction(
  action: ResultActionDescriptor | undefined,
): ResolvedResultActionDescriptor | null {
  if (!action) return null;
  return {
    label: action.label,
    accessibilityLabel: action.accessibilityLabel ?? action.label,
    onAction: action.onAction,
  };
}

export function resolveResultDescriptor(
  descriptor: ResultDescriptor,
): ResolvedResultDescriptor {
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
  ] as const,
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
} as const;
