export type DurationUnit = "hours" | "minutes" | "seconds";
export type DurationRange = Readonly<{ min?: number; max: number }>;
export type DurationFieldLabels = Readonly<{ label: string; hours: string; minutes: string; seconds: string; increment: (unit: DurationUnit) => string; decrement: (unit: DurationUnit) => string }>;
export function resolveDuration(value: number, range: DurationRange) {
  const min = range.min ?? 0;
  if (![min, range.max, value].every(Number.isSafeInteger) || min < 0 || range.max <= min || value < min || value > range.max) throw new RangeError("Duration requires integer seconds within a nonnegative min/max range");
  return { min, max: range.max, hours: Math.floor(value / 3600), minutes: Math.floor(value / 60) % 60, seconds: value % 60 };
}
export function changeDurationUnit(value: number, unit: DurationUnit, next: number | null, range: DurationRange): number {
  if (!["hours", "minutes", "seconds"].includes(unit)) throw new TypeError("Unsupported duration unit");
  const current = resolveDuration(value, range);
  const amount = next ?? 0;
  const limit = unit === "hours" ? Math.floor(range.max / 3600) : 59;
  if (!Number.isSafeInteger(amount) || amount < 0 || amount > limit) throw new RangeError("Invalid duration unit value");
  const multiplier = unit === "hours" ? 3600 : unit === "minutes" ? 60 : 1;
  // Clamp the combined value, rather than each displayed unit independently;
  // otherwise editing minutes can silently violate a product's total limit.
  return Math.max(current.min, Math.min(current.max, value + (amount - current[unit]) * multiplier));
}
