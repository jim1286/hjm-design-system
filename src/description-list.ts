import { semanticColors } from "./semantic-colors.js";
import { spacing } from "./foundations.js";
import type { DesignSystemTextScale } from "./design-system-provider.js";

export type DescriptionListColumns = 1 | 2;

/**
 * One label-value pair. Like Statistic, DescriptionList never formats the
 * value itself — products own locale, unit, and domain formatting and pass
 * the finished string.
 */
export type DescriptionItemDescriptor<Id extends string = string> = Readonly<{
  id: Id;
  label: string;
  value: string;
}>;

export type DescriptionListDescriptor<Id extends string = string> = Readonly<{
  items: readonly DescriptionItemDescriptor<Id>[];
  /** Renderer preference; the resolver may still collapse this to 1. */
  columns?: DescriptionListColumns;
}>;

export const descriptionListDefaults = {
  columns: 2,
} as const satisfies Readonly<{ columns: DescriptionListColumns }>;

export type ResolvedDescriptionListDescriptor<Id extends string = string> =
  Readonly<{
    items: readonly DescriptionItemDescriptor<Id>[];
    columns: DescriptionListColumns;
  }>;

function assertCopy(value: string, field: string): void {
  if (value.trim().length === 0) {
    throw new TypeError(`DescriptionList ${field} must not be empty`);
  }
}

export function validateDescriptionItem<Id extends string>(
  item: DescriptionItemDescriptor<Id>,
): void {
  assertCopy(item.id, "id");
  if (item.id !== item.id.trim()) {
    throw new TypeError(
      "DescriptionList item id must not start or end with whitespace",
    );
  }
  assertCopy(item.label, `item ${item.id} label`);
  assertCopy(item.value, `item ${item.id} value`);
}

export function validateDescriptionList<Id extends string>(
  descriptor: DescriptionListDescriptor<Id>,
): void {
  if (descriptor.items.length === 0) {
    throw new TypeError("DescriptionList must contain at least one item");
  }
  if (
    descriptor.columns !== undefined &&
    descriptor.columns !== 1 &&
    descriptor.columns !== 2
  ) {
    throw new RangeError("DescriptionList columns must be 1 or 2");
  }
  const ids = new Set<Id>();
  for (const item of descriptor.items) {
    validateDescriptionItem(item);
    if (ids.has(item.id)) {
      throw new TypeError(`Duplicate DescriptionList item id: ${item.id}`);
    }
    ids.add(item.id);
  }
}

export function resolveDescriptionListDescriptor<Id extends string>(
  descriptor: DescriptionListDescriptor<Id>,
): ResolvedDescriptionListDescriptor<Id> {
  validateDescriptionList(descriptor);
  return {
    items: descriptor.items,
    columns: descriptor.columns ?? descriptionListDefaults.columns,
  };
}

export const descriptionListRecipe = {
  slots: ["root", "group", "item", "label", "value"] as const,
  defaults: descriptionListDefaults,
  group: {
    gap: spacing.sm,
    minItemWidth: 160,
    columns: [1, 2] as const,
  },
  item: {
    gap: spacing.xxs,
  },
  label: { textVariant: "label", color: semanticColors.content.secondary },
  value: {
    textVariant: "body",
    color: semanticColors.content.primary,
    maxLines: null,
  },
} as const;

/**
 * Owns the large-text reflow so products stop re-deriving a per-screen
 * `textScale >= 1.6` guard (five screens missed it in the last review). The
 * minimum item width grows with `textScale`, so at a fixed `availableWidth`
 * the same formula that reflows for narrow screens also reflows for large
 * text — mirrors `resolveStatisticColumnCount`'s shape in the Yajalal app-rn
 * renderer contract.
 */
export function resolveDescriptionListColumnCount(
  availableWidth: number,
  requestedColumns: DescriptionListColumns,
  textScale: DesignSystemTextScale = 1,
): DescriptionListColumns {
  if (!Number.isFinite(availableWidth) || availableWidth <= 0) {
    return requestedColumns;
  }
  const scale = Number.isFinite(textScale) ? Math.max(textScale, 1) : 1;
  const minItemWidth = descriptionListRecipe.group.minItemWidth * scale;
  for (let columns = requestedColumns; columns >= 1; columns -= 1) {
    const itemWidth =
      (availableWidth - descriptionListRecipe.group.gap * (columns - 1)) /
      columns;
    if (itemWidth >= minItemWidth) {
      return columns as DescriptionListColumns;
    }
  }
  return 1;
}
