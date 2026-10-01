import { useEffect, useRef, type ComponentProps } from "react";
import { AccessibilityInfo, AppState, Platform } from "react-native";
import { Text } from "@hjmds/react-native/primitives";

type PatternStatusProps = Omit<ComponentProps<typeof Text>, "children" | "accessibilityLiveRegion"> & {
  children: string;
  announceOnMount?: boolean;
};

/** Showcase compositions own their status copy; public component announcers remain unchanged. */
export function PatternStatus({ children, announceOnMount = false, ...props }: PatternStatusProps) {
  const previous = useRef<string | undefined>(announceOnMount ? undefined : children);
  useEffect(() => {
    const changed = previous.current !== children;
    previous.current = children;
    // RN live regions are Android-only. Match the existing Notice/Toast iOS bridge,
    // without replaying status on ordinary renders, Strict Effects, or background updates.
    if (changed && children.trim() && Platform.OS === "ios" && AppState.currentState === "active") {
      AccessibilityInfo.announceForAccessibilityWithOptions(children, { queue: true });
    }
  }, [children]);
  return <Text {...props} accessibilityLiveRegion="polite">{children}</Text>;
}
