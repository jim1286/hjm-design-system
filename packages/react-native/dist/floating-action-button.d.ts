import type { ComponentRef } from "react";
import type { ButtonProps } from "./actions.js";
import { resolveFloatingActionButtonContentClearance, type FloatingActionButtonDescriptor, type FloatingActionButtonLayoutMode } from "@hjmds/design-contracts/components/floating-action-button";
import { forwardRef, type ReactNode } from "react";
import { View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
export { resolveFloatingActionButtonContentClearance };
export type FloatingActionButtonProps = Pick<ButtonProps, "onPress" | "onFocus" | "onBlur" | "testID"> & Readonly<{
    descriptor: FloatingActionButtonDescriptor;
    size?: "medium" | "large";
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
export declare const FloatingActionButton: ReturnType<typeof forwardRef<ComponentRef<typeof View>, FloatingActionButtonProps>>;
export declare function useFloatingActionButtonScroll(): {
    layoutMode: FloatingActionButtonLayoutMode;
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};
//# sourceMappingURL=floating-action-button.d.ts.map