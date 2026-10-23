import { fontWeight, numeric, spacing } from "./foundations.js";
import { formatNumber } from "./formatters.js";
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
};
function assertCount(value, name) {
    if (!Number.isSafeInteger(value) || value < 0)
        throw new RangeError(`characterCount ${name} must be a nonnegative integer`);
}
export function resolveCharacterCount(value, options) {
    const { max, messages } = options;
    const min = options.min ?? characterCountRecipe.defaults.min;
    const measure = options.measure ?? characterCountRecipe.defaults.measure;
    assertCount(max, "max");
    assertCount(min, "min");
    if (max === 0 || min > max)
        throw new RangeError("characterCount requires 0 <= min <= max and max > 0");
    if (measure !== "length" && measure !== "trimmed")
        throw new TypeError(`Unknown characterCount measure: ${String(measure)}`);
    const overflow = options.overflow ?? characterCountRecipe.defaults.overflow;
    if (overflow !== "block" && overflow !== "allow")
        throw new TypeError(`Unknown characterCount overflow: ${String(overflow)}`);
    const nearLimit = options.nearLimit ?? Math.ceil(max * characterCountRecipe.nearLimitRatio);
    assertCount(nearLimit, "nearLimit");
    const length = (measure === "trimmed" ? value.trim() : value).length;
    const remaining = max - length;
    // Same precedence as BurnTok: what blocks submission first, then the approaching limit, then the range.
    const status = length > max ? "over"
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
export function resolveCharacterCountMaxLength(options) {
    if (!options)
        return undefined;
    return (options.overflow ?? characterCountRecipe.defaults.overflow) === "block" ? options.max : undefined;
}
/** Announce on entering an announced status (not on mount, not on every keystroke inside one status). */
export function shouldAnnounceCharacterCount(previous, next) {
    return previous !== undefined && previous !== next.status && next.message !== undefined
        && characterCountRecipe.announcedStatuses.includes(next.status);
}
//# sourceMappingURL=character-count.js.map