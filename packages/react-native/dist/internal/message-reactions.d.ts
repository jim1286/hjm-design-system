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
    replyAction?: Readonly<{
        label: string;
        onPress(): void;
        disabled?: boolean;
    }>;
}>;
/** Core RN composition: no optional context-menu/Expo dependency enters the screens subpath. */
export declare function MessageReactions({ children, closeLabel, replyAction, menuAction, interactiveContent, ...picker }: Props): import("react").JSX.Element;
export {};
//# sourceMappingURL=message-reactions.d.ts.map