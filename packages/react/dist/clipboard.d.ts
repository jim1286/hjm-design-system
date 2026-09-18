import { type ReactNode } from "react";
import { type ButtonProps } from "./actions.js";
export type ClipboardButtonProps = Omit<ButtonProps, "children" | "onClick"> & Readonly<{
    value: string;
    /** Localized copy for both states; the renderer invents neither. */
    labels: Readonly<{
        idle: ReactNode;
        copied: ReactNode;
    }>;
    /** How long the copied state stays, in ms. */
    feedbackDuration?: number;
    onCopy?: (value: string) => void;
    onCopyError?: (error: unknown) => void;
}>;
/**
 * Copying is three things products kept re-deriving: the async clipboard call,
 * the temporary "copied" state, and announcing that state to a screen reader.
 * The last one is the part that was always missing — a label that only changes
 * visually tells a non-sighted user nothing happened.
 */
export declare const ClipboardButton: import("react").ForwardRefExoticComponent<Omit<ButtonProps, "children" | "onClick"> & Readonly<{
    value: string;
    /** Localized copy for both states; the renderer invents neither. */
    labels: Readonly<{
        idle: ReactNode;
        copied: ReactNode;
    }>;
    /** How long the copied state stays, in ms. */
    feedbackDuration?: number;
    onCopy?: (value: string) => void;
    onCopyError?: (error: unknown) => void;
}> & import("react").RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=clipboard.d.ts.map