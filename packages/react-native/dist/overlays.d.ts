import { type InitialFocusMode } from "@hjmds/design-contracts/screen-patterns";
import { type TransitionRect } from "@hjmds/design-contracts/content-transition";
import { type AlertDialogOpenChangeReason, type AlertDialogRequest, type AlertDialogResult } from "@hjmds/design-contracts/components/alert-dialog";
import { type HjmCompositionStyleProp } from "./composition-style.js";
import { type SheetDismissPolicy, type SheetDismissReason, type SheetOpenChangeDetails } from "@hjmds/design-contracts/components/sheet";
import { sheetRecipe, type DialogSize } from "@hjmds/design-contracts/recipes";
import { type ReactElement, type ReactNode, type RefObject } from "react";
import { View, type Insets, type ModalProps } from "react-native";
import { type ButtonTone } from "./actions.js";
export type OverlayAction = Readonly<{
    label: string;
    onPress: () => void | Promise<void>;
    tone?: ButtonTone;
    disabled?: boolean;
    accessibilityHint?: string;
}>;
type NativeModalProps = Omit<ModalProps, "animationType" | "children" | "onDismiss" | "onRequestClose" | "transparent" | "visible">;
type ReasonedOpenProps<Reason> = Readonly<{
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, detail: Readonly<{
        reason: Reason;
    }>) => void;
}>;
export type DialogOpenChangeReason = "close-action" | "back" | "outside";
/**
 * Heading slot shared by Dialog and Sheet. A string is its own accessible name. An
 * element (a product heading with an icon or emphasis) cannot be flattened by the
 * renderer, so the consumer supplies `accessibilityTitle` for the modal's
 * accessibility label; the union makes that pairing mandatory instead of letting the
 * name silently go empty. Web takes a plain ReactNode because `aria-labelledby`
 * reads the rendered DOM. Products cast `as unknown as string` before this existed.
 */
