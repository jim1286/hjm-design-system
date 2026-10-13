import { forwardRef, useEffect, useRef } from "react";
import { AccessibilityInfo, AppState, Platform, type Text as NativeText } from "react-native";
import { Text, type TextProps } from "./primitives.js";
import type { AnnouncementMode } from "./feedback.js";

/** Inline state/result copy; no panel, action, dismissal, or notification queue is created. */
export type StatusTextProps = Omit<TextProps, "children" | "accessibilityLiveRegion" | "aria-live"> & Readonly<{
  children: string;
  announcement?: AnnouncementMode;
  /** iOS: opt in for a conditionally mounted result. Persistent initial hints stay quiet. */
  announceOnMount?: boolean;
}>;

export const StatusText = forwardRef<NativeText, StatusTextProps>(function StatusText(
  { children, announcement = "polite", announceOnMount = false, ...props }, ref,
) {
  const previous = useRef<string | undefined>(announceOnMount ? undefined : children);
  useEffect(() => {
    const changed = previous.current !== children;
    previous.current = children;
    // Live regions are Android-only. Track even silent/background changes so neither mode
    // changes nor returning to the foreground replays a stale result; Strict Effects stays deduped.
    if (changed && children.trim() && announcement !== "none" && Platform.OS === "ios" && AppState.currentState === "active") {
      AccessibilityInfo.announceForAccessibilityWithOptions(children, { queue: announcement === "polite" });
    }
  }, [children, announcement]);
  return <Text {...props} ref={ref} accessibilityLiveRegion={announcement}>{children}</Text>;
});
