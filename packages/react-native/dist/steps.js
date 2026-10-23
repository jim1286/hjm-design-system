import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { resolveStepsDescriptor, stepsDefaults, stepsRecipe, validateStepsPresentation, } from "@hjmds/design-contracts/components/steps";
import { opacity as controlOpacity } from "@hjmds/design-contracts/foundations";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, View } from "react-native";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
function StepMark({ status, position, renderMark }) {
    const { colors, environment, palette } = useHjmNativeTheme();
    const [opacity] = useState(() => new Animated.Value(1));
    const previous = useRef(status);
    useEffect(() => {
        opacity.stopAnimation();
        if (previous.current !== status && !environment.reducedMotion) {
            opacity.setValue(0.5);
            Animated.timing(opacity, { toValue: 1, duration: stepsRecipe.transitionDuration, useNativeDriver: true }).start();
        }
        else
            opacity.setValue(1);
        previous.current = status;
        return () => opacity.stopAnimation();
    }, [status, environment.reducedMotion, opacity]);
    const { indicator } = stepsRecipe;
    const color = (reference) => resolveColorReference(reference, palette);
    const size = renderMark ? indicator.customSize : indicator.size;
    return _jsxs(Animated.View, { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { opacity, width: size, height: size, alignItems: "center", justifyContent: "center",
            borderRadius: size / 2, borderWidth: status === "error" ? indicator.activeBorderWidth : indicator.borderWidth,
            borderColor: color(indicator.border[status]), backgroundColor: renderMark || indicator.background[status] === null ? colors.bg : color(indicator.background[status]) }, children: [status === "current" ? _jsx(View, { pointerEvents: "none", style: { position: "absolute", top: -4, bottom: -4, left: -4, right: -4, borderWidth: 1, borderColor: colors.border, borderRadius: size } }) : null, renderMark?.(status, position) ?? _jsx(Text, { align: "center", emphasis: "medium", style: { color: renderMark ? colors.text : color(indicator.content[status]) }, variant: "label", children: status === "complete" ? "✓" : status === "error" ? "!" : position })] });
}
/** All presentations share one resolver: changing the layout never skips form validation. */
export function Steps({ descriptor, statusLabels, composeAccessibleName, presentation = stepsDefaults.presentation, overviewLabel, renderStepContent, renderMark, onStepPress, layoutStyle }) {
    const { colors, environment, palette, tokens } = useHjmNativeTheme();
    const steps = resolveStepsDescriptor(descriptor, { statusLabels, composeAccessibleName });
    validateStepsPresentation(presentation, overviewLabel);
    if (renderStepContent && presentation !== "vertical")
        throw new TypeError("Steps renderStepContent requires vertical presentation");
    const [expanded, setExpanded] = useState(false);
    const compact = presentation === "compact";
    const collapsed = compact && !expanded;
    const vertical = presentation === "vertical" || (compact && expanded);
    const current = steps.find(step => step.id === descriptor.currentStepId);
    const size = renderMark ? stepsRecipe.indicator.customSize : stepsRecipe.indicator.size;
    const color = (reference) => resolveColorReference(reference, palette);
    const rail = _jsx(View, { accessibilityRole: "summary", style: { flexDirection: vertical ? "column" : "row", gap: collapsed ? tokens.spacing.xxs : 0, paddingHorizontal: collapsed ? 0 : stepsRecipe.paddingInline }, children: steps.map((step, index) => {
            const terminal = index === steps.length - 1;
            const cursor = step.id === descriptor.currentStepId;
            const selected = step.status === "current" || step.status === "error";
            if (collapsed)
                return _jsx(View, { accessible: true, accessibilityLabel: step.accessibleName, accessibilityHint: step.statusLabel, style: { flex: 1, height: stepsRecipe.segmentHeight, borderRadius: tokens.radius.full, backgroundColor: step.status === "error" ? colors.danger : step.status === "pending" ? colors.border : colors.text } }, step.id);
            const cell = vertical ? { paddingBottom: terminal ? 0 : tokens.spacing.md } : { flexGrow: terminal ? 0 : 1, flexBasis: terminal ? "auto" : 0, flexShrink: 1, minWidth: size, ...(terminal ? { maxWidth: `${100 / steps.length}%` } : {}) };
            const segment = (reached) => _jsx(View, { style: { flex: 1, height: stepsRecipe.connector.height, backgroundColor: color(reached ? stepsRecipe.connector.tone.reached : stepsRecipe.connector.tone.unreached) } });
            const copy = _jsxs(View, { style: { flexShrink: 1, ...(vertical ? { flex: 1 } : {}), gap: tokens.spacing.xxs }, children: [_jsx(Text, { align: !vertical && terminal ? "end" : "start", emphasis: selected ? "medium" : "regular", variant: "label", style: { color: color(stepsRecipe.label.color[step.status]), ...(!vertical && !terminal ? { paddingEnd: stepsRecipe.gap } : {}) }, children: step.label }), step.description !== undefined && (!vertical || cursor) ? _jsx(Text, { variant: "caption", tone: "muted", align: !vertical && terminal ? "end" : "start", children: step.description }) : null, vertical ? _jsx(Text, { variant: "caption", tone: "muted", accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", children: step.statusLabel }) : null] });
            const mark = _jsx(StepMark, { status: step.status, position: step.position, ...(renderMark ? { renderMark } : {}) });
            const content = vertical ? _jsxs(_Fragment, { children: [mark, copy] }) : _jsxs(_Fragment, { children: [_jsxs(View, { accessible: false, style: { flexDirection: "row", alignItems: "center" }, children: [terminal ? segment(steps[index - 1]?.status === "complete") : null, mark, terminal ? null : segment(step.status === "complete")] }), copy] });
            const headerStyle = { minHeight: stepsRecipe.press.minTouchTarget, gap: vertical ? tokens.spacing.md : stepsRecipe.gap, ...(vertical ? { flexDirection: "row", alignItems: "center" } : {}) };
            const canPress = (descriptor.navigationMode === "free" || step.revisitable) && onStepPress;
            return _jsxs(View, { style: cell, children: [vertical && !terminal ? _jsx(View, { pointerEvents: "none", style: { position: "absolute", start: size / 2, top: size, bottom: 0, width: 1, backgroundColor: colors.border } }) : null, canPress ? _jsx(Pressable, { accessibilityRole: "button", accessibilityState: { selected }, accessibilityLabel: step.accessibleName, accessibilityHint: step.statusLabel, onPress: () => onStepPress(step.id), style: ({ pressed }) => [headerStyle, { opacity: pressed ? controlOpacity.pressed : 1 }], children: content })
                        : _jsx(View, { accessible: true, accessibilityLabel: step.accessibleName, accessibilityHint: step.statusLabel, style: headerStyle, children: content }), presentation === "vertical" && cursor && renderStepContent ? _jsx(View, { style: { marginStart: size + tokens.spacing.md, paddingVertical: tokens.spacing.sm }, children: renderStepContent(step.id) }) : null] }, step.id);
        }) });
    return _jsxs(View, { style: [{ direction: environment.direction }, layoutStyle], children: [compact ? _jsxs(View, { style: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: tokens.spacing.sm, marginBottom: tokens.spacing.xs }, children: [_jsxs(View, { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { flex: 1 }, children: [_jsxs(Text, { variant: "label", children: [current.position, " / ", current.total, " \u00B7 ", current.label] }), _jsx(Text, { variant: "caption", tone: "muted", children: current.statusLabel })] }), _jsx(Pressable, { accessibilityRole: "button", accessibilityState: { expanded }, accessibilityLabel: overviewLabel, onPress: () => setExpanded(value => !value), style: ({ pressed }) => ({ minHeight: stepsRecipe.press.minTouchTarget, justifyContent: "center", opacity: pressed ? controlOpacity.pressed : 1 }), children: _jsxs(Text, { variant: "label", tone: "muted", children: [overviewLabel, " ", expanded ? "⌃" : "⌄"] }) })] }) : null, rail] });
}
//# sourceMappingURL=steps.js.map