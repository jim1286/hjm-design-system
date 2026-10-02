import { jsx as _jsx } from "react/jsx-runtime";
import { resolveContentTransition } from "@hjmds/design-contracts/content-transition";
import { motion } from "framer-motion";
import { useCallback, useRef, useLayoutEffect } from "react";
import { easing, motion as timing } from "@hjmds/design-contracts/foundations";
import { useHjmTheme } from "./provider.js";
/** Motion Primitives' keyed transition pattern, adapted to HJM's single active subtree.
 * No exiting interactive copy: it would duplicate fields and focus targets. See THIRD_PARTY_NOTICES. */
export function ContentTransition({ stateKey, children, motion: preference = "system", preset = "fade", focusTarget }) {
    const { environment } = useHjmTheme();
    const from = resolveContentTransition(preset, environment.direction);
    const enabled = preference !== "none" && !environment.reducedMotion;
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
    return _jsx("div", { children: _jsx(motion.div, { ref: capturePanel, initial: enabled && !first.current ? { opacity: from.opacity, x: from.translateX, y: from.translateY, scale: from.scale } : false, animate: { opacity: 1, x: 0, y: 0, scale: 1 }, transition: { duration: enabled ? timing.normal / 1000 : 0, ease: [...easing.enter] }, children: children }, stateKey) });
}
/** Whole-text fade preserves graphemes, text wrapping, selection and a single spoken value. */
export function TextTransition({ text, motion: preference, preset }) {
    return _jsx(ContentTransition, { stateKey: text, ...(preset ? { preset } : {}), ...(preference ? { motion: preference } : {}), children: text });
}
//# sourceMappingURL=content-transition.js.map