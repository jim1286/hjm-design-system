import { resolveKeyboardAvoidanceBehavior, type KeyboardAvoidanceDescriptor } from "@hjmds/design-contracts/components/native-platform";
import { type ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
export type KeyboardAvoidingProps = KeyboardAvoidanceDescriptor & Readonly<{
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
}>;
/**
 * Keeps bottom actions above the keyboard. Products were each choosing
 * `KeyboardAvoidingView`'s behavior themselves and re-discovering that a
 * BottomCTA disappears under the keyboard; the platform answer is fixed, so it
 * lives in the contract and this renderer just applies it.
 */
export declare function KeyboardAvoiding({ children, offset, safeAreaBottom, style }: KeyboardAvoidingProps): import("react").JSX.Element;
/** Re-exported so a product does not import the contract twice for one value. */
export { resolveKeyboardAvoidanceBehavior };
//# sourceMappingURL=keyboard.d.ts.map