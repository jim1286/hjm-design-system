import { type AlertDialogOpenChangeReason, type AlertDialogRequest, type AlertDialogResult } from "@hjmds/design-contracts/components/alert-dialog";
import { type SheetDismissPolicy, type SheetDismissReason, type SheetOpenChangeDetails } from "@hjmds/design-contracts/components/sheet";
import { type DialogSize } from "@hjmds/design-contracts/recipes";
import { type ReactNode, type RefObject } from "react";
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
export type DialogProps = NativeModalProps & ReasonedOpenProps<DialogOpenChangeReason> & Readonly<{
    title: string;
    description?: string;
    children?: ReactNode;
    primaryAction?: OverlayAction;
    secondaryAction?: OverlayAction;
    dismissible?: boolean;
    busy?: boolean;
    size?: DialogSize;
    /** Localized accessible name for the close action. */
    closeLabel: string;
    returnFocusRef?: RefObject<View | null>;
    contentStyle?: StyleProp<ViewStyle>;
}>;
/** Native modal boundary with one reasoned close intent for each user attempt. */
export declare function Dialog({ open, defaultOpen, onOpenChange, title, description, children, primaryAction, secondaryAction, dismissible, busy, size, closeLabel, returnFocusRef, contentStyle, onShow, ...modalProps }: DialogProps): import("react").JSX.Element;
export type AlertDialogProps = NativeModalProps & ReasonedOpenProps<AlertDialogOpenChangeReason> & Readonly<{
    request: AlertDialogRequest;
    returnFocusRef?: RefObject<View | null>;
    onResult?: (result: AlertDialogResult) => void;
    contentStyle?: StyleProp<ViewStyle>;
}>;
/** Contract session owns duplicate confirms, busy dismissal, error and settlement. */
export declare function AlertDialog({ open, defaultOpen, onOpenChange, request, returnFocusRef, onResult, contentStyle, onShow, ...modalProps }: AlertDialogProps): import("react").JSX.Element;
export type SheetPlacement = "bottom" | "start" | "end";
export type SheetProps = NativeModalProps & ReasonedOpenProps<SheetOpenChangeDetails["reason"]> & Readonly<{
    title: string;
    description?: string;
    children?: ReactNode;
    footer?: ReactNode;
    placement?: SheetPlacement;
    busy?: boolean;
    dismissPolicy?: Partial<SheetDismissPolicy>;
    /** Localized accessible name for the close action. */
    closeLabel: string;
    returnFocusRef?: RefObject<View | null>;
    safeAreaInsets?: Partial<Insets>;
    onDismissComplete?: (detail: Readonly<{
        reason: SheetDismissReason;
    }>) => void;
    contentStyle?: StyleProp<ViewStyle>;
}>;
/** Native Sheet applies policy before emitting a concrete dismissal reason. */
export declare function Sheet({ open, defaultOpen, onOpenChange, title, description, children, footer, placement, busy, dismissPolicy, closeLabel, returnFocusRef, safeAreaInsets, onDismissComplete, contentStyle, onShow, ...modalProps }: SheetProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=overlays.d.ts.map