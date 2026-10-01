import { type ColorReference } from "./color-references.js";
export type EffectLayer = "mesh" | "glow" | "grain";
export type EffectSurfaceDescriptor = Readonly<{
    layers?: readonly EffectLayer[];
    seed?: string;
    intensity?: number;
    /** One slow cycle in seconds; decorative motion is off unless explicitly active. */
    period?: number;
    active?: boolean;
    colors?: readonly [ColorReference, ColorReference, ColorReference];
}>;
export declare function resolveEffectSurface(descriptor?: EffectSurfaceDescriptor): {
    layers: readonly EffectLayer[];
    intensity: number;
    period: number;
    active: boolean;
    colors: readonly [ColorReference, ColorReference, ColorReference];
    points: {
        x: number;
        y: number;
        radius: number;
    }[];
    anchors: {
        x: number;
        y: number;
        radius: number;
    }[];
};
//# sourceMappingURL=effect-surface.d.ts.map