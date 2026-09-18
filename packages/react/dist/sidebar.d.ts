import { type SidebarDescriptor, type SidebarItemDescriptor } from "@hjmds/design-contracts/components/sidebar";
import { type ReactNode } from "react";
export type SidebarProps<Id extends string = string, GroupId extends string = string> = Readonly<{
    descriptor: SidebarDescriptor<Id, GroupId>;
    collapsed?: boolean;
    defaultCollapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
    /** Localized names for the collapse control in both states. */
    collapseLabels?: Readonly<{
        collapse: string;
        expand: string;
    }>;
    onNavigate?: (id: Id) => void;
    /** Product-owned icon per item; required for the collapsed rail to stay usable. */
    renderIcon?: (item: SidebarItemDescriptor<Id>) => ReactNode;
    renderBadge?: (count: number, item: SidebarItemDescriptor<Id>) => ReactNode;
    className?: string;
}>;
export declare const Sidebar: <Id extends string = string, GroupId extends string = string>(props: SidebarProps<Id, GroupId> & {
    ref?: React.Ref<HTMLElement>;
}) => React.ReactElement | null;
//# sourceMappingURL=sidebar.d.ts.map