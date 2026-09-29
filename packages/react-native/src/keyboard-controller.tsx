import { KeyboardProvider, KeyboardStickyView, KeyboardAwareScrollView } from "react-native-keyboard-controller";
import type { ComponentProps, ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

/** Install once at the app root; never nest providers per input or CTA. */
export function KeyboardMotionProvider({ children }: { children: ReactNode }) {
  // Do not eagerly summon the OS keyboard merely to warm up an optional adapter.
  return <KeyboardProvider preload={false}>{children}</KeyboardProvider>;
}

export type KeyboardDockProps = {
  children: ReactNode;
  enabled?: boolean;
  /** Additional clearance above the keyboard, in layout points. */
  clearance?: number;
  style?: StyleProp<ViewStyle>;
};

/** Wrap BottomCTA or a chat composer. The host owns bottom safe-area padding. */
export function KeyboardDock({ children, enabled = true, clearance = 0, style }: KeyboardDockProps) {
  if (!Number.isFinite(clearance) || clearance < 0) throw new TypeError("KeyboardDock clearance must be nonnegative");
  // StickyView's offset is a translation: clearance above the keyboard is negative.
  return <KeyboardStickyView enabled={enabled} offset={{ closed: 0, opened: -clearance }} style={style}>{children}</KeyboardStickyView>;
}

export type KeyboardFormScrollViewProps = Pick<ComponentProps<typeof KeyboardAwareScrollView>,
  "children" | "style" | "contentContainerStyle" | "bottomOffset" | "enabled" | "testID">;

export function KeyboardFormScrollView(props: KeyboardFormScrollViewProps) {
  return <KeyboardAwareScrollView {...props} keyboardShouldPersistTaps="handled" />;
}
