import { type ScrollViewProps } from "react-native";
export type SheetScrollViewProps = ScrollViewProps & Readonly<{
    /** Value-changing wheels and inner code panes keep the whole gesture, including at their top. */
    gestureRole?: "body" | "input";
}>;
/** A Sheet's primary scroller lends its offset to dismissal; deeper scrollers keep their own gesture. */
export declare const SheetScrollView: import("react").ForwardRefExoticComponent<ScrollViewProps & Readonly<{
    /** Value-changing wheels and inner code panes keep the whole gesture, including at their top. */
    gestureRole?: "body" | "input";
}> & import("react").RefAttributes<import("react-native").ScrollViewInstance>>;
//# sourceMappingURL=sheet-scroll-view.d.ts.map