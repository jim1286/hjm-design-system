import { type ReactNode } from "react";
import { resolveFloatingActionButtonContentClearance, type FloatingActionButtonDescriptor, type FloatingActionButtonLayoutMode } from "@hjmds/design-contracts/components/floating-action-button";
import { type ButtonProps } from "./actions.js";
export { resolveFloatingActionButtonContentClearance };
export type FloatingActionButtonProps = Pick<ButtonProps, "onClick" | "onFocus" | "onBlur" | "id" | "className"> & Readonly<{
    descriptor: FloatingActionButtonDescriptor;
    renderIcon: (icon: Readonly<{
        name: string;
        size: number;
        color: string;
        decorative: true;
    }>) => ReactNode;
    safeAreaBottomInset?: number;
    /** Apply this to the scroll content's bottom padding, including multiline labels. */
    onContentClearanceChange: (clearance: number) => void;
}>;
/** One persistent button preserves focus while its label collapses. */
export declare const FloatingActionButton: import("react").ForwardRefExoticComponent<Pick<ButtonProps, "className" | "id" | "onFocus" | "onBlur" | "onClick"> & Readonly<{
    descriptor: FloatingActionButtonDescriptor;
    renderIcon: (icon: Readonly<{
        name: string;
        size: number;
        color: string;
        decorative: true;
    }>) => ReactNode;
    safeAreaBottomInset?: number;
    /** Apply this to the scroll content's bottom padding, including multiline labels. */
    onContentClearanceChange: (clearance: number) => void;
}> & import("react").RefAttributes<HTMLButtonElement>>;
/** Omit target for window scrolling; null waits for a custom scroll element to mount. */
export declare function useFloatingActionButtonScroll(target?: HTMLElement | null): FloatingActionButtonLayoutMode;
//# sourceMappingURL=floating-action-button.d.ts.map