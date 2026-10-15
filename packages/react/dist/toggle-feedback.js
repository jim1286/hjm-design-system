"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { resolveToggleFeedbackProposal, resolveToggleFeedbackFrame, toggleFeedbackPaths, toggleFeedbackRecipe } from "@hjmds/design-contracts/toggle-feedback";
import { Button } from "./actions.js";
import { AnimatedStatistic } from "./statistic-motion.js";
import { Stack, Text } from "./layout.js";
import { useHjmTheme } from "./provider.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
function FeedbackGlyph({ effect, selected, active, icon }) {
    const glyph = useRef(null), circle = useRef(null), rays = useRef(null), previous = useRef(selected);
    const reduced = useHjmTheme().environment.reducedMotion;
    useEffect(() => {
        const entering = selected && !previous.current;
        previous.current = selected;
        let frame = 0, start;
        const draw = (p) => { const f = resolveToggleFeedbackFrame(effect, p); glyph.current?.style.setProperty("transform", `translateY(${f.translateY}px) scale(${f.scale})`); circle.current?.setAttribute("r", String(f.radius)); circle.current?.setAttribute("opacity", effect === "ripple" ? String(f.opacity) : "0"); rays.current?.setAttribute("d", f.rays); rays.current?.setAttribute("opacity", effect === "burst" ? String(f.opacity) : "0"); };
        const settle = () => { cancelAnimationFrame(frame); draw(1); };
        const animate = (now) => { start ??= now; const p = Math.min(1, (now - start) / toggleFeedbackRecipe.duration); draw(p); if (p < 1)
            frame = requestAnimationFrame(animate); };
        // The old selected state consumes the event; environment changes never replay it.
        if (!entering || reduced || !active || document.hidden)
            settle();
        else {
            draw(0);
            frame = requestAnimationFrame(animate);
        }
        const visibility = () => { if (document.hidden)
            settle(); };
        document.addEventListener("visibilitychange", visibility);
        return () => { cancelAnimationFrame(frame); document.removeEventListener("visibilitychange", visibility); };
    }, [selected, effect, active, reduced]);
    const f = resolveToggleFeedbackFrame(effect, 1);
    return _jsxs("span", { "aria-hidden": "true", style: { position: "relative", display: "inline-flex", width: toggleFeedbackRecipe.glyphSize, height: toggleFeedbackRecipe.glyphSize }, children: [_jsx("span", { ref: glyph, style: { display: "inline-flex" }, children: icon ?? _jsx("svg", { width: 24, height: 24, viewBox: "0 0 24 24", focusable: "false", children: _jsx("path", { d: toggleFeedbackPaths[effect], fill: selected ? "currentColor" : "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinejoin: "round" }) }) }), _jsxs("svg", { "data-toggle-effect": effect, width: 40, height: 40, viewBox: "0 0 40 40", focusable: "false", style: { position: "absolute", left: -8, top: -8, pointerEvents: "none" }, fill: "none", stroke: "currentColor", strokeWidth: 1.7, children: [_jsx("circle", { ref: circle, cx: 20, cy: 20, r: f.radius, opacity: 0 }), _jsx("path", { ref: rays, d: f.rays, opacity: 0, strokeLinecap: "round" })] })] });
}
export function ToggleFeedbackButton(props) {
    if (!props.entityId.trim())
        throw new TypeError("Toggle feedback requires a stable entity id");
    return _jsx(ToggleFeedbackBody, { ...props }, props.entityId);
}
function ToggleFeedbackBody(props) {
    resolveToggleFeedbackProposal(props.state, props.state.selected);
    const active = props.active !== false, action = useCompositionAction(props.disabled === true || !active), state = action.active ?? props.state;
    const icon = props.renderIcon ? props.renderIcon({ selected: state.selected, pending: action.pending }) : props.icon;
    return _jsxs(Stack, { gap: "sm", children: [_jsxs(Stack, { axis: "inline", gap: "md", align: "center", wrap: true, children: [_jsx(Button, { tone: "secondary", selected: state.selected, loading: action.pending, disabled: props.disabled === true || !active, "aria-label": action.pending ? props.labels.pending : undefined, leading: _jsx(FeedbackGlyph, { effect: props.effect, selected: state.selected, active: active, ...(icon === undefined ? {} : { icon }) }), onClick: () => { const proposal = resolveToggleFeedbackProposal(props.state, !props.state.selected); void action.run(proposal, () => props.onSelectedChange(proposal.selected)); }, children: state.selected ? props.labels.selected : props.labels.select }), _jsx(AnimatedStatistic, { density: "compact", descriptor: { id: "selection-count", label: props.labels.count }, value: state.count, locale: props.locale, animated: active })] }), action.failed ? _jsx(Text, { role: "alert", tone: "danger", style: { textAlign: "center" }, children: props.labels.error }) : null] });
}
//# sourceMappingURL=toggle-feedback.js.map