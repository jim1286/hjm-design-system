export type TooltipPlacement = "top" | "bottom" | "start" | "end";
export type TooltipAlign = "start" | "center" | "end";
export type TooltipOpenChangeReason = "pointer" | "focus" | "pointer-leave" | "blur" | "escape" | "trigger-activation" | "another-tooltip";
export type TooltipOpenChangeDetails = Readonly<{
    reason: TooltipOpenChangeReason;
}>;
/** Tooltip copy is intentionally plain text and never owns an action. */
export type TooltipDescriptor = Readonly<{
    content: string;
    placement?: TooltipPlacement;
    align?: TooltipAlign;
}>;
export type ResolvedTooltipDescriptor = Readonly<{
    content: string;
    placement: TooltipPlacement;
    align: TooltipAlign;
}>;
export type ControlledTooltipOpenState = Readonly<{
    open: boolean;
    defaultOpen?: never;
    onOpenChange(open: boolean, details: TooltipOpenChangeDetails): void;
}>;
export type UncontrolledTooltipOpenState = Readonly<{
    open?: never;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, details: TooltipOpenChangeDetails) => void;
}>;
export type TooltipOpenState = ControlledTooltipOpenState | UncontrolledTooltipOpenState;
export declare const tooltipDescriptorDefaults: {
    readonly placement: "top";
    readonly align: "center";
};
export declare const tooltipBehaviorDefaults: {
    readonly pointerOpenDelayMs: 500;
    readonly focusOpenDelayMs: 0;
    readonly skipDelayMs: 300;
    readonly hoverable: true;
    readonly touchHover: false;
    readonly oneVisiblePerProvider: true;
};
export declare function validateTooltipDescriptor(descriptor: TooltipDescriptor): void;
export declare function resolveTooltipDescriptor(descriptor: TooltipDescriptor): ResolvedTooltipDescriptor;
export declare function validateTooltipOpenState(state: TooltipOpenState): void;
//# sourceMappingURL=tooltip.d.ts.map