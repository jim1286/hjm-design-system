import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { Animated, AppState } from "react-native";
import Svg, { Path } from "react-native-svg";
import { mediaTransportPaths, resolveMediaPlayback } from "@hjmds/design-contracts/media-transport";
import { motion } from "@hjmds/design-contracts/foundations";
import { IconButton } from "./actions.js";
import { Slider } from "./slider.js";
import { Stack, Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
function MediaGlyph({ playing, active }) {
    const first = useRef(null), second = useRef(null);
    const [value] = useState(() => new Animated.Value(playing ? 1 : 0)), current = useRef(playing ? 1 : 0);
    const theme = useHjmNativeTheme(), reduced = theme.environment.reducedMotion;
    useEffect(() => {
        const target = playing ? 1 : 0;
        const draw = (n) => { current.current = n; const paths = mediaTransportPaths(n); first.current?.setNativeProps?.({ d: paths[0] }); second.current?.setNativeProps?.({ d: paths[1] }); };
        const listener = value.addListener(({ value: n }) => draw(n));
        const settle = () => { value.stopAnimation(); value.setValue(target); draw(target); };
        // d is a path, so useNativeDriver cannot animate it. Update SVG hosts without React renders.
        if (reduced || !active || AppState.currentState !== "active")
            settle();
        else
            Animated.timing(value, { toValue: target, duration: motion.normal, useNativeDriver: false }).start();
        const app = AppState.addEventListener("change", state => { if (state !== "active")
            settle(); });
        return () => { value.stopAnimation(); value.removeListener(listener); app.remove(); };
    }, [playing, active, reduced, value]);
    const paths = mediaTransportPaths(current.current);
    return _jsxs(Svg, { width: 24, height: 24, viewBox: "0 0 24 24", accessible: false, children: [_jsx(Path, { ref: first, d: paths[0], fill: theme.colors.contentBrand }), _jsx(Path, { ref: second, d: paths[1], fill: theme.colors.contentBrand })] });
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
    return _jsxs(Stack, { gap: "md", children: [_jsxs(Stack, { axis: "inline", gap: "sm", align: "center", children: [_jsx(IconButton, { label: state.playing ? props.labels.pause : props.labels.play, tone: "ghost", selected: state.playing, loading: action.pending || (state.buffering === true && !state.playing), disabled: props.disabled === true || !active, onPress: toggle, children: _jsx(MediaGlyph, { playing: state.playing, active: active }) }), _jsxs(Text, { variant: "caption", children: [props.formatTime(state.position), " / ", state.duration === null ? props.labels.unknownDuration : props.formatTime(state.duration)] })] }), state.seekable ? _jsx(Slider, { label: props.labels.seek, min: 0, max: state.duration, step: .1, value: Math.min(state.duration, draft ?? state.position), disabled: locked, onValueChange: seconds => { if (!locked)
                    setDraft(seconds); }, onValueChangeEnd: seek, getValueText: props.formatTime, decrementLabel: props.labels.decrement, incrementLabel: props.labels.increment }) : null, action.failed ? _jsx(Text, { accessibilityRole: "alert", accessibilityLiveRegion: "assertive", tone: "danger", align: "center", children: props.labels.error }) : null] });
}
//# sourceMappingURL=media-transport.js.map