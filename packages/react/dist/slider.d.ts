import { type CSSProperties, type InputHTMLAttributes } from "react";
type NativeSliderInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "aria-label" | "aria-orientation" | "aria-valuemax" | "aria-valuemin" | "aria-valuenow" | "aria-valuetext" | "children" | "className" | "defaultValue" | "max" | "min" | "onChange" | "readOnly" | "size" | "step" | "type" | "value">;
export type SliderProps = NativeSliderInputProps & Readonly<{
    label: string;
    min: number;
    max: number;
    step?: number;
    value?: number;
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    onValueChangeEnd?: (value: number) => void;
    /** Product-owned visible and accessible value formatting. */
    getValueText?: (value: number) => string;
    className?: string;
    inputClassName?: string;
    style?: CSSProperties;
}>;
/** Native range semantics with HJM visuals and explicit change-end behavior. */
export declare const Slider: import("react").ForwardRefExoticComponent<NativeSliderInputProps & Readonly<{
    label: string;
    min: number;
    max: number;
    step?: number;
    value?: number;
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    onValueChangeEnd?: (value: number) => void;
    /** Product-owned visible and accessible value formatting. */
    getValueText?: (value: number) => string;
    className?: string;
    inputClassName?: string;
    style?: CSSProperties;
}> & import("react").RefAttributes<HTMLInputElement>>;
export {};
//# sourceMappingURL=slider.d.ts.map