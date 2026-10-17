import { resolveKeyboardAvoidanceBehavior, type KeyboardAvoidanceDescriptor } from "@hjmds/design-contracts/components/native-platform";
import { type ReactNode, type RefObject } from "react";
import { View, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollView, type StyleProp, type ViewStyle } from "react-native";
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
/**
 * True inside a region that already keeps itself above the keyboard (KeyboardAvoiding, a keyboard-aware
 * Sheet or Dialog). Nested layouts skip their own avoidance: both measuring at the same keyboard event
 * would each see the full overlap and pad twice.
 */
export declare const KeyboardAvoidanceContext: import("react").Context<boolean>;
/**
 * Height of the keyboard overlapping `host`'s bottom edge. Padding only the real overlap keeps hosts above
 * a tab bar or toolbar from showing an empty band (2026-10-16).
 */
export declare function useKeyboardOverlap(host: RefObject<Pick<View, "measureInWindow"> | null>, enabled?: boolean): number;
/**
 * After the keyboard settles, scroll the focused input inside `scroll` into view. A shrunken ScrollView
 * does not do this by itself, so lower fields stayed hidden (2026-10-16 keyboard audit).
 * Returns an onScroll handler that tracks the offset; merge it with any host handler.
 */
export declare function useScrollFocusedInputIntoView(scroll: RefObject<ScrollView | null>, enabled?: boolean, margin?: number): (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
export declare function KeyboardAvoiding({ children, offset, safeAreaBottom, style }: KeyboardAvoidingProps): import("react").JSX.Element;
export declare function useInsideKeyboardAvoidance(): boolean;
/** Re-exported so a product does not import the contract twice for one value. */
export { resolveKeyboardAvoidanceBehavior };
//# sourceMappingURL=keyboard.d.ts.map