import { type NumberFieldSize, type NumberFieldValue } from "@hjmds/design-contracts/components/number-field";
import { type InputHTMLAttributes, type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
type NativeNumberInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "aria-errormessage" | "aria-valuemax" | "aria-valuemin" | "aria-valuenow" | "aria-valuetext" | "children" | "className" | "defaultValue" | "disabled" | "max" | "min" | "onChange" | "readOnly" | "required" | "role" | "size" | "step" | "type" | "value">;
export type NumberFieldProps = NativeNumberInputProps & Readonly<{
    label: ReactNode;
    min: number;
    max: number;
    step?: number;
    value?: NumberFieldValue;
    defaultValue?: NumberFieldValue;
    onValueChange?: (value: NumberFieldValue) => void;
    description?: ReactNode;
    error?: ReactNode;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    size?: NumberFieldSize;
    /** Product-localized accessible name for the decrement action. */
    decrementLabel: string;
    /** Product-localized accessible name for the increment action. */
    incrementLabel: string;
    /** Optional product formatting for assistive output, never the editable text. */
    getValueText?: (value: number) => string;
    className?: string;
    inputClassName?: string;
    /**
     * Canonical layout-only placement on the field frame. `style` keeps going to
     * the input element, where it always went, so existing callers do not move.
     */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/**
 * Exact numeric entry with a nullable draft and explicit single-step actions.
 * Typing commits on blur; steppers and ArrowUp/ArrowDown commit immediately.
 */
export declare const NumberField: import("react").ForwardRefExoticComponent<NativeNumberInputProps & Readonly<{
    label: ReactNode;
    min: number;
    max: number;
    step?: number;
    value?: NumberFieldValue;
    defaultValue?: NumberFieldValue;
    onValueChange?: (value: NumberFieldValue) => void;
    description?: ReactNode;
    error?: ReactNode;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    size?: NumberFieldSize;
    /** Product-localized accessible name for the decrement action. */
    decrementLabel: string;
    /** Product-localized accessible name for the increment action. */
    incrementLabel: string;
    /** Optional product formatting for assistive output, never the editable text. */
    getValueText?: (value: number) => string;
    className?: string;
    inputClassName?: string;
    /**
     * Canonical layout-only placement on the field frame. `style` keeps going to
     * the input element, where it always went, so existing callers do not move.
     */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLInputElement>>;
export {};
//# sourceMappingURL=number-field.d.ts.map