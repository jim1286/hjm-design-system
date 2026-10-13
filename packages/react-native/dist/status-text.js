import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef, useEffect, useRef } from "react";
import { AccessibilityInfo, AppState, Platform } from "react-native";
import { Text } from "./primitives.js";
export const StatusText = forwardRef(function StatusText({ children, announcement = "polite", announceOnMount = false, ...props }, ref) {
    const previous = useRef(announceOnMount ? undefined : children);
    useEffect(() => {
        const changed = previous.current !== children;
        previous.current = children;
        // Live regions are Android-only. Track even silent/background changes so neither mode
        // changes nor returning to the foreground replays a stale result; Strict Effects stays deduped.
        if (changed && children.trim() && announcement !== "none" && Platform.OS === "ios" && AppState.currentState === "active") {
            AccessibilityInfo.announceForAccessibilityWithOptions(children, { queue: announcement === "polite" });
        }
    }, [children, announcement]);
    return _jsx(Text, { ...props, ref: ref, accessibilityLiveRegion: announcement, children: children });
});
//# sourceMappingURL=status-text.js.map