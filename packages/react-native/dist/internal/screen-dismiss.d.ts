import { Animated } from "react-native";
/** Shared native screen dismissal; navigation, reverse artwork and pending exit remain product-owned. */
export declare function useScreenPullDismiss(enabled: boolean, onClose: (() => void) | undefined, testID?: string, closeLabel?: string): {
    offset: Animated.Value;
    close: () => void;
    onScrollBeginDrag: (event: import("react-native").ScrollEvent) => void;
    onScrollEndDrag: (event: import("react-native").ScrollEvent) => void;
    handle: import("react").JSX.Element | null;
};
//# sourceMappingURL=screen-dismiss.d.ts.map