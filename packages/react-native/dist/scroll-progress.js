import { jsx as _jsx } from "react/jsx-runtime";
import { resolveScrollProgress } from '@hjmds/design-contracts/scroll-progress';
import { Progress } from './feedback.js';
/** Host supplies logical metrics from its ScrollView; no competing gesture responder. */
export function ScrollProgress({ metrics, ...props }) { return _jsx(Progress, { ...props, value: resolveScrollProgress(metrics), max: 1 }); }
//# sourceMappingURL=scroll-progress.js.map