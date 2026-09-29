import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import Transition, { type ScreenTransitionConfig } from "react-native-screen-transitions";
import { motion as timing } from "@hjmds/design-contracts/foundations";
import { useHjmNativeTheme } from "./provider.js";

/** The host owns its navigation container, route types and back behavior. */
export { createBlankStackNavigator as createHjmTransitionStack } from "react-native-screen-transitions/react-navigation";

/** Wrap each route: retained shared-element screens must not leak into accessibility. */
export function SharedTransitionScreen({ children, style, ...props }: ViewProps) {
  const focused = useIsFocused();
  const { colors } = useHjmNativeTheme();
  // Keep the source mounted for reverse geometry, but hide it from assistive tech.
  // An opaque themed surface also prevents the transition backdrop tinting content.
  return <View {...props} style={[{ flex: 1, backgroundColor: colors.bg }, style]}
    accessibilityElementsHidden={!focused} importantForAccessibility={focused ? "auto" : "no-hide-descendants"}
    pointerEvents={focused ? "auto" : "none"}>{children}</View>;
}

export type SharedTransitionElementProps = Pick<ViewProps, "style" | "accessibilityLabel"> & {
  id: string; children: ReactNode;
};
export function SharedTransitionElement({ id, children, ...props }: SharedTransitionElementProps) {
  const { environment } = useHjmNativeTheme();
  if (!id.trim()) throw new TypeError("SharedTransitionElement requires a stable shared ID");
  // Inline measurement avoids a new native teleport dependency in existing clients.
  // Live-view handoff and clipping escape are intentionally not exposed.
  return <Transition.Boundary id={id} enabled={!environment.reducedMotion} handoff={false} escapeClipping={false} {...props}>{children}</Transition.Boundary>;
}
export function useSharedTransitionOptions(id: string): ScreenTransitionConfig {
  const { environment } = useHjmNativeTheme();
  if (!id.trim()) throw new TypeError("Shared transition requires a stable shared ID");
  const reduced = environment.reducedMotion;
  return {
    gestureEnabled: !reduced,
    gestureDirection: "vertical",
    transitionSpec: { open: { duration: reduced ? 0 : timing.slow }, close: { duration: reduced ? 0 : timing.normal } },
    screenStyleInterpolator: ({ bounds }) => {
      "worklet";
      if (reduced) return { content: { style: { opacity: 1 } } };
      return bounds({ id }).navigation.zoom({ target: "bound" });
    },
  };
}
