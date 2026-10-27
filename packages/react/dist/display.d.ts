import { listRowRecipe, type BadgeAdornmentContext, type BadgeSize, type BadgeTone, type BadgeVariant as ContractBadgeVariant, type BadgeCategoryColor, type ListRowDensity, type ListRowLeadingShape, type ListRowTrailingAccessory } from "@hjmds/design-contracts/recipes";
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
    /**
     * Product classification color per theme (series, grade…) in place of `tone`. HJM keeps the frame and picks the
     * label ink; a color whose label cannot reach AA 4.5 throws instead of rendering unreadable.
     */
    categoryColor?: BadgeCategoryColor;
    size?: BadgeSize;
    variant?: BadgeVariant;
    leading?: ReactNode | ((context: BadgeAdornmentContext) => ReactNode);
    trailing?: ReactNode | ((context: BadgeAdornmentContext) => ReactNode);
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const Badge: import("react").ForwardRefExoticComponent<HTMLAttributes<HTMLSpanElement> & Readonly<{
    tone?: BadgeTone;
    /**
     * Product classification color per theme (series, grade…) in place of `tone`. HJM keeps the frame and picks the
     * label ink; a color whose label cannot reach AA 4.5 throws instead of rendering unreadable.
     */
    categoryColor?: BadgeCategoryColor;
    size?: BadgeSize;
    variant?: BadgeVariant;
    leading?: ReactNode | ((context: BadgeAdornmentContext) => ReactNode);
    trailing?: ReactNode | ((context: BadgeAdornmentContext) => ReactNode);
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
    /** Independent identity destination, outside the card activation host. */
    leadingAction?: Readonly<{
        label: string;
        onPress(): void;
        disabled?: boolean;
    }>;
    media?: ReactNode;
    /** Decorative artwork behind the shared body/actions; its host determines the available height. */
    backgroundMedia?: ReactNode;
    /** Platform gesture/accessibility host behind content. Requires backgroundMedia; never put metadata/actions here. */
    backgroundInteraction?: ReactNode;
    /** Non-interactive cover classification at the shared top/end inset. Requires backgroundMedia. */
    mediaBadges?: ReactNode;
    badges?: ReactNode;
    /** Corner labels float above content without changing card height; keep their copy short. */
    badgesPlacement?: "body" | "corner";
    /** Centre short metadata beneath artwork without product-owned badge layout. */
    badgesAlign?: "start" | "center";
    /** Activate only the passive cover; other card content/actions keep independent targets. */
    mediaAction?: Readonly<{
        label: string;
        onActivate(): void;
        icon?: (context: Readonly<{
            color: string;
            size: number;
        }>) => ReactNode;
    }>;
    actions?: ReactNode;
    /** Independent commands at the header end; never nested in whole-card activation. */
    headerActions?: ReactNode;
    headingLevel?: CardHeadingLevel;
    selected?: boolean;
    /**
     * Whole-card activation. With `actions`, the card stays an article and a separate full-card button sits under the
     * action region, so actions remain independent buttons (never a button inside a button). Keep other children passive.
     */
    onActivate?: () => void;
    /** A native anchor preserves new-tab, copy-link and browser previews; it is exclusive with onActivate. */
    href?: string;
    /** Framework routing and product effects can wrap the shared anchor without replacing its placement. */
    renderLink?: (props: React.ComponentPropsWithRef<"a">) => ReactNode;
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
    /** Independent identity destination, outside the card activation host. */
    leadingAction?: Readonly<{
        label: string;
        onPress(): void;
        disabled?: boolean;
    }>;
    media?: ReactNode;
    /** Decorative artwork behind the shared body/actions; its host determines the available height. */
    backgroundMedia?: ReactNode;
    /** Platform gesture/accessibility host behind content. Requires backgroundMedia; never put metadata/actions here. */
    backgroundInteraction?: ReactNode;
    /** Non-interactive cover classification at the shared top/end inset. Requires backgroundMedia. */
    mediaBadges?: ReactNode;
    badges?: ReactNode;
    /** Corner labels float above content without changing card height; keep their copy short. */
    badgesPlacement?: "body" | "corner";
    /** Centre short metadata beneath artwork without product-owned badge layout. */
    badgesAlign?: "start" | "center";
    /** Activate only the passive cover; other card content/actions keep independent targets. */
    mediaAction?: Readonly<{
        label: string;
        onActivate(): void;
        icon?: (context: Readonly<{
            color: string;
            size: number;
        }>) => ReactNode;
    }>;
    actions?: ReactNode;
    /** Independent commands at the header end; never nested in whole-card activation. */
    headerActions?: ReactNode;
    headingLevel?: CardHeadingLevel;
    selected?: boolean;
    /**
     * Whole-card activation. With `actions`, the card stays an article and a separate full-card button sits under the
     * action region, so actions remain independent buttons (never a button inside a button). Keep other children passive.
     */
    onActivate?: () => void;
    /** A native anchor preserves new-tab, copy-link and browser previews; it is exclusive with onActivate. */
    href?: string;
    /** Framework routing and product effects can wrap the shared anchor without replacing its placement. */
    renderLink?: (props: React.ComponentPropsWithRef<"a">) => ReactNode;
    disabled?: boolean;
    tone?: SurfaceTone;
    bordered?: boolean;
    padding?: SurfacePadding;
    radius?: SurfaceRadius;
    /** Canonical layout-only placement; forwarded to the root Surface, which applies it. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLElement>>;
/** An attributed quotation reuses Card material while keeping quotation semantics and its caption together. */
export type QuoteCardProps = Omit<HTMLAttributes<HTMLElement>, "children" | "title"> & Readonly<{
    children: ReactNode;
    attribution?: string;
    renderMark?: (context: {
        color: string;
        size: number;
    }) => ReactNode;
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function QuoteCard({ children, attribution, renderMark, ...props }: QuoteCardProps): import("react").JSX.Element;
export type ListRowProps = Omit<HTMLAttributes<HTMLElement>, "title" | "onClick"> & Readonly<{
    title: ReactNode;
    description?: ReactNode;
    leading?: ReactNode;
    /** Independent member destination; rendered beside, never inside, the row command. */
    leadingAction?: Readonly<{
        label: string;
        onPress(): void;
        disabled?: boolean;
    }>;
    trailing?: ReactNode;
    /**
     * `disclosure`: the row opens another screen. HJM draws the decorative chevron after `trailing`, inside the row
     * command (before any `trailingAction`), mirrored in RTL; size and color come from `listRowRecipe.accessories`.
     */
    trailingAccessory?: ListRowTrailingAccessory;
    /** Independent command outside the row's navigation target. */
    trailingAction?: ReactNode;
    /** Supply a framework Link without replacing the shared row layout. */
    renderLink?: (props: React.ComponentPropsWithRef<"a">) => ReactNode;
    density?: ListRowDensity;
    /** Semantic emphasis for destructive destinations; selection stays independent. */
    tone?: keyof typeof listRowRecipe.tones;
    /** Frame the ListRow paints around `leading`; the recipe owns its size. */
    leadingShape?: ListRowLeadingShape;
    /** Large member portraits use the shared 48px frame; icons retain the default frame. */
    leadingSize?: "default" | "large";
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
    /** Independent member destination; rendered beside, never inside, the row command. */
    leadingAction?: Readonly<{
        label: string;
        onPress(): void;
        disabled?: boolean;
    }>;
    trailing?: ReactNode;
    /**
     * `disclosure`: the row opens another screen. HJM draws the decorative chevron after `trailing`, inside the row
     * command (before any `trailingAction`), mirrored in RTL; size and color come from `listRowRecipe.accessories`.
     */
    trailingAccessory?: ListRowTrailingAccessory;
    /** Independent command outside the row's navigation target. */
    trailingAction?: ReactNode;
    /** Supply a framework Link without replacing the shared row layout. */
    renderLink?: (props: React.ComponentPropsWithRef<"a">) => ReactNode;
    density?: ListRowDensity;
    /** Semantic emphasis for destructive destinations; selection stays independent. */
    tone?: keyof typeof listRowRecipe.tones;
    /** Frame the ListRow paints around `leading`; the recipe owns its size. */
    leadingShape?: ListRowLeadingShape;
    /** Large member portraits use the shared 48px frame; icons retain the default frame. */
    leadingSize?: "default" | "large";
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