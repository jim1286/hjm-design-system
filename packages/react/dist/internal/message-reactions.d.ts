import { type ReactNode, type Ref } from "react";
import { type ChatReactionSummaryItem } from "@hjmds/design-contracts/screen-patterns";
import type { MenuItemTone } from "@hjmds/design-contracts/recipes";
import { type ReactionPickerProps } from "../reaction-picker.js";
/** One row of the hold menu. Products supply copy and icons; HJM owns order, size and tone. */
export type MessageMenuAction = Readonly<{
    id: string;
    label: string;
    icon?: ReactNode;
    onPress(): void;
    disabled?: boolean; /** Shows › for rows that open a further list. */
    submenu?: boolean;
    /** Same vocabulary as Menu items: `danger` for destructive rows such as delete (default `neutral`). */ tone?: MenuItemTone;
}>;
/** Lets the owning message open the same hold menu from its reaction summary. */
export type MessageReactionsHandle = Readonly<{
    open(): void;
}>;
type Props = ReactionPickerProps & Readonly<{
    closeLabel: string;
    menuAction?: Readonly<{
        label: string;
        onPress(): void;
        disabled?: boolean;
    }>;
    children: ReactNode;
    interactiveContent?: boolean; /** Comments reuse the hold menu without chat bubble styling. */
    triggerClassName?: string;
    replyAction?: Readonly<{
        label: string;
        onPress(): void;
        disabled?: boolean;
        icon?: ReactNode;
    }>;
    /** Shown above the actions, e.g. the exact send time that a run only shows once. */
    menuTitle?: string;
    menuActions?: readonly MessageMenuAction[];
    /** Always last and in the danger tone, matching the measured reference menu (2026-10-16). */
    reportAction?: Readonly<{
        label: string;
        onPress(): void;
        disabled?: boolean;
        icon?: ReactNode;
    }>;
    menuRef?: Ref<MessageReactionsHandle>;
}>;
/** Chat-specific trigger translation; Popover retains collision, focus, Escape and outside dismissal. */
export declare function MessageReactions({ children, closeLabel, menuAction, interactiveContent, triggerClassName, replyAction, menuTitle, menuActions, reportAction, menuRef, ...picker }: Props): import("react").JSX.Element;
/** ChatMessage strips its summary before spreading the rest into the hold menu. */
export declare function omitReactionSummary<T extends Readonly<{
    summary?: unknown;
}>>({ summary: _summary, ...rest }: T): Omit<T, "summary">;
/**
 * Current reactions as one button beside the time; pressing it opens the hold menu (the press target and its name
 * are the whole pill, so per-emoji parts are hidden from assistive tech). The pill shows the brand border when the
 * reader's own reaction is among the items.
 */
export declare function ReactionSummaryButton({ label, items, selected, disabled, onPress }: Readonly<{
    label: string;
    items: readonly (ChatReactionSummaryItem & Readonly<{
        showCount: boolean;
    }>)[];
    selected: string | null;
    disabled: boolean;
    onPress(): void;
}>): import("react").JSX.Element;
/**
 * Read-only counts (`summary.readOnly`, 2026-10-18 Utilverse guests who cannot react): the same place and items as
 * the pill, as plain caption text without the pill surface, so it is neither drawn nor announced as a control. The
 * product label is the text screen readers read; the drawn emoji and numbers are hidden from them.
 */
export declare function ReactionSummaryText({ label, items }: Readonly<{
    label: string;
    items: readonly (ChatReactionSummaryItem & Readonly<{
        showCount: boolean;
    }>)[];
}>): import("react").JSX.Element;
export {};
//# sourceMappingURL=message-reactions.d.ts.map