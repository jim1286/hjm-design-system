import { type MenuItem } from "./overlays.js";
export type MorphingMenuProps = {
    label: string;
    items: readonly MenuItem[];
    onAction?: (id: string) => void;
    disabled?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};
/** Action-only morph presentation. Selection/async menus retain the full Menu. */
export declare function MorphingMenu({ label, items, onAction, disabled, open: controlled, onOpenChange }: MorphingMenuProps): import("react").JSX.Element;
//# sourceMappingURL=menu-morph.d.ts.map