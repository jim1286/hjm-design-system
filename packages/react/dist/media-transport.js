"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { mediaTransportGlyphOpacity, resolveMediaPlayback } from "@hjmds/design-contracts/media-transport";
import { Pause, Play } from "lucide";
import { renderLucideNodes } from "./semantic-lucide.js";
import { motion } from "@hjmds/design-contracts/foundations";
import { IconButton } from "./actions.js";
import { Slider } from "./slider.js";
import { Stack, Text } from "./layout.js";
import { useHjmTheme } from "./provider.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
function MediaGlyph({ playing, active }) {
    const play = useRef(null), pause = useRef(null), current = useRef(playing ? 1 : 0);
    const reduced = useHjmTheme().environment.reducedMotion;
    useEffect(() => {
        const target = playing ? 1 : 0, initial = current.current;
        let frame = 0, start;
        const draw = (value) => { current.current = value; const weight = mediaTransportGlyphOpacity(value); play.current?.setAttribute("opacity", String(weight.play)); pause.current?.setAttribute("opacity", String(weight.pause)); };
        const settle = () => { cancelAnimationFrame(frame); draw(target); };
        const visibility = () => { if (document.hidden)
            settle(); };
        const animate = (now) => { start ??= now; const p = Math.min(1, (now - start) / motion.normal); draw(initial + (target - initial) * (1 - (1 - p) ** 3)); if (p < 1)
            frame = requestAnimationFrame(animate); };
        // Lucide play/pause cross-fade (user instruction 2026-11-05: Lucide only). Opacity updates go directly to SVG: no per-frame React render and no background loop.
        if (reduced || !active || document.hidden || initial === target)
            settle();
        else
            frame = requestAnimationFrame(animate);
        document.addEventListener("visibilitychange", visibility);
        return () => { cancelAnimationFrame(frame); document.removeEventListener("visibilitychange", visibility); };
    }, [playing, active, reduced]);
    const weight = mediaTransportGlyphOpacity(current.current);
    return _jsxs("svg", { width: 24, height: 24, viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("g", { ref: play, opacity: weight.play, children: renderLucideNodes(Play) }), _jsx("g", { ref: pause, opacity: weight.pause, children: renderLucideNodes(Pause) })] });
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