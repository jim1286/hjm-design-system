import { type IconDescriptor } from "@hjm/design-contracts/components/icon";
import { type CounterBadgeSize, type CounterBadgeTone, type CounterBadgeVariant } from "@hjm/design-contracts/recipes";
import { type HTMLAttributes, type SVGAttributes } from "react";
export type IconProps = Omit<SVGAttributes<SVGSVGElement>, "children" | "color"> & IconDescriptor;
export declare const Icon: import("react").ForwardRefExoticComponent<IconProps & import("react").RefAttributes<SVGSVGElement>>;
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
//# sourceMappingURL=supplemental-display.d.ts.map