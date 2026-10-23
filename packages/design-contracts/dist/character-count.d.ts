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
    range?: (params: Readonly<{
        min: number;
        max: number;
    }>) => string;
    /** Near the limit, e.g. `${count}자 더 쓸 수 있어요`. */
    remaining?: (params: Readonly<{
        count: number;
    }>) => string;
    /** Non-empty and below `min`, e.g. `${count}자만 더 적어주세요`. */
    needed?: (params: Readonly<{
        count: number;
    }>) => string;
    /** Above `max` (only reachable with `overflow: "allow"`), e.g. `${count}자를 줄여주세요`. */
    over?: (params: Readonly<{
        count: number;
    }>) => string;
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
export declare const characterCountRecipe: {
    readonly defaults: {
        readonly min: 0;
        readonly overflow: "block";
        readonly measure: "length";
    };
    /** BurnTok switched to the remaining sentence at 40 of 300–1000; one tenth of max is the shared default. */
    readonly nearLimitRatio: 0.1;
    readonly separator: "/";
    readonly textVariant: "label";
    readonly colors: {
        readonly idle: "textMuted";
        readonly invalid: "danger";
    };
    /** The counter only gains weight when it must be fixed; color is not the only cue. */
    readonly counterFontWeight: {
        readonly idle: "400";
        readonly invalid: "600";
    };
    readonly numeric: "tabular-nums";
    /** Between the sentence and the counter on one row. */
    readonly gap: 12;
    /**
     * Statuses announced (politely) when the value enters them. Announcing every keystroke drowns the typed text,
     * so `within` is silent and the counter is read on focus through the description link instead.
     */
    readonly announcedStatuses: readonly ["near", "short", "over"];
};
export declare function resolveCharacterCount(value: string, options: CharacterCountOptions): CharacterCountState;
/** The platform `maxLength` for the options: only `block` limits typing. */
export declare function resolveCharacterCountMaxLength(options: CharacterCountOptions | undefined): number | undefined;
/** Announce on entering an announced status (not on mount, not on every keystroke inside one status). */
export declare function shouldAnnounceCharacterCount(previous: CharacterCountStatus | undefined, next: CharacterCountState): boolean;
//# sourceMappingURL=character-count.d.ts.map