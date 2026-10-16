import { type ReactElement, type ReactNode } from "react";
import { type AccessibilityActionEvent, type GestureResponderEvent } from "react-native";
import type { ContextMenuItemDescriptor } from "@hjmds/design-contracts/components/context-menu";
export type NativeCanonicalContextMenuItem = Pick<ContextMenuItemDescriptor, "id" | "label" | "disabled" | "tone"> & Readonly<{
    icon?: ReactNode;
}>;
type HostProps = Readonly<{
    onLongPress?: (event: GestureResponderEvent) => void;
    delayLongPress?: number;
    accessibilityActions?: readonly Readonly<{
        name: string;
        label?: string;
    }>[];
    onAccessibilityAction?: (event: AccessibilityActionEvent) => void;
}>;
export type ContextMenuProps = Readonly<{
    /** One pressable host (row, card). It keeps its own tap and name; the menu adds long-press only. */
    children: ReactElement<HostProps>;
    items: readonly NativeCanonicalContextMenuItem[];
    onAction(id: string): void;
    /** Localized name of the accessibility action that opens the menu. */
    accessibilityLabel: string;
    disabled?: boolean;
    onOpenChange?: (open: boolean) => void;
}>;
/**
 * Canonical long-press menu without native modules (2026-10-16: conversation lists and comments need the
 * same hold menu as chat). Reply/report-style rows match the chat hold menu; danger rows are last by product order.
 * Screen-reader users open it from the host's accessibility action instead of a long press.
 */
export declare function ContextMenu({ children, items, onAction, accessibilityLabel, disabled, onOpenChange }: ContextMenuProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=context-menu.d.ts.map