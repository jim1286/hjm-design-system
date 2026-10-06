import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useId, useRef, useState } from "react";
import { resolveEffectSurface } from "@hjmds/design-contracts/effect-surface";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { useHjmTheme } from "./provider.js";
/** Decorative layers never receive pointer events or own the content's name. */
export function EffectSurface({ descriptor = {}, children, className, layoutStyle }) {
    const { palette, environment } = useHjmTheme();
    const effect = resolveEffectSurface(descriptor);
    const id = useId().replace(/:/g, "");
    const host = useRef(null);
    const layer = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        if (!host.current)
            return;
        if (typeof IntersectionObserver === "undefined") {
            setVisible(true);
            return;
        }
        const observer = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? false));
        observer.observe(host.current);
        return () => observer.disconnect();
    }, []);
    useEffect(() => {
        const node = layer.current;
        if (!node || !effect.active || environment.reducedMotion || !visible || typeof node.animate !== "function")
            return;
        // WAAPI stays outside React renders; visibility changes cancel the loop and
        // expose its static composition rather than scheduling invisible frames.
        let animation;
        let failed = false;
        const sync = () => {
            animation?.cancel();
            if (document.hidden || failed)
                return;
            // A host may expose WAAPI but reject animation creation. Keep the static SVG
            // and content instead of propagating a decorative failure to the application.
            try {
                animation = node.animate([
                    { transform: "scale(1.08) translate(-1%, 0%)" },
                    { transform: "scale(1.12) translate(1%, 1%)" },
                    { transform: "scale(1.08) translate(-1%, 0%)" },
                ], { duration: effect.period * 1000, iterations: Infinity, easing: "ease-in-out" });
            }
            catch {
                failed = true;
            }
        };
        sync();
        document.addEventListener("visibilitychange", sync);
        return () => { animation?.cancel(); document.removeEventListener("visibilitychange", sync); };
    }, [effect.active, effect.period, environment.reducedMotion, visible]);
    const colors = effect.colors.map(color => resolveColorReference(color, palette));
    return _jsxs("div", { ref: host, className: className, "data-hjm-effect-surface": "", style: { ...layoutStyle, position: "relative", isolation: "isolate", overflow: "hidden", background: palette.theme.bg }, children: [_jsxs("svg", { ref: layer, "aria-hidden": "true", focusable: "false", style: { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: effect.intensity }, children: [_jsx("defs", { children: effect.noise && _jsxs(_Fragment, { children: [_jsx("pattern", { id: `${id}-noise-tile`, width: effect.noise.size, height: effect.noise.size, x: effect.noise.offset, patternUnits: "userSpaceOnUse", children: _jsx("image", { href: effect.noise.uri, width: effect.noise.size, height: effect.noise.size }) }), _jsx("mask", { id: `${id}-noise-mask`, x: 0, y: 0, width: "100%", height: "100%", maskUnits: "userSpaceOnUse", children: _jsx("rect", { width: "100%", height: "100%", fill: `url(#${id}-noise-tile)` }) })] }) }), effect.noise && _jsx("rect", { width: "100%", height: "100%", fill: palette.theme.text, mask: `url(#${id}-noise-mask)` }), _jsxs("svg", { width: "100%", height: "100%", viewBox: "0 0 100 100", preserveAspectRatio: "none", children: [_jsxs("defs", { children: [colors.map((color, index) => _jsxs("radialGradient", { id: `${id}-${index}`, children: [_jsx("stop", { offset: "0%", stopColor: color }), _jsx("stop", { offset: "100%", stopColor: color, stopOpacity: 0 })] }, index)), _jsx("pattern", { id: `${id}-grain`, width: 4, height: 4, patternUnits: "userSpaceOnUse", children: effect.points.map((point, index) => _jsx("circle", { cx: point.x / 25, cy: point.y / 25, r: point.radius / 10, fill: palette.theme.text, opacity: 0.28 }, index)) })] }), effect.layers.includes("mesh") && effect.anchors.map((anchor, index) => _jsx("ellipse", { cx: anchor.x, cy: anchor.y, rx: 65, ry: 70, fill: `url(#${id}-${index})` }, index)), effect.layers.includes("glow") && _jsx("ellipse", { cx: 50, cy: 10, rx: 70, ry: 95, fill: `url(#${id}-0)` }), effect.layers.includes("grain") && _jsx("rect", { width: 100, height: 100, fill: `url(#${id}-grain)` })] })] }), _jsx("div", { style: { position: "relative" }, children: children })] });
}
//# sourceMappingURL=effect-surface.js.map