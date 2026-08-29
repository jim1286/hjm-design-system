import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { resolveStepsDescriptor, stepsRecipe, } from "@hjmds/design-contracts/components/steps";
import { View } from "react-native";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
/** Non-interactive linear steps preserving one cursor and reading order. */
export function Steps({ descriptor, statusLabels, composeAccessibleName, renderMark, style, }) {
    const { colors, environment } = useHjmNativeTheme();
    const steps = resolveStepsDescriptor(descriptor, { statusLabels, composeAccessibleName });
    const statusColor = (status) => status === "error" ? colors.danger : status === "pending" ? colors.textMuted : colors.contentBrand;
    return (_jsx(View, { accessibilityRole: "summary", style: [{ direction: environment.direction, flexDirection: "row", gap: stepsRecipe.gap }, style], children: steps.map((step, index) => (_jsxs(View, { accessibilityHint: step.statusLabel, accessibilityLabel: step.accessibleName, accessible: true, style: { flex: 1, gap: stepsRecipe.gap, minWidth: 0 }, children: [_jsxs(View, { accessible: false, style: { alignItems: "center", flexDirection: "row" }, children: [_jsx(View, { style: { alignItems: "center", backgroundColor: colors.surface, borderColor: statusColor(step.status), borderRadius: stepsRecipe.indicator.size / 2, borderWidth: step.status === "current" || step.status === "error" ? stepsRecipe.indicator.activeBorderWidth : stepsRecipe.indicator.borderWidth, height: stepsRecipe.indicator.size, justifyContent: "center", width: stepsRecipe.indicator.size }, children: renderMark?.(step.status, step.position) ?? _jsx(Text, { align: "center", emphasis: "strong", style: { color: statusColor(step.status) }, variant: "label", children: step.status === "complete" ? "✓" : step.status === "error" ? "!" : step.position }) }), index === steps.length - 1 ? null : _jsx(View, { style: { backgroundColor: step.status === "complete" ? colors.contentBrand : colors.border, flex: 1, height: stepsRecipe.connector.height } })] }), _jsx(Text, { emphasis: "strong", style: { color: statusColor(step.status) }, variant: "label", children: step.label }), step.description === undefined ? null : _jsx(Text, { tone: "muted", variant: "caption", children: step.description })] }, step.id))) }));
}
//# sourceMappingURL=steps.js.map