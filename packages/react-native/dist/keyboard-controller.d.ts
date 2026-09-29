import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import type { ComponentProps, ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
/** Install once at the app root; never nest providers per input or CTA. */
export declare function KeyboardMotionProvider({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
export type KeyboardDockProps = {
    children: ReactNode;
    enabled?: boolean;
    /** Additional clearance above the keyboard, in layout points. */
    clearance?: number;
    style?: StyleProp<ViewStyle>;
};
/** Wrap BottomCTA or a chat composer. The host owns bottom safe-area padding. */
export declare function KeyboardDock({ children, enabled, clearance, style }: KeyboardDockProps): import("react").JSX.Element;
export type KeyboardFormScrollViewProps = Pick<ComponentProps<typeof KeyboardAwareScrollView>, "children" | "style" | "contentContainerStyle" | "bottomOffset" | "enabled" | "testID">;
export declare function KeyboardFormScrollView(props: KeyboardFormScrollViewProps): import("react").JSX.Element;
//# sourceMappingURL=keyboard-controller.d.ts.map