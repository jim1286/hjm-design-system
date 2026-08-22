function isWhitespace(char) {
    return char !== undefined && /\s/.test(char);
}
/**
 * Rejects the configuration shapes a naive Mentions implementation would
 * accept and then fail on later: an empty trigger list (nothing to detect),
 * a multi-character or whitespace trigger (the scan below assumes exactly one
 * non-whitespace code unit), and two configs racing on the same character or
 * id.
 */
export function validateMentionTriggers(triggers) {
    if (triggers.length === 0) {
        throw new TypeError("Mentions must configure at least one trigger");
    }
    const chars = new Set();
    const ids = new Set();
    for (const config of triggers) {
        if (config.trigger.length !== 1) {
            throw new TypeError(`Mentions trigger must be exactly one character: ${JSON.stringify(config.trigger)}`);
        }
        if (isWhitespace(config.trigger)) {
            throw new TypeError("Mentions trigger must not be whitespace");
        }
        if (chars.has(config.trigger)) {
            throw new TypeError(`Duplicate Mentions trigger character: ${config.trigger}`);
        }
        chars.add(config.trigger);
        if (ids.has(config.id)) {
            throw new TypeError(`Duplicate Mentions trigger id: ${config.id}`);
        }
        ids.add(config.id);
    }
}
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
export function findActiveMentionTrigger(text, cursorPosition, triggers) {
    validateMentionTriggers(triggers);
    if (cursorPosition < 0 || cursorPosition > text.length) {
        throw new RangeError("Mentions cursorPosition must be within the text bounds");
    }
    for (let index = cursorPosition - 1; index >= 0; index -= 1) {
        const char = text[index];
        if (isWhitespace(char))
            return null;
        const config = triggers.find((candidate) => candidate.trigger === char);
        if (config && (index === 0 || isWhitespace(text[index - 1]))) {
            return {
                triggerId: config.id,
                trigger: config.trigger,
                triggerStart: index,
                query: text.slice(index + 1, cursorPosition),
            };
        }
    }
    return null;
}
/**
 * Replaces `[match.triggerStart, cursorPosition)` — the trigger character
 * through wherever the caret sits now — with the trigger plus the product's
 * display text plus a trailing space, so typing can continue without fusing
 * into the mention. The trigger character is always prepended here, not by
 * the caller, so it can never be forgotten or duplicated.
 */
export function resolveMentionInsertion(text, match, cursorPosition, insertedText) {
    if (insertedText.trim().length === 0) {
        throw new TypeError("Mentions insertedText must not be empty");
    }
    if (cursorPosition < match.triggerStart || cursorPosition > text.length) {
        throw new RangeError("Mentions cursorPosition must be at or after the matched trigger");
    }
    const before = text.slice(0, match.triggerStart);
    const after = text.slice(cursorPosition);
    const inserted = `${match.trigger}${insertedText} `;
    return {
        text: `${before}${inserted}${after}`,
        cursorPosition: before.length + inserted.length,
    };
}
/**
 * No new recipe or behaviorRegistry entry: the popup is
 * `behaviorRegistry.combobox` verbatim (roles, keyboard, dismiss, the
 * `ime-composition-does-not-prematurely-filter-or-commit` scenario already
 * covers composed text), layered on a plain `TextArea`. These scenarios are
 * the trigger-detection slice combobox's list does not already cover.
 */
export const mentionsBehaviorScenarios = [
    "trigger-preceded-by-a-non-whitespace-character-does-not-open-the-popup",
    "typing-a-space-after-the-trigger-closes-the-popup-without-committing",
    "empty-query-right-after-the-trigger-is-a-valid-active-match",
    "ime-composition-updates-the-query-like-any-other-text-change-no-special-casing-needed",
    "commit-always-inserts-the-trigger-character-exactly-once",
    "commit-replaces-exactly-the-trigger-through-the-current-cursor-nothing-before-or-after",
    "two-configured-triggers-never-share-a-character-or-an-id",
    "the-nearer-trigger-to-the-cursor-wins-when-an-earlier-token-also-looks-like-a-trigger",
];
//# sourceMappingURL=mentions.js.map