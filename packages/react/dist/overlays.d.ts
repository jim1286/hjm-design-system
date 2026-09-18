import { type AlertDialogOpenChangeReason, type AlertDialogRequest } from "@hjmds/design-contracts/components/alert-dialog";
import { type SheetDetent, type SheetDismissPolicy, type SheetDismissReason, type SheetOpenChangeDetails } from "@hjmds/design-contracts/components/sheet";
import { type TooltipAlign, type TooltipOpenChangeDetails, type TooltipPlacement } from "@hjmds/design-contracts/components/tooltip";
import { type DialogSize, type MenuDensity, type MenuItemTone } from "@hjmds/design-contracts/recipes";
import type { MenuSectionDescriptor } from "@hjmds/design-contracts/behaviors";
import { type ReactNode } from "react";
import { type ModalOpenState, type OpenState, type OverlayTrigger } from "./modal.js";
export type { OverlayTrigger } from "./modal.js";
export type DialogOpenChangeReason = "trigger" | "close-action" | "escape" | "outside";
export type DialogProps = ModalOpenState<Readonly<{
    reason: DialogOpenChangeReason;
}>> & Readonly<{
    title: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
    size?: DialogSize;
    dismissible?: boolean;
    busy?: boolean;
    /** Localized accessible name for the close action. */
    closeLabel: string;
    initialFocusRef?: React.RefObject<HTMLElement | null>;
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
export type SheetProps = ModalOpenState<SheetOpenChangeDetails> & Readonly<{
    title: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
    placement?: SheetPlacement;
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
    /** Localized accessible name for the close action. */
    closeLabel: string;
    initialFocusRef?: React.RefObject<HTMLElement | null>;
    returnFocusRef?: React.RefObject<HTMLElement | null>;
    /** Fires once per visible cycle, after the Sheet portal has been removed. */
    onDismissComplete?: (detail: Readonly<{
        reason: SheetDismissReason;
    }>) => void;
    /** Higher-priority modals remain interactive above later lower-priority modals. */
    modalPriority?: number;
    portalContainer?: HTMLElement;
    className?: string;
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
    /** Backward-compatible item-local action; Menu onAction receives every activation. */
    onSelect?: () => void;
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
}> & MenuSourceProps;
export type MenuProps = OpenState<Readonly<{
    reason: MenuOpenChangeReason;
}>> & MenuBaseProps & (MenuActionSelection | MenuSingleSelection | MenuMultipleSelection);
export declare const Menu: import("react").ForwardRefExoticComponent<MenuProps & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=overlays.d.ts.map