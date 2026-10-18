import { type ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
/**
 * The shared Field error announcement (Web: internal/field-error.tsx). Android announces the assertive
 * live region; iOS ignores live regions, so each new or changed error is announced once. Before 1.31
 * only MessageComposer and FieldGroup announced on iOS (2026-10-18), so other field errors were silent.
 */
export declare function useFieldErrorAnnouncement(error: string | undefined): void;
/** Error line for controls that draw their own caption (Select, Combobox) with the same announcement. */
export declare function FieldErrorText({ error }: Readonly<{
    error: string;
}>): import("react").JSX.Element;
export declare function FieldMessage({ error, supportText }: Readonly<{
    error?: string;
    supportText?: string;
}>): import("react").JSX.Element | null;
export declare function NativeFieldFrame({ label, required, error, description, children, style, groupControl, disabledOpacity }: Readonly<{
    label?: string;
    required?: boolean;
    error?: string;
    description?: string;
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    groupControl?: boolean;
    disabledOpacity?: number;
}>): import("react").JSX.Element;
//# sourceMappingURL=field-frame.d.ts.map