import type { ComponentRef } from "react";
import { forwardRef, type ReactNode } from "react";
import { View, type LayoutChangeEvent, type ViewProps } from "react-native";
import type { HjmCompositionStyleProp } from "./composition-style.js";
type NativeSliderViewProps = Omit<ViewProps, "accessibilityActions" | "accessibilityLabel" | "accessibilityRole" | "accessibilityState" | "accessibilityValue" | "accessible" | "children" | "onAccessibilityAction" | "onLayout" | "style">;
export type SliderProps = NativeSliderViewProps & Readonly<{
    label: string;
    min: number;
    max: number;
    step?: number;
    value?: number;
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    onValueChangeEnd?: (value: number) => void;
    disabled?: boolean;
    /** Product-localized label for the standard adjustable decrement action. */
    decrementLabel: string;
    /** Product-localized label for the standard adjustable increment action. */
    incrementLabel: string;
    /** Product-owned visible and accessible value formatting. */
    getValueText?: (value: number) => string;
    onLayout?: (event: LayoutChangeEvent) => void;
    /** Canonical layout-only placement for the complete slider. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/**
 * HJM-internal: ColorPicker's hue and opacity bars reuse this gesture and accessibility logic with a painted track.
 * The visible header is dropped (the bar itself shows the value) and the thumb shows the colour under it.
 */
export type SliderPrivateProps = Readonly<{
    hjmColorTrack?: Readonly<{
        fill: ReactNode;
        thumbFill: ReactNode;
        height: number;
        thumbDiameter: number;
        thumbBorder: number;
    }>;
}>;
/** Dependency-free horizontal Slider using the Native responder system. */
export declare const Slider: ReturnType<typeof forwardRef<ComponentRef<typeof View>, SliderProps>>;
export {};
//# sourceMappingURL=slider.d.ts.map