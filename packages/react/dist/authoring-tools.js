"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { validateBezier, resolveShortcutCapture } from "@hjmds/design-contracts/authoring-tools";
import { Button } from "./actions.js";
import { Slider } from "./slider.js";
import { Stack, Text } from "./layout.js";
import { useHjmTheme } from "./provider.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
export function BezierEditor(props) {
    validateBezier(props.value);
    const range = props.yRange ?? [-2, 2], duration = props.duration ?? 1000;
    if (!Number.isFinite(duration) || duration <= 0 || !range.every(Number.isFinite) || range[0] >= range[1] || props.value[1] < range[0] || props.value[1] > range[1] || props.value[3] < range[0] || props.value[3] > range[1])
        throw new RangeError("Invalid Bezier preview duration or y range");
    const theme = useHjmTheme(), ball = useRef(null), animation = useRef(null);
    const cancel = () => { animation.current?.cancel(); animation.current = null; };
    useEffect(() => { cancel(); return cancel; }, [...props.value, duration, props.active, props.disabled, theme.environment.reducedMotion]);
    useEffect(() => { const stop = () => { if (document.hidden)
        cancel(); }; document.addEventListener("visibilitychange", stop); return () => document.removeEventListener("visibilitychange", stop); }, []);
    const preview = () => { cancel(); if (props.disabled || theme.environment.reducedMotion || props.active === false || document.hidden)
        return; animation.current = ball.current?.animate([{ transform: "translateX(0)" }, { transform: "translateX(120px)" }], { duration, easing: `cubic-bezier(${props.value.join(",")})`, fill: "forwards" }) ?? null; };
    const [x1, y1, x2, y2] = props.value;
    // Fit the selected controls and both endpoints; the allowed edit range would shrink the default curve.
    const curveMin = Math.min(0, 1, y1, y2), curveMax = Math.max(0, 1, y1, y2);
    return _jsxs(Stack, { gap: "md", children: [_jsxs("svg", { role: "img", "aria-label": props.labels.curve, width: "100%", height: 180, viewBox: `-10 ${100 - curveMax * 100 - 10} 120 ${(curveMax - curveMin) * 100 + 20}`, children: [_jsx("path", { d: "M0 100 L100 0", fill: "none", stroke: "currentColor", opacity: .2 }), _jsx("path", { d: `M0 100 L${x1 * 100} ${100 - y1 * 100} M100 0 L${x2 * 100} ${100 - y2 * 100}`, fill: "none", stroke: "currentColor", opacity: .5 }), _jsx("path", { d: `M0 100 C${x1 * 100} ${100 - y1 * 100} ${x2 * 100} ${100 - y2 * 100} 100 0`, fill: "none", stroke: "var(--hjm-color-content-brand, currentColor)", strokeWidth: 2 }), _jsx("circle", { cx: x1 * 100, cy: 100 - y1 * 100, r: 3, fill: "currentColor" }), _jsx("circle", { cx: x2 * 100, cy: 100 - y2 * 100, r: 3, fill: "currentColor" })] }), props.value.map((value, index) => _jsx(Slider, { label: props.labels.coordinates[index], min: index % 2 === 0 ? 0 : range[0], max: index % 2 === 0 ? 1 : range[1], step: .01, value: value, disabled: props.disabled === true, getValueText: props.formatCoordinate, onValueChange: next => { const values = [...props.value]; values[index] = next; props.onValueChange(values); } }, index)), _jsx("div", { "aria-hidden": "true", style: { height: 24, paddingInline: 4, overflow: "hidden" }, children: _jsx("div", { ref: ball, style: { width: 20, height: 20, borderRadius: "50%", background: "currentColor" } }) }), _jsx(Button, { disabled: props.disabled || props.active === false, onClick: preview, children: props.labels.preview })] });
}
export function ShortcutRecorder(props) {
    const [recording, setRecording] = useState(false), [draft, setDraft] = useState(null), [status, setStatus] = useState("ignored");
    const action = useCompositionAction(props.disabled), area = useRef(null);
    useEffect(() => { if (recording)
        area.current?.focus(); }, [recording]);
    useEffect(() => { if (props.disabled) {
        setRecording(false);
        setDraft(null);
    } }, [props.disabled]);
    const capture = (event) => {
        if (!recording || props.disabled || action.pending)
            return;
        // Tab keeps standard focus movement; the recorder stops when focus leaves.
        if (event.code === "Tab")
            return;
        event.preventDefault();
        event.stopPropagation();
        const result = resolveShortcutCapture({ code: event.code, ctrlKey: event.ctrlKey, altKey: event.altKey, shiftKey: event.shiftKey, metaKey: event.metaKey, repeat: event.repeat, isComposing: event.nativeEvent.isComposing, altGraph: event.getModifierState("AltGraph") }, { platform: props.platform, ...(props.conflicts ? { conflicts: props.conflicts } : {}), ...(props.reserved ? { reserved: props.reserved } : {}) });
        setStatus(result.status);
        if (result.status === "ready") {
            setDraft(result.shortcut);
            setRecording(false);
        }
        else if (result.status === "cancelled") {
            setRecording(false);
            setDraft(null);
        }
        else if (result.status !== "ignored")
            setDraft(null);
    };
    const register = () => { if (!draft)
        return; const current = resolveShortcutCapture({ code: draft.code, ctrlKey: draft.ctrl, altKey: draft.alt, shiftKey: draft.shift, metaKey: draft.meta }, { platform: props.platform, ...(props.conflicts ? { conflicts: props.conflicts } : {}), ...(props.reserved ? { reserved: props.reserved } : {}) }); setStatus(current.status); if (current.status !== "ready")
        return; void action.run("register", () => props.onRegister(current.shortcut)).then(result => { if (result.status === "success") {
        setDraft(null);
        setStatus(null);
    } }); };
    return _jsxs(Stack, { gap: "md", children: [_jsx("div", { ref: area, tabIndex: recording ? 0 : -1, role: "group", "aria-label": props.labels.recording, onKeyDown: capture, onBlur: () => setRecording(false), style: { minHeight: 44, display: "grid", placeItems: "center", outline: recording ? "2px solid currentColor" : undefined }, children: _jsx(Text, { children: recording ? props.labels.recording : draft ? props.formatShortcut(draft) : props.value ? props.formatShortcut(props.value) : props.labels.empty }) }), _jsxs(Stack, { axis: "inline", gap: "xs", children: [_jsx(Button, { disabled: props.disabled || action.pending, onClick: () => { setDraft(null); setStatus("ignored"); setRecording(true); }, children: props.labels.record }), draft ? _jsx(Button, { loading: action.pending, disabled: props.disabled === true, onClick: register, children: props.labels.register }) : null, recording || draft ? _jsx(Button, { disabled: action.pending, tone: "ghost", onClick: () => { setRecording(false); setDraft(null); setStatus("cancelled"); }, children: props.labels.cancel }) : null] }), status !== null ? _jsx(Text, { role: "status", children: props.labels.status(status) }) : null, action.failed ? _jsx(Text, { role: "alert", tone: "danger", style: { textAlign: "center" }, children: props.labels.error }) : null] });
}
//# sourceMappingURL=authoring-tools.js.map