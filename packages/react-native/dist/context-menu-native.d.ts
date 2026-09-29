import type { ReactElement } from "react";
export type NativeContextMenuItem = {
    id: string;
    label: string;
    disabled?: boolean;
    tone?: "default" | "danger";
};
export type NativeContextMenuProps = {
    /** Pass an accessible native host with the product's localized label. */
    children: ReactElement;
    items: readonly NativeContextMenuItem[];
    onAction: (id: string) => void;
    onOpenChange?: (open: boolean) => void;
};
/** OS-owned long-press actions; the default Menu remains free of native modules. */
export declare function NativeContextMenu({ children, items, onAction, onOpenChange }: NativeContextMenuProps): import("react").JSX.Element;
//# sourceMappingURL=context-menu-native.d.ts.map