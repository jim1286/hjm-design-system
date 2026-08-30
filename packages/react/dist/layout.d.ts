import { type GridDescriptor, type GridGap } from "@hjmds/design-contracts/grid";
import { type AspectRatioValue } from "@hjmds/design-contracts/components/aspect-ratio";
import { type ContainerGutter, type ContainerSize } from "@hjmds/design-contracts/components/container";
import { type LayoutSidebarRole } from "@hjmds/design-contracts/components/layout";
import { type SurfacePadding, type SurfaceRadius, type SurfaceTone } from "@hjmds/design-contracts/recipes/base";
import { type StackAlign, type StackAxis, type StackGap, type StackJustify, type TextEmphasis, type TextTone } from "@hjmds/design-contracts/recipes";
import type { TextVariant } from "@hjmds/design-contracts/foundations";
import { type AnchorHTMLAttributes, type HTMLAttributes, type ReactElement, type ReactNode, type Ref } from "react";
export type { SurfacePadding, SurfaceRadius, SurfaceTone, } from "@hjmds/design-contracts/recipes/base";
export type { StackAlign, StackAxis, StackGap, StackJustify, TextEmphasis, TextTone, } from "@hjmds/design-contracts/recipes";
type LayoutRegionProps = Omit<HTMLAttributes<HTMLElement>, "children" | "role">;
type LayoutSidebarBase = Readonly<{
    children: ReactNode;
    role: LayoutSidebarRole;
    label: string;
    landmarkProps?: Omit<LayoutRegionProps, "aria-label">;
    landmarkRef?: Ref<HTMLElement>;
}>;
/**
 * A persistent sidebar is rendered in the shell grid. An overlay sidebar is
 * deliberately handed to the product's SidePanel (or equivalent) through
 * `renderOverlay`; Layout never owns a second open/dismiss lifecycle.
 */
