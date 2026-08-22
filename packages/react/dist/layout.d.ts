import { type GridDescriptor, type GridGap } from "@hjm/design-contracts/grid";
import { type SurfacePadding, type SurfaceRadius, type SurfaceTone } from "@hjm/design-contracts/recipes/base";
import { type StackAlign, type StackAxis, type StackGap, type StackJustify, type TextEmphasis, type TextTone } from "@hjm/design-contracts/recipes";
import type { TextVariant } from "@hjm/design-contracts/foundations";
import { type HTMLAttributes, type ReactNode } from "react";
export type { SurfacePadding, SurfaceRadius, SurfaceTone, } from "@hjm/design-contracts/recipes/base";
export type { StackAlign, StackAxis, StackGap, StackJustify, TextEmphasis, TextTone, } from "@hjm/design-contracts/recipes";
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
export type GridProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & Pick<GridDescriptor, "columns" | "gap" | "minColumnWidth"> & Readonly<{
    children?: ReactNode;
    /** Test/SSR override. Browser renderers otherwise observe window.innerWidth. */
    windowWidth?: number;
    /** Container measurement override; ResizeObserver is used when omitted. */
    availableWidth?: number;
}>;
export declare const Grid: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLDivElement>, "children"> & Pick<Readonly<{
    columns: import("@hjm/design-contracts/responsive").ResponsiveValue<number>;
    gap?: import("@hjm/design-contracts/responsive").ResponsiveValue<GridGap>;
    minColumnWidth?: import("@hjm/design-contracts/responsive").ResponsiveValue<number>;
}>, "gap" | "columns" | "minColumnWidth"> & Readonly<{
    children?: ReactNode;
    /** Test/SSR override. Browser renderers otherwise observe window.innerWidth. */
    windowWidth?: number;
    /** Container measurement override; ResizeObserver is used when omitted. */
    availableWidth?: number;
}> & import("react").RefAttributes<HTMLDivElement>>;
export type { GridGap };
//# sourceMappingURL=layout.d.ts.map