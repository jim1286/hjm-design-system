import { type ReactNode } from "react";
import { type ButtonProps, type IconButtonProps } from "./actions.js";
export type ClipboardButtonProps = Omit<ButtonProps, "children" | "onClick" | "onCopy"> & Readonly<{
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
export declare const ClipboardButton: import("react").ForwardRefExoticComponent<Omit<ButtonProps, "children" | "onClick" | "onCopy"> & Readonly<{
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
export type ClipboardIconButtonProps = Omit<IconButtonProps, "children" | "label" | "onClick" | "onCopy" | "selected"> & Readonly<{
    value: string;
    /** Localized accessible names for both states; the icon carries no visible text. */
    labels: Readonly<{
        idle: string;
        copied: string;
    }>;
    feedbackDuration?: number;
    onCopy?: (value: string) => void;
    onCopyError?: (error: unknown) => void;
}>;
/**
 * Copy as a tool action (a code block or share-link header): an icon button named by the localized label, copy → check
 * while the copied state lasts. A bordered text button there read as a form action (2026-10-17 review E10).
 */
export declare const ClipboardIconButton: import("react").ForwardRefExoticComponent<Omit<IconButtonProps, "children" | "label" | "onClick" | "onCopy" | "selected"> & Readonly<{
    value: string;
    /** Localized accessible names for both states; the icon carries no visible text. */
    labels: Readonly<{
        idle: string;
        copied: string;
    }>;
    feedbackDuration?: number;
    onCopy?: (value: string) => void;
    onCopyError?: (error: unknown) => void;
}> & import("react").RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=clipboard.d.ts.map