export type LayoutSidebar = (LayoutSidebarBase & Readonly<{
    mode: "persistent";
    renderOverlay?: never;
}>) | (LayoutSidebarBase & Readonly<{
    mode: "overlay";
    renderOverlay(sidebarLandmark: ReactElement): ReactNode;
}>);
export type LayoutProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & Readonly<{
    children: ReactNode;
    header?: ReactNode;
    footer?: ReactNode;
    sidebar?: LayoutSidebar;
    skipLinkLabel?: string;
    /** Stable product id for deep links; a hydration-safe id is generated when omitted. */
    mainId?: string;
    mainRef?: Ref<HTMLElement>;
    headerProps?: LayoutRegionProps;
    mainProps?: Omit<LayoutRegionProps, "id" | "tabIndex">;
    footerProps?: LayoutRegionProps;
    skipLinkProps?: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href">;
}>;
/** Accessible Web app shell with real landmarks and bypass navigation. */
export declare const Layout: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLDivElement>, "children"> & Readonly<{
    children: ReactNode;
    header?: ReactNode;
    footer?: ReactNode;
    sidebar?: LayoutSidebar;
    skipLinkLabel?: string;
    /** Stable product id for deep links; a hydration-safe id is generated when omitted. */
    mainId?: string;
    mainRef?: Ref<HTMLElement>;
    headerProps?: LayoutRegionProps;
    mainProps?: Omit<LayoutRegionProps, "id" | "tabIndex">;
    footerProps?: LayoutRegionProps;
    skipLinkProps?: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href">;
}> & import("react").RefAttributes<HTMLDivElement>>;
export type TextProps = Omit<HTMLAttributes<HTMLElement>, "children"> & Readonly<{
    children: ReactNode;
    as?: "span" | "p" | "div" | "strong" | "small";
    variant?: TextVariant;
    tone?: TextTone;
    emphasis?: TextEmphasis;
}>;
export declare const Text: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLElement>, "children"> & Readonly<{
    children: ReactNode;
    as?: "span" | "p" | "div" | "strong" | "small";
    variant?: TextVariant;
    tone?: TextTone;
    emphasis?: TextEmphasis;
}> & import("react").RefAttributes<HTMLElement>>;
export type SurfaceProps = HTMLAttributes<HTMLElement> & Readonly<{
    as?: "div" | "section" | "article";
    tone?: SurfaceTone;
    bordered?: boolean;
    padding?: SurfacePadding;
    radius?: SurfaceRadius;
}>;
export declare const Surface: import("react").ForwardRefExoticComponent<HTMLAttributes<HTMLElement> & Readonly<{
    as?: "div" | "section" | "article";
    tone?: SurfaceTone;
    bordered?: boolean;
    padding?: SurfacePadding;
    radius?: SurfaceRadius;
}> & import("react").RefAttributes<HTMLElement>>;
export type StackProps = HTMLAttributes<HTMLDivElement> & Readonly<{
    axis?: StackAxis;
    gap?: StackGap;
    align?: StackAlign;
    justify?: StackJustify;
    wrap?: boolean;
}>;
export declare const Stack: import("react").ForwardRefExoticComponent<HTMLAttributes<HTMLDivElement> & Readonly<{
    axis?: StackAxis;
    gap?: StackGap;
    align?: StackAlign;
    justify?: StackJustify;
    wrap?: boolean;
}> & import("react").RefAttributes<HTMLDivElement>>;
export type ContainerProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & Readonly<{
    children?: ReactNode;
    size?: ContainerSize;
    gutter?: ContainerGutter;
}>;
/** A centered, token-guttered content boundary shared with Native large screens. */
export declare const Container: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLDivElement>, "children"> & Readonly<{
    children?: ReactNode;
    size?: ContainerSize;
    gutter?: ContainerGutter;
}> & import("react").RefAttributes<HTMLDivElement>>;
export type AspectRatioProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & Readonly<{
    children?: ReactNode;
    ratio?: AspectRatioValue;
}>;
/** Responsive media frame. Products retain object-fit, crop, and content semantics. */
export declare const AspectRatio: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLDivElement>, "children"> & Readonly<{
    children?: ReactNode;
    ratio?: AspectRatioValue;
}> & import("react").RefAttributes<HTMLDivElement>>;
export type VisuallyHiddenProps = HTMLAttributes<HTMLSpanElement> & Readonly<{
    children: ReactNode;
}>;
/** Keeps meaningful copy available to assistive technology without visible layout. */
export declare const VisuallyHidden: import("react").ForwardRefExoticComponent<HTMLAttributes<HTMLSpanElement> & Readonly<{
    children: ReactNode;
}> & import("react").RefAttributes<HTMLSpanElement>>;
export type GridProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & Pick<GridDescriptor, "columns" | "gap" | "minColumnWidth"> & Readonly<{
    children?: ReactNode;
    /** Test/SSR override. Browser renderers otherwise observe window.innerWidth. */
    windowWidth?: number;
    /** Container measurement override; ResizeObserver is used when omitted. */
    availableWidth?: number;
}>;
export declare const Grid: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLDivElement>, "children"> & Pick<Readonly<{
    columns: import("@hjmds/design-contracts/responsive").ResponsiveValue<number>;
    gap?: import("@hjmds/design-contracts/responsive").ResponsiveValue<GridGap>;
    minColumnWidth?: import("@hjmds/design-contracts/responsive").ResponsiveValue<number>;
}>, "gap" | "columns" | "minColumnWidth"> & Readonly<{
    children?: ReactNode;
    /** Test/SSR override. Browser renderers otherwise observe window.innerWidth. */
    windowWidth?: number;
    /** Container measurement override; ResizeObserver is used when omitted. */
    availableWidth?: number;
}> & import("react").RefAttributes<HTMLDivElement>>;
export type SectionProps = Omit<HTMLAttributes<HTMLElement>, "children" | "title"> & Readonly<{
    title?: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    children: ReactNode;
    headingLevel?: 2 | 3 | 4 | 5 | 6;
}>;
/** Large-text-safe semantic content section with an optional header action. */
export declare const Section: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLElement>, "children" | "title"> & Readonly<{
    title?: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    children: ReactNode;
    headingLevel?: 2 | 3 | 4 | 5 | 6;
}> & import("react").RefAttributes<HTMLElement>>;
export type { GridGap };
export type { AspectRatioValue, ContainerGutter, ContainerSize };
//# sourceMappingURL=layout.d.ts.map