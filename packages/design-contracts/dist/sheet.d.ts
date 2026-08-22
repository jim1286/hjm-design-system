/** Why an open Sheet is being asked to close. */
export type SheetDismissReason = "close-action" | "escape" | "back" | "outside" | "swipe" | "programmatic";
/**
 * `trigger` only opens a Sheet. Every close reports the concrete dismiss reason
 * so renderers and product analytics do not have to infer it from platform events.
 */
export type SheetOpenChangeDetails = Readonly<{
    reason: "trigger" | SheetDismissReason;
}>;
/** User-dismiss policy. A controlled owner may always close programmatically. */
export type SheetDismissPolicy = Readonly<{
    dismissible: boolean;
    dismissWhileBusy: boolean;
    outsideDismiss: boolean;
    escapeOrBackDismiss: boolean;
    swipeDismiss: boolean;
}>;
export type SheetOpenState = Readonly<{
    open: boolean;
    defaultOpen?: never;
    onOpenChange(open: boolean, detail: SheetOpenChangeDetails): void;
}> | Readonly<{
    open?: never;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, detail: SheetOpenChangeDetails) => void;
}>;
export declare const sheetBehaviorDefaults: {
    readonly dismissible: true;
    readonly dismissWhileBusy: false;
    readonly outsideDismiss: true;
    readonly escapeOrBackDismiss: true;
    readonly swipeDismiss: false;
};
/**
 * Resolves an attempted close without platform knowledge. Programmatic close is
 * intentionally an owner override: a controlled `open={false}` cannot be vetoed
 * by a renderer, even while the Sheet is busy or not user-dismissible.
 */
export declare function canDismissSheet(reason: SheetDismissReason, busy: boolean, policy?: SheetDismissPolicy): boolean;
export type SheetLifecycle = Readonly<{
    open(): number;
    beginDismiss(): number | null;
    requestClose(reason: SheetDismissReason, busy: boolean, policy?: SheetDismissPolicy): boolean;
    completeDismiss(cycle: number): boolean;
}>;
/**
 * Makes persistent native Modal renderers settle each visible cycle once.
 * Platform adapters still decide when native dismissal has actually completed.
 */
export declare function createSheetLifecycle(initiallyVisible?: boolean): SheetLifecycle;
//# sourceMappingURL=sheet.d.ts.map