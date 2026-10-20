import type { ComponentRef } from "react";
import { AccessibilityInfo, Platform, findNodeHandle, type TextInput, type View } from "react-native";

// RN Web throws in findNodeHandle; its host ref is a DOM element. Keep focus
// platform-owned so Expo previews and device VoiceOver/TalkBack use the same actions.
export function focusAccessibleHost(target: ComponentRef<typeof View> | ComponentRef<typeof TextInput> | null | undefined): void {
  if (!target) return;
  if (Platform.OS === "web") {
    (target as { focus?: () => void }).focus?.();
    return;
  }
  const handle = findNodeHandle(target);
  if (typeof handle === "number") AccessibilityInfo.setAccessibilityFocus(handle);
}
