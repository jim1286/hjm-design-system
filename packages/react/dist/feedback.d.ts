import { emptyStateRecipe, skeletonRecipe, type NoticeTone, type ProgressShape, type ProgressSize, type ProgressTone, type SpinnerSize, type SpinnerTone } from "@hjmds/design-contracts/recipes";
import { type ResultDescriptor } from "@hjmds/design-contracts/components/result";
import { type HTMLAttributes, type ProgressHTMLAttributes, type ReactNode } from "react";
export type NoticeProps = HTMLAttributes<HTMLElement> & Readonly<{
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    icon?: ReactNode;
    tone?: NoticeTone;
}>;
export declare const Notice: import("react").ForwardRefExoticComponent<HTMLAttributes<HTMLElement> & Readonly<{
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    icon?: ReactNode;
    tone?: NoticeTone;
}> & import("react").RefAttributes<HTMLElement>>;
type EmptyStateDensity = keyof typeof emptyStateRecipe.density;
export type EmptyStateProps = HTMLAttributes<HTMLDivElement> & Readonly<{
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    icon?: ReactNode;
    density?: EmptyStateDensity;
}>;
export declare const EmptyState: import("react").ForwardRefExoticComponent<HTMLAttributes<HTMLDivElement> & Readonly<{
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    icon?: ReactNode;
    density?: EmptyStateDensity;
}> & import("react").RefAttributes<HTMLDivElement>>;
export type ResultProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> & ResultDescriptor & Readonly<{
    headingLevel?: 1 | 2;
    /** Optional product glyph; its meaning is already carried by title/status. */
    icon?: ReactNode;
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
}> & import("react").RefAttributes<HTMLDivElement>>;
export type ProgressProps = Omit<ProgressHTMLAttributes<HTMLProgressElement>, "children" | "max" | "size" | "value"> & Readonly<{
    label: ReactNode;
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
}>;
export declare const Progress: import("react").ForwardRefExoticComponent<Omit<ProgressHTMLAttributes<HTMLProgressElement>, "value" | "children" | "size" | "max"> & Readonly<{
    label: ReactNode;
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
}> & import("react").RefAttributes<HTMLProgressElement>>;
export type SpinnerProps = HTMLAttributes<HTMLSpanElement> & Readonly<{
    label: string;
    size?: SpinnerSize;
    tone?: SpinnerTone;
}>;
export declare const Spinner: import("react").ForwardRefExoticComponent<HTMLAttributes<HTMLSpanElement> & Readonly<{
    label: string;
    size?: SpinnerSize;
    tone?: SpinnerTone;
}> & import("react").RefAttributes<HTMLSpanElement>>;
type SkeletonShape = keyof typeof skeletonRecipe.shapes;
export type SkeletonProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & Readonly<{
    shape?: SkeletonShape;
    animated?: boolean;
    width?: string | number;
    height?: string | number;
}>;
export declare const Skeleton: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLSpanElement>, "children"> & Readonly<{
    shape?: SkeletonShape;
    animated?: boolean;
    width?: string | number;
    height?: string | number;
}> & import("react").RefAttributes<HTMLSpanElement>>;
export {};
//# sourceMappingURL=feedback.d.ts.map