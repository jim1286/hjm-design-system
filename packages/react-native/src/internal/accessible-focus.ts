import { AccessibilityInfo, Platform, findNodeHandle, type TextInput, type View } from "react-native";

// RN Web throws in findNodeHandle; its host ref is a DOM element. Keep focus
// platform-owned so Expo previews and device VoiceOver/TalkBack use the same actions.
export function focusAccessibleHost(target: View | TextInput | null | undefined): void {
  if (!target) return;
  if (Platform.OS === "web") {
    (target as { focus?: () => void }).focus?.();
    return;
  }
  const handle = findNodeHandle(target);
  if (handle !== null) AccessibilityInfo.setAccessibilityFocus(handle);
}
