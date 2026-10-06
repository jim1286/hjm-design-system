import { type ReactNode } from 'react';
import { type ProgressiveBlurDescriptor, type ProgressiveBlurLayer } from '@hjmds/design-contracts/progressive-blur';
export type ProgressiveBlurHostLayer = ProgressiveBlurLayer & Readonly<{
    side: 'top' | 'bottom' | 'left' | 'right';
}>;
export type ProgressiveBlurProps = Readonly<{
    descriptor: ProgressiveBlurDescriptor;
    /** Product host supplies real backdrop blur and an alpha mask; no simulated tint fallback. */
    renderLayer: (layer: ProgressiveBlurHostLayer) => ReactNode;
}>;
/** Content stays a sibling so losing the optional native host cannot lose its state. */
export declare function ProgressiveBlur({ descriptor, renderLayer }: ProgressiveBlurProps): import("react").JSX.Element | null;
//# sourceMappingURL=progressive-blur.d.ts.map