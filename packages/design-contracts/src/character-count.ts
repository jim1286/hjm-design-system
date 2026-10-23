import { fontWeight, numeric, spacing, type FontWeightValue, type TextVariant } from "./foundations.js";
import { formatNumber } from "./formatters.js";
import type { ThemeColors } from "./colors.js";

/**
 * Character count under TextField / TextArea (2026-10-23).
 *
 * BurnTok drew the same rule twice — web `components/ComposerCount.tsx` and app `components/TextLengthHint.tsx`:
 * a `length/max` counter, one sentence chosen in the order over → still short → near the limit → allowed range,
 * and the danger color for the short/over states. The thresholds already drifted (web emphasised the counter at
 * 50 remaining, the app did not). Measuring and choosing the state live here; the product supplies the localized
 * sentences and the locale, and the renderer formats the numbers with that locale.
 */

/**
 * `length` counts UTF-16 code units, the unit of the platform `maxLength` on both renderers, so the counter
 * and the block agree. `trimmed` counts after removing leading/trailing whitespace (BurnTok's server policy).
 */
export type CharacterCountMeasure = "length" | "trimmed";
/**
 * `block` passes `max` to the platform `maxLength`, so typing stops at the limit. `allow` keeps typing past
 * the limit so a pasted or long draft is preserved and the user is told how much to remove; submission must
 * then check `status !== "over"`.
 */
export type CharacterCountOverflow = "block" | "allow";
/** `over` > max · `short` non-empty and < min · `near` remaining ≤ nearLimit · `within` otherwise. */
export type CharacterCountStatus = "over" | "short" | "near" | "within";

export type CharacterCountMessages = Readonly<{
  /** Within the limits and not near the end, e.g. `${min}–${max}자`. Omit to show only the counter. */
  range?: (params: Readonly<{ min: number; max: number }>) => string;
  /** Near the limit, e.g. `${count}자 더 쓸 수 있어요`. */
  remaining?: (params: Readonly<{ count: number }>) => string;
  /** Non-empty and below `min`, e.g. `${count}자만 더 적어주세요`. */
  needed?: (params: Readonly<{ count: number }>) => string;
  /** Above `max` (only reachable with `overflow: "allow"`), e.g. `${count}자를 줄여주세요`. */
  over?: (params: Readonly<{ count: number }>) => string;
}>;

export type CharacterCountOptions = Readonly<{
  max: number;
  /** Default 0. An empty value is never `short`: an untouched field is not an error. */
  min?: number;
  /** Default `block`. */
  overflow?: CharacterCountOverflow;
  /** Default `length`. */
  measure?: CharacterCountMeasure;
  /** Remaining count at or below which the state is `near`. Default `ceil(max × characterCountRecipe.nearLimitRatio)`. */
  nearLimit?: number;
  /** Required: the counter numbers are formatted for this locale (no silent environment default). */
  locale: string | readonly string[];
  messages?: CharacterCountMessages;
}>;

export type CharacterCountState = Readonly<{
  length: number;
  min: number;
  max: number;
  /** Negative when over, so the product can say how much to remove. */
  remaining: number;
  status: CharacterCountStatus;
  /** `short` or `over`: the counter row uses the error color. */
  invalid: boolean;
  /** The visible counter, e.g. `1,024/1,000`. */
  counter: string;
  /** The product sentence for this status, when supplied. */
  message?: string;
}>;

export const characterCountRecipe = {
  defaults: { min: 0, overflow: "block", measure: "length" },
  /** BurnTok switched to the remaining sentence at 40 of 300–1000; one tenth of max is the shared default. */
  nearLimitRatio: 0.1,
  separator: "/",
  textVariant: "label",
  colors: { idle: "textMuted", invalid: "danger" },
  /** The counter only gains weight when it must be fixed; color is not the only cue. */
  counterFontWeight: { idle: fontWeight.regular, invalid: fontWeight.semibold },
  numeric: numeric.tabular,
  /** Between the sentence and the counter on one row. */
  gap: spacing.sm,
  /**
   * Statuses announced (politely) when the value enters them. Announcing every keystroke drowns the typed text,
   * so `within` is silent and the counter is read on focus through the description link instead.
   */
  announcedStatuses: ["near", "short", "over"],
} as const satisfies {
  defaults: { min: number; overflow: CharacterCountOverflow; measure: CharacterCountMeasure };
  nearLimitRatio: number;
  separator: string;
  textVariant: TextVariant;
  colors: Record<"idle" | "invalid", keyof ThemeColors>;
  counterFontWeight: Record<"idle" | "invalid", FontWeightValue>;
  numeric: string;
  gap: number;
  announcedStatuses: readonly CharacterCountStatus[];
};

function assertCount(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0) throw new RangeError(`characterCount ${name} must be a nonnegative integer`);
}

export function resolveCharacterCount(value: string, options: CharacterCountOptions): CharacterCountState {
  const { max, messages } = options;
  const min = options.min ?? characterCountRecipe.defaults.min;
  const measure = options.measure ?? characterCountRecipe.defaults.measure;
  assertCount(max, "max");
  assertCount(min, "min");
  if (max === 0 || min > max) throw new RangeError("characterCount requires 0 <= min <= max and max > 0");
  if (measure !== "length" && measure !== "trimmed") throw new TypeError(`Unknown characterCount measure: ${String(measure)}`);
  const overflow = options.overflow ?? characterCountRecipe.defaults.overflow;
  if (overflow !== "block" && overflow !== "allow") throw new TypeError(`Unknown characterCount overflow: ${String(overflow)}`);
  const nearLimit = options.nearLimit ?? Math.ceil(max * characterCountRecipe.nearLimitRatio);
  assertCount(nearLimit, "nearLimit");
  const length = (measure === "trimmed" ? value.trim() : value).length;
  const remaining = max - length;
  // Same precedence as BurnTok: what blocks submission first, then the approaching limit, then the range.
  const status: CharacterCountStatus = length > max ? "over"
    : length > 0 && length < min ? "short"
    : remaining <= nearLimit ? "near"
    : "within";
  const message = status === "over" ? messages?.over?.({ count: -remaining })
    : status === "short" ? messages?.needed?.({ count: min - length })
    : status === "near" ? messages?.remaining?.({ count: remaining })
    : messages?.range?.({ min, max });
  const counter = `${formatNumber(length, { locale: options.locale })}${characterCountRecipe.separator}${formatNumber(max, { locale: options.locale })}`;
  return {
    length, min, max, remaining, status, invalid: status === "over" || status === "short", counter,
    ...(message ? { message } : {}),
  };
}

/** The platform `maxLength` for the options: only `block` limits typing. */
export function resolveCharacterCountMaxLength(options: CharacterCountOptions | undefined): number | undefined {
  if (!options) return undefined;
  return (options.overflow ?? characterCountRecipe.defaults.overflow) === "block" ? options.max : undefined;
}

/** Announce on entering an announced status (not on mount, not on every keystroke inside one status). */
export function shouldAnnounceCharacterCount(previous: CharacterCountStatus | undefined, next: CharacterCountState): boolean {
  return previous !== undefined && previous !== next.status && next.message !== undefined
    && (characterCountRecipe.announcedStatuses as readonly CharacterCountStatus[]).includes(next.status);
}
