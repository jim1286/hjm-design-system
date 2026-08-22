/**
 * `docs/mentions.md`'s "이게 새 컴포넌트인가" verdict: Mentions is a `TextArea`
 * whose candidate popup is Combobox's existing listbox contract
 * (`comboboxRecipe`, `behaviorRegistry.combobox`) verbatim — arrow-key
 * navigation, typeahead-free filtering, loading/empty/error announcement are
 * already owned there and this module does not redeclare them. The one piece
 * neither owns is *finding the trigger inside free-form text and computing
 * what range gets replaced on commit* — that is genuinely new, and it is all
 * this module contains.
 */
export type MentionTriggerConfig<TriggerId extends string = string> = Readonly<{
    id: TriggerId;
    /** Exactly one non-whitespace character, e.g. "@" or "#". */
    trigger: string;
}>;
export type MentionMatch<TriggerId extends string = string> = Readonly<{
    triggerId: TriggerId;
    trigger: string;
    /** UTF-16 code unit offset of the trigger character itself in `text`. */
    triggerStart: number;
    /** Text between the trigger and the cursor — drives candidate filtering. */
    query: string;
}>;
/**
 * Rejects the configuration shapes a naive Mentions implementation would
 * accept and then fail on later: an empty trigger list (nothing to detect),
 * a multi-character or whitespace trigger (the scan below assumes exactly one
 * non-whitespace code unit), and two configs racing on the same character or
 * id.
 */
export declare function validateMentionTriggers<TriggerId extends string>(triggers: readonly MentionTriggerConfig<TriggerId>[]): void;
/**
 * Scans left from the cursor for the nearest trigger character that starts a
 * token (start-of-text or preceded by whitespace) with no whitespace between
 * it and the cursor. The whitespace-between check is what must reject
 * `"user@example.com"` — the char before `@` is `r`, not whitespace/start —
 * and cancel an already-open mention the moment the user types a space, the
 * same convention every mention UI (Slack, Discord, GitHub) uses so the query
 * can never run away across word boundaries. Operating on the resolved text
 * value and a single cursor offset (never individual keystrokes) is also why
 * Hangul composition needs no special-casing here: a composing jamo is
 * already a valid code point in that string the moment `onChange` fires,
 * composed or not.
 */
export declare function findActiveMentionTrigger<TriggerId extends string>(text: string, cursorPosition: number, triggers: readonly MentionTriggerConfig<TriggerId>[]): MentionMatch<TriggerId> | null;
export type MentionInsertionResult = Readonly<{
    text: string;
    /** Caret offset immediately after the inserted mention and its trailing space. */
    cursorPosition: number;
}>;
/**
 * Replaces `[match.triggerStart, cursorPosition)` — the trigger character
 * through wherever the caret sits now — with the trigger plus the product's
 * display text plus a trailing space, so typing can continue without fusing
 * into the mention. The trigger character is always prepended here, not by
 * the caller, so it can never be forgotten or duplicated.
 */
export declare function resolveMentionInsertion<TriggerId extends string>(text: string, match: MentionMatch<TriggerId>, cursorPosition: number, insertedText: string): MentionInsertionResult;
/**
 * No new recipe or behaviorRegistry entry: the popup is
 * `behaviorRegistry.combobox` verbatim (roles, keyboard, dismiss, the
 * `ime-composition-does-not-prematurely-filter-or-commit` scenario already
 * covers composed text), layered on a plain `TextArea`. These scenarios are
 * the trigger-detection slice combobox's list does not already cover.
 */
export declare const mentionsBehaviorScenarios: readonly ["trigger-preceded-by-a-non-whitespace-character-does-not-open-the-popup", "typing-a-space-after-the-trigger-closes-the-popup-without-committing", "empty-query-right-after-the-trigger-is-a-valid-active-match", "ime-composition-updates-the-query-like-any-other-text-change-no-special-casing-needed", "commit-always-inserts-the-trigger-character-exactly-once", "commit-replaces-exactly-the-trigger-through-the-current-cursor-nothing-before-or-after", "two-configured-triggers-never-share-a-character-or-an-id", "the-nearer-trigger-to-the-cursor-wins-when-an-earlier-token-also-looks-like-a-trigger"];
//# sourceMappingURL=mentions.d.ts.map