import { type MenubarDescriptor } from "@hjmds/design-contracts/components/menubar";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type MenubarProps<Key extends string = string, MenuKey extends string = string> = Readonly<{
    descriptor: MenubarDescriptor<Key, MenuKey>;
    openMenuId?: MenuKey | null;
    defaultOpenMenuId?: MenuKey | null;
    onOpenMenuIdChange?: (id: MenuKey | null) => void;
    onAction: (id: Key, menuId: MenuKey) => void;
    className?: string;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function Menubar<Key extends string = string, MenuKey extends string = string>({ descriptor, openMenuId: controlledOpen, defaultOpenMenuId, onOpenMenuIdChange, onAction, className, layoutStyle, }: MenubarProps<Key, MenuKey>): import("react").JSX.Element;
//# sourceMappingURL=menubar.d.ts.map