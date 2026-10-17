import { emptyStateRecipe, skeletonRecipe, type NoticeTone, type ProgressShape, type ProgressSize, type ProgressTone } from "@hjmds/design-contracts/recipes";
import { type ResultDescriptor } from "@hjmds/design-contracts/components/result";
import { type HTMLAttributes, type ProgressHTMLAttributes, type ReactNode } from "react";
import { type ButtonShape } from "@hjmds/design-contracts/recipes/base";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type NoticeProps = Omit<HTMLAttributes<HTMLElement>, "title"> & Readonly<{
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    icon?: ReactNode;
    tone?: NoticeTone;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const Notice: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLElement>, "title"> & Readonly<{
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    icon?: ReactNode;
    tone?: NoticeTone;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLElement>>;
type EmptyStateDensity = keyof typeof emptyStateRecipe.density;
export type EmptyStateProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & Readonly<{
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    icon?: ReactNode;
    density?: EmptyStateDensity;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const EmptyState: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLDivElement>, "title"> & Readonly<{
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    icon?: ReactNode;
    density?: EmptyStateDensity;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLDivElement>>;
export type ResultProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> & ResultDescriptor & Readonly<{
    headingLevel?: 1 | 2;
    /** Optional product glyph; its meaning is already carried by title/status. */
    icon?: ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** A terminal flow outcome. EmptyState remains reserved for fillable content. */
export declare const Result: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> & Readonly<{
    status: import("@hjmds/design-contracts/components/result").ResultStatus;
    title: string;
    description?: string;
    actions?: readonly import("@hjmds/design-contracts/components/result").ResultActionDescriptor[];
}> & Readonly<{
    headingLevel?: 1 | 2;
    /** Optional product glyph; its meaning is already carried by title/status. */
    icon?: ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLDivElement>>;
type ProgressName = Readonly<{
    label: ReactNode;
    "aria-label"?: string;
}> | Readonly<{
    label?: never;
    "aria-label": string;
}>;
export type ProgressProps = Omit<ProgressHTMLAttributes<HTMLProgressElement>, "children" | "max" | "size" | "value" | "aria-label"> & ProgressName & Readonly<{
    value?: number;
    max?: number;
    valueText?: string;
    size?: ProgressSize;
    tone?: ProgressTone;
    /**
     * `circular` draws the same value as a ring. It is a shape, not a second
     * component: min/max/now, the indeterminate case and the announcement are
     * identical, so the accessibility contract stays in one place.
     */
    shape?: ProgressShape;
    /** Content inside the ring — a percentage, a count, an icon. Ignored when linear. */
    children?: ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const Progress: import("react").ForwardRefExoticComponent<ProgressProps & import("react").RefAttributes<HTMLProgressElement>>;
export { Spinner, type SpinnerProps } from "./internal/spinner.js";
type SkeletonShape = keyof typeof skeletonRecipe.shapes;
export type SkeletonProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & Readonly<{
    shape?: SkeletonShape;
    animated?: boolean;
    /**
     * `text` only: draw this many lines with the last one shorter (`skeletonRecipe.lines`), so a paragraph
     * placeholder is not rebuilt from loose bars in every product. `width` sizes the whole group.
     */
    lines?: number;
    /**
     * `button` only: the Button `shape` this placeholder stands in for (default: Button's default). Products that use
     * `shape="pill"` buttons pass the same value so the placeholder matches (BurnTok, 2026-10-17).
     */
    buttonShape?: ButtonShape;
    width?: string | number;
    height?: string | number;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const Skeleton: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLSpanElement>, "children"> & Readonly<{
    shape?: SkeletonShape;
    animated?: boolean;
    /**
     * `text` only: draw this many lines with the last one shorter (`skeletonRecipe.lines`), so a paragraph
     * placeholder is not rebuilt from loose bars in every product. `width` sizes the whole group.
     */
    lines?: number;
    /**
     * `button` only: the Button `shape` this placeholder stands in for (default: Button's default). Products that use
     * `shape="pill"` buttons pass the same value so the placeholder matches (BurnTok, 2026-10-17).
     */
    buttonShape?: ButtonShape;
    width?: string | number;
    height?: string | number;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLSpanElement>>;
export { ActivityChip, type ActivityChipProps } from "./activity-chip.js";
//# sourceMappingURL=feedback.d.ts.map