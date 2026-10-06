import type { ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
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