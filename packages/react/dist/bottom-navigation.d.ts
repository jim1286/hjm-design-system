import { type BottomNavigationActivation, type BottomNavigationConfiguration, type BottomNavigationDescriptor, type ResolvedBottomNavigationItemDescriptor } from "@hjm/design-contracts/components/bottom-navigation";
import { type AnchorHTMLAttributes, type HTMLAttributes, type MouseEvent, type ReactElement, type ReactNode, type RefAttributes } from "react";
export type BottomNavigationIconRenderProps<Key extends string = string, IconName extends string = string> = Readonly<{
    item: ResolvedBottomNavigationItemDescriptor<Key, IconName>;
    name: IconName;
    selected: boolean;
    color: "currentColor";
    size: number;
    strokeWidth: number;
    scale: number;
}>;
export type BottomNavigationLinkRenderProps = AnchorHTMLAttributes<HTMLAnchorElement> & Readonly<{
    href: string;
    children: ReactNode;
    "data-state": "idle" | "selected";
}>;
export type BottomNavigationProps<Key extends string = string, IconName extends string = string> = Omit<HTMLAttributes<HTMLElement>, "aria-label" | "aria-labelledby" | "children" | "dir" | "onChange" | "role"> & Readonly<{
    descriptor: BottomNavigationDescriptor<Key, IconName>;
    configuration?: BottomNavigationConfiguration;
    getHref: (item: ResolvedBottomNavigationItemDescriptor<Key, IconName>) => string;
    renderIcon: (props: BottomNavigationIconRenderProps<Key, IconName>) => ReactNode;
    /** Framework navigation adapter, for example Next.js Link. */
    renderLink?: (props: BottomNavigationLinkRenderProps) => ReactElement;
    primaryAction?: ReactNode;
    onActivate?: (activation: BottomNavigationActivation<Key>) => void;
}>;
export declare function isUnmodifiedPrimaryBottomNavigationClick(event: Pick<MouseEvent<HTMLAnchorElement>, "altKey" | "button" | "ctrlKey" | "defaultPrevented" | "metaKey" | "shiftKey">): boolean;
export declare function shouldHideBottomNavigationForKeyboard(input: Readonly<{
    behavior: "hide" | "remain";
    layoutViewportHeight: number;
    visualViewportHeight: number;
    visualViewportOffsetTop?: number;
    visualViewportScale?: number;
}>): boolean;
export declare function getBottomNavigationGridColumn(index: number, itemCount: number, distribution: "equal" | "center-gap"): number | undefined;
export declare const BottomNavigation: <Key extends string = string, IconName extends string = string>(props: BottomNavigationProps<Key, IconName> & RefAttributes<HTMLElement>) => ReactElement | null;
//# sourceMappingURL=bottom-navigation.d.ts.map