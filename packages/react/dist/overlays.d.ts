import { type AlertDialogOpenChangeReason, type AlertDialogRequest } from "@hjm/design-contracts/components/alert-dialog";
import { type SheetDismissPolicy, type SheetDismissReason, type SheetOpenChangeDetails } from "@hjm/design-contracts/components/sheet";
import { type TooltipAlign, type TooltipOpenChangeDetails, type TooltipPlacement } from "@hjm/design-contracts/components/tooltip";
import { type DialogSize, type MenuDensity, type MenuItemTone } from "@hjm/design-contracts/recipes";
import type { MenuSectionDescriptor } from "@hjm/design-contracts/behaviors";
import { type AriaAttributes, type MouseEventHandler, type ReactElement, type ReactNode, type Ref } from "react";
type TriggerElementProps = Readonly<{
    ref?: Ref<HTMLElement>;
    disabled?: boolean;
    onClick?: MouseEventHandler<HTMLElement>;
    onMouseEnter?: MouseEventHandler<HTMLElement>;
    onMouseLeave?: MouseEventHandler<HTMLElement>;
    onPointerEnter?: React.PointerEventHandler<HTMLElement>;
    onPointerLeave?: React.PointerEventHandler<HTMLElement>;
    onFocus?: React.FocusEventHandler<HTMLElement>;
    onBlur?: React.FocusEventHandler<HTMLElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
    "aria-controls"?: string;
    "aria-describedby"?: string;
    "aria-disabled"?: AriaAttributes["aria-disabled"];
    "aria-expanded"?: AriaAttributes["aria-expanded"];
    "aria-haspopup"?: AriaAttributes["aria-haspopup"];
}>;
export type OverlayTrigger = ReactElement<TriggerElementProps>;
type OpenState<Detail> = Readonly<{
    open: boolean;
    defaultOpen?: never;
    onOpenChange: (open: boolean, detail: Detail) => void;
}> | Readonly<{
    open?: never;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, detail: Detail) => void;
}>;
type ModalOpenState<Detail> = Readonly<{
    open: boolean;
    defaultOpen?: never;
    onOpenChange: (open: boolean, detail: Detail) => void;
    /** Optional for product-owned, programmatically controlled overlays. */
    trigger?: OverlayTrigger;
}> | Readonly<{
    open?: never;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, detail: Detail) => void;
    /** Uncontrolled overlays need a first-party activation target. */
    trigger: OverlayTrigger;
}>;
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
export {};
//# sourceMappingURL=overlays.d.ts.map