import { validateImageChoiceItems } from "./image-choice.js";
export const shareSheetRecipe = {
    /** The picker scrolls in a tall sheet; external actions alone keep the sheet at its content height. */
    size: { recipients: "large", externalOnly: "auto" },
    /** Body regions (notices, search, list) and footer rows (send button above the action row). */
    bodyGap: "md",
    footerGap: "xs",
    /** Two round external actions centred in one row, each with its caption below (BurnTok 1.28 share footer). */
    actionGap: "xxxl",
    actionCaptionGap: "xs",
    actionButton: { tone: "secondary", size: "large" },
    actionCaptionVariant: "caption",
    sendButton: { tone: "primary", size: "large" },
    /**
     * Recipients are picked by face and name. Two name lines: a 12-character nickname ends near six Hangul glyphs on
     * one 80-wide caption line (BurnTok share recipients, 2026-10-18).
     */
    picker: { showItemLabels: true, itemLabelLines: 2 },
};
export function validateShareSheet(input) {
    if (!input.title.trim())
        throw new TypeError("ShareSheet title must not be empty");
    if (!input.link.trim())
        throw new TypeError("ShareSheet link must not be empty");
    for (const [key, value] of Object.entries(input.labels)) {
        if (typeof value !== "string" || !value.trim())
            throw new TypeError(`ShareSheet labels.${key} must be localized text`);
    }
}
/** Recipients the sheet shows for a search: every item for a blank query, else label matches (locale lower case). */
export function filterShareSheetRecipients(items, query) {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle)
        return items;
    return items.filter(item => item.label.toLocaleLowerCase().includes(needle));
}
/** Validates the full recipient list (unique ids, localized labels) the same way the picker does. */
export function validateShareSheetRecipients(items) {
    if (items.length)
        validateImageChoiceItems(items);
}
/**
 * Splits one send attempt into delivered and failed ids. A product reporting an id it was not asked to send is a bug
 * (it would mark someone as sent who never was), so it throws instead of being ignored.
 */
export function resolveShareSheetSendOutcome(requested, result) {
    const asked = new Set(requested);
    for (const id of result.sentIds) {
        if (!asked.has(id))
            throw new TypeError(`ShareSheet onSend reported "${id}", which was not requested`);
    }
    const delivered = new Set(result.sentIds);
    return { sent: requested.filter(id => delivered.has(id)), failed: requested.filter(id => !delivered.has(id)) };
}
/**
 * The picker value: the user's selection plus every already-sent recipient, which stays checked and locked so it
 * cannot be sent twice.
 */
export function resolveShareSheetPickerValue(selected, sent, visibleIds) {
    return [...selected.filter(id => !sent.has(id)), ...visibleIds.filter(id => sent.has(id))];
}
//# sourceMappingURL=share-sheet.js.map