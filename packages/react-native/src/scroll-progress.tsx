import { resolveScrollProgress, type ScrollMetrics } from '@hjmds/design-contracts/scroll-progress';
import { Progress, type ProgressProps } from './feedback.js';
export type ScrollProgressProps = Omit<ProgressProps,'value'|'max'> & Readonly<{label:string;metrics:ScrollMetrics}>;
/** Host supplies logical metrics from its ScrollView; no competing gesture responder. */
export function ScrollProgress({metrics,...props}:ScrollProgressProps){return <Progress {...props} value={resolveScrollProgress(metrics)} max={1}/>;}
