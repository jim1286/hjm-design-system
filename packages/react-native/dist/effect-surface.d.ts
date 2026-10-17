import { type ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import { type EffectSurfaceDescriptor } from "@hjmds/design-contracts/effect-surface";
import { type SurfacePadding, type SurfaceRadius } from "@hjmds/design-contracts/recipes/base";
export type EffectSurfaceProps = Readonly<{
    descriptor?: EffectSurfaceDescriptor;
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    /** Content inset inside the decorated area (Surface padding scale). Decoration stays absolute-fill, so it still covers the inset. */
    padding?: SurfacePadding;
    /** Corner radius of the decorated area. Defaults to the Surface radius so a framed hero clips its
     * decoration to the same corners as the Surface it wraps; full-bleed canvases pass `"none"`. */
    radius?: SurfaceRadius | "none";
    /** Host screen/list visibility; false freezes decoration. */ visible?: boolean;
}>;
export declare function EffectSurface({ descriptor, children, style, padding, radius, visible }: EffectSurfaceProps): import("react").JSX.Element;
//# sourceMappingURL=effect-surface.d.ts.map