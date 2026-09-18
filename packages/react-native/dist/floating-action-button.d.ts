import { type ReactNode } from "react";
import { View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { resolveFloatingActionButtonContentClearance, type FloatingActionButtonDescriptor, type FloatingActionButtonLayoutMode } from "@hjmds/design-contracts/components/floating-action-button";
import { type ButtonProps } from "./actions.js";
export { resolveFloatingActionButtonContentClearance };
export type FloatingActionButtonProps = Pick<ButtonProps, "onPress" | "onFocus" | "onBlur" | "testID"> & Readonly<{
    descriptor: FloatingActionButtonDescriptor;
    renderIcon: (icon: Readonly<{
        name: string;
        size: number;
        color: string;
        decorative: true;
    }>) => ReactNode;
    safeAreaBottomInset?: number;
    onContentClearanceChange: (clearance: number) => void;
}>;
/** Place after the ScrollView in a positioned screen; reserve the reported content clearance. */
export declare const FloatingActionButton: import("react").ForwardRefExoticComponent<Pick<ButtonProps, "testID" | "onBlur" | "onFocus" | "onPress"> & Readonly<{
    descriptor: FloatingActionButtonDescriptor;
    renderIcon: (icon: Readonly<{
        name: string;
        size: number;
        color: string;
        decorative: true;
    }>) => ReactNode;
    safeAreaBottomInset?: number;
    onContentClearanceChange: (clearance: number) => void;
}> & import("react").RefAttributes<View>>;
export declare function useFloatingActionButtonScroll(): {
    layoutMode: FloatingActionButtonLayoutMode;
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};
//# sourceMappingURL=floating-action-button.d.ts.map