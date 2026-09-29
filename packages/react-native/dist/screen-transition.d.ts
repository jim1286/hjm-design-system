import type { ReactNode } from "react";
import { type ViewProps } from "react-native";
import { type ScreenTransitionConfig } from "react-native-screen-transitions";
/** The host owns its navigation container, route types and back behavior. */
export { createBlankStackNavigator as createHjmTransitionStack } from "react-native-screen-transitions/react-navigation";
/** Wrap each route: retained shared-element screens must not leak into accessibility. */
export declare function SharedTransitionScreen({ children, style, ...props }: ViewProps): import("react").JSX.Element;
export type SharedTransitionElementProps = Pick<ViewProps, "style" | "accessibilityLabel"> & {
    id: string;
    children: ReactNode;
};
export declare function SharedTransitionElement({ id, children, ...props }: SharedTransitionElementProps): import("react").JSX.Element;
export declare function useSharedTransitionOptions(id: string): ScreenTransitionConfig;
//# sourceMappingURL=screen-transition.d.ts.map