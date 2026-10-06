import { jsx as _jsx } from "react/jsx-runtime";
import { resolveContentTransition } from "@hjmds/design-contracts/content-transition";
import { motion } from "framer-motion";
import { useCallback, useRef, useLayoutEffect } from "react";
import { easing, motion as timing } from "@hjmds/design-contracts/foundations";
import { useHjmTheme } from "./provider.js";
/** Motion Primitives' keyed transition pattern, adapted to HJM's single active subtree.
 * No exiting interactive copy: it would duplicate fields and focus targets. See THIRD_PARTY_NOTICES. */
export function ContentTransition({ stateKey, children, motion: preference = "system", preset = "fade", focusTarget, animateHeight = false }) {
    const { environment } = useHjmTheme();
    const from = resolveContentTransition(preset, environment.direction);
    const enabled = preference !== "none" && !environment.reducedMotion;
    const frame = useRef(null);
    const measure = useRef(null);
    useLayoutEffect(() => {
        const outer = frame.current;
        const inner = measure.current;
        if (!outer || !inner || !animateHeight || !enabled || typeof ResizeObserver === "undefined")
            return;
        let previous = inner.getBoundingClientRect().height;
        let animation;
        const settle = () => { animation?.cancel(); animation = undefined; outer.style.height = ""; outer.style.overflow = ""; previous = inner.getBoundingClientRect().height; };
        const observer = new ResizeObserver(() => {
            const next = inner.getBoundingClientRect().height;
            if (Math.abs(next - previous) < 0.5)
                return;
            const fromHeight = animation ? outer.getBoundingClientRect().height : previous;
            animation?.cancel();
            previous = next;
            if (document.hidden || typeof outer.animate !== "function") {
                settle();
                return;
            }
            // Measure the unconfined inner flow; transform/layout projection would scale
            // text or duplicate input subtrees. WAAPI affects only the surrounding height.
            outer.style.height = `${next}px`;
            outer.style.overflow = "hidden";
            try {
                const current = outer.animate([{ height: `${fromHeight}px` }, { height: `${next}px` }], { duration: timing.normal, easing: `cubic-bezier(${easing.enter.join(",")})` });
                animation = current;
                current.onfinish = () => { if (animation === current)
                    settle(); };
            }
            catch {
                settle();
            }
        });
        observer.observe(inner);
        const visibility = () => { if (document.hidden)
            settle(); };
        document.addEventListener("visibilitychange", visibility);
        return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visibility); settle(); };
    }, [animateHeight, enabled]);
    const first = useRef(true);
    const host = useRef(null);
    const restore = useRef(false);
    const capturePanel = useCallback((node) => {
        // The keyed node detaches before DOM removal. Parent effect cleanup runs too
        // late: the browser has already moved focus to body by then.
        if (!node)
            restore.current = Boolean(host.current?.contains(document.activeElement));
        host.current = node;
    }, []);
    useLayoutEffect(() => {
        if (restore.current)
            focusTarget?.current?.focus();
        restore.current = false;
        first.current = false;
    }, [stateKey, focusTarget]);
    return _jsx("div", { ref: frame, children: _jsx("div", { ref: measure, style: { display: "flow-root" }, children: _jsx(motion.div, { ref: capturePanel, initial: enabled && !first.current ? { opacity: from.opacity, x: from.translateX, y: from.translateY, scale: from.scale } : false, animate: { opacity: 1, x: 0, y: 0, scale: 1 }, transition: { duration: enabled ? timing.normal / 1000 : 0, ease: [...easing.enter] }, children: children }, stateKey) }) });
}
/** Whole-text fade preserves graphemes, text wrapping, selection and a single spoken value. */
export function TextTransition({ text, motion: preference, preset }) {
    return _jsx(ContentTransition, { stateKey: text, ...(preset ? { preset } : {}), ...(preference ? { motion: preference } : {}), children: text });
}
//# sourceMappingURL=content-transition.js.map