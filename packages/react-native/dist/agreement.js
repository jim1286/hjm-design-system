import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { agreementRecipe, reconcileAgreementSelection, resolveAgreementState, toggleAgreementAll, toggleAgreementItem, validateAgreementDescriptor, } from "@hjmds/design-contracts/components/agreement";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { radius, spacing } from "@hjmds/design-contracts/foundations";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
export function Agreement({ descriptor, checkedIds: controlledChecked, defaultCheckedIds, onCheckedIdsChange, onStateChange, onDetail, requiredLabel, optionalLabel, style, }) {
    validateAgreementDescriptor(descriptor);
    const theme = useHjmNativeTheme();
    const [internal, setInternal] = useState(defaultCheckedIds ?? new Set());
    const raw = controlledChecked ?? internal;
    const checked = useMemo(() => reconcileAgreementSelection(descriptor, raw), [descriptor, raw]);
    const state = resolveAgreementState(descriptor, checked);
    const commit = (next) => {
        if (controlledChecked === undefined)
            setInternal(next);
        onCheckedIdsChange?.(next);
        onStateChange?.(resolveAgreementState(descriptor, next));
    };
    const markColor = resolveColorReference(agreementRecipe.item.selectedIndicator, theme.palette);
    const borderColor = resolveColorReference(agreementRecipe.item.focus.color, theme.palette);
    const mark = (value) => (_jsx(View, { style: {
            alignItems: "center",
            backgroundColor: value === false ? "transparent" : markColor,
            borderColor: value === false ? borderColor : markColor,
            borderRadius: radius.sm,
            borderWidth: 1,
            height: spacing.md,
            justifyContent: "center",
            width: spacing.md,
        }, children: value === false ? null : (_jsx(Text, { style: { color: resolveColorReference(agreementRecipe.all.color, theme.palette) }, variant: "caption", children: value === "mixed" ? "–" : "✓" })) }));
    return (_jsxs(View, { accessibilityLabel: descriptor.accessibilityLabel, accessibilityRole: "none", style: [{ gap: agreementRecipe.gap }, style], children: [_jsxs(Pressable, { accessibilityRole: "checkbox", accessibilityState: { checked: state.all === "mixed" ? "mixed" : state.all }, onPress: () => commit(toggleAgreementAll(descriptor, checked)), style: {
                    alignItems: "center",
                    backgroundColor: resolveColorReference(agreementRecipe.all.background, theme.palette),
                    borderRadius: radius.md,
                    flexDirection: "row",
                    gap: agreementRecipe.all.gap,
                    minHeight: agreementRecipe.all.minHeight,
                    paddingHorizontal: agreementRecipe.all.paddingHorizontal,
                    paddingVertical: agreementRecipe.all.paddingVertical,
                }, children: [mark(state.all), _jsx(Text, { variant: agreementRecipe.all.textVariant, children: descriptor.allLabel })] }), descriptor.items.map((item) => (_jsxs(View, { style: { gap: spacing.xxs }, children: [_jsxs(View, { style: { alignItems: "center", flexDirection: "row", gap: spacing.xs }, children: [_jsxs(Pressable, { accessibilityRole: "checkbox", accessibilityState: { checked: checked.has(item.id), disabled: item.disabled === true }, disabled: item.disabled === true, onPress: () => commit(toggleAgreementItem(descriptor, checked, item.id)), style: {
                                    alignItems: "center",
                                    flex: 1,
                                    flexDirection: "row",
                                    gap: agreementRecipe.item.gap,
                                    minHeight: agreementRecipe.item.minHeight,
                                }, children: [mark(checked.has(item.id)), _jsx(Text, { style: { flex: 1 }, variant: agreementRecipe.item.label.textVariant, children: `${item.label} ${item.required === true ? requiredLabel : optionalLabel}` })] }), item.detail ? (_jsx(Pressable, { accessibilityRole: "button", onPress: () => onDetail?.(item.id), style: { justifyContent: "center", minHeight: agreementRecipe.detail.minHeight, paddingHorizontal: spacing.xs }, children: _jsx(Text, { style: { color: resolveColorReference(agreementRecipe.detail.color, theme.palette), textDecorationLine: "underline" }, variant: agreementRecipe.detail.textVariant, children: item.detail.label }) })) : null] }), item.description ? (_jsx(Text, { style: { color: resolveColorReference(agreementRecipe.item.description.color, theme.palette), paddingStart: spacing.xl }, variant: agreementRecipe.item.description.textVariant, children: item.description })) : null] }, item.id)))] }));
}
//# sourceMappingURL=agreement.js.map