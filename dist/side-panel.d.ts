/** Logical, RTL-aware docking side. `top`/`bottom` stay Sheet's job — see docs/side-panel.md. */
export type SidePanelEdge = "start" | "end";
/**
 * No `"back"`/`"swipe"`: SidePanel is Web-only (no hardware back, no
 * measured demand for a swipe-to-dismiss drawer). Everything else mirrors
 * `SheetDismissReason` (`src/sheet.ts`) because the *reasons* a panel closes
 * are the same on Web; only which reasons are *permitted* differs by `modal`.
 */
export type SidePanelDismissReason = "close-action" | "escape" | "outside" | "programmatic";
export type SidePanelOpenChangeDetails = Readonly<{
    reason: "trigger" | SidePanelDismissReason;
}>;
export type SidePanelOpenState = Readonly<{
    open: boolean;
    defaultOpen?: never;
    onOpenChange(open: boolean, detail: SidePanelOpenChangeDetails): void;
}> | Readonly<{
    open?: never;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, detail: SidePanelOpenChangeDetails) => void;
}>;
/**
 * `modal` is the axis Sheet does not need (Sheet is always modal). A
 * non-modal panel has no backdrop to click "outside" of — the rest of the
 * page stays live and interactive — so `outsideDismiss` is not merely
 * defaulted to `false` there, the type forbids it from existing at all.
 * This is the same "make the invalid combination unrepresentable" move as
 * `SheetOpenState`'s controlled/uncontrolled split.
 */
export type SidePanelDismissPolicy = Readonly<{
    modal: true;
    dismissible: boolean;
    dismissWhileBusy: boolean;
    escapeDismiss: boolean;
    outsideDismiss: boolean;
}> | Readonly<{
    modal: false;
    dismissible: boolean;
    dismissWhileBusy: boolean;
    escapeDismiss: boolean;
    outsideDismiss?: never;
}>;
export declare const sidePanelBehaviorDefaults: {
    readonly modal: true;
    readonly dismissible: true;
    readonly dismissWhileBusy: false;
    readonly escapeDismiss: true;
    readonly outsideDismiss: true;
};
/**
 * Same shape and role as `canDismissSheet`, kept as a separate function
 * because the two owning types are not generic over each other (`sheet.ts`
 * is a shared file this module must not edit) and the `modal` branch is
 * genuine new logic, not a copy.
 */
export declare function canDismissSidePanel(reason: SidePanelDismissReason, busy: boolean, policy?: SidePanelDismissPolicy): boolean;
export type SidePanelSize = "compact" | "regular" | "wide";
/**
 * No `createSidePanelLifecycle` counterpart to `createSheetLifecycle`: that
 * machinery exists solely to make Android's persistently-mounted native
 * Modal settle one visible cycle at a time. SidePanel is Web-only, where a
 * plain CSS `transitionend`/exit-callback (the same pattern `sheetRecipe`
 * and `dialogRecipe` already assume for Web) is the whole story — adding a
 * cycle counter here would solve a problem this platform does not have.
 */
export declare const sidePanelRecipe: {
    readonly slots: readonly ["backdrop", "positioner", "content", "header", "title", "body", "footer", "close"];
    readonly defaults: {
        readonly edge: "end";
        readonly size: "regular";
    };
    readonly sizes: {
        readonly compact: 320;
        readonly regular: 400;
        readonly wide: 560;
    };
    readonly backdrop: {
        readonly color: "#000000";
        readonly opacity: 0.6;
    };
    readonly content: {
        readonly background: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly border: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
        readonly borderWidth: 1;
        /** Flush to the viewport edge it docks to — unlike Sheet's floating `xl` radius. */
        readonly radius: null;
        readonly shadow: {
            readonly color: "#000000";
            readonly opacity: 0.16;
            readonly radius: 24;
            readonly offsetY: 8;
        };
        readonly paddingHorizontal: 20;
        readonly paddingTop: 12;
        readonly paddingBottom: 12;
    };
    readonly header: {
        readonly minHeight: 44;
        readonly gap: 12;
    };
    readonly title: {
        readonly color: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
        readonly textVariant: "title";
        readonly fontWeight: "700";
    };
    readonly body: {
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly textVariant: "body";
        readonly gap: 16;
    };
    readonly footer: {
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly textVariant: "body";
        readonly gap: 12;
        readonly paddingTop: 12;
    };
    readonly transition: {
        readonly enter: {
            readonly duration: 200;
            readonly easing: "enter";
            readonly reducedMotion: "opacity";
        };
        readonly exit: {
            readonly duration: 120;
            readonly easing: "exit";
            readonly reducedMotion: "instant";
        };
    };
    readonly states: {
        readonly focus: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly width: 2;
            readonly offset: 2;
        };
    };
};
/**
 * `web.focus` can only hold one value, but the real behavior branches on
 * `modal`: `"trap"` (default, modal) vs. no trap at all when `modal: false`.
 * The field records the default configuration; the non-modal case is a
 * documented exception in `docs/side-panel.md`, the same way this contract
 * records one representative value elsewhere and pushes edge cases to
 * `scenarios`.
 */
export declare const sidePanelBehavior: {
    readonly controlled: readonly ["open", "defaultOpen", "onOpenChange", "dismissPolicy"];
    readonly defaults: {
        readonly modal: true;
        readonly dismissible: true;
        readonly dismissWhileBusy: false;
        readonly escapeDismiss: true;
        readonly outsideDismiss: true;
    };
    readonly configuration: {
        readonly edge: readonly ["start", "end"];
        readonly modal: readonly ["true", "false"];
    };
    readonly stateAxes: {
        readonly availability: readonly ["enabled", "busy"];
        readonly value: readonly ["open"];
    };
    readonly web: {
        readonly roles: readonly ["dialog"];
        readonly keyboard: readonly ["Tab", "Escape"];
        readonly focus: "trap";
        readonly dismiss: readonly ["escape", "outside"];
    };
    readonly native: {
        readonly roles: readonly [];
        readonly states: readonly [];
        readonly actions: readonly [];
    };
    readonly scenarios: readonly ["edge-is-a-logical-start-or-end-direction-never-left-or-right", "modal-panels-trap-focus-and-lock-scroll-non-modal-panels-do-neither", "non-modal-panels-never-expose-outside-dismiss-the-type-forbids-it", "single-dismiss-callback-reports-the-concrete-reason", "busy-blocks-user-dismiss-programmatic-owner-close-is-always-allowed", "escape-dismisses-in-both-modal-and-non-modal-panels", "no-back-or-swipe-dismiss-reason-exists-on-this-web-only-platform", "reduced-motion-still-completes-the-exit-callback-once"];
};
//# sourceMappingURL=side-panel.d.ts.map