import { type IconDescriptor } from "@hjm/design-contracts/components/icon";
import { type ImageDescriptor, type ImageLoadStatus } from "@hjm/design-contracts/components/image";
import { type CounterBadgeSize, type CounterBadgeTone, type CounterBadgeVariant } from "@hjm/design-contracts/recipes";
import { type CSSProperties, type HTMLAttributes, type ImgHTMLAttributes, type ReactElement, type ReactEventHandler, type ReactNode, type Ref, type SVGAttributes } from "react";
export type IconProps = Omit<SVGAttributes<SVGSVGElement>, "children" | "color"> & IconDescriptor;
export declare const Icon: import("react").ForwardRefExoticComponent<IconProps & import("react").RefAttributes<SVGSVGElement>>;
type ImageElementProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "alt" | "aria-hidden" | "aria-label" | "children" | "className" | "height" | "onError" | "onLoad" | "role" | "src" | "style" | "width">;
/** Canonical props handed to a framework adapter such as `next/image`. */
export type ImageAdapterProps = ImageElementProps & Readonly<{
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    style: CSSProperties;
    "aria-hidden"?: true;
    onLoad: ReactEventHandler<HTMLImageElement>;
    onError: ReactEventHandler<HTMLImageElement>;
    ref?: Ref<HTMLImageElement>;
}>;
type ImageRootProps = Omit<HTMLAttributes<HTMLSpanElement>, "aria-hidden" | "aria-label" | "aria-labelledby" | "children" | "onError" | "onLoad" | "role">;
export type ImageProps = ImageRootProps & ImageDescriptor & Readonly<{
    /** Additional native `<img>` props shared with the framework adapter. */
    imageProps?: ImageElementProps & Readonly<{
        className?: string;
        style?: CSSProperties;
    }>;
    /**
     * Receives the complete accessible image contract. The adapter must pass
     * these props to its underlying image element so HJM can observe failure.
     */
    renderImage?: (props: ImageAdapterProps) => ReactElement;
    /** Visual content only; HJM keeps the fallback's accessible name. */
    fallback?: ReactNode;
    imageRef?: Ref<HTMLImageElement>;
    onLoad?: ReactEventHandler<HTMLImageElement>;
    onError?: ReactEventHandler<HTMLImageElement>;
    onLoadStatusChange?: (status: Extract<ImageLoadStatus, "loaded" | "error">) => void;
}>;
/** Intrinsic-size image with canonical alt semantics and an accessible fallback. */
export declare const Image: import("react").ForwardRefExoticComponent<ImageProps & import("react").RefAttributes<HTMLSpanElement>>;
export type CounterBadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & Readonly<{
    count: number;
    max?: number;
    tone?: CounterBadgeTone;
    size?: CounterBadgeSize;
    variant?: CounterBadgeVariant;
    accessibilityLabel?: string;
}>;
export declare const CounterBadge: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLSpanElement>, "children"> & Readonly<{
    count: number;
    max?: number;
    tone?: CounterBadgeTone;
    size?: CounterBadgeSize;
    variant?: CounterBadgeVariant;
    accessibilityLabel?: string;
}> & import("react").RefAttributes<HTMLSpanElement>>;
export {};
//# sourceMappingURL=supplemental-display.d.ts.map