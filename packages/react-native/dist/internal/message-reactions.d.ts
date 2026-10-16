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
    interactiveContent?: boolean;
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
/** Core RN composition: no optional context-menu/Expo dependency enters the screens subpath. */
export declare function MessageReactions({ children, closeLabel, replyAction, menuAction, menuTitle, menuActions, reportAction, interactiveContent, ...picker }: Props): import("react").JSX.Element;
export {};
//# sourceMappingURL=message-reactions.d.ts.map