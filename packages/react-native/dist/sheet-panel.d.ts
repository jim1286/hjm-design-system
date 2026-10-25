import { type ReactNode } from "react";
import { type ViewProps } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type SheetPanelProps = Readonly<{
    children: ReactNode;
    /** Localized name for the always-visible fold/unfold control. */
    handleLabel: string;
    /** Map/canvas layout owns the available height, not the panel's content. */
    maximumHeight?: number;
    height?: number;
    onHeightChange?: (height: number) => void;
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * Space at the bottom that something else covers, such as a raised bottom-navigation item overlapping the sheet. The
     * surface still reaches the bottom edge (no map strip under it); the body and the folded handle stay above the
     * covered space (2026-10-25 Diairy map sheet joined to its tab bar).
     */
    safeAreaBottom?: number;
    /** Product artwork above the scrolling body; it must not replace the handle. */
    overlay?: ReactNode;
    /** Domain navigation, such as horizontal letter paging; vertical ownership remains here. */
    contentGesture?: Parameters<typeof Gesture.Exclusive>[number];
    handleActions?: ViewProps["accessibilityActions"];
    onHandleAction?: ViewProps["onAccessibilityAction"];
    testID?: string;
}>;
/** A nonmodal, bottom-anchored sheet. The map behind it keeps pointer and accessibility access. */
export declare function SheetPanel({ children, handleLabel, maximumHeight, height, onHeightChange, layoutStyle, safeAreaBottom, overlay, contentGesture, handleActions, onHandleAction, testID }: SheetPanelProps): import("react").JSX.Element;
//# sourceMappingURL=sheet-panel.d.ts.map