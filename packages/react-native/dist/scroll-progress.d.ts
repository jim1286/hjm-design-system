import { type ScrollMetrics } from '@hjmds/design-contracts/scroll-progress';
import { type ProgressProps } from './feedback.js';
export type ScrollProgressProps = Omit<ProgressProps, 'value' | 'max'> & Readonly<{
    label: string;
    metrics: ScrollMetrics;
}>;
/** Host supplies logical metrics from its ScrollView; no competing gesture responder. */
export declare function ScrollProgress({ metrics, ...props }: ScrollProgressProps): import("react").JSX.Element;
//# sourceMappingURL=scroll-progress.d.ts.map