import { type ReactNode } from "react";
import { type ReactionPickerProps } from "../reaction-picker.js";
/** One row of the hold menu. Products supply copy and icons; HJM owns order, size and tone. */
export type MessageMenuAction = Readonly<{
    id: string;
    label: string;
    icon?: ReactNode;
    onPress(): void;
    disabled?: boolean;
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
}>;
/** Chat-specific trigger translation; Popover retains collision, focus, Escape and outside dismissal. */
export declare function MessageReactions({ children, closeLabel, menuAction, interactiveContent, triggerClassName, replyAction, menuTitle, menuActions, reportAction, ...picker }: Props): import("react").JSX.Element;
export {};
//# sourceMappingURL=message-reactions.d.ts.map