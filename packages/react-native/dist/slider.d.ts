import { View, type LayoutChangeEvent, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
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
    /**
     * @deprecated Raw container style bypasses `sliderRecipe`. Use `layoutStyle` for placement.
     * Removed in the next major (consumer-policy.md §3.1).
     */
    containerStyle?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw control style bypasses `sliderRecipe` (track, thumb and hit target).
     * Removed in the next major (consumer-policy.md §3.1).
     */
    controlStyle?: StyleProp<ViewStyle>;
}>;
/** Dependency-free horizontal Slider using the Native responder system. */
export declare const Slider: import("react").ForwardRefExoticComponent<NativeSliderViewProps & Readonly<{
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
    /**
     * @deprecated Raw container style bypasses `sliderRecipe`. Use `layoutStyle` for placement.
     * Removed in the next major (consumer-policy.md §3.1).
     */
    containerStyle?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw control style bypasses `sliderRecipe` (track, thumb and hit target).
     * Removed in the next major (consumer-policy.md §3.1).
     */
    controlStyle?: StyleProp<ViewStyle>;
}> & import("react").RefAttributes<View>>;
export {};
//# sourceMappingURL=slider.d.ts.map