import { type ReactNode } from "react";
import { type ReactionPickerProps } from "../reaction-picker.js";
type Props = ReactionPickerProps & Readonly<{
    closeLabel: string;
    menuAction?: Readonly<{
        label: string;
        onPress(): void;
        disabled?: boolean;
    }>;
    children: ReactNode;
    interactiveContent?: boolean;
}>;
/** Chat-specific trigger translation; Popover retains collision, focus, Escape and outside dismissal. */
export declare function MessageReactions({ children, closeLabel, menuAction, interactiveContent, ...picker }: Props): import("react").JSX.Element;
export {};
//# sourceMappingURL=message-reactions.d.ts.map