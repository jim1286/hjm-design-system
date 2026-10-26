import { type ReactNode } from "react";
import type { SheetOpenChangeDetails } from "@hjmds/design-contracts/components/sheet";
import { type ShareSheetLabels, type ShareSheetRecipientDescriptor, type ShareSheetRecipientLabels, type ShareSheetRecipientStatus, type ShareSheetSendResult, type ShareSheetShareContent, type ShareSheetSystemShareOutcome } from "@hjmds/design-contracts/share-sheet";
export type { ShareSheetLabels, ShareSheetRecipientLabels, ShareSheetRecipientStatus, ShareSheetSendResult, ShareSheetShareContent, ShareSheetSystemShareOutcome, } from "@hjmds/design-contracts/share-sheet";
export type ShareSheetRecipient = ShareSheetRecipientDescriptor & Readonly<{
    image: ReactNode;
}>;
export type ShareSheetRecipientSearch = Readonly<{
    /** Controlled query. With `onQueryChange` the product owns the query and `items` is already its result. */
    query?: string;
    onQueryChange?: (query: string) => void;
    /** A server search is running. */
    searching?: boolean;
}>;
export type ShareSheetRecipients = Readonly<{
    items: readonly ShareSheetRecipient[];
    labels: ShareSheetRecipientLabels;
    /** Default `ready`. */
    status?: ShareSheetRecipientStatus;
    /** Shown with the `error` state. */
    onRetry?: () => void;
    retrying?: boolean;
    /** Omit to filter `items` by label here; pass `onQueryChange` to search on the server. */
    search?: ShareSheetRecipientSearch;
    /** Recipients that already received this link (before the sheet opened). They stay checked and locked. */
    sentIds?: readonly string[];
    /** Sends the link to the selected ids. Delivered ids lock as sent; the rest stay selected for a retry. */
    onSend: (ids: readonly string[]) => Promise<ShareSheetSendResult>;
}>;
export type ShareSheetProps = Readonly<{
    open: boolean;
    onOpenChange: (open: boolean, detail: SheetOpenChangeDetails) => void;
    title: string;
    labels: ShareSheetLabels;
    /** The URL that is copied and shared. */
    link: string;
    /** Title and text handed to the OS share sheet with the link. */
    shareTitle?: string;
    shareText?: string;
    /**
     * Writes the link to the clipboard (e.g. `expo-clipboard`), or `null` to hide the action. React Native core has no
     * clipboard and HJM installs no native clipboard module, so the product supplies it.
     */
    copyLink: ((link: string) => Promise<void>) | null;
    /** Replaces React Native `Share.share` (e.g. an iOS module with a rich preview); `false` hides the action. */
    systemShare?: ((content: ShareSheetShareContent) => Promise<ShareSheetSystemShareOutcome>) | false;
    onLinkCopied?: () => void;
    /** The OS share sheet closed. `completed` is not a delivery receipt. */
    onSystemShare?: (outcome: ShareSheetSystemShareOutcome) => void;
    /** Product artwork for the two actions; Native core draws no copy/share glyphs of its own. */
    icons: Readonly<{
        copyLink: ReactNode;
        systemShare: ReactNode;
    }>;
    /** In-app recipients (group chats, followers). Omit for external sharing only. */
    recipients?: ShareSheetRecipients;
    /** Product feedback above the body, such as a reward earned by sending. */
    notice?: ReactNode;
}>;
/**
 * One Sheet for sharing a link (2026-10-26, generalized from BurnTok's share sheets): optional in-app recipients with a
 * batch send, then copy link and the OS share sheet as two round actions in the footer.
 */
export declare function ShareSheet({ open, onOpenChange, title, labels, link, shareTitle, shareText, copyLink, systemShare, onLinkCopied, onSystemShare, icons, recipients, notice, }: ShareSheetProps): import("react").JSX.Element;
//# sourceMappingURL=share-sheet.d.ts.map