import {
  keyboardTransitionDuration,
  resolveKeyboardAvoidanceBehavior,
  resolveKeyboardInset,
  type KeyboardAvoidanceDescriptor,
} from "@hjmds/design-contracts/components/native-platform";
import { useEffect, useState, type ReactNode } from "react";
import {
  Keyboard,
  LayoutAnimation,
  Platform,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

export type KeyboardAvoidingProps = KeyboardAvoidanceDescriptor &
  Readonly<{
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
  }>;

/**
 * Keeps bottom actions above the keyboard. Products were each choosing
 * `KeyboardAvoidingView`'s behavior themselves and re-discovering that a
 * BottomCTA disappears under the keyboard; the platform answer is fixed, so it
 * lives in the contract and this renderer just applies it.
 */
export function KeyboardAvoiding({ children, offset, safeAreaBottom, style }: KeyboardAvoidingProps) {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    // iOS reports the frame before the animation, Android only after it ends;
    // subscribing to both keeps one code path for the measured height.
    const showEvent = Platform.OS === "ios" ? "keyboardWillChangeFrame" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const show = Keyboard.addListener(showEvent, (event) => {
      LayoutAnimation.configureNext({
        duration: keyboardTransitionDuration,
        update: { type: LayoutAnimation.Types.easeInEaseOut },
      });
      setHeight(event.endCoordinates?.height ?? 0);
    });
    const hide = Keyboard.addListener(hideEvent, () => {
      LayoutAnimation.configureNext({
        duration: keyboardTransitionDuration,
        update: { type: LayoutAnimation.Types.easeInEaseOut },
      });
      setHeight(0);
    });
    return () => { show.remove(); hide.remove(); };
  }, []);

  const inset = resolveKeyboardInset(height, {
    ...(offset === undefined ? {} : { offset }),
    ...(safeAreaBottom === undefined ? {} : { safeAreaBottom }),
  });
  return <View style={[{ paddingBottom: inset }, style]}>{children}</View>;
}

/** Re-exported so a product does not import the contract twice for one value. */
export { resolveKeyboardAvoidanceBehavior };
