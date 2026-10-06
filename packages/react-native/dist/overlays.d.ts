import { type AlertDialogOpenChangeReason, type AlertDialogRequest, type AlertDialogResult } from "@hjmds/design-contracts/components/alert-dialog";
import { type HjmCompositionStyleProp } from "./composition-style.js";
import { type SheetDismissPolicy, type SheetDismissReason, type SheetOpenChangeDetails } from "@hjmds/design-contracts/components/sheet";
import { sheetRecipe, type DialogSize } from "@hjmds/design-contracts/recipes";
import { type ReactElement, type ReactNode, type RefObject } from "react";
import { View, type Insets, type ModalProps, type StyleProp, type ViewStyle } from "react-native";
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
    size?: DialogSize;
    /** Localized accessible name for the close action. */
    closeLabel: string;
    returnFocusRef?: RefObject<View | null>;
    /** Layout-only placement for the sheet content. Use `size` for height. */
    contentStyle?: HjmCompositionStyleProp;
}>;
/** Native modal boundary with one reasoned close intent for each user attempt. */
export declare function Dialog({ open, defaultOpen, onOpenChange, title, accessibilityTitle, description, children, primaryAction, secondaryAction, dismissible, busy: externalBusy, onActionError, size, closeLabel, returnFocusRef, contentStyle, onShow, ...modalProps }: DialogProps): import("react").JSX.Element;
export type AlertDialogProps = NativeModalProps & ReasonedOpenProps<AlertDialogOpenChangeReason> & Readonly<{
    request: AlertDialogRequest;
    returnFocusRef?: RefObject<View | null>;
    onResult?: (result: AlertDialogResult) => void;
    /**
     * Layout keys only (`hjmCompositionStyleKeys`). Visual keys still apply but are deprecated:
     * use `size`/`placement` and the recipe for appearance.
     * @deprecated for visual keys. The next major narrows this to `HjmCompositionStyleProp`, like Dialog
     * (consumer-policy.md §3.1).
     */
    contentStyle?: StyleProp<ViewStyle>;
}>;
/** Contract session owns duplicate confirms, busy dismissal, error and settlement. */
export declare function AlertDialog({ open, defaultOpen, onOpenChange, request, returnFocusRef, onResult, contentStyle, onShow, ...modalProps }: AlertDialogProps): import("react").JSX.Element;
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
    /**
     * Layout keys only (`hjmCompositionStyleKeys`). Visual keys still apply but are deprecated:
     * use `size`/`placement` and the recipe for appearance.
     * @deprecated for visual keys. The next major narrows this to `HjmCompositionStyleProp`, like Dialog
     * (consumer-policy.md §3.1).
     */
    contentStyle?: StyleProp<ViewStyle>;
    /** Opt in when the body contains inputs; the modal owns keyboard clearance. */
    keyboardAvoidance?: boolean;
    /** Keep the header/footer fixed while long content scrolls. Do not nest a virtualized list. */
    scrollable?: boolean;
}>;
/** Native Sheet applies policy before emitting a concrete dismissal reason. */
export declare function Sheet({ open, defaultOpen, onOpenChange, title, accessibilityTitle, description, children, footer, placement, size, busy, dismissPolicy, closeLabel, returnFocusRef, safeAreaInsets: suppliedSafeAreaInsets, onDismissComplete, contentStyle, keyboardAvoidance, scrollable, onShow, ...modalProps }: SheetProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=overlays.d.ts.map