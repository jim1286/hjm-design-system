import { type GridDescriptor, type ResolvedGridLayout } from "@hjmds/design-contracts/grid";
import { type AspectRatioValue } from "@hjmds/design-contracts/components/aspect-ratio";
import { type ContainerGutter, type ContainerSize } from "@hjmds/design-contracts/components/container";
import { type IconDescriptor } from "@hjmds/design-contracts/components/icon";
import { type LayoutSidebarRole } from "@hjmds/design-contracts/components/layout";
import { type TextVariant } from "@hjmds/design-contracts/foundations";
import { type SurfacePadding as ContractSurfacePadding, type SurfaceRadius as ContractSurfaceRadius, type SurfaceTone as ContractSurfaceTone } from "@hjmds/design-contracts/recipes/base";
import { type StackAlign, type StackAxis, type StackGap, type StackJustify, type TextEmphasis, type TextTone as ContractTextTone } from "@hjmds/design-contracts/recipes";
import { type Ref, type ReactNode } from "react";
import { Text as NativeText, View, type StyleProp, type TextProps as NativeTextProps, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
export type { StackAlign, StackAxis, StackGap, StackJustify, TextEmphasis, } from "@hjmds/design-contracts/recipes";
export type TextTone = ContractTextTone;
type LayoutRegionProps = Omit<ViewProps, "children">;
type LayoutSidebarBase = Readonly<{
    children: ReactNode;
    role: LayoutSidebarRole;
    label: string;
    containerProps?: LayoutRegionProps;
}>;
export type LayoutSidebar = (LayoutSidebarBase & Readonly<{
    mode: "persistent";
    renderOverlay?: never;
}>) | (LayoutSidebarBase & Readonly<{
    mode: "overlay";
    renderOverlay(sidebar: ReactNode): ReactNode;
}>);
export type LayoutProps = Omit<ViewProps, "children"> & Readonly<{
    children: ReactNode;
    header?: ReactNode;
    footer?: ReactNode;
    sidebar?: LayoutSidebar;
    /** @deprecated Native has no bypass-link equivalent; omit this Web-only copy. */
    skipLinkLabel?: string;
    headerProps?: LayoutRegionProps;
    mainProps?: LayoutRegionProps;
    footerProps?: LayoutRegionProps;
    mainRef?: Ref<View>;
}>;
/** Native shell translation: ordered regions without inventing Web landmark roles. */
export declare const Layout: import("react").ForwardRefExoticComponent<Omit<ViewProps, "children"> & Readonly<{
    children: ReactNode;
    header?: ReactNode;
    footer?: ReactNode;
    sidebar?: LayoutSidebar;
    /** @deprecated Native has no bypass-link equivalent; omit this Web-only copy. */
    skipLinkLabel?: string;
    headerProps?: LayoutRegionProps;
    mainProps?: LayoutRegionProps;
    footerProps?: LayoutRegionProps;
    mainRef?: Ref<View>;
}> & import("react").RefAttributes<View>>;
export type TextProps = Omit<NativeTextProps, "children"> & Readonly<{
    children: ReactNode;
    variant?: TextVariant;
    tone?: TextTone;
    emphasis?: TextEmphasis;
    align?: TextStyle["textAlign"];
}>;
export declare const Text: import("react").ForwardRefExoticComponent<Omit<NativeTextProps, "children"> & Readonly<{
    children: ReactNode;
    variant?: TextVariant;
    tone?: TextTone;
    emphasis?: TextEmphasis;
    align?: TextStyle["textAlign"];
}> & import("react").RefAttributes<NativeText>>;
/** @deprecated Compatibility aliases; use `subtle` and `accent`. */
export type LegacyNativeSurfaceTone = "sunken" | "brand";
export type SurfaceTone = ContractSurfaceTone | LegacyNativeSurfaceTone;
export type SurfacePadding = ContractSurfacePadding | number;
export type SurfaceRadius = ContractSurfaceRadius | number;
export type SurfaceProps = ViewProps & Readonly<{
    tone?: SurfaceTone;
    padding?: SurfacePadding;
    radius?: SurfaceRadius;
    bordered?: boolean;
}>;
export declare function Surface({ tone, padding, radius: radiusValue, bordered, style, ...props }: SurfaceProps): import("react").JSX.Element;
export type StackProps = ViewProps & Readonly<{
    axis?: StackAxis;
    gap?: StackGap | number;
    align?: StackAlign;
    justify?: StackJustify;
    wrap?: boolean;
    /** @deprecated Use the renderer-neutral `axis` prop. */
    direction?: "row" | "column";
}>;
export declare function Stack({ axis, direction, gap, align, justify, wrap, style, ...props }: StackProps): import("react").JSX.Element;
export type ContainerProps = Omit<ViewProps, "children"> & Readonly<{
    children?: ReactNode;
    size?: ContainerSize;
    gutter?: ContainerGutter;
}>;
/** Shared centered content boundary for phones, tablets, and desktop-sized Native windows. */
export declare function Container({ size, gutter, style, ...props }: ContainerProps): import("react").JSX.Element;
export type AspectRatioProps = Omit<ViewProps, "children"> & Readonly<{
    children?: ReactNode;
    ratio?: AspectRatioValue;
}>;
/** Native translation of the same width/height contract used by Web media frames. */
export declare function AspectRatio({ ratio, style, ...props }: AspectRatioProps): import("react").JSX.Element;
type GridCanonicalDescriptorProps = Pick<GridDescriptor, "columns" | "gap" | "minColumnWidth"> & Readonly<{
    descriptor?: never;
}>;
type GridLegacyDescriptorProps = Readonly<{
    /** @deprecated Pass `columns`, `gap`, and `minColumnWidth` directly. */
    descriptor: GridDescriptor;
    columns?: never;
    gap?: never;
    minColumnWidth?: never;
}>;
export type GridProps = Omit<ViewProps, "children"> & (GridCanonicalDescriptorProps | GridLegacyDescriptorProps) & Readonly<{
    children?: ReactNode;
    /** Inner width after page padding. When omitted, the rendered container is measured. */
    availableWidth?: number;
    onLayoutResolved?: (layout: ResolvedGridLayout) => void;
    itemStyle?: StyleProp<ViewStyle>;
}>;
export declare function Grid({ children, descriptor, columns, gap, minColumnWidth, availableWidth, onLayoutResolved, itemStyle, style, onLayout, ...props }: GridProps): import("react").JSX.Element;
export type NativeIconRenderProps<Name extends string = string> = Readonly<{
    name: Name;
    size: number;
    color: string;
    strokeWidth: number;
}>;
export type IconProps<Name extends string = string> = Readonly<{
    descriptor: IconDescriptor<Name>;
    /** Tree-shakeable product glyph boundary; HJM owns all appearance values. */
    renderGlyph: (props: NativeIconRenderProps<Name>) => ReactNode;
    style?: StyleProp<ViewStyle>;
}>;
/** Semantic Native icon frame without an Expo or third-party icon dependency. */
export declare function Icon<Name extends string = string>({ descriptor, renderGlyph, style, }: IconProps<Name>): import("react").JSX.Element;
export type SectionProps = Omit<ViewProps, "children"> & Readonly<{
    title?: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
    headerStyle?: StyleProp<ViewStyle>;
    copyStyle?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    descriptionStyle?: StyleProp<TextStyle>;
    actionStyle?: StyleProp<ViewStyle>;
    contentStyle?: StyleProp<ViewStyle>;
}>;
/** A large-text-safe content section with a logical header action slot. */
export declare function Section({ title, description, action, children, headerStyle, copyStyle, titleStyle, descriptionStyle, actionStyle, contentStyle, style, ...props }: SectionProps): import("react").JSX.Element;
export type { AspectRatioValue, ContainerGutter, ContainerSize };
//# sourceMappingURL=primitives.d.ts.map