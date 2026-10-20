import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { resolveStepsDescriptor, stepsRecipe, } from "@hjmds/design-contracts/components/steps";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { Pressable, View } from "react-native";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
/** Linear steps preserving one cursor and reading order; steps before the cursor can be pressed to go back. */
export function Steps({ descriptor, statusLabels, composeAccessibleName, renderMark, onStepPress, layoutStyle, }) {
    const { colors, environment, palette } = useHjmNativeTheme();
    const steps = resolveStepsDescriptor(descriptor, { statusLabels, composeAccessibleName });
    // Colors come from stepsRecipe so labels stay body-colored as on Web; one brand color for indicator and label
    // made every reached step read as selected (2026-10-17 review N3).
    const { indicator, connector, label } = stepsRecipe;
    const color = (reference) => resolveColorReference(reference, palette);
    return (_jsx(View, { accessibilityRole: "summary", style: [{ direction: environment.direction, flexDirection: "row" }, layoutStyle], children: steps.map((step, index) => {
            const terminal = index === steps.length - 1;
            // The final step reserves only its copy/marker width; connectors own all remaining rail width.
            const cell = { flexGrow: terminal ? 0 : 1, flexBasis: terminal ? "auto" : 0, flexShrink: 1, gap: stepsRecipe.gap, minWidth: indicator.size, ...(terminal ? { maxWidth: `${100 / steps.length}%` } : {}) };
            const segment = (reached) => _jsx(View, { style: { backgroundColor: color(reached ? connector.tone.reached : connector.tone.unreached), flex: 1, height: connector.height } });
            const content = _jsxs(_Fragment, { children: [_jsxs(View, { accessible: false, style: { alignItems: "center", flexDirection: "row" }, children: [terminal ? segment(steps[index - 1]?.status === "complete") : null, _jsx(View, { style: { alignItems: "center", backgroundColor: indicator.background[step.status] === null ? colors.bg : color(indicator.background[step.status]), borderColor: color(indicator.border[step.status]), borderRadius: indicator.size / 2, borderWidth: step.status === "current" || step.status === "error" ? indicator.activeBorderWidth : indicator.borderWidth, height: indicator.size, justifyContent: "center", width: indicator.size }, children: renderMark?.(step.status, step.position) ?? _jsx(Text, { align: "center", emphasis: "strong", style: { color: color(indicator.content[step.status]) }, variant: "label", children: step.status === "complete" ? "✓" : step.status === "error" ? "!" : step.position }) }), terminal ? null : segment(step.status === "complete")] }), _jsx(Text, { emphasis: "medium", align: terminal ? "end" : "start", style: { color: color(label.color[step.status]), ...(terminal ? {} : { paddingEnd: stepsRecipe.gap }) }, variant: label.textVariant, children: step.label }), step.description === undefined ? null : _jsx(Text, { tone: "muted", align: terminal ? "end" : "start", variant: "caption", children: step.description })] });
            // A pressable step is one named button over marker and label; the status stays the hint, as on static steps.
            return (descriptor.navigationMode === "free" || step.revisitable) && onStepPress
                ? _jsx(Pressable, { accessibilityRole: "button", accessibilityState: { selected: step.status === "current" || step.status === "error" }, accessibilityHint: step.statusLabel, accessibilityLabel: step.accessibleName, onPress: () => onStepPress(step.id), style: { ...cell, minHeight: stepsRecipe.press.minTouchTarget }, children: content }, step.id)
                : _jsx(View, { accessibilityHint: step.statusLabel, accessibilityLabel: step.accessibleName, accessible: true, style: cell, children: content }, step.id);
        }) }));
}
//# sourceMappingURL=steps.js.map