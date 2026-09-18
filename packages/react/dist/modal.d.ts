import { type AriaAttributes, type MouseEventHandler, type ReactElement, type ReactNode, type Ref } from "react";
export type TriggerElementProps = Readonly<{
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
export declare function containsEventTarget(container: Node | null, target: EventTarget | null): boolean;
type ModalPortalProps = Readonly<{
    children: ReactNode;
    container?: HTMLElement;
}>;
export declare function HjmPortal({ children, container }: ModalPortalProps): import("react").ReactPortal | null;
export type OpenState<Detail> = Readonly<{
    open: boolean;
    defaultOpen?: never;
    onOpenChange: (open: boolean, detail: Detail) => void;
}> | Readonly<{
    open?: never;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, detail: Detail) => void;
}>;
export type ModalOpenState<Detail> = Readonly<{
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
export declare function useOpenState<Detail>({ open, defaultOpen, onOpenChange, }: Readonly<{
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, detail: Detail) => void;
}>): readonly [boolean, (nextOpen: boolean, detail: Detail) => void];
export declare function getFocusable(container: HTMLElement): HTMLElement[];
export declare function getModalLayer(priority: number): number;
type ModalFocusOptions = Readonly<{
    active: boolean;
    priority?: number;
    contentRef: React.RefObject<HTMLElement | null>;
    initialFocusRef?: React.RefObject<HTMLElement | null>;
    returnFocusRef?: React.RefObject<HTMLElement | null>;
    fallbackReturnRef?: React.RefObject<HTMLElement | null>;
    onEscape(): void;
}>;
export declare function useModalFocus({ active, priority, contentRef, initialFocusRef, returnFocusRef, fallbackReturnRef, onEscape, }: ModalFocusOptions): void;
export declare function renderTrigger(trigger: OverlayTrigger, triggerRef: React.RefObject<HTMLElement | null>, open: boolean, contentId: string, popup: "dialog" | "menu", onOpen: () => void): ReactElement;
export {};
//# sourceMappingURL=modal.d.ts.map