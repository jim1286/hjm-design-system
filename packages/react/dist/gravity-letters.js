import { jsx as _jsx } from "react/jsx-runtime";
import { useLayoutEffect, useRef } from "react";
import { gravityLetterMotion, resolveGravityLetters } from "@hjmds/design-contracts/gravity-letters";
import { useHjmTheme } from "./provider.js";
/** Decorative only: provide the meaningful heading outside this hidden presentation. */
export function GravityLetters({ glyphs, active = false, replayKey = 0, layoutStyle }) {
    const { environment } = useHjmTheme();
    const root = useRef(null);
    const signature = JSON.stringify(glyphs);
    const units = resolveGravityLetters(glyphs);
    useLayoutEffect(() => {
        if (!active || environment.reducedMotion || document.hidden)
            return;
        const recipe = resolveGravityLetters(JSON.parse(signature));
        const animations = [...root.current.children].map((node, index) => node.animate(gravityLetterMotion.input.map((offset, step) => ({ offset, transform: `translateY(${gravityLetterMotion.y[step]}px) rotate(${step === 0 ? recipe[index].rotation : 0}deg)` })), { duration: gravityLetterMotion.duration, delay: recipe[index].delay, fill: "backwards", easing: "ease-out" }));
        const stop = () => animations.forEach(animation => animation.cancel());
        const visibility = () => { if (document.hidden)
            stop(); };
        document.addEventListener("visibilitychange", visibility);
        return () => { stop(); document.removeEventListener("visibilitychange", visibility); };
    }, [signature, active, replayKey, environment.reducedMotion]);
    return _jsx("span", { ref: root, "aria-hidden": "true", style: { display: "flex", flexWrap: "wrap", pointerEvents: "none", paddingTop: 36, ...layoutStyle }, children: units.map((unit, index) => _jsx("span", { style: { display: "inline-block", whiteSpace: "pre" }, children: unit.glyph }, index)) });
}
//# sourceMappingURL=gravity-letters.js.map