"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useState } from "react";
import NumberFlow, {} from "@number-flow/react";
import { Statistic } from "./advanced-display.js";
import { useHjmTheme } from "./provider.js";
/** NumberFlow stays outside the base Statistic graph and its accessible text. */
export function AnimatedStatistic({ descriptor, value, locale, format, animated = true, ...props }) {
    const theme = useHjmTheme();
    const [visible, setVisible] = useState(true);
    const motionRef = useCallback((node) => {
        if (!(node instanceof HTMLElement))
            return;
        // NumberFlow skips new updates while hidden, but does not settle an already
        // running transition on visibility changes or disconnection. Finish rather
        // than cancel so its completion promises and latest digits settle together.
        const finish = () => node.shadowRoot?.getAnimations?.().forEach(animation => animation.finish());
        const visibility = () => { if (node.ownerDocument.visibilityState !== "visible")
            finish(); };
        const document = node.ownerDocument;
        document.addEventListener("visibilitychange", visibility);
        visibility();
        // NumberFlow checks display:none, but not viewport intersection. Keep its
        // host mounted so offscreen updates retain final values and can resume.
        const observer = typeof IntersectionObserver === "undefined" ? undefined : new IntersectionObserver(([entry]) => {
            const intersecting = entry?.isIntersecting ?? false;
            if (!intersecting)
                finish();
            setVisible(intersecting);
        });
        if (observer)
            observer.observe(node);
        else
            setVisible(false);
        return () => { observer?.disconnect(); document.removeEventListener("visibilitychange", visibility); finish(); };
    }, []);
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
            ? _jsx(NumberFlow, { ref: motionRef, animated: visible, value: value, locales: locale, format: animatedFormat, respectMotionPreference: true })
            : text });
}
//# sourceMappingURL=statistic-motion.js.map