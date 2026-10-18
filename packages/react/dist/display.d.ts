import { listRowRecipe, type BadgeSize, type BadgeTone, type BadgeVariant as ContractBadgeVariant, type ListRowDensity, type ListRowLeadingShape } from "@hjmds/design-contracts/recipes";
import { type TagTone } from "@hjmds/design-contracts/components/tag";
import { type CardHeadingLevel } from "@hjmds/design-contracts/components/card";
import { type SurfacePadding, type SurfaceRadius, type SurfaceTone } from "@hjmds/design-contracts/recipes/base";
import { type HTMLAttributes, type MouseEventHandler, type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type { CardHeadingLevel } from "@hjmds/design-contracts/components/card";
export type { TagTone } from "@hjmds/design-contracts/components/tag";
export type BadgeVariant = ContractBadgeVariant;
export type BadgeProps = HTMLAttributes<HTMLSpanElement> & Readonly<{
    tone?: BadgeTone;
    size?: BadgeSize;
    variant?: BadgeVariant;
    leading?: ReactNode;
    trailing?: ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const Badge: import("react").ForwardRefExoticComponent<HTMLAttributes<HTMLSpanElement> & Readonly<{
    tone?: BadgeTone;
    size?: BadgeSize;
    variant?: BadgeVariant;
    leading?: ReactNode;
    trailing?: ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLSpanElement>>;
export type TagProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & Readonly<{
    children: string;
    tone?: TagTone;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const Tag: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLSpanElement>, "children"> & Readonly<{
    children: string;
    tone?: TagTone;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLSpanElement>>;
export type CardProps = Omit<HTMLAttributes<HTMLElement>, "title"> & Readonly<{
    title?: ReactNode;
    description?: ReactNode;
    leading?: ReactNode;
    media?: ReactNode;
    actions?: ReactNode;
    headingLevel?: CardHeadingLevel;
    selected?: boolean;
    /**
     * Whole-card activation. With `actions`, the card stays an article and a separate full-card button sits under the
     * action region, so actions remain independent buttons (never a button inside a button). Keep other children passive.
     */
    onActivate?: () => void;
    disabled?: boolean;
    tone?: SurfaceTone;
    bordered?: boolean;
    padding?: SurfacePadding;
    radius?: SurfaceRadius;
    /** Canonical layout-only placement; forwarded to the root Surface, which applies it. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const Card: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLElement>, "title"> & Readonly<{
    title?: ReactNode;
    description?: ReactNode;
    leading?: ReactNode;
    media?: ReactNode;
    actions?: ReactNode;
    headingLevel?: CardHeadingLevel;
    selected?: boolean;
    /**
     * Whole-card activation. With `actions`, the card stays an article and a separate full-card button sits under the
     * action region, so actions remain independent buttons (never a button inside a button). Keep other children passive.
     */
    onActivate?: () => void;
    disabled?: boolean;
    tone?: SurfaceTone;
    bordered?: boolean;
    padding?: SurfacePadding;
    radius?: SurfaceRadius;
    /** Canonical layout-only placement; forwarded to the root Surface, which applies it. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLElement>>;
export type ListRowProps = Omit<HTMLAttributes<HTMLElement>, "title" | "onClick"> & Readonly<{
    title: ReactNode;
    description?: ReactNode;
    leading?: ReactNode;
    trailing?: ReactNode;
    /** Independent command outside the row's navigation target. */
    trailingAction?: ReactNode;
    /** Supply a framework Link without replacing the shared row layout. */
    renderLink?: (props: React.ComponentPropsWithRef<"a">) => ReactNode;
    density?: ListRowDensity;
    /** Semantic emphasis for destructive destinations; selection stays independent. */
    tone?: keyof typeof listRowRecipe.tones;
    /** Frame the ListRow paints around `leading`; the recipe owns its size. */
    leadingShape?: ListRowLeadingShape;
    selected?: boolean;
    disabled?: boolean;
    /**
     * Placeholder row while the real one loads. It keeps the row's own height
     * and slot geometry, so a list does not jump when the content arrives —
     * which is exactly what a product-owned skeleton next to the list cannot do.
     */
    loading?: boolean;
    /** Localized status text announced while `loading`. */
    loadingLabel?: string;
    href?: string;
    onClick?: MouseEventHandler<HTMLElement>;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const ListRow: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLElement>, "title" | "onClick"> & Readonly<{
    title: ReactNode;
    description?: ReactNode;
    leading?: ReactNode;
    trailing?: ReactNode;
    /** Independent command outside the row's navigation target. */
    trailingAction?: ReactNode;
    /** Supply a framework Link without replacing the shared row layout. */
    renderLink?: (props: React.ComponentPropsWithRef<"a">) => ReactNode;
    density?: ListRowDensity;
    /** Semantic emphasis for destructive destinations; selection stays independent. */
    tone?: keyof typeof listRowRecipe.tones;
    /** Frame the ListRow paints around `leading`; the recipe owns its size. */
    leadingShape?: ListRowLeadingShape;
    selected?: boolean;
    disabled?: boolean;
    /**
     * Placeholder row while the real one loads. It keeps the row's own height
     * and slot geometry, so a list does not jump when the content arrives —
     * which is exactly what a product-owned skeleton next to the list cannot do.
     */
    loading?: boolean;
    /** Localized status text announced while `loading`. */
    loadingLabel?: string;
    href?: string;
    onClick?: MouseEventHandler<HTMLElement>;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLElement>>;
//# sourceMappingURL=display.d.ts.map