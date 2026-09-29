import { jsx as _jsx } from "react/jsx-runtime";
import NumberFlow from "@number-flow/react";
import { Statistic } from "./advanced-display.js";
import { useHjmTheme } from "./provider.js";
/** NumberFlow stays outside the base Statistic graph and its accessible text. */
export function AnimatedStatistic({ descriptor, value, locale, format, animated = true, ...props }) {
    const theme = useHjmTheme();
    if (!Number.isFinite(value))
        throw new TypeError("AnimatedStatistic value must be finite");
    const formatter = new Intl.NumberFormat(locale, format);
    const text = formatter.format(value);
    // Upstream cannot animate non-Latin digits, RTL or exponent notation reliably.
    // Preserve Intl output instead of transliterating the user's number format.
    const canAnimate = animated && !theme.environment.reducedMotion &&
        theme.environment.direction !== "rtl" && formatter.resolvedOptions().numberingSystem === "latn" &&
        !/^(ar|fa|he|ur)(-|$)/i.test(locale) &&
        !["scientific", "engineering"].includes(format?.notation ?? "standard");
    const animatedFormat = { ...format, notation: format?.notation === "compact" ? "compact" : "standard" };
    return _jsx(Statistic, { ...props, descriptor: { ...descriptor, value: text }, renderValue: () => canAnimate
            ? _jsx(NumberFlow, { value: value, locales: locale, format: animatedFormat, respectMotionPreference: true })
            : text });
}
//# sourceMappingURL=statistic-motion.js.map