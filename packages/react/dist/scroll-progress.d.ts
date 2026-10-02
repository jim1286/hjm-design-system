import { type ScrollMetrics } from '@hjmds/design-contracts/scroll-progress';
import { type ProgressProps } from './feedback.js';
export type ScrollProgressProps = Omit<ProgressProps, 'value' | 'max'> & Readonly<{
    metrics: ScrollMetrics;
}>;
/** Existing Progress owns its accessible name, range and visual presentation. */
export declare function ScrollProgress({ metrics, ...props }: ScrollProgressProps): import("react").JSX.Element;
/** Pass an actual vertical scroll host; never implicitly attach to window. */
export declare function useScrollMetrics(host: HTMLElement | null): ScrollMetrics;
//# sourceMappingURL=scroll-progress.d.ts.map