import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLayoutEffect, useRef } from "react";
import { gridRevealTiles, gridRevealDuration } from "@hjmds/design-contracts/grid-reveal";
import { useHjmTheme } from "./provider.js";
/** Connect ready to Image.onLoadStatusChange; the image retains loading/error/accessibility. */
export function GridReveal({ ready, active = true, children }) {
    const { environment } = useHjmTheme();
    const overlay = useRef(null);
    useLayoutEffect(() => {
        if (!ready || !active || environment.reducedMotion || document.hidden)
            return;
        const animations = [...overlay.current.children].map((node, index) => node.animate([{ opacity: 1 }, { opacity: 0 }], { duration: gridRevealDuration, delay: gridRevealTiles[index].delay, fill: "backwards", easing: "ease-out" }));
        const stop = () => animations.forEach(animation => animation.cancel());
        const visibility = () => { if (document.hidden)
            stop(); };
        document.addEventListener("visibilitychange", visibility);
        return () => { stop(); document.removeEventListener("visibilitychange", visibility); };
    }, [ready, active, environment.reducedMotion]);
    return _jsxs("div", { style: { position: "relative" }, children: [children, _jsx("div", { ref: overlay, "aria-hidden": "true", style: { position: "absolute", inset: 0, pointerEvents: "none", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gridTemplateRows: "repeat(4, 1fr)" }, children: gridRevealTiles.map(tile => _jsx("span", { style: { opacity: 0, background: "var(--hjm-color-bg)" } }, tile.id)) })] });
}
//# sourceMappingURL=grid-reveal.js.map