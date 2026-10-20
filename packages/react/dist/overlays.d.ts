import { type InitialFocusMode } from "@hjmds/design-contracts/screen-patterns";
import type { TransitionRect } from "@hjmds/design-contracts/content-transition";
import { type AlertDialogOpenChangeReason, type AlertDialogRequest } from "@hjmds/design-contracts/components/alert-dialog";
import { type SheetDetent, type SheetDismissPolicy, type SheetDismissReason, type SheetOpenChangeDetails } from "@hjmds/design-contracts/components/sheet";
import { type TooltipAlign, type TooltipOpenChangeDetails, type TooltipPlacement } from "@hjmds/design-contracts/components/tooltip";
import { sheetRecipe, type DialogSize, type MenuDensity, type MenuItemTone } from "@hjmds/design-contracts/recipes";
import type { MenuSectionDescriptor } from "@hjmds/design-contracts/behaviors";
import { type ReactNode } from "react";
import { type ModalOpenState, type OpenState, type OverlayTrigger } from "./modal.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type { OverlayTrigger } from "./modal.js";
export type DialogOpenChangeReason = "trigger" | "close-action" | "escape" | "outside";
export type DialogProps = ModalOpenState<Readonly<{
    reason: DialogOpenChangeReason;
}>> & Readonly<{
    title: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
    /**
     * Decorative layer over the whole viewport, outside the card frame (a drag ghost following the pointer, a
     * highlight anchored to an element). Children are positioned in viewport coordinates, never receive pointer
     * input, and are hidden from assistive technology; interactive content belongs in `children`.
     */
    overlayLayer?: ReactNode;
    /**
     * Whether the user can scroll the dialog (default true). `false` locks the current scroll position while a
     * gesture inside the body owns pointer movement, e.g. dragging an item in a folder popup (BurnTok, 2026-10-18);
     * turn it back on when the gesture ends. Content stays reachable: it is a temporary lock, not a clip.
     */
    scrollEnabled?: boolean;
    /** Optional measured trigger bounds in viewport coordinates; keeps canonical modal behavior. */
    motionOrigin?: TransitionRect;
    size?: DialogSize;
    dismissible?: boolean;
    busy?: boolean;
    /** Localized accessible name for the close action. */
    closeLabel: string;
    initialFocusRef?: React.RefObject<HTMLElement | null>;
    /**
     * Text field focused when it opens and no `initialFocusRef` is given: by default only a lone text entry
     * (`single-input`); `first-input` prefers the field marked `initialFocusTarget`; `none` keeps the first focusable
     * element (2026-10-18, screen-patterns rules shared with Native).
     */
    initialFocus?: InitialFocusMode;
    returnFocusRef?: React.RefObject<HTMLElement | null>;
    /**
     * Fires once per visible cycle, after the portal is gone and focus has been
     * restored — the signal a product needs before opening the next overlay.
     * Sheet already owns this split; Dialog kept only the request side, which is
     * why products reached for a 0ms timer to guess when cleanup had finished.
     */
    onDismissComplete?: (detail: Readonly<{
        reason: Exclude<DialogOpenChangeReason, "trigger"> | "programmatic";
    }>) => void;
    /** Higher-priority modals remain interactive above later lower-priority modals. */
    modalPriority?: number;
    portalContainer?: HTMLElement;
    className?: string;
}>;
export declare const Dialog: import("react").ForwardRefExoticComponent<DialogProps & import("react").RefAttributes<HTMLDivElement>>;
export type AlertDialogProps = ModalOpenState<Readonly<{
    reason: AlertDialogOpenChangeReason;
}>> & Readonly<{
    request: AlertDialogRequest;
    /** Product eligibility (for example a retry cooldown); cancel remains available. */
    confirmDisabled?: boolean;
    icon?: ReactNode;
    size?: DialogSize;
    returnFocusRef?: React.RefObject<HTMLElement | null>;
    /** Higher-priority modals remain interactive above later lower-priority modals. */
    modalPriority?: number;
    portalContainer?: HTMLElement;
    className?: string;
}>;
export declare const AlertDialog: import("react").ForwardRefExoticComponent<AlertDialogProps & import("react").RefAttributes<HTMLDivElement>>;
export type SheetPlacement = "bottom" | "start" | "end";
export type SheetSize = keyof typeof sheetRecipe.sizes;
export type SheetProps = ModalOpenState<SheetOpenChangeDetails> & Readonly<{
    title: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
    placement?: SheetPlacement;
    /**
     * Height the product opens the sheet at (`sheetRecipe.sizes`); `auto` keeps
     * the content height capped by the recipe. Native has had this since 1.3;
     * Web only had user-adjustable `detents` until 1.5.0. `activeDetent` wins
     * when both are given.
     */
    size?: SheetSize;
    /**
     * Heights the user may step between while the sheet is open, smallest
     * first. `sheetRecipe.sizes` is what the *product* opens at; this is what
     * the *user* can change afterwards.
     */
    detents?: readonly SheetDetent[];
    activeDetent?: SheetDetent;
    onDetentChange?: (detent: SheetDetent) => void;
    /** Localized names for the handle in each direction; required with detents. */
    detentLabels?: Readonly<{
        expand: string;
        collapse: string;
    }>;
    busy?: boolean;
    dismissPolicy?: Partial<SheetDismissPolicy>;
    /** Downward handle dismissal. Bottom sheets enable it by default; side sheets opt in for a reading panel. */
    swipeDirection?: "down";
    /** Localized accessible name for the close action. */
    closeLabel: string;
    /** Side sheets only. Bottom sheets focus their modal container, never an input on opening. */
    initialFocusRef?: React.RefObject<HTMLElement | null>;
    /**
     * Side sheets only: same text-entry selection as Dialog. Bottom sheets disable automatic input focus,
     * including nested screens and marked fields (2026-10-18 page-entry policy).
     */
    initialFocus?: InitialFocusMode;
    returnFocusRef?: React.RefObject<HTMLElement | null>;
    /** Fires once per visible cycle, after the Sheet portal has been removed. */
    onDismissComplete?: (detail: Readonly<{
        reason: SheetDismissReason;
    }>) => void;
    /** Higher-priority modals remain interactive above later lower-priority modals. */
    modalPriority?: number;
    portalContainer?: HTMLElement;
    className?: string;
    /** Visible × in the header. Off by default for bottom sheets, which close by dragging (2026-10-16). */
    showClose?: boolean;
}>;
export declare const Sheet: import("react").ForwardRefExoticComponent<SheetProps & import("react").RefAttributes<HTMLDivElement>>;
export type TooltipProps = OpenState<TooltipOpenChangeDetails> & Readonly<{
    trigger: OverlayTrigger;
    content: string;
    placement?: TooltipPlacement;
    align?: TooltipAlign;
    pointerOpenDelayMs?: number;
    focusOpenDelayMs?: number;
    portalContainer?: HTMLElement;
    className?: string;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const Tooltip: import("react").ForwardRefExoticComponent<TooltipProps & import("react").RefAttributes<HTMLSpanElement>>;
export type MenuItem = Readonly<{
    id: string;
    label: ReactNode;
    /** Required for typeahead when label is not plain text. */
    textValue?: string;
    description?: ReactNode;
    leading?: ReactNode;
    trailing?: ReactNode;
    tone?: MenuItemTone;
    disabled?: boolean;
}>;
export type MenuSection = Omit<MenuSectionDescriptor<string, string>, "items"> & Readonly<{
    items: readonly MenuItem[];
}>;
export type MenuOpenChangeReason = "trigger" | "selection" | "escape" | "outside" | "tab";
export type MenuAsyncState = Readonly<{
    status: "idle";
}> | Readonly<{
    status: "loading" | "loadingMore" | "empty" | "error";
    message: ReactNode;
}>;
type MenuActionSelection = Readonly<{
    selectionMode?: "action";
    value?: never;
    defaultValue?: never;
    onValueChange?: never;
}>;
type MenuSingleSelection = Readonly<{
    selectionMode: "single";
    value: string | null;
    defaultValue?: never;
    onValueChange(value: string): void;
}> | Readonly<{
    selectionMode: "single";
    value?: never;
    defaultValue?: string | null;
    onValueChange?: (value: string) => void;
}>;
type MenuMultipleSelection = Readonly<{
    selectionMode: "multiple";
    value: ReadonlySet<string>;
    defaultValue?: never;
    onValueChange(value: ReadonlySet<string>): void;
}> | Readonly<{
    selectionMode: "multiple";
    value?: never;
    defaultValue?: ReadonlySet<string>;
    onValueChange?: (value: ReadonlySet<string>) => void;
}>;
type MenuSourceProps = Readonly<{
    items: readonly MenuItem[];
    sections?: never;
}> | Readonly<{
    items?: never;
    sections: readonly MenuSection[];
}>;
type MenuBaseProps = Readonly<{
    trigger: OverlayTrigger;
    label: string;
    density?: MenuDensity;
    /** Logical alignment against the trigger; automatically mirrors in RTL. */
    align?: "start" | "end";
    disabled?: boolean;
    asyncState?: MenuAsyncState;
    onAction?: (id: string) => void;
    /** Runs only once the owner actually closes the menu. */
    onActionAfterDismiss?: (id: string) => void;
    portalContainer?: HTMLElement;
    className?: string;
    /** Canonical layout-only placement on the in-flow wrapper around the trigger; the popup stays anchored. */
    layoutStyle?: HjmCompositionStyleProp;
}> & MenuSourceProps;
export type MenuProps = OpenState<Readonly<{
    reason: MenuOpenChangeReason;
}>> & MenuBaseProps & (MenuActionSelection | MenuSingleSelection | MenuMultipleSelection);
export declare const Menu: import("react").ForwardRefExoticComponent<MenuProps & import("react").RefAttributes<HTMLDivElement>>;
export type ImmersiveOverlayOpenChangeReason = "exit-action" | "escape";
export type ImmersiveOverlayProps = Readonly<{
    open: boolean;
    onOpenChange: (open: boolean, detail: Readonly<{
        reason: ImmersiveOverlayOpenChangeReason;
    }>) => void;
    /** Localized accessible name of the presentation. */
    label: string;
    /** Localized visible label of the exit action. */
    exitLabel: string;
    /** Product-drawn stage filling the viewport edge to edge above the control bar. */
    children: ReactNode;
    /** Tool actions placed before the exit action (pause, rotate). */
    tools?: ReactNode;
    /** Status copy above the action row (keep-awake state, a notice). */
    status?: ReactNode;
    /** Defaults to the exit action. */
    initialFocusRef?: React.RefObject<HTMLElement | null>;
    returnFocusRef?: React.RefObject<HTMLElement | null>;
    /** Higher-priority modals remain interactive above later lower-priority modals. */
    modalPriority?: number;
    portalContainer?: HTMLElement;
    className?: string;
}>;
/**
 * Edge-to-edge presentation (Dialog companion): no card, scrim or header, on the shared modal stack with its focus
 * trap, Escape dismissal, background isolation and focus return. The browser Fullscreen API is deliberately not
 * requested: it needs a fresh user activation, its Escape exits fullscreen before the page sees the key (leaving the
 * overlay open in a window), and iOS Safari does not grant it to elements.
 */
export declare const ImmersiveOverlay: import("react").ForwardRefExoticComponent<Readonly<{
    open: boolean;
    onOpenChange: (open: boolean, detail: Readonly<{
        reason: ImmersiveOverlayOpenChangeReason;
    }>) => void;
    /** Localized accessible name of the presentation. */
    label: string;
    /** Localized visible label of the exit action. */
    exitLabel: string;
    /** Product-drawn stage filling the viewport edge to edge above the control bar. */
    children: ReactNode;
    /** Tool actions placed before the exit action (pause, rotate). */
    tools?: ReactNode;
    /** Status copy above the action row (keep-awake state, a notice). */
    status?: ReactNode;
    /** Defaults to the exit action. */
    initialFocusRef?: React.RefObject<HTMLElement | null>;
    returnFocusRef?: React.RefObject<HTMLElement | null>;
    /** Higher-priority modals remain interactive above later lower-priority modals. */
    modalPriority?: number;
    portalContainer?: HTMLElement;
    className?: string;
}> & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=overlays.d.ts.map