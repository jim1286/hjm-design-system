export type CounterBadgeTone = "danger" | "brand" | "neutral";
export type CounterBadgeSize = "small" | "medium";
export type CounterBadgeVariant = "inline" | "floating";

/** Shared defaults usable without importing the visual recipe barrel. */
export const counterBadgeDefaults = {
  tone: "danger",
  size: "medium",
  variant: "inline",
  max: 99,
} as const satisfies Readonly<{
  tone: CounterBadgeTone;
  size: CounterBadgeSize;
  variant: CounterBadgeVariant;
  max: number;
}>;

export function formatCounterBadgeCount(
  count: number,
  max: number = counterBadgeDefaults.max,
): string | null {
  const normalizedCount = Number.isFinite(count)
    ? Math.max(0, Math.trunc(count))
    : 0;
  if (normalizedCount === 0) return null;
  const normalizedMax = Number.isFinite(max)
    ? Math.max(1, Math.trunc(max))
    : counterBadgeDefaults.max;
  return normalizedCount > normalizedMax
    ? `${normalizedMax}+`
    : String(normalizedCount);
}
