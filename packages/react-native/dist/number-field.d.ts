import type { ComponentRef } from "react";
import { type NumberFieldSize, type NumberFieldValue } from "@hjmds/design-contracts/components/number-field";
import { forwardRef } from "react";
import { TextInput, type TextInputProps } from "react-native";
import type { HjmCompositionStyleProp } from "./composition-style.js";
type NativeNumberInputProps = Omit<TextInputProps, "accessibilityActions" | "accessibilityHint" | "accessibilityLabel" | "accessibilityRole" | "accessibilityState" | "accessibilityValue" | "defaultValue" | "editable" | "inputMode" | "keyboardType" | "multiline" | "onAccessibilityAction" | "onChangeText" | "readOnly" | "style" | "value">;
export type NumberFieldProps = NativeNumberInputProps & Readonly<{
    label: string;
    min: number;
    max: number;
    step?: number;
    value?: NumberFieldValue;
    defaultValue?: NumberFieldValue;
    onValueChange?: (value: NumberFieldValue) => void;
    description?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    size?: NumberFieldSize;
    /** Product-localized accessible name for the decrement action. */
    decrementLabel: string;
    /** Product-localized accessible name for the increment action. */
    incrementLabel: string;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    /** Optional product formatting for assistive output, never the editable text. */
    getValueText?: (value: number) => string;
    inputMode?: "decimal" | "numeric" | "text";
    /** Canonical layout-only placement for the complete field. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Expo-independent exact numeric input sharing the Web range/step resolver. */
export declare const NumberField: ReturnType<typeof forwardRef<ComponentRef<typeof TextInput>, NumberFieldProps>>;
export {};
//# sourceMappingURL=number-field.d.ts.map