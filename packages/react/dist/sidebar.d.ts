import { type SidebarDescriptor, type SidebarItemDescriptor, type SidebarSize } from "@hjmds/design-contracts/components/sidebar";
import { type AnchorHTMLAttributes, type ReactElement, type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type SidebarAppearance = "standard" | "bounce" | "hook" | "proximity";
export type { SidebarSize };
/**
 * Anchor props HJM prepared for one enabled item with a destination. A router adapter spreads all of them onto its
 * own link (for example Next.js `Link`): `onClick` keeps the disabled guard, bounce and `onNavigate` before the
 * router navigates, and `aria-current`/collapsed `aria-label` stay HJM-owned.
 */
export type SidebarLinkRenderProps = AnchorHTMLAttributes<HTMLAnchorElement> & Readonly<{
    href: string;
    className: string;
    children: ReactNode;
}>;
export type SidebarProps<Id extends string = string, GroupId extends string = string> = Readonly<{
    descriptor: SidebarDescriptor<Id, GroupId>;
    /** Decoration only; link hit areas and document-order keyboard navigation stay fixed. */
    appearance?: SidebarAppearance;
    /** Open width step: `regular` 260 (default) or `compact` 220 (`sidebarRecipe.sizes`). The collapsed rail stays 72. */
    size?: SidebarSize;
    collapsed?: boolean;
    defaultCollapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
    /** Localized names for the collapse control in both states. */
    collapseLabels?: Readonly<{
        collapse: string;
        expand: string;
    }>;
    /** Called on item activation, before a `renderLink` router navigates. A plain `href` still navigates natively. */
    onNavigate?: (id: Id) => void;
    /**
     * Framework navigation adapter (same contract as `BottomNavigation.renderLink`) for items with a destination.
     * Disabled items and items without a destination keep HJM's own anchor so the adapter never receives a dead link.
     */
    renderLink?: (props: SidebarLinkRenderProps) => ReactElement;
    /** Product-owned icon per item; required for the collapsed rail to stay usable. */
    renderIcon?: (item: SidebarItemDescriptor<Id>) => ReactNode;
    renderBadge?: (count: number, item: SidebarItemDescriptor<Id>) => ReactNode;
    /** Product slot above the groups (brand mark, primary action). Diairy and BurnTok shells drew it outside HJM. */
    header?: ReactNode;
    /** Product slot pinned to the bottom (settings, language). Stays at the end however short the groups are. */
    footer?: ReactNode;
    className?: string;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const Sidebar: <Id extends string = string, GroupId extends string = string>(props: SidebarProps<Id, GroupId> & {
    ref?: React.Ref<HTMLElement>;
}) => React.ReactElement | null;
//# sourceMappingURL=sidebar.d.ts.map