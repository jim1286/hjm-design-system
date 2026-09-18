import { type ReactNode, type RefObject } from "react";
import { type PopoverDescriptor, type PopoverDismissPolicy, type PopoverOpenOn, type PopoverOpenState } from "@hjmds/design-contracts/components/popover";
import type { OverlayTrigger } from "./overlays.js";
export type PopoverContentActions = Readonly<{
    close(): void;
}>;
export type PopoverProps = PopoverOpenState & Readonly<{
    trigger: OverlayTrigger;
    title: string;
    closeLabel: string;
    description?: string;
    descriptor?: PopoverDescriptor;
    children?: ReactNode | ((actions: PopoverContentActions) => ReactNode);
    dismissPolicy?: Partial<PopoverDismissPolicy>;
    /**
     * `"hover"` adds pointer enter/leave on top of the click path; it never
     * replaces it, because hover does not exist on touch or for a keyboard.
     */
    openOn?: PopoverOpenOn;
    initialFocusRef?: RefObject<HTMLElement | null>;
    portalContainer?: HTMLElement;
    className?: string;
}>;
export declare const Popover: import("react").ForwardRefExoticComponent<PopoverProps & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=popover.d.ts.map