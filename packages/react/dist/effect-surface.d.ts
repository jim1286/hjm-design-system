import { type ReactNode } from "react";
import { type EffectSurfaceDescriptor } from "@hjmds/design-contracts/effect-surface";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type EffectSurfaceProps = Readonly<{
    descriptor?: EffectSurfaceDescriptor;
    children: ReactNode;
    className?: string; /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Decorative layers never receive pointer events or own the content's name. */
export declare function EffectSurface({ descriptor, children, className, layoutStyle }: EffectSurfaceProps): import("react").JSX.Element;
//# sourceMappingURL=effect-surface.d.ts.map