export type OverlayTitleProps = Readonly<{
    title: string;
    accessibilityTitle?: string;
}> | Readonly<{
    title: ReactElement;
    accessibilityTitle: string;
}>;
export type DialogProps = NativeModalProps & ReasonedOpenProps<DialogOpenChangeReason> & OverlayTitleProps & Readonly<{
    description?: string;
    /**
     * Body below the fixed title row. It is placed in a bounded ScrollView, so do not pass a
     * FlatList/SectionList here (nested virtualized lists lose virtualization and warn); use a
     * Sheet or a plain mapped list for long collections.
     */
    children?: ReactNode;
    primaryAction?: OverlayAction;
    secondaryAction?: OverlayAction;
    /**
     * Called when an action throws or its promise rejects. The dialog stays open with the action
     * re-enabled; the host presents a localized, recoverable error. Without it, development builds
     * log every failure with console.error (not warnOnce: deduplication would hide repeats), so a
     * failed action does not vanish silently.
     *
     * The pending/settle logic is a run token, not contracts `createActionSession`: that store settles a
     * microtask later and carries value/retry state, but a synchronous action must close in the same
     * press. (Kept in this type comment so the rationale does not ship in the overlays bundle.)
     */
    onActionError?: (error: unknown) => void;
    dismissible?: boolean;
    busy?: boolean;
    /** Trigger bounds measured in window coordinates immediately before opening. */
    motionOrigin?: TransitionRect;
    size?: DialogSize;
    /** Localized accessible name for the close action. */
    closeLabel: string;
    returnFocusRef?: RefObject<View | null>;
    /** Layout-only placement for the sheet content. Use `size` for height. */
    contentStyle?: HjmCompositionStyleProp;
    /**
     * Text field focused after the dialog opens: by default only a lone text entry (`single-input`); `first-input`
     * prefers the field marked `initialFocusTarget`; `none` leaves focus alone (2026-10-18, screen-patterns rules).
     */
    initialFocus?: InitialFocusMode;
    /**
     * Decorative layer over the whole modal window, outside the card frame (a drag ghost following the finger, a
     * highlight anchored to a measured view). Children are positioned in window coordinates (`pageX`/`pageY`,
     * `measureInWindow`), never receive touches and are hidden from accessibility; interactive content belongs in
     * `children`.
     */
    overlayLayer?: ReactNode;
    /**
     * Whether the user can scroll the dialog body (default true). `false` locks the bounded ScrollView while a
     * gesture inside the body owns touch movement, e.g. dragging an item in a folder popup (BurnTok, 2026-10-18);
     * turn it back on when the gesture ends.
     */
    scrollEnabled?: boolean;
}>;
/** Native modal boundary with one reasoned close intent for each user attempt. */
export declare function Dialog({ open, defaultOpen, onOpenChange, title, accessibilityTitle, description, children, primaryAction, secondaryAction, dismissible, busy: externalBusy, onActionError, size, motionOrigin, closeLabel, returnFocusRef, contentStyle, onShow, initialFocus, overlayLayer, scrollEnabled, ...modalProps }: DialogProps): import("react").JSX.Element;
export type AlertDialogProps = NativeModalProps & ReasonedOpenProps<AlertDialogOpenChangeReason> & Readonly<{
    request: AlertDialogRequest;
    size?: DialogSize;
    returnFocusRef?: RefObject<View | null>;
    onResult?: (result: AlertDialogResult) => void;
    /** Layout-only placement; semantic size and the recipe own appearance. */
    contentStyle?: HjmCompositionStyleProp;
}>;
/** Contract session owns duplicate confirms, busy dismissal, error and settlement. */
export declare function AlertDialog({ open, defaultOpen, onOpenChange, request, size, returnFocusRef, onResult, contentStyle, onShow, ...modalProps }: AlertDialogProps): import("react").JSX.Element;
export type SheetPlacement = "bottom" | "start" | "end";
export type SheetSize = keyof typeof sheetRecipe.sizes;
export type SheetProps = NativeModalProps & ReasonedOpenProps<SheetOpenChangeDetails["reason"]> & OverlayTitleProps & Readonly<{
    description?: string;
    children?: ReactNode;
    footer?: ReactNode;
    placement?: SheetPlacement;
    /**
     * How tall the sheet opens. `auto` keeps the content-driven height. Without this
     * axis a consumer has to set `contentStyle={{ height }}`, which moves a
     * recipe-owned dimension into product code.
     */
    size?: SheetSize;
    busy?: boolean;
    dismissPolicy?: Partial<SheetDismissPolicy>;
    /** Localized accessible name for the close action. */
    closeLabel: string;
    returnFocusRef?: RefObject<View | null>;
    safeAreaInsets?: Partial<Insets>;
    onDismissComplete?: (detail: Readonly<{
        reason: SheetDismissReason;
    }>) => void;
    /** Layout-only placement; semantic size and the recipe own appearance. */
    contentStyle?: HjmCompositionStyleProp;
    /** The modal owns keyboard clearance; on by default (2026-10-16). Turn off only for input-free sheets with custom motion. */
    keyboardAvoidance?: boolean;
    /** Keep the header/footer fixed while long content scrolls. Do not nest a virtualized list. */
    scrollable?: boolean;
    /** Visible × in the header. Off by default for bottom sheets, which close by dragging (2026-10-16). */
    showClose?: boolean;
    /** Same as Dialog `initialFocus`: by default a lone text entry is focused once the sheet has entered. */
    initialFocus?: InitialFocusMode;
}>;
/** Native Sheet applies policy before emitting a concrete dismissal reason. */
export declare function Sheet({ open, defaultOpen, onOpenChange, title, accessibilityTitle, description, children, footer, placement, size, busy, dismissPolicy, closeLabel, returnFocusRef, safeAreaInsets: suppliedSafeAreaInsets, onDismissComplete, contentStyle, keyboardAvoidance, scrollable, showClose, onShow, initialFocus, ...modalProps }: SheetProps): import("react").JSX.Element;
export type ImmersiveOverlayOpenChangeReason = "exit-action" | "back";
export type ImmersiveOverlayProps = Readonly<{
    open: boolean;
    onOpenChange: (open: boolean, detail: Readonly<{
        reason: ImmersiveOverlayOpenChangeReason;
    }>) => void;
    /** Localized accessible name of the presentation. */
    label: string;
    /** Localized visible label of the exit action. */
    exitLabel: string;
    /** Product-drawn stage filling the window edge to edge above the control bar. */
    children: ReactNode;
    /** Tool actions placed before the exit action (pause, rotate). */
    tools?: ReactNode;
    /** Status copy above the action row (keep-awake state, a notice). */
    status?: ReactNode;
    returnFocusRef?: RefObject<View | null>;
    onShow?: ModalProps["onShow"];
}>;
/**
 * Edge-to-edge presentation (Dialog companion): a full-screen Modal with the status bar hidden and rotation allowed,
 * no card, scrim or header. It joins the overlay stack (screens below keep a pending entry focus until it has torn
 * down), dismisses on back with a reason, and returns accessibility focus after the native dismissal.
 */
export declare function ImmersiveOverlay({ open, onOpenChange, label, exitLabel, children, tools, status, returnFocusRef, onShow }: ImmersiveOverlayProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=overlays.d.ts.map