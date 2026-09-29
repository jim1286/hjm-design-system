import { type ReactNode } from "react";
import { type HjmNativeSafeAreaInsets } from "./provider.js";
/**
 * The keyboard-aware input with the HJM field frame. The raw library input had no
 * border or padding, so it read as plain text (2026-09-30 audit).
 */
export declare const GestureSheetInput: import("react").ForwardRefExoticComponent<Omit<import("@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput/types.js").BottomSheetTextInputProps & import("react").RefAttributes<import("react-native-gesture-handler").TextInput | undefined>, "ref"> & import("react").RefAttributes<import("react-native-gesture-handler").TextInput | undefined>>;
/** Closes the newest open GestureSheet. Returns false when none is open (let the host close). */
export declare function dismissTopGestureSheet(): boolean;
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
    /** Defaults to the HjmNativeProvider insets; keeps the full snap below the status bar. */
    safeAreaInsets?: HjmNativeSafeAreaInsets;
};
/** Explicit gesture variant: it does not silently change the canonical Sheet. */
export declare function GestureSheet({ open, onOpenChange, title, closeLabel, children, snapPoints, initialIndex, busy, safeAreaInsets }: GestureSheetProps): import("react").JSX.Element;
//# sourceMappingURL=sheet-gesture.d.ts.map