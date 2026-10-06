import { validateImageDescriptor } from "./image.js";

export type RatingDescriptor = Readonly<{ label: string; value: number | null; max?: number; readOnly?: boolean }>;
/** A bounded row remains a rating rather than an unbounded repeated-icon list.
 * Null means unrated; zero and fractional averages are meaningful only in read-only summaries. */
export function resolveRating({ label, value, max = 5, readOnly = false }: RatingDescriptor) {
  if (!label.trim()) throw new TypeError("Rating requires a label");
  if (!Number.isInteger(max) || max < 1 || max > 10) throw new RangeError("Rating max must be an integer from 1 to 10");
  if (value !== null && (!Number.isFinite(value) || value < 0 || value > max || (!readOnly && (!Number.isInteger(value) || value === 0)))) {
    throw new RangeError("Interactive ratings require whole scores from 1 to max, or null");
  }
  return { max, value, fractions: Array.from({ length: max }, (_, index) => Math.max(0, Math.min(1, (value ?? 0) - index))) };
}
export type ComparisonImage = Readonly<{ src: string; width: number; height: number; label: string }>;
export type ImageComparisonDescriptor = Readonly<{ label: string; before: ComparisonImage; after: ComparisonImage; value: number }>;
/** Both pictures share one coordinate system. Reject mismatched aspect ratios
 * instead of silently stretching or cropping the evidence being compared. */
export function resolveImageComparison({ label, before, after, value }: ImageComparisonDescriptor) {
  if (!label.trim()) throw new TypeError("ImageComparison requires a label");
  for (const image of [before, after]) validateImageDescriptor({ ...image, decorative: false, accessibilityLabel: image.label });
  if (!Number.isFinite(value) || value < 0 || value > 100) throw new RangeError("ImageComparison value must be from 0 to 100");
  const aspectRatio = before.width / before.height;
  if (Math.abs(aspectRatio - after.width / after.height) > 0.000001) throw new RangeError("Compared images require the same aspect ratio");
  return { aspectRatio, fraction: value / 100 };
}
