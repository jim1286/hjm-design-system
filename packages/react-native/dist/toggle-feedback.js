import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { Animated, AppState, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { resolveToggleFeedbackProposal, resolveToggleFeedbackFrame, toggleFeedbackPaths, toggleFeedbackRecipe } from "@hjmds/design-contracts/toggle-feedback";
import { Button } from "./actions.js";
import { AnimatedStatistic } from "./statistic-motion.js";
import { Stack, Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
function FeedbackGlyph({ effect, selected, active, icon }) {
    const glyph = useRef(null), circle = useRef(null), rays = useRef(null), previous = useRef(selected);
    const [value] = useState(() => new Animated.Value(1));
    const theme = useHjmNativeTheme(), reduced = theme.environment.reducedMotion;
    useEffect(() => {
        const entering = selected && !previous.current;
        previous.current = selected;
        const draw = (p) => { const f = resolveToggleFeedbackFrame(effect, p); glyph.current?.setNativeProps?.({ style: { transform: [{ translateY: f.translateY }, { scale: f.scale }] } }); circle.current?.setNativeProps?.({ r: f.radius, opacity: effect === "ripple" ? f.opacity : 0 }); rays.current?.setNativeProps?.({ d: f.rays, opacity: effect === "burst" ? f.opacity : 0 }); };
        const listener = value.addListener(({ value: p }) => draw(p));
        const settle = () => { value.stopAnimation(); value.setValue(1); draw(1); };
        // SVG geometry cannot use the native driver. Only host props change on each frame.
        if (!entering || reduced || !active || AppState.currentState !== "active")
            settle();
        else {
            value.setValue(0);
            Animated.timing(value, { toValue: 1, duration: toggleFeedbackRecipe.duration, useNativeDriver: false }).start();
        }
        const app = AppState.addEventListener("change", state => { if (state !== "active")
            settle(); });
        return () => { value.stopAnimation(); value.removeListener(listener); app.remove(); };
    }, [selected, effect, active, reduced, value]);
    const f = resolveToggleFeedbackFrame(effect, 1);
    return _jsxs(View, { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { position: "relative", width: toggleFeedbackRecipe.glyphSize, height: toggleFeedbackRecipe.glyphSize }, children: [_jsx(View, { ref: glyph, children: icon ?? _jsx(Svg, { width: 24, height: 24, viewBox: "0 0 24 24", children: _jsx(Path, { d: toggleFeedbackPaths[effect], fill: selected ? theme.colors.contentBrand : "none", stroke: theme.colors.contentBrand, strokeWidth: 1.7, strokeLinejoin: "round" }) }) }), _jsxs(Svg, { pointerEvents: "none", width: 40, height: 40, viewBox: "0 0 40 40", style: { position: "absolute", left: -8, top: -8 }, fill: "none", stroke: theme.colors.contentBrand, strokeWidth: 1.7, children: [_jsx(Circle, { ref: circle, cx: 20, cy: 20, r: f.radius, opacity: 0 }), _jsx(Path, { ref: rays, d: f.rays, opacity: 0, strokeLinecap: "round" })] })] });
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
    return _jsxs(Stack, { gap: "sm", children: [_jsxs(Stack, { axis: "inline", gap: "md", align: "center", wrap: true, children: [_jsx(Button, { tone: "secondary", selected: state.selected, loading: action.pending, loadingLabel: props.labels.pending, disabled: props.disabled === true || !active, leading: _jsx(FeedbackGlyph, { effect: props.effect, selected: state.selected, active: active, ...(icon === undefined ? {} : { icon }) }), onPress: () => { const proposal = resolveToggleFeedbackProposal(props.state, !props.state.selected); void action.run(proposal, () => props.onSelectedChange(proposal.selected)); }, children: state.selected ? props.labels.selected : props.labels.select }), _jsx(AnimatedStatistic, { density: "compact", descriptor: { id: "selection-count", label: props.labels.count }, value: state.count, locale: props.locale, animated: active })] }), action.failed ? _jsx(Text, { accessibilityRole: "alert", accessibilityLiveRegion: "assertive", tone: "danger", align: "center", children: props.labels.error }) : null] });
}
//# sourceMappingURL=toggle-feedback.js.map