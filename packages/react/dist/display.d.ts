import { type BadgeSize, type BadgeTone, type BadgeVariant as ContractBadgeVariant, type ListRowDensity } from "@hjm/design-contracts/recipes";
import { type TagTone } from "@hjm/design-contracts/components/tag";
import { type CardHeadingLevel } from "@hjm/design-contracts/components/card";
import { type SurfacePadding, type SurfaceRadius, type SurfaceTone } from "@hjm/design-contracts/recipes/base";
import { type HTMLAttributes, type MouseEventHandler, type ReactNode } from "react";
export type { CardHeadingLevel } from "@hjm/design-contracts/components/card";
export type { TagTone } from "@hjm/design-contracts/components/tag";
export type BadgeVariant = ContractBadgeVariant;
export type BadgeProps = HTMLAttributes<HTMLSpanElement> & Readonly<{
    tone?: BadgeTone;
    size?: BadgeSize;
    variant?: BadgeVariant;
    leading?: ReactNode;
}>;
export declare const Badge: import("react").ForwardRefExoticComponent<HTMLAttributes<HTMLSpanElement> & Readonly<{
    tone?: BadgeTone;
    size?: BadgeSize;
    variant?: BadgeVariant;
    leading?: ReactNode;
}> & import("react").RefAttributes<HTMLSpanElement>>;
export type TagProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & Readonly<{
    children: string;
    tone?: TagTone;
}>;
export declare const Tag: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLSpanElement>, "children"> & Readonly<{
    children: string;
    tone?: TagTone;
}> & import("react").RefAttributes<HTMLSpanElement>>;
export type CardProps = Omit<HTMLAttributes<HTMLElement>, "title"> & Readonly<{
    title?: ReactNode;
    description?: ReactNode;
    leading?: ReactNode;
    media?: ReactNode;
    actions?: ReactNode;
    headingLevel?: CardHeadingLevel;
    selected?: boolean;
    tone?: SurfaceTone;
    bordered?: boolean;
    padding?: SurfacePadding;
    radius?: SurfaceRadius;
}>;
export declare const Card: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLElement>, "title"> & Readonly<{
    title?: ReactNode;
    description?: ReactNode;
    leading?: ReactNode;
    media?: ReactNode;
    actions?: ReactNode;
    headingLevel?: CardHeadingLevel;
    selected?: boolean;
    tone?: SurfaceTone;
    bordered?: boolean;
    padding?: SurfacePadding;
    radius?: SurfaceRadius;
}> & import("react").RefAttributes<HTMLElement>>;
export type ListRowProps = Omit<HTMLAttributes<HTMLElement>, "title" | "onClick"> & Readonly<{
    title: ReactNode;
    description?: ReactNode;
    leading?: ReactNode;
    trailing?: ReactNode;
    density?: ListRowDensity;
    selected?: boolean;
    disabled?: boolean;
    href?: string;
    onClick?: MouseEventHandler<HTMLElement>;
}>;
export declare const ListRow: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLElement>, "title" | "onClick"> & Readonly<{
    title: ReactNode;
    description?: ReactNode;
    leading?: ReactNode;
    trailing?: ReactNode;
    density?: ListRowDensity;
    selected?: boolean;
    disabled?: boolean;
    href?: string;
    onClick?: MouseEventHandler<HTMLElement>;
}> & import("react").RefAttributes<HTMLElement>>;
//# sourceMappingURL=display.d.ts.map