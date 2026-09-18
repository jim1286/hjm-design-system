import { type MenubarDescriptor } from "@hjmds/design-contracts/components/menubar";
export type MenubarProps<Key extends string = string, MenuKey extends string = string> = Readonly<{
    descriptor: MenubarDescriptor<Key, MenuKey>;
    openMenuId?: MenuKey | null;
    defaultOpenMenuId?: MenuKey | null;
    onOpenMenuIdChange?: (id: MenuKey | null) => void;
    onAction: (id: Key, menuId: MenuKey) => void;
    className?: string;
}>;
export declare function Menubar<Key extends string = string, MenuKey extends string = string>({ descriptor, openMenuId: controlledOpen, defaultOpenMenuId, onOpenMenuIdChange, onAction, className, }: MenubarProps<Key, MenuKey>): import("react").JSX.Element;
//# sourceMappingURL=menubar.d.ts.map