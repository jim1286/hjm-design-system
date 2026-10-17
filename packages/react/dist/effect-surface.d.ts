import { type ReactNode } from "react";
import { type EffectSurfaceDescriptor } from "@hjmds/design-contracts/effect-surface";
import { type SurfacePadding, type SurfaceRadius } from "@hjmds/design-contracts/recipes/base";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type EffectSurfaceProps = Readonly<{
    descriptor?: EffectSurfaceDescriptor;
    children: ReactNode;
    className?: string;
    /** Content inset inside the decorated area (Surface padding scale). Consumers otherwise wrapped children in raw padded elements. */
    padding?: SurfacePadding;
    /** Corner radius of the decorated area. Defaults to the Surface radius so a framed hero clips its
     * decoration to the same corners as the Surface it wraps; full-bleed canvases pass `"none"`. */
    radius?: SurfaceRadius | "none";
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */ layoutStyle?: HjmCompositionStyleProp;
}>;
/** Decorative layers never receive pointer events or own the content's name. */
export declare function EffectSurface({ descriptor, children, className, padding, radius, layoutStyle }: EffectSurfaceProps): import("react").JSX.Element;
//# sourceMappingURL=effect-surface.d.ts.map