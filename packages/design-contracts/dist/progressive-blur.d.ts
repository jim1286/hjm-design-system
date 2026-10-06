import { type ScrollMetrics } from './scroll-progress.js';
export type ProgressiveBlurDescriptor = Readonly<{
    edge: 'top' | 'bottom' | 'start' | 'end';
    /** Physical extent in logical pixels; choose after measuring the content host. */
    extent: number;
    /** Host-relative blur strength, not a cross-platform pixel-equivalence claim. */
    strength: number;
    layers?: number;
    content: {
        kind: 'decoration';
    } | {
        kind: 'scroll';
        metrics: ScrollMetrics;
        focused: boolean;
    };
}>;
export type ProgressiveBlurLayer = Readonly<{
    strength: number;
    start: number;
    end: number;
}>;
export declare function resolveProgressiveBlur(descriptor: ProgressiveBlurDescriptor, direction?: 'ltr' | 'rtl'): {
    side: "top" | "bottom" | "left" | "right";
    extent: number;
    visible: boolean;
    layers: Readonly<{
        strength: number;
        start: number;
        end: number;
    }>[];
};
//# sourceMappingURL=progressive-blur.d.ts.map