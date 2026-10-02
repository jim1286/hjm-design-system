import { View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
export declare const RecipeButton: import("react").ForwardRefExoticComponent<Omit<import("react-native").PressableProps, "style" | "children" | "hitSlop" | "accessibilityRole" | "accessibilityState" | "disabled"> & Readonly<{
    children?: import("react").ReactNode;
    tone?: import("../actions.js").ButtonTone;
    size?: import("../actions.js").ButtonSize;
    shape?: import("../actions.js").ButtonShape;
    align?: import("../actions.js").ButtonAlign;
    selected?: boolean;
    disabled?: boolean;
    loading?: boolean;
    disableWhileLoading?: boolean;
    growWithContent?: boolean;
    loadingLabel?: import("react").ReactNode;
    leading?: import("react").ReactNode;
    trailing?: import("react").ReactNode;
    fullWidth?: boolean;
    hitSlop?: import("react-native").PressableProps["hitSlop"];
    accessibilityState?: import("react-native").PressableProps["accessibilityState"];
    layoutStyle?: import("../composition-style.js").HjmCompositionStyleProp;
    renderLoadingIndicator?: (props: Readonly<{
        color: string;
        size: "small";
    }>) => import("react").ReactNode;
}> & Readonly<{
    style?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
}> & import("react").RefAttributes<View>>;
//# sourceMappingURL=recipe-button.d.ts.map