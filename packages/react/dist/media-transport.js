"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { mediaTransportPaths, resolveMediaPlayback } from "@hjmds/design-contracts/media-transport";
import { motion } from "@hjmds/design-contracts/foundations";
import { IconButton } from "./actions.js";
import { Slider } from "./slider.js";
import { Stack, Text } from "./layout.js";
import { useHjmTheme } from "./provider.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
function MediaGlyph({ playing, active }) {
    const first = useRef(null), second = useRef(null), current = useRef(playing ? 1 : 0);
    const reduced = useHjmTheme().environment.reducedMotion;
    useEffect(() => {
        const target = playing ? 1 : 0, initial = current.current;
        let frame = 0, start;
        const draw = (value) => { current.current = value; const paths = mediaTransportPaths(value); first.current?.setAttribute("d", paths[0]); second.current?.setAttribute("d", paths[1]); };
        const settle = () => { cancelAnimationFrame(frame); draw(target); };
        const visibility = () => { if (document.hidden)
            settle(); };
        const animate = (now) => { start ??= now; const p = Math.min(1, (now - start) / motion.normal); draw(initial + (target - initial) * (1 - (1 - p) ** 3)); if (p < 1)
            frame = requestAnimationFrame(animate); };
        // Geometry updates go directly to SVG: no per-frame React render and no background loop.
        if (reduced || !active || document.hidden || initial === target)
            settle();
        else
            frame = requestAnimationFrame(animate);
        document.addEventListener("visibilitychange", visibility);
        return () => { cancelAnimationFrame(frame); document.removeEventListener("visibilitychange", visibility); };
    }, [playing, active, reduced]);
    const paths = mediaTransportPaths(current.current);
    return _jsxs("svg", { width: 24, height: 24, viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", fill: "currentColor", children: [_jsx("path", { ref: first, d: paths[0] }), _jsx("path", { ref: second, d: paths[1] })] });
}
export function MediaTransport(props) {
    const state = resolveMediaPlayback(props.state), active = props.active !== false;
    const action = useCompositionAction(props.disabled === true || !active), [draft, setDraft] = useState(null);
    const locked = props.disabled === true || !active || action.pending;
    useEffect(() => { if (!active)
        setDraft(null); }, [active]);
    const toggle = () => { void action.run(state.playing ? "pause" : "play", state.playing ? props.onPause : props.onPlay); };
    const seek = (seconds) => {
        if (locked || !state.seekable)
            return;
        void action.run("seek", () => props.onSeek(Math.min(state.duration, Math.max(0, seconds)))).then(result => { if (result.status === "success" || result.status === "error")
            setDraft(null); });
    };
    return _jsxs(Stack, { gap: "md", children: [_jsxs(Stack, { axis: "inline", gap: "sm", align: "center", children: [_jsx(IconButton, { label: state.playing ? props.labels.pause : props.labels.play, tone: "ghost", selected: state.playing, loading: action.pending || (state.buffering === true && !state.playing), disabled: props.disabled === true || !active, onClick: toggle, children: _jsx(MediaGlyph, { playing: state.playing, active: active }) }), _jsxs(Text, { variant: "caption", children: [props.formatTime(state.position), " / ", state.duration === null ? props.labels.unknownDuration : props.formatTime(state.duration)] })] }), state.seekable ? _jsx(Slider, { label: props.labels.seek, min: 0, max: state.duration, step: .1, value: Math.min(state.duration, draft ?? state.position), disabled: locked, onValueChange: seconds => { if (!locked)
                    setDraft(seconds); }, onValueChangeEnd: seek, getValueText: props.formatTime }) : null, action.failed ? _jsx(Text, { role: "alert", tone: "danger", style: { textAlign: "center" }, children: props.labels.error }) : null] });
}
//# sourceMappingURL=media-transport.js.map