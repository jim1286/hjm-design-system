import { type ReactNode } from "react";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
export { BottomSheetTextInput as GestureSheetInput };
export declare function GestureSheetProvider({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
export type GestureSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    closeLabel: string;
    children: ReactNode;
    snapPoints?: readonly (number | `${number}%`)[];
    initialIndex?: number;
    busy?: boolean;
};
/** Explicit gesture variant: it does not silently change the canonical Sheet. */
export declare function GestureSheet({ open, onOpenChange, title, closeLabel, children, snapPoints, initialIndex, busy }: GestureSheetProps): import("react").JSX.Element;
//# sourceMappingURL=sheet-gesture.d.ts.map