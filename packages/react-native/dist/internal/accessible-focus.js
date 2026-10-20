import { AccessibilityInfo, Platform, findNodeHandle } from "react-native";
// RN Web throws in findNodeHandle; its host ref is a DOM element. Keep focus
// platform-owned so Expo previews and device VoiceOver/TalkBack use the same actions.
export function focusAccessibleHost(target) {
    if (!target)
        return;
    if (Platform.OS === "web") {
        target.focus?.();
        return;
    }
    const handle = findNodeHandle(target);
    if (typeof handle === "number")
        AccessibilityInfo.setAccessibilityFocus(handle);
}
//# sourceMappingURL=accessible-focus.js.map