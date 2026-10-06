import { type MenuItem } from "./overlays.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type MorphingMenuProps = {
    label: string;
    items: readonly MenuItem[];
    onAction?: (id: string) => void;
    disabled?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /**
     * Canonical layout-only placement. Applied to the morph root, or to the
     * canonical Menu's wrapper when reduced motion/RTL falls back to it, so
     * placement survives the switch.
     */
    layoutStyle?: HjmCompositionStyleProp;
};
/** Action-only morph presentation. Selection/async menus retain the full Menu. */
export declare function MorphingMenu({ label, items, onAction, disabled, open: controlled, onOpenChange, layoutStyle }: MorphingMenuProps): import("react").JSX.Element;
//# sourceMappingURL=menu-morph.d.ts.map