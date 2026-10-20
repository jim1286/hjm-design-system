import type { ComponentRef } from "react";
import { forwardRef } from "react";
import { type View as NativeView, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import type { ButtonProps } from "../actions.js";
type RecipeButtonProps = ButtonProps & Readonly<{
    style?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
}>;
export declare const RecipeButton: ReturnType<typeof forwardRef<ComponentRef<typeof NativeView>, RecipeButtonProps>>;
export {};
//# sourceMappingURL=recipe-button.d.ts.map