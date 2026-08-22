import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { commitNumberFieldInput, numberFieldRecipe, parseNumberFieldInput, resolveNumberFieldDescriptor, resolveNumberFieldInputStepperState, stepNumberFieldInput, } from "@hjm/design-contracts/components/number-field";
import { forwardRef, useEffect, useState } from "react";
import { Pressable, Text as NativeText, TextInput, View, } from "react-native";
import { useControllableState } from "./internal/state.js";
import { logicalTextAlign, minimumTargetStyle, scalableTextDefaults, } from "./internal/styles.js";
import { useHjmNativeTheme } from "./provider.js";
function valueToInput(value) {
    return value === null ? "" : String(value);
}
function defaultInputMode(min, step) {
    if (min < 0)
        return "text";
    return Number.isInteger(step) ? "numeric" : "decimal";
}
/** Expo-independent exact numeric input sharing the Web range/step resolver. */
export const NumberField = forwardRef(function NumberField({ label, min, max, step, value, defaultValue = null, onValueChange, description, error, required = false, disabled = false, readOnly = false, size = "medium", decrementLabel, incrementLabel, accessibilityLabel, accessibilityHint, getValueText, inputMode, inputStyle, containerStyle, onBlur, onFocus, onSubmitEditing, ...inputProps }, forwardedRef) {
    const { colors, environment, tokens } = useHjmNativeTheme();
    const controlled = value !== undefined;
    const [currentValue, setCurrentValue] = useControllableState({
        ...(value === undefined ? {} : { value }),
        defaultValue,
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    const descriptor = resolveNumberFieldDescriptor({
        value: currentValue,
        min,
        max,
        ...(step === undefined ? {} : { step }),
    });
    const recipe = numberFieldRecipe.sizes[size];
    const [draft, setDraft] = useState(() => valueToInput(currentValue));
    const [focused, setFocused] = useState(false);
    const stepper = resolveNumberFieldInputStepperState(draft, descriptor);
    useEffect(() => {
        setDraft(valueToInput(currentValue));
    }, [currentValue]);
    const restoreOrDisplay = (next) => {
        setDraft(valueToInput(controlled ? currentValue : next));
    };
    const commitDraft = () => {
        const next = commitNumberFieldInput(draft, descriptor);
        if (next === undefined) {
            setDraft(valueToInput(currentValue));
            return;
        }
        if (!Object.is(next, currentValue))
            setCurrentValue(next);
        restoreOrDisplay(next);
    };
    const stepValue = (direction) => {
        if (disabled || readOnly)
            return;
        const next = stepNumberFieldInput(draft, descriptor, direction);
        if (!Object.is(next, currentValue))
            setCurrentValue(next);
        restoreOrDisplay(next);
    };
    const unavailable = disabled || readOnly;
    const visibleLabel = `${label}${required ? " *" : ""}`;
    const hint = accessibilityHint ?? error ?? description;
    const parsedDraft = parseNumberFieldInput(draft);
    const announcedValue = typeof parsedDraft === "number" && parsedDraft >= min && parsedDraft <= max
        ? parsedDraft
        : currentValue;
    const valueText = announcedValue === null ? undefined : getValueText?.(announcedValue);
    const accessibilityValue = {
        min,
        max,
        ...(announcedValue === null ? {} : { now: announcedValue }),
        ...(valueText === undefined ? {} : { text: valueText }),
    };
    const actionProps = unavailable
        ? {}
        : {
            accessibilityActions: [
                { name: "increment", label: incrementLabel },
                { name: "decrement", label: decrementLabel },
            ],
            onAccessibilityAction: (event) => {
                if (event.nativeEvent.actionName === "increment")
                    stepValue("increment");
                if (event.nativeEvent.actionName === "decrement")
                    stepValue("decrement");
            },
        };
    return (_jsxs(View, { style: [{ gap: numberFieldRecipe.support.gap }, containerStyle], children: [_jsx(NativeText, { ...scalableTextDefaults, style: [
                    tokens.typography[numberFieldRecipe.support.label.textVariant],
                    {
                        color: colors.textBody,
                        fontWeight: numberFieldRecipe.support.label.fontWeight,
                        textAlign: logicalTextAlign(environment.direction),
                    },
                ], children: visibleLabel }), _jsxs(View, { style: {
                    alignItems: "center",
                    backgroundColor: colors.surface,
                    borderColor: error
                        ? colors.danger
                        : focused
                            ? colors.contentBrand
                            : colors.border,
                    borderRadius: tokens.radius[numberFieldRecipe.frame.radius],
                    borderWidth: error || focused ? 2 : numberFieldRecipe.frame.borderWidth,
                    direction: environment.direction,
                    flexDirection: "row",
                    minHeight: recipe.minHeight,
                    opacity: disabled ? numberFieldRecipe.states.disabledOpacity : 1,
                    overflow: "hidden",
                }, children: [_jsx(Pressable, { accessibilityLabel: decrementLabel, accessibilityRole: "button", accessibilityState: { disabled: unavailable || stepper.decrementDisabled }, disabled: unavailable || stepper.decrementDisabled, onPress: () => stepValue("decrement"), style: ({ pressed }) => [
                            minimumTargetStyle,
                            {
                                alignItems: "center",
                                alignSelf: "stretch",
                                backgroundColor: pressed ? colors.surfaceAlt : "transparent",
                                borderEndColor: colors.border,
                                borderEndWidth: 1,
                                justifyContent: "center",
                                opacity: unavailable || stepper.decrementDisabled ? 0.5 : 1,
                                width: recipe.stepperDiameter,
                            },
                        ], children: _jsx(NativeText, { ...scalableTextDefaults, accessible: false, style: [tokens.typography.title, { color: colors.textMuted, textAlign: "center" }], children: "\u2212" }) }), _jsx(TextInput, { ...scalableTextDefaults, ...inputProps, ...actionProps, ref: forwardedRef, accessibilityHint: hint, accessibilityLabel: accessibilityLabel ?? visibleLabel, accessibilityRole: "text", accessibilityState: { disabled }, accessibilityValue: accessibilityValue, editable: !disabled, readOnly: readOnly, inputMode: inputMode ?? defaultInputMode(min, descriptor.step), multiline: false, onChangeText: setDraft, onFocus: (event) => {
                            setFocused(true);
                            onFocus?.(event);
                        }, onBlur: (event) => {
                            setFocused(false);
                            commitDraft();
                            onBlur?.(event);
                        }, onSubmitEditing: (event) => {
                            commitDraft();
                            onSubmitEditing?.(event);
                        }, placeholderTextColor: colors.textWeak, style: [
                            {
                                color: colors.text,
                                flex: 1,
                                fontSize: tokens.typography[recipe.textVariant].fontSize,
                                fontWeight: tokens.typography[recipe.textVariant].fontWeight,
                                fontVariant: ["tabular-nums"],
                                lineHeight: tokens.typography[recipe.textVariant].lineHeight,
                                minHeight: recipe.minHeight,
                                paddingHorizontal: recipe.paddingHorizontal,
                                paddingVertical: 0,
                                textAlign: "center",
                            },
                            inputStyle,
                        ], value: draft }), _jsx(Pressable, { accessibilityLabel: incrementLabel, accessibilityRole: "button", accessibilityState: { disabled: unavailable || stepper.incrementDisabled }, disabled: unavailable || stepper.incrementDisabled, onPress: () => stepValue("increment"), style: ({ pressed }) => [
                            minimumTargetStyle,
                            {
                                alignItems: "center",
                                alignSelf: "stretch",
                                backgroundColor: pressed ? colors.surfaceAlt : "transparent",
                                borderStartColor: colors.border,
                                borderStartWidth: 1,
                                justifyContent: "center",
                                opacity: unavailable || stepper.incrementDisabled ? 0.5 : 1,
                                width: recipe.stepperDiameter,
                            },
                        ], children: _jsx(NativeText, { ...scalableTextDefaults, accessible: false, style: [tokens.typography.title, { color: colors.textMuted, textAlign: "center" }], children: "+" }) })] }), error ? (_jsx(NativeText, { ...scalableTextDefaults, accessibilityLiveRegion: "assertive", style: [
                    tokens.typography.caption,
                    { color: colors.danger, textAlign: logicalTextAlign(environment.direction) },
                ], children: error })) : description ? (_jsx(NativeText, { ...scalableTextDefaults, style: [
                    tokens.typography.caption,
                    { color: colors.textMuted, textAlign: logicalTextAlign(environment.direction) },
                ], children: description })) : null] }));
});
//# sourceMappingURL=number-field.js.map