import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { control, radius, spacing, typography } from "@hjm/design-contracts/foundations";
import { resolveInitialRadioValue, resolveInitialTabValue, reconcileRadioSelection, validateRadioSelection, validateSelectionItems, } from "@hjm/design-contracts/behaviors";
import { forwardRef, useEffect, useId, useRef } from "react";
import { ActivityIndicator, Pressable, Switch as NativeSwitch, TextInput, View, } from "react-native";
import { useControllableState } from "./internal/state.js";
import { logicalTextAlign, minimumTargetHitSlop, minimumTargetStyle, scalableTextDefaults, } from "./internal/styles.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
function FieldMessage({ error, supportText }) {
    if (!error && !supportText)
        return null;
    return (_jsx(Text, { accessibilityLiveRegion: error ? "assertive" : "none", tone: error ? "danger" : "muted", variant: "caption", children: error ?? supportText }));
}
const FieldRenderer = forwardRef(function FieldRenderer({ label, value, defaultValue = "", onValueChange, supportText, error, required = false, disabled = false, busy = false, accessibilityLabel, inputStyle, containerStyle, multiline, search, ...props }, ref) {
    const { colors, environment } = useHjmNativeTheme();
    const [currentValue, setCurrentValue] = useControllableState({
        ...(value === undefined ? {} : { value }),
        defaultValue,
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    const hint = error ?? supportText;
    return (_jsxs(View, { style: [{ gap: spacing.xs }, containerStyle], children: [_jsxs(Text, { tone: "primary", variant: "label", children: [label, required ? " *" : ""] }), _jsx(View, { style: {
                    alignItems: multiline ? "stretch" : "center",
                    backgroundColor: colors.bg,
                    borderColor: error ? colors.danger : colors.border,
                    borderRadius: radius.md,
                    borderWidth: error ? 2 : 1,
                    flexDirection: "row",
                    minHeight: multiline ? 112 : 44,
                    paddingHorizontal: spacing.sm,
                }, children: _jsx(TextInput, { ...scalableTextDefaults, ...props, ref: ref, accessibilityHint: hint, accessibilityLabel: accessibilityLabel ?? label, accessibilityRole: search ? "search" : undefined, accessibilityState: { busy, disabled }, editable: !disabled && !busy, multiline: multiline, onChangeText: setCurrentValue, placeholderTextColor: colors.textWeak, style: [
                        {
                            color: colors.text,
                            flex: 1,
                            fontSize: typography.bodyLarge.fontSize,
                            lineHeight: typography.bodyLarge.lineHeight,
                            minHeight: multiline ? 96 : 44,
                            paddingHorizontal: 0,
                            paddingVertical: multiline ? spacing.sm : 0,
                            textAlign: logicalTextAlign(environment.direction),
                            textAlignVertical: multiline ? "top" : "center",
                        },
                        inputStyle,
                    ], value: currentValue }) }), _jsx(FieldMessage, { ...(error === undefined ? {} : { error }), ...(supportText === undefined ? {} : { supportText }) })] }));
});
export const TextField = forwardRef(function TextField(props, ref) {
    return _jsx(FieldRenderer, { ...props, ref: ref, multiline: false, search: false });
});
export const TextArea = forwardRef(function TextArea(props, ref) {
    return _jsx(FieldRenderer, { ...props, ref: ref, multiline: true, search: false });
});
export const SearchField = forwardRef(function SearchField({ clearLabel, busyLabel, onClear, value, defaultValue, onValueChange, busy = false, disabled = false, ...props }, ref) {
    const [searchValue, setSearchValue] = useControllableState({
        ...(value === undefined ? {} : { value }),
        defaultValue: defaultValue ?? "",
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    return (_jsxs(View, { children: [_jsx(FieldRenderer, { ...props, ref: ref, busy: busy, disabled: disabled, multiline: false, onValueChange: (next) => {
                    if (!busy && !disabled)
                        setSearchValue(next);
                }, search: true, value: searchValue }), busy ? (_jsx(View, { accessibilityLabel: busyLabel, accessibilityRole: "progressbar", accessibilityState: { busy: true }, style: { alignItems: "center", bottom: 0, end: spacing.xs, height: 44, justifyContent: "center", position: "absolute", width: 44 }, children: _jsx(ActivityIndicator, { size: "small" }) })) : searchValue.length > 0 ? (_jsx(Pressable, { accessibilityLabel: clearLabel, accessibilityRole: "button", hitSlop: minimumTargetHitSlop, disabled: disabled, onPress: () => {
                    setSearchValue("");
                    onClear?.();
                }, style: {
                    alignItems: "center",
                    bottom: 0,
                    height: 44,
                    justifyContent: "center",
                    position: "absolute",
                    end: spacing.xs,
                    width: 44,
                }, children: _jsx(Text, { align: "center", tone: "muted", variant: "title", children: "\u00D7" }) })) : null] }));
});
export function Checkbox({ label, checked, defaultChecked = false, onCheckedChange, disabled = false, accessibilityHint, style, }) {
    const { colors } = useHjmNativeTheme();
    const [selected, setSelected] = useControllableState({
        ...(checked === undefined ? {} : { value: checked }),
        defaultValue: defaultChecked,
        ...(onCheckedChange === undefined ? {} : { onChange: onCheckedChange }),
    });
    return (_jsxs(Pressable, { accessibilityHint: accessibilityHint, accessibilityLabel: label, accessibilityRole: "checkbox", accessibilityState: { checked: selected, disabled }, disabled: disabled, hitSlop: minimumTargetHitSlop, onPress: () => setSelected(!selected), style: ({ pressed }) => [
            minimumTargetStyle,
            {
                alignItems: "center",
                flexDirection: "row",
                gap: spacing.sm,
                opacity: disabled ? 0.5 : pressed ? 0.86 : 1,
            },
            style,
        ], children: [_jsx(View, { accessible: false, style: {
                    alignItems: "center",
                    backgroundColor: selected ? colors.primary : colors.bg,
                    borderColor: selected ? colors.primary : colors.textWeak,
                    borderRadius: radius.sm / 2,
                    borderWidth: 2,
                    height: 24,
                    justifyContent: "center",
                    width: 24,
                }, children: selected ? _jsx(Text, { align: "center", tone: "inverse", variant: "label", children: "\u2713" }) : null }), _jsx(Text, { tone: "body", variant: "bodyLarge", children: label })] }));
}
export function RadioGroup({ label, options, value, defaultValue, onValueChange, required = false, disabled = false, readOnly = false, invalid = false, description, error, requiredLabel, readOnlyLabel, style, }) {
    const { colors } = useHjmNativeTheme();
    const selectionItems = options.map((option) => ({
        id: option.value,
        label: option.label,
        ...(option.disabled === undefined ? {} : { disabled: option.disabled }),
    }));
    validateSelectionItems(selectionItems);
    if (value !== undefined) {
        validateRadioSelection(selectionItems, value);
    }
    const initialRef = useRef(null);
    if (initialRef.current === null) {
        initialRef.current = {
            value: resolveInitialRadioValue(selectionItems, value ?? defaultValue, required),
        };
    }
    const [storedValue, setSelected] = useControllableState({
        ...(value === undefined ? {} : { value }),
        defaultValue: initialRef.current.value,
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    const reconciledValue = reconcileRadioSelection(selectionItems, storedValue, required);
    const controlled = value !== undefined;
    useEffect(() => {
        if (!controlled && reconciledValue !== storedValue)
            setSelected(reconciledValue);
    }, [controlled, reconciledValue, setSelected, storedValue]);
    const selected = reconciledValue;
    const id = useId().replaceAll(":", "");
    const labelId = `${id}-label`;
    const messageId = `${id}-message`;
    const hasError = invalid || error !== undefined;
    const resolvedGroupLabel = [
        label,
        required ? requiredLabel ?? "*" : undefined,
        readOnly ? readOnlyLabel : undefined,
    ].filter(Boolean).join(", ");
    return (_jsxs(View, { accessibilityHint: error ?? description, accessibilityLabel: resolvedGroupLabel, accessibilityLabelledBy: labelId, accessibilityRole: "radiogroup", accessibilityState: { disabled: disabled || readOnly }, accessibilityValue: hasError && error ? { text: error } : undefined, style: [{ gap: spacing.xs }, style], children: [_jsxs(Text, { nativeID: labelId, tone: "primary", variant: "label", children: [label, required ? requiredLabel ? ` (${requiredLabel})` : " *" : ""] }), options.map((option) => {
                const optionDisabled = disabled || option.disabled === true;
                const isSelected = selected === option.value;
                return (_jsxs(Pressable, { accessibilityHint: [
                        option.accessibilityHint,
                        error ?? description,
                        readOnly ? readOnlyLabel : undefined,
                    ].filter(Boolean).join(". ") || undefined, accessibilityLabel: option.label, accessibilityRole: "radio", accessibilityState: { checked: isSelected, disabled: optionDisabled || readOnly }, accessibilityValue: hasError && error ? { text: error } : undefined, disabled: optionDisabled || readOnly, onPress: () => setSelected(option.value), style: ({ pressed }) => [
                        minimumTargetStyle,
                        {
                            alignItems: "center",
                            flexDirection: "row",
                            gap: spacing.sm,
                            opacity: optionDisabled ? 0.5 : pressed ? 0.86 : 1,
                        },
                    ], children: [_jsx(View, { accessible: false, style: {
                                alignItems: "center",
                                borderColor: isSelected ? colors.primary : colors.textWeak,
                                borderRadius: radius.full,
                                borderWidth: 2,
                                height: 24,
                                justifyContent: "center",
                                width: 24,
                            }, children: isSelected ? (_jsx(View, { style: { backgroundColor: colors.primary, borderRadius: radius.full, height: 12, width: 12 } })) : null }), _jsx(Text, { tone: "body", variant: "bodyLarge", children: option.label })] }, option.value));
            }), error ? (_jsx(Text, { nativeID: messageId, accessibilityLiveRegion: "assertive", accessibilityRole: "alert", tone: "danger", variant: "caption", children: error })) : description ? (_jsx(Text, { nativeID: messageId, tone: "muted", variant: "caption", children: description })) : null] }));
}
export function Switch({ label, value, defaultValue = false, onValueChange, disabled = false, accessibilityHint, style, ...props }) {
    const { colors } = useHjmNativeTheme();
    const [enabled, setEnabled] = useControllableState({
        ...(value === undefined ? {} : { value }),
        defaultValue,
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    return (_jsxs(Pressable, { accessibilityHint: accessibilityHint, accessibilityLabel: label, accessibilityRole: "switch", accessibilityState: { checked: enabled, disabled }, disabled: disabled, onPress: () => setEnabled(!enabled), style: ({ pressed }) => [
            minimumTargetStyle,
            {
                alignItems: "center",
                flexDirection: "row",
                gap: spacing.sm,
                opacity: disabled ? 0.5 : pressed ? 0.86 : 1,
            },
            style,
        ], children: [_jsx(Text, { style: { flex: 1 }, tone: "body", variant: "bodyLarge", children: label }), _jsx(NativeSwitch, { ...props, accessible: false, disabled: disabled, ios_backgroundColor: colors.surfaceAlt, pointerEvents: "none", thumbColor: colors.bg, trackColor: { false: colors.surfaceAlt, true: colors.primary }, value: enabled })] }));
}
export function SegmentedControl({ label, options, value, defaultValue, onValueChange, disabled = false, style, }) {
    const { colors } = useHjmNativeTheme();
    const descriptors = options.map((option) => ({
        id: option.value,
        label: option.label,
        ...(option.disabled === undefined ? {} : { disabled: option.disabled }),
    }));
    const collectionFallback = resolveInitialTabValue(descriptors);
    if (collectionFallback === undefined)
        throw new Error("SegmentedControl requires an enabled option");
    if (value !== undefined)
        resolveInitialTabValue(descriptors, value);
    const initialRef = useRef(null);
    if (initialRef.current === null) {
        const initial = resolveInitialTabValue(descriptors, value ?? defaultValue);
        if (initial === undefined)
            throw new Error("SegmentedControl requires an enabled option");
        initialRef.current = { value: initial };
    }
    const [storedValue, setSelected] = useControllableState({
        ...(value === undefined ? {} : { value }),
        defaultValue: initialRef.current.value,
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    const storedValueValid = descriptors.some((item) => item.id === storedValue && !item.disabled);
    const selected = storedValueValid ? storedValue : collectionFallback;
    const controlled = value !== undefined;
    useEffect(() => {
        if (!controlled && !storedValueValid)
            setSelected(collectionFallback);
    }, [collectionFallback, controlled, setSelected, storedValueValid]);
    return (_jsx(View, { accessibilityLabel: label, accessibilityRole: "radiogroup", style: [
            {
                backgroundColor: colors.surface,
                borderRadius: radius.md,
                flexDirection: "row",
                gap: spacing.xxs,
                padding: spacing.xxs,
            },
            style,
        ], children: options.map((option) => {
            const isSelected = option.value === selected;
            const optionDisabled = disabled || option.disabled === true;
            return (_jsx(Pressable, { accessibilityLabel: option.label, accessibilityRole: "radio", accessibilityState: { checked: isSelected, disabled: optionDisabled }, disabled: optionDisabled, onPress: () => setSelected(option.value), style: ({ pressed }) => [
                    minimumTargetStyle,
                    {
                        alignItems: "center",
                        backgroundColor: isSelected ? colors.bg : "transparent",
                        borderRadius: radius.sm,
                        flex: 1,
                        justifyContent: "center",
                        opacity: optionDisabled ? 0.5 : pressed ? 0.86 : 1,
                        paddingHorizontal: spacing.xs,
                    },
                ], children: _jsx(Text, { align: "center", style: { fontWeight: isSelected ? typography.label.fontWeight : typography.body.fontWeight }, tone: isSelected ? "primary" : "muted", children: option.label }) }, option.value));
        }) }));
}
/** Action/filter chip with role-specific, controlled selection semantics. */
export function Chip({ label, size = "small", disabled = false, leading, trailing, accessibilityLabel, accessibilityHint, style, selectionMode = "action", selected, onPress, }) {
    const { colors, environment } = useHjmNativeTheme();
    const selectable = selectionMode !== "action";
    const active = selectable && selected === true;
    const role = selectionMode === "single" ? "radio" : selectionMode === "multiple" ? "checkbox" : "button";
    return (_jsxs(Pressable, { accessibilityHint: accessibilityHint, accessibilityLabel: accessibilityLabel ?? label, accessibilityRole: role, accessibilityState: selectable ? { checked: active, disabled } : { disabled }, disabled: disabled, hitSlop: size === "small" ? minimumTargetHitSlop : undefined, onPress: () => {
            if (selectionMode === "action")
                onPress();
            else
                onPress(!active);
        }, style: ({ pressed }) => [
            minimumTargetStyle,
            {
                alignItems: "center",
                alignSelf: "flex-start",
                backgroundColor: active ? colors.surfaceAccent : colors.bg,
                borderColor: active ? colors.primary : colors.border,
                borderRadius: radius.full,
                borderWidth: 1,
                flexDirection: environment.direction === "rtl" ? "row-reverse" : "row",
                gap: size === "small" ? spacing.xxs : spacing.xs,
                height: control.chipHeight[size],
                opacity: disabled ? 0.5 : pressed ? 0.86 : 1,
                paddingHorizontal: size === "small" ? spacing.sm : spacing.md,
            },
            style,
        ], children: [leading ? _jsx(View, { accessible: false, children: leading }) : null, active ? _jsx(Text, { accessible: false, tone: "brand", variant: "caption", children: "\u2713" }) : null, _jsx(Text, { align: "center", style: { fontWeight: active ? typography.label.fontWeight : typography.body.fontWeight }, tone: active ? "brand" : "muted", children: label }), trailing ? _jsx(View, { accessible: false, children: trailing }) : null] }));
}
//# sourceMappingURL=inputs.js.map