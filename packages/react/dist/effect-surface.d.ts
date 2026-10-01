import { type ReactNode } from "react";
import { type EffectSurfaceDescriptor } from "@hjmds/design-contracts/effect-surface";
export type EffectSurfaceProps = Readonly<{
    descriptor?: EffectSurfaceDescriptor;
    children: ReactNode;
    className?: string;
}>;
/** Decorative layers never receive pointer events or own the content's name. */
export declare function EffectSurface({ descriptor, children, className }: EffectSurfaceProps): import("react").JSX.Element;
//# sourceMappingURL=effect-surface.d.ts.map