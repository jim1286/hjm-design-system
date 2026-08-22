import { View, type LayoutChangeEvent, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
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
    containerStyle?: StyleProp<ViewStyle>;
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
    containerStyle?: StyleProp<ViewStyle>;
    controlStyle?: StyleProp<ViewStyle>;
}> & import("react").RefAttributes<View>>;
export {};
//# sourceMappingURL=slider.d.ts.map