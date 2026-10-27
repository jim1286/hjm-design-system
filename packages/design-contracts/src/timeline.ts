import type { ColorReference } from "./color-references.js";
import type { FontWeightValue, TextVariant } from "./foundations.js";
import { fontWeight, spacing, stroke } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
import { getCollectionNavigationIntent, getCollectionNavigationTarget } from "./collection.js";

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
  /** Machine-readable date for the formatted timestamp; products retain the original instant. */
  dateTime?: string;
  /** Product-formatted supplementary detail, e.g. "안타로 1루 진출". */
  description?: string;
  tone?: TimelineItemTone;
  /** Passive emphasis for a notable record, not a progress cursor or selection. */
  emphasized?: boolean;
}>;

export type TimelineDescriptor<Id extends string = string> = Readonly<{
  items: readonly TimelineItemDescriptor<Id>[];
  /**
   * Single selection of one record (2026-10-23): `undefined` keeps the passive record, `null` makes the list selectable
   * with nothing chosen yet. Selection is not a progress cursor — no status is derived from it. Diairy's journey log
   * rebuilt this with a `Button` tone toggle + `aria-pressed` per step (SELECTION forbids button-as-selection).
   */
  selectedId?: Id | null;
}>;

export const timelineDefaults = {
  itemTone: "neutral",
  variant: "journal",
} as const satisfies Readonly<{ itemTone: TimelineItemTone; variant: "record" | "journal" }>;

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
    /** True only for the record matching a selectable Timeline's `selectedId`. */
    selected: boolean;
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
  if (item.emphasized !== undefined && typeof item.emphasized !== "boolean") {
    throw new TypeError("Timeline item emphasized must be a boolean");
  }
  if (item.id !== item.id.trim()) {
    throw new TypeError("Timeline item id must not start or end with whitespace");
  }
  assertNonEmpty(item.label, "item label");
  if (item.timestamp !== undefined) {
    assertNonEmpty(item.timestamp, "item timestamp");
  }
  if (item.dateTime !== undefined) {
    assertNonEmpty(item.dateTime, "item dateTime");
    if (item.timestamp === undefined) throw new TypeError("Timeline dateTime requires timestamp");
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
  if (descriptor.selectedId !== undefined && descriptor.selectedId !== null && !ids.has(descriptor.selectedId)) {
    throw new RangeError(`Timeline selectedId does not match any item id: ${String(descriptor.selectedId)}`);
  }
}

/**
 * Selection is a pair: a controlled `selectedId` (null for none) and the change callback, or neither. A selectable
 * record is one target (Web option, Native selected button), so it cannot also host `renderActions` commands —
 * nested controls inside an option are not operable by assistive tech. Products that need a per-record command keep
 * the passive Timeline.
 */
export function validateTimelineSelection(
  selectedId: unknown,
  onSelectedIdChange: unknown,
  options: Readonly<{ hasActions: boolean; variant?: "record" | "journal" }> = { hasActions: false },
): void {
  if (options.variant !== undefined && options.variant !== "record" && options.variant !== "journal") {
    throw new TypeError("Unsupported Timeline variant");
  }
  if ((selectedId === undefined) !== (onSelectedIdChange === undefined)) {
    throw new TypeError("Timeline selectedId and onSelectedIdChange must be supplied together");
  }
  if (onSelectedIdChange !== undefined && typeof onSelectedIdChange !== "function") {
    throw new TypeError("Timeline onSelectedIdChange must be a function");
  }
  if (onSelectedIdChange !== undefined && options.hasActions) {
    throw new TypeError("A selectable Timeline cannot render per-record actions; the record itself is the selection target");
  }
}

/**
 * Keyboard target for a selectable Timeline (vertical listbox): ArrowDown/ArrowUp step one record, Home/End jump to
 * the ends, and the ends do not wrap — a history has a first and a last record. Selection follows focus, as in the
 * single-select listbox pattern, because choosing a record only changes what the product shows next to it.
 * Returns undefined for keys Timeline does not own. Reuses the shared collection navigation math.
 */
export function getTimelineSelectionTarget<Id extends string>(
  items: readonly TimelineItemDescriptor<Id>[],
  currentId: Id | null,
  key: string,
): Id | undefined {
  const intent = getCollectionNavigationIntent(key as Parameters<typeof getCollectionNavigationIntent>[0]);
  if (!intent) return undefined;
  return getCollectionNavigationTarget(
    { items: items.map((item) => ({ id: item.id, label: item.label, textValue: item.label })) },
    currentId,
    intent,
    false,
  );
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
      selected: descriptor.selectedId !== undefined && descriptor.selectedId === item.id,
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
  gap: spacing.lg,
  // 2026-10-27: the approved journey journal keeps the reading rail, without large selected cards.
  // Passive histories keep every detail and command; selection adds disclosure without changing event semantics.
  journal: { gap: 0, paddingBlock: spacing.md, dotDiameter: 8 },
  // A record remains passive: emphasis highlights its history without implying progress.
  item: {
    padding: spacing.sm,
    emphasisBackground: semanticColors.feedback.info.background,
    /**
     * Selected record (selectable Timeline): the neutral persistent-selection surface and ring shared with ListRow,
     * not brand fill (theme-palette.md 선택 상태 색상 기준). Selection outranks passive emphasis on the same record.
     */
    selected: {
      background: semanticColors.selection.background,
      border: semanticColors.selection.border,
      borderWidth: stroke.default,
    },
  },
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
    fontWeight: fontWeight.medium,
    color: semanticColors.content.primary,
  },
  description: {
    textVariant: "body",
    color: semanticColors.content.body,
  },
} as const satisfies {
  slots: readonly string[];
  gap: number;
  journal: { gap: number; paddingBlock: number; dotDiameter: number };
  item: {
    padding: number;
    emphasisBackground: ColorReference;
    selected: { background: ColorReference; border: ColorReference; borderWidth: number };
  };
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
  label: { textVariant: TextVariant; fontWeight: FontWeightValue; color: ColorReference };
  description: { textVariant: TextVariant; color: ColorReference };
};
