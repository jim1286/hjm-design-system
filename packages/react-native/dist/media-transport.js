import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Animated, AppState, View } from "react-native";
import { resolveMediaPlayback } from "@hjmds/design-contracts/media-transport";
import Pause from "lucide-react-native/icons/pause";
import Play from "lucide-react-native/icons/play";
import { LucideGlyph } from "./internal/lucide-glyph.js";
import { motion } from "@hjmds/design-contracts/foundations";
import { IconButton } from "./actions.js";
import { Slider } from "./slider.js";
import { Stack, Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
function MediaGlyph({ playing, active }) {
    const [value] = useState(() => new Animated.Value(playing ? 1 : 0));
    const theme = useHjmNativeTheme(), reduced = theme.environment.reducedMotion;
    useEffect(() => {
        const target = playing ? 1 : 0;
        const settle = () => { value.stopAnimation(); value.setValue(target); };
        // Lucide play/pause cross-fade (user instruction 2026-11-05: Lucide only). Opacity runs on the native driver;
        // the weights match contracts `mediaTransportGlyphOpacity`.
        if (reduced || !active || AppState.currentState !== "active")
            settle();
        else
            Animated.timing(value, { toValue: target, duration: motion.normal, useNativeDriver: true }).start();
        const app = AppState.addEventListener("change", state => { if (state !== "active")
            settle(); });
        return () => { value.stopAnimation(); app.remove(); };
    }, [playing, active, reduced, value]);
    const layer = { position: "absolute", top: 0, left: 0 };
    return _jsxs(View, { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { width: 24, height: 24 }, children: [_jsx(Animated.View, { style: [layer, { opacity: value.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }], children: _jsx(LucideGlyph, { icon: Play, size: 24, color: theme.colors.contentBrand }) }), _jsx(Animated.View, { style: [layer, { opacity: value }], children: _jsx(LucideGlyph, { icon: Pause, size: 24, color: theme.colors.contentBrand }) })] });
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