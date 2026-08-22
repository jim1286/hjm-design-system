export type StatisticTrendDirection = "up" | "down" | "flat";
export type StatisticTrendTone = "neutral" | "success" | "warning" | "danger";

export const statisticDefaults = {
  trendTone: "neutral",
} as const satisfies Readonly<{ trendTone: StatisticTrendTone }>;

export type StatisticTrendDescriptor = Readonly<{
  direction: StatisticTrendDirection;
  /** Direction and meaning are independent: an increase is not always good. */
  tone?: StatisticTrendTone;
  /** Visible localized copy ensures the trend is never communicated by color alone. */
  label: string;
}>;

export type StatisticDescriptor<Id extends string = string> = Readonly<{
  id: Id;
  label: string;
  /** Products own number/date/unit formatting and pass the final visible string. */
  value: string;
  prefix?: string;
  suffix?: string;
  hint?: string;
  trend?: StatisticTrendDescriptor;
}>;

export type StatisticGroupDescriptor<Id extends string = string> = Readonly<{
  items: readonly StatisticDescriptor<Id>[];
  columns?: 1 | 2 | 3 | 4;
}>;

export type ResolvedStatisticTrendDescriptor = Omit<
  StatisticTrendDescriptor,
  "tone"
> &
  Readonly<{ tone: StatisticTrendTone }>;

export type ResolvedStatisticDescriptor<Id extends string = string> = Omit<
  StatisticDescriptor<Id>,
  "trend"
> &
  Readonly<{ trend?: ResolvedStatisticTrendDescriptor }>;

function assertCopy(value: string, field: string): void {
  if (value.trim().length === 0) {
    throw new TypeError(`Statistic ${field} must not be empty`);
  }
}

export function validateStatisticDescriptor<Id extends string>(
  descriptor: StatisticDescriptor<Id>,
): void {
  assertCopy(descriptor.id, "id");
  if (descriptor.id !== descriptor.id.trim()) {
    throw new TypeError("Statistic id must not start or end with whitespace");
  }
  assertCopy(descriptor.label, "label");
  assertCopy(descriptor.value, "value");
  if (descriptor.prefix !== undefined) assertCopy(descriptor.prefix, "prefix");
  if (descriptor.suffix !== undefined) assertCopy(descriptor.suffix, "suffix");
  if (descriptor.hint !== undefined) assertCopy(descriptor.hint, "hint");
  if (descriptor.trend) {
    if (
      descriptor.trend.direction !== "up" &&
      descriptor.trend.direction !== "down" &&
      descriptor.trend.direction !== "flat"
    ) {
      throw new TypeError(
        `Unsupported Statistic trend direction: ${String(descriptor.trend.direction)}`,
      );
    }
    if (
      descriptor.trend.tone !== undefined &&
      descriptor.trend.tone !== "neutral" &&
      descriptor.trend.tone !== "success" &&
      descriptor.trend.tone !== "warning" &&
      descriptor.trend.tone !== "danger"
    ) {
      throw new TypeError(
        `Unsupported Statistic trend tone: ${String(descriptor.trend.tone)}`,
      );
    }
    assertCopy(descriptor.trend.label, "trend.label");
  }
}

export function resolveStatisticDescriptor<Id extends string>(
  descriptor: StatisticDescriptor<Id>,
): ResolvedStatisticDescriptor<Id> {
  validateStatisticDescriptor(descriptor);
  const { trend, ...copy } = descriptor;
  if (!trend) return copy;
  return {
    ...copy,
    trend: {
      ...trend,
      tone: trend.tone ?? statisticDefaults.trendTone,
    },
  };
}

export function validateStatisticGroup<Id extends string>(
  group: StatisticGroupDescriptor<Id>,
): void {
  if (group.items.length === 0) {
    throw new TypeError("Statistic group must contain at least one item");
  }
  if (
    group.columns !== undefined &&
    group.columns !== 1 &&
    group.columns !== 2 &&
    group.columns !== 3 &&
    group.columns !== 4
  ) {
    throw new RangeError("Statistic columns must be 1, 2, 3, or 4");
  }
  const ids = new Set<Id>();
  for (const item of group.items) {
    validateStatisticDescriptor(item);
    if (ids.has(item.id)) {
      throw new TypeError(`Duplicate Statistic id: ${item.id}`);
    }
    ids.add(item.id);
  }
}

export const statisticTrendMarks = {
  up: "trendUp",
  down: "trendDown",
  flat: "trendFlat",
} as const satisfies Record<StatisticTrendDirection, string>;
