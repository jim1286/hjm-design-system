import { type ImageChoiceItemDescriptor } from "./image-choice.js";
/**
 * Sharing one link (2026-10-26 user request "번뚝 공유 그대로 공통화"): BurnTok's Web and Native share sheets are the
 * reference. One Sheet offers in-app recipients (optional) plus two external actions — copy link and the OS share
 * sheet. The product owns the link, the recipient data and the delivery; HJM owns the layout, selection, in-flight
 * guards and the honest feedback (the OS share sheet only proves it opened, never that anything was delivered).
 */
export type ShareSheetRecipientDescriptor = ImageChoiceItemDescriptor;
/** Where the recipient list is: the product fetches it, the sheet shows the matching state. */
export type ShareSheetRecipientStatus = "ready" | "loading" | "error";
/**
 * What `onSend` reports back. `sentIds` are the requested ids the product delivered; every other requested id stays
 * selected so the user can retry only those (a partial batch must not resend the delivered ones). `error` is the
 * product's localized reason for the failures; without it the sheet shows `labels.sendFailed`.
 */
export type ShareSheetSendResult = Readonly<{
    sentIds: readonly string[];
    error?: string;
}>;
/** Payload for the OS share sheet. */
export type ShareSheetShareContent = Readonly<{
    url: string;
    title?: string;
    text?: string;
}>;
/**
 * How the OS share sheet closed. `completed` means the user picked a target, not that it was delivered; `dismissed`
 * means they backed out (Web `AbortError`, iOS `dismissedAction`). Android always reports `completed`.
 */
export type ShareSheetSystemShareOutcome = "completed" | "dismissed";
/** Localized copy for the sheet chrome and the external actions. The renderer invents none. */
export type ShareSheetLabels = Readonly<{
    /** Accessible name of the Sheet close action. */
    close: string;
    copyLink: string;
    systemShare: string;
    /** Announced (polite) after the link reached the clipboard. */
    linkCopied: string;
    /** Shown when copying or opening the OS share sheet failed. */
    actionFailed: string;
}>;
/** Localized copy for the recipient section. */
export type ShareSheetRecipientLabels = Readonly<{
    /** Accessible name of the recipient group (e.g. "Choose who to send to"). */
    group: string;
    /** Search field name and placeholder. */
    search: string;
    clearSearch: string;
    loading: string;
    loadFailed: string;
    retry: string;
    /** No recipients at all. */
    empty: string;
    /** Recipients exist but none match the search. */
    noResults: string;
    /** Item description of an already-sent recipient. */
    sent: string;
    /** Send failure without a product reason. */
    sendFailed: string;
    /** Footer action, e.g. `count => \`Send to ${count}\``. */
    send: (count: number) => string;
}>;
export declare const shareSheetRecipe: {
    /** The picker scrolls in a tall sheet; external actions alone keep the sheet at its content height. */
    readonly size: {
        recipients: "large";
        externalOnly: "auto";
    };
    /** Body regions (notices, search, list) and footer rows (send button above the action row). */
    readonly bodyGap: "md";
    readonly footerGap: "xs";
    /** Two round external actions centred in one row, each with its caption below (BurnTok 1.28 share footer). */
    readonly actionGap: "xxxl";
    readonly actionCaptionGap: "xs";
    readonly actionButton: {
        readonly tone: "secondary";
        readonly size: "large";
    };
    readonly actionCaptionVariant: "caption";
    readonly sendButton: {
        readonly tone: "primary";
        readonly size: "large";
    };
    /**
     * Recipients are picked by face and name. Two name lines: a 12-character nickname ends near six Hangul glyphs on
     * one 80-wide caption line (BurnTok share recipients, 2026-10-18).
     */
    readonly picker: {
        readonly showItemLabels: true;
        readonly itemLabelLines: 2;
    };
};
export declare function validateShareSheet(input: Readonly<{
    title: string;
    link: string;
    labels: ShareSheetLabels;
}>): void;
/** Recipients the sheet shows for a search: every item for a blank query, else label matches (locale lower case). */
export declare function filterShareSheetRecipients<Item extends ShareSheetRecipientDescriptor>(items: readonly Item[], query: string): readonly Item[];
/** Validates the full recipient list (unique ids, localized labels) the same way the picker does. */
export declare function validateShareSheetRecipients(items: readonly ShareSheetRecipientDescriptor[]): void;
/**
 * Splits one send attempt into delivered and failed ids. A product reporting an id it was not asked to send is a bug
 * (it would mark someone as sent who never was), so it throws instead of being ignored.
 */
export declare function resolveShareSheetSendOutcome(requested: readonly string[], result: ShareSheetSendResult): Readonly<{
    sent: readonly string[];
    failed: readonly string[];
}>;
/**
 * The picker value: the user's selection plus every already-sent recipient, which stays checked and locked so it
 * cannot be sent twice.
 */
export declare function resolveShareSheetPickerValue(selected: readonly string[], sent: ReadonlySet<string>, visibleIds: readonly string[]): string[];
//# sourceMappingURL=share-sheet.d.ts.map