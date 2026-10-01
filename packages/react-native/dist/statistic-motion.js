import { jsx as _jsx } from "react/jsx-runtime";
import { Statistic } from './data-display.js';
import { ContentTransition } from './content-transition.js';
/** Native presents a short whole-statistic transition; Intl and Statistic own the final spoken value. */
export function AnimatedStatistic({ descriptor, value, locale, format, animated = true, ...props }) {
    if (!Number.isFinite(value))
        throw new TypeError('AnimatedStatistic value must be finite');
    const text = new Intl.NumberFormat(locale, format).format(value);
    // Reuse the existing reduced-motion/AppState-aware transition instead of introducing
    // a second number engine or announcing intermediate counts as real product data.
    return _jsx(ContentTransition, { stateKey: text, preset: "rise", motion: animated ? 'system' : 'none', children: _jsx(Statistic, { ...props, descriptor: { ...descriptor, value: text } }) });
}
//# sourceMappingURL=statistic-motion.js.map