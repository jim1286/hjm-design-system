import type { ColorReference } from "./color-references.js";
import type { TextVariant } from "./foundations.js";
import { spacing, stroke } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

/**
 * Timeline is a record of what already happened, not a position in a flow —
 * that is Steps' job (see docs/steps.md and the boundary note in
 * docs/timeline.md). Because there is no cursor, Timeline never derives a
 * status from position: every item is simply "happened", and the connector
 * between items carries no reached/unreached meaning. Ant Design's
 * alternating left/right layout is intentionally not reproduced — it is a
 * Web-only decoration with no equivalent in a single-direction native list;
 * see docs/timeline.md for the rationale.
 */
export type TimelineItemTone = "neutral" | "info" | "success" | "attention";

export type TimelineItemDescriptor<Id extends string = string> = Readonly<{
  id: Id;
  label: string;
  /** Product-formatted "when" copy, e.g. "3회 초" or "2024-01-15". Timeline never formats a clock, inning, or date itself. */
  timestamp?: string;
  /** Product-formatted supplementary detail, e.g. "안타로 1루 진출". */
  description?: string;
  tone?: TimelineItemTone;
}>;

export type TimelineDescriptor<Id extends string = string> = Readonly<{
  items: readonly TimelineItemDescriptor<Id>[];
}>;

export const timelineDefaults = {
  itemTone: "neutral",
} as const satisfies Readonly<{ itemTone: TimelineItemTone }>;

export type TimelineAccessibleNameInfo = Readonly<{
  position: number;
  total: number;
  label: string;
}>;

/**
 * Products own the exact phrase order and counter-word grammar, same reason
 * Steps does not assemble its own accessible name (see docs/steps.md).
 */
export type ComposeTimelineAccessibleName = (
  info: TimelineAccessibleNameInfo,
) => string;

export type ResolvedTimelineItemDescriptor<Id extends string = string> = Omit<
  TimelineItemDescriptor<Id>,
  "tone"
> &
  Readonly<{
    tone: TimelineItemTone;
    /** 1-indexed so position and label both preserve reading order for renderers. */
    position: number;
    total: number;
    /** Order + label, for platforms without built-in list-position semantics. */
    accessibleName: string;
  }>;

export type ResolveTimelineOptions = Readonly<{
  composeAccessibleName: ComposeTimelineAccessibleName;
}>;

function assertNonEmpty(value: string, field: string): void {
  if (value.trim().length === 0) {
    throw new TypeError(`Timeline ${field} must not be empty`);
  }
}

export function validateTimelineItemDescriptor<Id extends string>(
  item: TimelineItemDescriptor<Id>,
): void {
  assertNonEmpty(item.id, "item id");
  if (item.id !== item.id.trim()) {
    throw new TypeError("Timeline item id must not start or end with whitespace");
  }
  assertNonEmpty(item.label, "item label");
  if (item.timestamp !== undefined) {
    assertNonEmpty(item.timestamp, "item timestamp");
  }
  if (item.description !== undefined) {
    assertNonEmpty(item.description, "item description");
  }
  if (
    item.tone !== undefined &&
    item.tone !== "neutral" &&
    item.tone !== "info" &&
    item.tone !== "success" &&
    item.tone !== "attention"
  ) {
    throw new TypeError(`Unsupported Timeline item tone: ${String(item.tone)}`);
  }
}

export function validateTimelineDescriptor<Id extends string>(
  descriptor: TimelineDescriptor<Id>,
): void {
  if (descriptor.items.length === 0) {
    throw new RangeError("Timeline must contain at least one item");
  }
  const ids = new Set<Id>();
  for (const item of descriptor.items) {
    validateTimelineItemDescriptor(item);
    if (ids.has(item.id)) {
      throw new TypeError(`Duplicate Timeline item id: ${item.id}`);
    }
    ids.add(item.id);
  }
}

/**
 * Attaches order-preserving accessible names to an already-ordered item list.
 * Unlike Steps, no status is derived from position — every item already
 * happened, so this only adds order and the resolved tone default.
 */
export function resolveTimelineDescriptor<Id extends string>(
  descriptor: TimelineDescriptor<Id>,
  options: ResolveTimelineOptions,
): readonly ResolvedTimelineItemDescriptor<Id>[] {
  validateTimelineDescriptor(descriptor);
  if (typeof options.composeAccessibleName !== "function") {
    throw new TypeError("Timeline composeAccessibleName must be a function");
  }

  const total = descriptor.items.length;
  return descriptor.items.map((item, index) => {
    const position = index + 1;
    const accessibleName = options.composeAccessibleName({
      position,
      total,
      label: item.label,
    });
    if (typeof accessibleName !== "string" || accessibleName.trim().length === 0) {
      throw new TypeError(
        "Timeline composeAccessibleName must return a non-empty string",
      );
    }
    return {
      ...item,
      tone: item.tone ?? timelineDefaults.itemTone,
      position,
      total,
      accessibleName,
    };
  });
}

export const timelineRecipe = {
  slots: [
    "root",
    "item",
    "dot",
    "connector",
    "content",
    "timestamp",
    "label",
    "description",
  ] as const,
  gap: spacing.md,
  dot: {
    diameter: 10,
    borderWidth: stroke.default,
    tones: {
      neutral: { border: null, fill: semanticColors.content.secondary },
      info: {
        border: semanticColors.feedback.info.border,
        fill: semanticColors.feedback.info.foreground,
      },
      success: {
        border: semanticColors.feedback.success.border,
        fill: semanticColors.feedback.success.foreground,
      },
      attention: {
        border: semanticColors.feedback.attention.border,
        fill: semanticColors.feedback.attention.foreground,
      },
    },
  },
  /**
   * A single tone, unlike stepsRecipe.connector's reached/unreached pair —
   * Timeline has no cursor, so no segment is "not yet reached".
   */
  connector: {
    width: stroke.default,
    tone: semanticColors.border.default,
  },
  timestamp: {
    textVariant: "caption",
    color: semanticColors.content.secondary,
  },
  label: {
    textVariant: "body",
    fontWeight: "600",
    color: semanticColors.content.primary,
  },
  description: {
    textVariant: "body",
    color: semanticColors.content.body,
  },
} as const satisfies {
  slots: readonly string[];
  gap: number;
  dot: {
    diameter: number;
    borderWidth: number;
    tones: Record<
      TimelineItemTone,
      { border: ColorReference | null; fill: ColorReference }
    >;
  };
  connector: {
    width: number;
    tone: ColorReference;
  };
  timestamp: { textVariant: TextVariant; color: ColorReference };
  label: { textVariant: TextVariant; fontWeight: string; color: ColorReference };
  description: { textVariant: TextVariant; color: ColorReference };
};
