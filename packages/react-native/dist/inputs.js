import { createElement as _createElement } from "react";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button } from "./actions.js";
import { useInitialFocusTarget } from "./internal/initial-focus.js";
import { setInputVisibilityFrame } from "./internal/field-visibility.js";
import { assertNoRemovedStyleProps } from "./internal/diagnostics.js";
import { FixedGlyph } from "./internal/fixed-glyph.js";
import { SelectionMark } from "./internal/selection-mark.js";
import { FieldMessage, NativeFieldFrame, useFieldErrorAnnouncement } from "./internal/field-frame.js";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { control, glyph, spacing, typography, motion as motionTiming, } from "@hjmds/design-contracts/foundations";
import { fieldRecipe, } from "@hjmds/design-contracts/recipes/base";
import { chipRecipe, searchFieldRecipe, segmentedControlRecipe, selectionControlRecipe, selectionGroupRecipe, switchRecipe, } from "@hjmds/design-contracts/recipes";
import { visibleControlHeight } from "@hjmds/design-contracts/components/design-system-provider";
import { passwordFieldRecipe, resolvePasswordFieldDescriptor, } from "@hjmds/design-contracts/components/password-field";
import { getOtpFieldSlotValues, otpFieldRecipe, resolveOtpFieldValue, } from "@hjmds/design-contracts/components/otp-field";
import { characterCountRecipe, resolveCharacterCount, resolveCharacterCountMaxLength, shouldAnnounceCharacterCount, } from "@hjmds/design-contracts/character-count";
import { getCheckboxNextState, reconcileCheckboxSelection, resolveControlAccessibleName, resolveInitialRadioValue, resolveRadioTabStop, resolveInitialTabValue, reconcileRadioSelection, resolveScrollRevealOffset, selectionGroupBehaviorDefaults, toggleCheckboxSelection, validateCheckboxSelection, validateRadioSelection, validateSelectionItems, } from "@hjmds/design-contracts/behaviors";
import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState, } from "react";
import { AccessibilityInfo, ActivityIndicator, Animated, AppState, Easing, Platform, Pressable, ScrollView, Switch as NativeSwitch, Text as NativeText, TextInput, View, } from "react-native";
import { mixedCheckboxState, useControllableState } from "./internal/state.js";
import { isWebRenderer, webChoiceProps, webOnly } from "./internal/web-a11y.js";
import { logicalTextAlign, minimumTargetStyle, resolveNativeFontStyle, resolveNativeTextScaleProps, } from "./internal/styles.js";
import { Grid, Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
function resolveFieldAccessibleName(label, accessibilityLabel) {
    const visibleLabel = label?.trim();
    const explicitAccessibleName = accessibilityLabel?.trim();
    const accessibleName = explicitAccessibleName || visibleLabel;
    if (!accessibleName) {
        throw new TypeError("Field requires a non-empty label or accessibilityLabel");
    }
    return {
        accessibleName,
        ...(visibleLabel ? { visibleLabel } : {}),
    };
}
/*
  Character count (characterCountRecipe, 2026-10-23 BurnTok TextLengthHint). The row is hidden from the
  accessibility tree and its sentence and counter are appended to the input hint, so they are read on focus without
  a second swipe stop. Entering near/short/over is announced once; announcing each keystroke would talk over the
  typed text. Both platforms use announceForAccessibility because an Android live region on the row would speak on
  every counter change.
*/
function useCharacterCount(options, value, ownMaxLength) {
    if (options && ownMaxLength !== undefined) {
        throw new TypeError("Pass the limit through characterCount.max instead of maxLength");
    }
    const state = options ? resolveCharacterCount(value, options) : undefined;
    const previous = useRef(undefined);
    const status = state?.status;
    useEffect(() => {
        if (state && shouldAnnounceCharacterCount(previous.current, state))
            AccessibilityInfo.announceForAccessibility(state.message ?? "");
        previous.current = status;
        // Only a status change announces; the message inside one status changes with every keystroke.
    }, [status]);
    const maxLength = options ? resolveCharacterCountMaxLength(options) : ownMaxLength;
    return { ...(state ? { state } : {}), ...(maxLength === undefined ? {} : { maxLength }) };
}
function CharacterCountRow({ state }) {
    const { colors, environment } = useHjmNativeTheme();
    const tone = state.invalid ? "invalid" : "idle";
    const color = colors[characterCountRecipe.colors[tone]];
    return (_jsxs(View, { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", testID: "hjm-field-character-count", style: { flexDirection: "row", alignItems: "flex-start", gap: characterCountRecipe.gap, direction: environment.direction }, children: [state.message ? _jsx(Text, { variant: characterCountRecipe.textVariant, style: { color, flex: 1 }, children: state.message }) : null, _jsx(Text, { variant: characterCountRecipe.textVariant, style: { color, flexShrink: 0, marginStart: "auto", fontVariant: [characterCountRecipe.numeric], fontWeight: characterCountRecipe.counterFontWeight[tone] }, children: state.counter })] }));
}
const FieldRenderer = forwardRef(function FieldRenderer({ label, value, defaultValue = "", onValueChange, description, error, invalid = false, accessibilityHint, required = false, disabled = false, busy = false, variant = fieldRecipe.defaults.variant, shape, accessibilityLabel, layoutStyle, allowFontScaling, multiline, maxVisibleLines, minVisibleLines, align = fieldRecipe.defaults.align, search, recipeMinHeight, recipeTextVariant, disabledOpacity, searchSize = searchFieldRecipe.defaults.size, leading, trailing, leadingAction, hjmCompactMultiline = false, hjmDescriptionAlign = "start", initialFocusTarget, onBlur, onFocus, onContentSizeChange, onSelectionChange, characterCount, maxLength: ownMaxLength, ...props }, ref) {
    const resolvedDisabledOpacity = disabledOpacity ?? (search ? searchFieldRecipe.states.disabledOpacity : fieldRecipe.disabledOpacity);
    const theme = useHjmNativeTheme();
    const { colors, environment, textScaling } = theme;
    const [focused, setFocused] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);
    const inputRef = useRef(null);
    const fieldFrameRef = useRef(null);
    const restoreFocusRef = useRef(false);
    const selectionRef = useRef(null);
    const attachInput = useCallback((node) => {
        if (node === null)
            restoreFocusRef.current = inputRef.current?.isFocused?.() ?? false;
        if (inputRef.current)
            setInputVisibilityFrame(inputRef.current, null);
        inputRef.current = node;
        if (node)
            setInputVisibilityFrame(node, fieldFrameRef);
    }, []);
    const [currentValue, setCurrentValue] = useControllableState({
        ...(value === undefined ? {} : { value }),
        defaultValue,
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    // Disabled and read-only fields are never focused on entry (busy plain fields are locked too).
    useInitialFocusTarget(inputRef, initialFocusTarget, () => !disabled && !props.readOnly && props.editable !== false && (search || !busy));
    const supportText = description;
    const count = useCharacterCount(characterCount, currentValue, ownMaxLength);
    const countHint = count.state ? [count.state.message, count.state.counter].filter(Boolean).join(", ") : undefined;
    const hint = [error ?? accessibilityHint ?? supportText, countHint].filter(Boolean).join(", ") || undefined;
    // Over the limit (overflow "allow") draws the invalid border like an external group error.
    const invalidState = invalid || count.state?.status === "over";
    const { accessibleName, visibleLabel } = resolveFieldAccessibleName(label, accessibilityLabel);
    const resolvedShape = shape ??
        (search ? searchFieldRecipe.defaults.shape : fieldRecipe.defaults.shape);
    const searchSizing = searchFieldRecipe.sizes[searchSize];
    const resolvedMaxVisibleLines = maxVisibleLines ?? fieldRecipe.multilineMaxVisibleLines;
    const borderWidth = error || invalidState ? fieldRecipe.states.invalid.borderWidth
        : search ? searchFieldRecipe.borderWidth : fieldRecipe.borderWidth;
    const borderColor = search
        ? resolveColorReference(error || invalidState
            ? searchFieldRecipe.colors.invalid
            : focused
                ? searchFieldRecipe.colors.focus
                : searchFieldRecipe.colors.border, theme.palette)
        : colors[error || invalidState
            ? fieldRecipe.states.invalid.border
            : focused
                ? fieldRecipe.states.focused.border
                : fieldRecipe.states.idle.border];
    const backgroundColor = search && variant === fieldRecipe.defaults.variant
        ? resolveColorReference(searchFieldRecipe.colors.background, theme.palette)
        : colors[fieldRecipe.variants[variant].background];
    const placeholderColor = search
        ? resolveColorReference(searchFieldRecipe.colors.placeholder, theme.palette)
        : colors[fieldRecipe.placeholder.color];
    const textStyle = theme.tokens.typography[search ? searchSizing.textVariant : recipeTextVariant ?? fieldRecipe.textVariant];
    // Native TextInput scales its text without enlarging a fixed frame (BT-QA-020).
    // Size the one-line frame for the same scale instead of capping accessible text.
    const frameTextScale = textScaling.mode === "controlled"
        ? textScaling.scale
        : allowFontScaling === false
            ? 1
            : Math.min(textScaling.scale, props.maxFontSizeMultiplier && props.maxFontSizeMultiplier > 0 ? props.maxFontSizeMultiplier : Infinity);
    const singleLineMinHeight = Math.ceil(textStyle.lineHeight * frameTextScale + fieldRecipe.paddingVertical * 2 + borderWidth * 2);
    // iOS RCTUITextView updates typingAttributes/placeholder but leaves existing
    // attributed text at its old scale (BT-QA-025). Refresh only the native editor,
    // keeping the field's draft state and restoring focus/selection instead of capping text.
    const editorKey = Platform.OS === "ios" && multiline
        ? `multiline-${frameTextScale}`
        : "field";
    // Deps: only an editorKey remount changes the handle; none re-attached callback refs every render.
    useImperativeHandle(ref, () => inputRef.current, [editorKey]);
    useLayoutEffect(() => {
        if (restoreFocusRef.current) {
            inputRef.current?.focus?.();
            const selection = props.selection ?? selectionRef.current;
            if (selection)
                inputRef.current?.setNativeProps?.({ selection });
            restoreFocusRef.current = false;
        }
    }, [editorKey, props.selection]);
    // A composer that should open several lines tall asks in lines, not pixels,
    // so the recipe keeps ownership of line height and vertical padding. Compact: see field-private.ts.
    const minHeight = multiline
        ? minVisibleLines === undefined
            ? fieldRecipe.multilineMinHeight
            : Math.max(hjmCompactMultiline ? fieldRecipe.minHeight : fieldRecipe.multilineMinHeight, textStyle.lineHeight * minVisibleLines +
                fieldRecipe.paddingVertical * 2)
        : Math.max(search ? searchSizing.minHeight : recipeMinHeight ?? fieldRecipe.minHeight, singleLineMinHeight);
    const controlRadius = theme.tokens.radius[search
        ? searchFieldRecipe.shapes[resolvedShape]
        : fieldRecipe.shapes[resolvedShape]];
    const inputTextScaleProps = resolveNativeTextScaleProps(textScaling, [
        {
            color: search
                ? resolveColorReference(searchFieldRecipe.colors.content, theme.palette)
                : colors.text,
            flex: 1,
            ...resolveNativeFontStyle(theme.tokens.fontFamily.ui),
            fontSize: textStyle.fontSize,
            fontWeight: textStyle.fontWeight,
            lineHeight: textStyle.lineHeight,
            minHeight: minHeight - borderWidth * 2,
            // Explicit line bounds opt into content-driven composer sizing, without changing ordinary editors.
            ...(multiline && minVisibleLines !== undefined ? { height: Math.max(minHeight - borderWidth * 2, Math.min(currentValue ? contentHeight : 0, textStyle.lineHeight * (resolvedMaxVisibleLines ?? 1000) + fieldRecipe.paddingVertical * 2)) } : {}),
            ...(multiline &&
                resolvedMaxVisibleLines !== null &&
                resolvedMaxVisibleLines !== undefined
                ? {
                    maxHeight: textStyle.lineHeight * resolvedMaxVisibleLines +
                        fieldRecipe.paddingVertical * 2,
                }
                : {}),
            paddingHorizontal: 0,
            paddingVertical: fieldRecipe.paddingVertical,
            textAlign: align === "center"
                ? "center"
                : logicalTextAlign(environment.direction),
            textAlignVertical: multiline ? "top" : "center",
        },
    ], allowFontScaling);
    // SearchField `busy` means "results are loading", not "this value is being committed":
    // locking the editor dropped every keystroke typed while suggestions refreshed, while the
    // Web SearchField keeps typing under `aria-busy` (2026-10-06 parity follow-up). Plain
    // fields keep the lock because their busy means a pending save of the current value.
    // iOS scrolls the one-line viewport before reporting intrinsic growth. Keep bounded
    // composers unscrollable until their content exceeds the recipe cap; ordinary editors retain caller behavior.
    const editor = (_jsx(TextInput, { ...props, ...(count.maxLength === undefined ? {} : { maxLength: count.maxLength }), ...inputTextScaleProps, ref: attachInput, accessibilityHint: hint, accessibilityLabel: accessibleName, accessibilityRole: search ? "search" : undefined, accessibilityState: { busy, disabled }, editable: !disabled && !props.readOnly && props.editable !== false && (search || !busy), multiline: multiline, scrollEnabled: multiline && minVisibleLines !== undefined
            ? !!currentValue && contentHeight > textStyle.lineHeight * (resolvedMaxVisibleLines ?? 1000) + fieldRecipe.paddingVertical * 2
            : props.scrollEnabled, onBlur: (event) => {
            setFocused(false);
            onBlur?.(event);
        }, onContentSizeChange: event => {
            // Bounded sizing is owned by the unconstrained text measurement below.
            onContentSizeChange?.(event);
        }, onSelectionChange: event => {
            selectionRef.current = event.nativeEvent.selection;
            onSelectionChange?.(event);
        }, onChangeText: (next) => {
            if (!disabled && !props.readOnly && props.editable !== false && (search || !busy))
                setCurrentValue(next);
        }, onFocus: (event) => {
            setFocused(true);
            onFocus?.(event);
        }, placeholderTextColor: placeholderColor, value: currentValue }, editorKey));
    return (_jsxs(NativeFieldFrame, { frameRef: fieldFrameRef, descriptionAlign: hjmDescriptionAlign, ...(visibleLabel === undefined ? {} : { label: visibleLabel }), required: required, ...(error === undefined ? {} : { error }), ...(supportText === undefined ? {} : { description: supportText }), ...(disabled ? { disabledOpacity: resolvedDisabledOpacity } : {}), style: layoutStyle, children: [_jsxs(View, { style: {
                    opacity: disabled ? resolvedDisabledOpacity : 1,
                    alignItems: multiline ? "stretch" : "center",
                    backgroundColor,
                    borderColor,
                    borderRadius: controlRadius,
                    borderWidth,
                    direction: environment.direction,
                    flexDirection: "row",
                    gap: search ? searchSizing.gap : 0,
                    minHeight,
                    paddingHorizontal: search
                        ? searchSizing.paddingHorizontal
                        : fieldRecipe.paddingHorizontal,
                }, children: [leading ? (_jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", children: leading })) : null, leadingAction ? _jsx(View, { style: { alignSelf: "center" }, children: leadingAction }) : null, multiline && minVisibleLines !== undefined ? _jsxs(View, { style: { flex: 1, flexDirection: "row" }, children: [_jsx(NativeText, { ...resolveNativeTextScaleProps(textScaling, [{
                                        ...resolveNativeFontStyle(theme.tokens.fontFamily.ui), fontSize: textStyle.fontSize,
                                        fontWeight: textStyle.fontWeight, lineHeight: textStyle.lineHeight,
                                        position: "absolute", left: 0, right: 0, opacity: 0,
                                        paddingVertical: fieldRecipe.paddingVertical,
                                    }], allowFontScaling), accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", pointerEvents: "none", onTextLayout: event => setContentHeight(event.nativeEvent.lines.reduce((height, line) => height + Math.max(line.height, textStyle.lineHeight), 0) + fieldRecipe.paddingVertical * 2), children: currentValue + "\u200b" }), editor] }) : editor, trailing] }), count.state ? _jsx(CharacterCountRow, { state: count.state }) : null] }));
});
export const TextField = forwardRef(function TextField(props, ref) {
    return _jsx(FieldRenderer, { ...props, ref: ref, multiline: false, search: false });
});
export const TextArea = forwardRef(function TextArea(props, ref) {
    return _jsx(FieldRenderer, { ...props, ref: ref, multiline: true, search: false });
});
export const SearchField = forwardRef(function SearchField({ clearLabel, busyLabel, onClear, leading: leadingNode, trailing: trailingNode, renderLeading, renderClearIcon, renderBusyIndicator, value, defaultValue, onValueChange, size = searchFieldRecipe.defaults.size, busy = false, disabled = false, ...props }, ref) {
    const inputRef = useRef(null);
    // Single-line child editor never remounts.
    useImperativeHandle(ref, () => inputRef.current, []);
    const theme = useHjmNativeTheme();
    const searchSizing = searchFieldRecipe.sizes[size];
    const iconProps = {
        color: resolveColorReference(searchFieldRecipe.colors.leading, theme.palette),
        size: glyph[searchSizing.glyph],
        disabled,
    };
    const [searchValue, setSearchValue] = useControllableState({
        ...(value === undefined ? {} : { value }),
        defaultValue: defaultValue ?? "",
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    const leading = leadingNode ?? renderLeading?.(iconProps);
    const trailing = busy ? (_jsx(View, { accessibilityLabel: busyLabel, accessibilityRole: "progressbar", accessibilityState: { busy: true }, style: {
            alignItems: "center",
            height: searchSizing.clearDiameter,
            justifyContent: "center",
            width: searchSizing.clearDiameter,
        }, children: renderBusyIndicator?.(iconProps) ?? (_jsx(ActivityIndicator, { color: iconProps.color, size: iconProps.size })) })) : searchValue.length > 0 && !props.readOnly && props.editable !== false ? (_jsx(Pressable, { accessibilityLabel: clearLabel, accessibilityRole: "button", disabled: disabled, hitSlop: searchSizing.clearHitSlop, onPress: () => {
            setSearchValue("");
            onClear?.();
            inputRef.current?.focus();
        }, style: {
            alignItems: "center",
            height: searchSizing.clearDiameter,
            justifyContent: "center",
            width: searchSizing.clearDiameter,
        }, children: renderClearIcon?.(iconProps) ?? (_jsx(FixedGlyph, { tone: "muted", fontSize: iconProps.size, children: "\u00D7" })) })) : trailingNode;
    return (_jsx(FieldRenderer, { ...props, ref: inputRef, busy: busy, disabled: disabled, leading: leading, multiline: false, onValueChange: (next) => {
            // Typing continues while busy (same as Web `loading`); only disabled ignores input.
            if (!disabled)
                setSearchValue(next);
        }, search: true, searchSize: size, trailing: trailing, value: searchValue }));
});
function DefaultPasswordToggleIcon({ color, revealed, size, }) {
    // Web's `visibility`/`visibilityOff` paths: an almond eye pointed at both sides, a ring pupil and a top-start to
    // bottom-end slash. The eye is a square with two rounded opposite corners turned 45deg; the earlier full pill read
    // as a capsule, not an eye (2026-10-17 review). Views keep react-native-svg optional for this core input.
    const strokeWidth = Math.max(1.5, size * 0.1);
    const side = size * 0.62;
    const pupil = size * 0.34;
    // RTL swaps the rounded corners and the turn together (scenario matrix), which draws the same symmetric eye.
    const rtl = useHjmNativeTheme().environment.direction === "rtl";
    return (_jsxs(View, { accessible: false, style: { alignItems: "center", height: size, justifyContent: "center", width: size }, children: [_jsx(View, { style: {
                    borderColor: color,
                    ...(rtl ? { borderTopRightRadius: side * 0.85, borderBottomLeftRadius: side * 0.85 } : { borderTopLeftRadius: side * 0.85, borderBottomRightRadius: side * 0.85 }),
                    borderWidth: strokeWidth,
                    height: side,
                    position: "absolute",
                    transform: [{ rotate: rtl ? "-45deg" : "45deg" }],
                    width: side,
                } }), _jsx(View, { style: { borderColor: color, borderRadius: pupil / 2, borderWidth: strokeWidth, height: pupil, width: pupil } }), revealed ? (_jsx(View, { style: {
                    backgroundColor: color,
                    borderRadius: strokeWidth,
                    height: strokeWidth,
                    position: "absolute",
                    transform: [{ rotate: "45deg" }],
                    width: size * 1.06,
                } })) : null] }));
}
/** Password input with independent reveal state and native autofill translation. */
export const PasswordField = forwardRef(function PasswordField({ revealed: revealedProp, defaultRevealed = false, onRevealedChange, autofillHint, revealLabel, concealLabel, size = passwordFieldRecipe.defaults.size, renderToggleIcon, disabled = false, onSelectionChange, ...props }, forwardedRef) {
    const theme = useHjmNativeTheme();
    const inputRef = useRef(null);
    // Single-line child editor never remounts.
    useImperativeHandle(forwardedRef, () => inputRef.current, []);
    const selectionRef = useRef({ start: 0, end: 0 });
    const [revealed, setRevealed] = useControllableState({
        ...(revealedProp === undefined ? {} : { value: revealedProp }),
        defaultValue: defaultRevealed,
        ...(onRevealedChange === undefined ? {} : { onChange: onRevealedChange }),
    });
    const resolved = resolvePasswordFieldDescriptor({ revealed, autofillHint }, {
        composeToggleAccessibleName: ({ willReveal }) => willReveal ? revealLabel : concealLabel,
    });
    // Size is a minimum; both text and frame derive from themed metrics so large text cannot be clipped.
    const metrics = passwordFieldRecipe.sizes[size];
    const toggleColor = resolveColorReference(passwordFieldRecipe.toggle.color, theme.palette);
    const appearance = {
        name: revealed
            ? passwordFieldRecipe.toggle.icons.revealed
            : passwordFieldRecipe.toggle.icons.concealed,
        color: toggleColor,
        size: glyph.sm,
        revealed,
        disabled,
    };
    useEffect(() => {
        const timeout = setTimeout(() => {
            inputRef.current?.setNativeProps({ selection: selectionRef.current });
        }, 0);
        return () => clearTimeout(timeout);
    }, [revealed]);
    return (_jsx(FieldRenderer, { ...props, ref: inputRef, autoComplete: autofillHint === "none" ? "off" : autofillHint === "current" ? "current-password" : "new-password", disabled: disabled, 
        // passwordFieldRecipe.states owns the amount; both renderers used the field default 0.6 until 2026-10-06.
        disabledOpacity: passwordFieldRecipe.states.disabledOpacity, recipeTextVariant: size === "large" ? "bodyLarge" : fieldRecipe.textVariant, recipeMinHeight: metrics.minHeight, multiline: false, onSelectionChange: (event) => {
            selectionRef.current = event.nativeEvent.selection;
            onSelectionChange?.(event);
        }, search: false, secureTextEntry: resolved.nativeSecureTextEntry, importantForAutofill: autofillHint === "none" ? "no" : props.importantForAutofill, textContentType: autofillHint === "none" ? "none" : autofillHint === "current" ? "password" : "newPassword", trailing: (_jsx(Pressable, { accessibilityLabel: resolved.toggleAccessibleName, accessibilityRole: "button", 
            // No `selected`: the label already names the next action, and VoiceOver
            // would read "Selected, Hide password" — the Native twin of the
            // `aria-pressed` the contract rules out (password-field.md, rationale 1).
            accessibilityState: { disabled }, disabled: disabled, onPress: () => setRevealed(!revealed), style: ({ pressed }) => ({
                alignItems: "center",
                height: metrics.toggleDiameter,
                justifyContent: "center",
                opacity: pressed ? 0.72 : 1,
                width: metrics.toggleDiameter,
            }), children: renderToggleIcon?.(appearance) ?? _jsx(DefaultPasswordToggleIcon, { ...appearance }) })) }));
});
/** One accessible numeric TextInput rendered through decorative OTP slots. */
export const OtpField = forwardRef(function OtpField({ label, accessibilityLabel, description, error, required = false, disabled = false, busy = false, readOnly = false, length, value: valueProp, defaultValue = "", onValueChange, onComplete, size = otpFieldRecipe.defaults.size, presentation = "boxes", 
// Inherited from BaseFieldProps; before 1.13 it fell into `...props` and was spread onto the
// hidden TextInput, so OtpField silently ignored its own canonical placement prop.
layoutStyle, allowFontScaling, onBlur, onFocus, ...props }, ref) {
    assertNoRemovedStyleProps("OtpField", props, ["slotStyle", "slotTextStyle"]);
    const supportText = description;
    const theme = useHjmNativeTheme();
    const { accessibleName, visibleLabel } = resolveFieldAccessibleName(label, accessibilityLabel);
    const [focused, setFocused] = useState(false);
    const [value, setValue] = useControllableState({
        ...(valueProp === undefined ? {} : { value: valueProp }),
        defaultValue: resolveOtpFieldValue(length, defaultValue),
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    const slots = getOtpFieldSlotValues({ length, value });
    const complete = value.length === length;
    const wasCompleteRef = useRef(complete);
    useEffect(() => {
        if (complete && !wasCompleteRef.current)
            onComplete?.(value);
        wasCompleteRef.current = complete;
    }, [complete, onComplete, value]);
    const metrics = otpFieldRecipe.sizes[size];
    const activeIndex = Math.min(value.length, length - 1);
    const slotHeight = Math.max(metrics.slotSize, theme.tokens.typography[metrics.textVariant].lineHeight * theme.environment.textScale + spacing.xs * 2);
    const baseBorder = resolveColorReference(otpFieldRecipe.slot.border, theme.palette);
    const focusBorder = resolveColorReference(otpFieldRecipe.slot.focusBorder, theme.palette);
    const invalidBorder = resolveColorReference(otpFieldRecipe.slot.invalidBorder, theme.palette);
    const filledBorder = resolveColorReference(otpFieldRecipe.slot.filledBorder, theme.palette);
    const contentColor = resolveColorReference(otpFieldRecipe.slot.content, theme.palette);
    // fieldRecipe.disabledScope: label and slots fade; the hint/error below keep full contrast.
    // The whole column used to fade (2026-10-06 change, same as Web).
    const disabledOpacity = disabled || busy ? otpFieldRecipe.states.disabledOpacity : 1;
    return (_jsxs(View, { style: [
            { gap: fieldRecipe.label.gap },
            layoutStyle,
        ], children: [visibleLabel ? (_jsxs(Text, { style: {
                    color: theme.colors[fieldRecipe.label.color],
                    fontWeight: fieldRecipe.label.fontWeight,
                    opacity: disabledOpacity,
                }, tone: "body", variant: fieldRecipe.label.textVariant, children: [visibleLabel, required ? " *" : ""] })) : null, _jsxs(View, { style: { gap: otpFieldRecipe.support.gap }, children: [_jsxs(View, { style: {
                            direction: "ltr",
                            maxWidth: metrics.slotSize * length + metrics.gap * (length - 1),
                            opacity: disabledOpacity,
                            position: "relative",
                            width: "100%",
                        }, children: [_jsx(TextInput, { ...props, ref: ref, accessibilityHint: error ?? supportText, accessibilityLabel: accessibleName, accessibilityState: { busy, disabled: disabled || readOnly }, allowFontScaling: allowFontScaling, autoComplete: "one-time-code", caretHidden: true, editable: !disabled && !busy && !readOnly && props.editable !== false, keyboardType: "number-pad", maxLength: length, onBlur: (event) => {
                                    setFocused(false);
                                    onBlur?.(event);
                                }, onChangeText: (rawText) => setValue(resolveOtpFieldValue(length, rawText)), onFocus: (event) => {
                                    setFocused(true);
                                    onFocus?.(event);
                                }, selectionColor: "transparent", style: {
                                    bottom: 0,
                                    color: "transparent",
                                    left: 0,
                                    // UIKit excludes views with opacity <= 0.01 from hit testing.
                                    // Keep it behind opaque, pointer-transparent slots: Android may paint
                                    // composing text despite a transparent text color.
                                    padding: 0,
                                    position: "absolute",
                                    right: 0,
                                    top: 0,
                                    zIndex: 0,
                                }, textContentType: "oneTimeCode", value: value }), _jsx(View, { pointerEvents: "none", style: { backgroundColor: theme.colors.bg, flexDirection: "row", gap: metrics.gap, width: "100%", zIndex: 1 }, children: slots.map((digit, index) => {
                                    const borderColor = error
                                        ? invalidBorder
                                        : focused && index === activeIndex
                                            ? focusBorder
                                            : digit
                                                ? filledBorder
                                                : baseBorder;
                                    return (_jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", pointerEvents: "none", style: [
                                            {
                                                alignItems: "center",
                                                backgroundColor: theme.colors.bg,
                                                borderColor,
                                                borderRadius: presentation === "underline" ? 0 : theme.tokens.radius[otpFieldRecipe.slot.radius],
                                                // Underline changes only decoration; one TextInput still owns edits and autofill.
                                                borderWidth: presentation === "underline" ? 0 : otpFieldRecipe.slot.borderWidth,
                                                borderBottomWidth: presentation === "underline" ? 2 : otpFieldRecipe.slot.borderWidth,
                                                flex: 1,
                                                height: slotHeight,
                                                justifyContent: "center",
                                                maxWidth: metrics.slotSize,
                                                minWidth: 0,
                                                zIndex: 1,
                                            },
                                        ], children: _jsx(Text, { accessible: false, align: "center", allowFontScaling: allowFontScaling, style: [{ color: contentColor }], variant: metrics.textVariant, children: digit }) }, index));
                                }) })] }), _jsx(FieldMessage, { ...(error === undefined ? {} : { error }), ...(supportText === undefined ? {} : { supportText }) })] })] }));
});
// UI control labels keep the ui font even when their metric variant is body; content still uses reading.
function ChoiceRow({ kind, label, labelContent, action, description, checked, disabled, readOnly, required, invalid, readOnlyLabel, requiredLabel, invalidLabel, accessibilityHint, presentation = selectionControlRecipe.defaults.presentation, size = selectionControlRecipe.defaults.size, indicator = "default", leading, renderLeading, renderIndicator, onActivate, webTabIndex, layoutStyle, onRailLayout, onRailFocus, }) {
    const theme = useHjmNativeTheme();
    const metrics = selectionControlRecipe.sizes[size];
    const chips = presentation === "chips", chipMetrics = chipRecipe.sizes[size];
    const rowMinHeight = chips ? visibleControlHeight(chipMetrics.height, theme.environment.minimumVisualTarget) : metrics.rowMinHeight;
    const plate = selectionControlRecipe.presentations[presentation];
    const selected = checked === true || checked === "mixed";
    const chipState = chipRecipe.states[selected ? "selected" : "idle"];
    const indicatorColor = resolveColorReference(chips ? chipState.content : selectionControlRecipe.states.indicator, theme.palette);
    const appearance = {
        checked,
        selected,
        disabled,
        readOnly,
        color: indicatorColor,
        size: metrics.control,
    };
    const resolvedLeading = leading ?? renderLeading?.(appearance);
    const plateBackground = chips ? chipState.background : selected
        ? selectionControlRecipe.states.selectedBackground
        : plate.background ?? selectionControlRecipe.states.idleBackground;
    const plateBorder = invalid
        ? selectionControlRecipe.states.invalidBorder
        : chips ? chipState.border : selected
            ? selectionControlRecipe.states.selectedBorder
            : plate.border;
    const frameStyle = {
        ...(chips ? { maxWidth: "100%" } : {}),
        backgroundColor: resolveColorReference(plateBackground, theme.palette),
        borderColor: plateBorder ? resolveColorReference(plateBorder, theme.palette) : "transparent",
        borderRadius: theme.tokens.radius[plate.radius],
        borderWidth: plate.borderWidth,
    };
    const resolvedHint = [
        accessibilityHint ?? description,
        required ? requiredLabel : undefined,
        readOnly ? readOnlyLabel : undefined,
        invalid ? invalidLabel : undefined,
    ].filter(Boolean).join(". ") || undefined;
    const target = (_jsxs(Pressable, { accessibilityHint: resolvedHint, accessibilityLabel: label, accessibilityRole: kind, 
        // See mixedCheckboxState: a checkbox leaving "mixed" kept the suffix on Android.
        accessibilityState: kind === "checkbox" ? mixedCheckboxState(checked, { disabled: disabled || readOnly }) : { checked, disabled: disabled || readOnly }, ...webOnly(webChoiceProps({
            kind,
            checked,
            disabled,
            readOnly,
            onActivate,
            ...(webTabIndex === undefined ? {} : { tabIndex: webTabIndex }),
        })), disabled: disabled || readOnly, hitSlop: chips ? chipMetrics.hitSlop : plate.useSizePadding ? 0 : metrics.hitSlop, ...(onRailFocus ? { onFocus: onRailFocus } : {}), ...(onRailLayout && !action ? { onLayout: onRailLayout } : {}), onPress: () => {
            if (!readOnly)
                onActivate();
        }, style: ({ pressed }) => [
            {
                alignItems: "center",
                alignSelf: chips ? "flex-start" : "stretch",
                // Grid cells stretch to the tallest sibling; the visible card must fill that cell too.
                flexGrow: presentation === "card" ? 1 : undefined,
                ...frameStyle,
                direction: theme.environment.direction,
                flexDirection: "row",
                gap: chips ? chipMetrics.gap : metrics.gap,
                minHeight: rowMinHeight,
                opacity: disabled
                    ? selectionControlRecipe.states.disabledOpacity
                    : pressed && !readOnly
                        ? 0.86
                        : 1,
                paddingHorizontal: chips ? chipMetrics.paddingHorizontal : plate.useSizePadding ? metrics.paddingHorizontal : 0,
                paddingVertical: chips ? 0 : plate.useSizePadding ? metrics.paddingVertical : 0,
            },
            action ? { flex: 1, minWidth: 0, backgroundColor: "transparent", borderWidth: 0, borderRadius: 0, opacity: pressed && !readOnly && !disabled ? 0.86 : 1 } : layoutStyle,
        ], children: [chips && indicator === "default" && renderIndicator ? (_jsx(View, { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", children: renderIndicator(appearance) })) : !chips && indicator === "default" ? (_jsx(SelectionMark, { kind: kind, checked: checked, size: size, invalid: invalid ?? false, children: renderIndicator?.(appearance) })) : null, resolvedLeading ? (_jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", children: resolvedLeading })) : null, _jsxs(View, { style: [{ flexGrow: chips ? 0 : 1, flexShrink: 1, gap: spacing.xxs, minWidth: 0 }], children: [labelContent != null && typeof labelContent !== "string" && typeof labelContent !== "number" ? labelContent : _jsx(Text, { fontRole: "ui", style: [
                            {
                                color: resolveColorReference(chips ? chipState.content : selectionControlRecipe.label.color, theme.palette),
                                fontWeight: selected
                                    ? selectionControlRecipe.label.checkedFontWeight
                                    : selectionControlRecipe.label.fontWeight,
                            },
                        ], variant: chips ? chipMetrics.textVariant : metrics.labelVariant, children: labelContent ?? label }), description ? (_jsx(Text, { style: [
                            {
                                color: resolveColorReference(selectionControlRecipe.description.color, theme.palette),
                            },
                        ], variant: metrics.descriptionVariant, children: description })) : null] })] }));
    if (!action)
        return target;
    // The selection target owns its accessible label; the action is a separate sibling
    // so rename/manage never changes the selected option or nests a button in a radio.
    return _jsxs(View, { ...(onRailLayout ? { onLayout: onRailLayout } : {}), style: [{
                alignItems: "center", alignSelf: chips ? "flex-start" : "stretch", flexDirection: "row", direction: theme.environment.direction,
                minHeight: rowMinHeight,
                flexGrow: presentation === "card" ? 1 : undefined,
                ...frameStyle,
                opacity: disabled ? selectionControlRecipe.states.disabledOpacity : 1,
            }, layoutStyle], children: [target, _jsx(View, { style: { paddingEnd: spacing.xs }, children: _jsx(Button, { tone: "ghost", size: "small", disabled: disabled || action.disabled === true, accessibilityLabel: action.accessibilityLabel, onPress: action.onAction, children: action.label }) })] });
}
export function Checkbox({ label, checked, defaultChecked = false, onCheckedChange, disabled = false, readOnly = false, required = false, invalid = false, description, readOnlyLabel, requiredLabel, invalidLabel, leading, renderLeading, renderIndicator, accessibilityHint, ...visual }) {
    const [selected, setSelected] = useControllableState({
        ...(checked === undefined ? {} : { value: checked }),
        defaultValue: defaultChecked,
        ...(onCheckedChange === undefined
            ? {}
            : { onChange: (next) => onCheckedChange(next === true) }),
    });
    return (_jsx(ChoiceRow, { ...visual, accessibilityHint: accessibilityHint, checked: selected, description: description, disabled: disabled, indicator: visual.indicator ?? "default", invalid: invalid, invalidLabel: invalidLabel, kind: "checkbox", label: label, leading: leading, onActivate: () => setSelected(getCheckboxNextState(selected)), readOnly: readOnly, readOnlyLabel: readOnlyLabel, renderIndicator: renderIndicator, renderLeading: renderLeading, required: required, requiredLabel: requiredLabel }));
}
/** Standalone native radio item. Prefer RadioGroup when group state is owned here. */
export function Radio({ label, checked, defaultChecked = false, onCheckedChange, disabled = false, readOnly = false, required = false, invalid = false, description, readOnlyLabel, requiredLabel, invalidLabel, leading, renderLeading, renderIndicator, accessibilityHint, ...visual }) {
    const [selected, setSelected] = useControllableState({
        ...(checked === undefined ? {} : { value: checked }),
        defaultValue: defaultChecked,
        ...(onCheckedChange === undefined
            ? {}
            : { onChange: (next) => next && onCheckedChange(true) }),
    });
    return (_jsx(ChoiceRow, { ...visual, accessibilityHint: accessibilityHint, checked: selected, description: description, disabled: disabled, indicator: visual.indicator ?? "default", invalid: invalid, invalidLabel: invalidLabel, kind: "radio", label: label, leading: leading, onActivate: () => setSelected(true), readOnly: readOnly, readOnlyLabel: readOnlyLabel, renderIndicator: renderIndicator, renderLeading: renderLeading, required: required, requiredLabel: requiredLabel }));
}
/** Measures chips in the rail and scrolls the least distance that shows a focused chip (resolveScrollRevealOffset). */
function useChipRail(enabled) {
    const ref = useRef(null);
    const offset = useRef(0);
    const viewport = useRef(0);
    const rects = useRef({});
    if (!enabled)
        return undefined;
    return {
        ref,
        onScroll: event => { offset.current = event.nativeEvent.contentOffset.x; },
        onViewportLayout: event => { viewport.current = event.nativeEvent.layout.width; },
        itemLayout: id => event => { const { x, width } = event.nativeEvent.layout; rects.current[id] = { x, width }; },
        reveal: id => {
            const rect = rects.current[id];
            if (!rect || viewport.current <= 0)
                return;
            // Layout x is inside the padded content row; the scroll offset counts the content padding too.
            const inset = selectionGroupRecipe.overflow.scrollInset;
            const next = resolveScrollRevealOffset(offset.current, viewport.current, rect.x + inset, rect.width, inset);
            if (next !== offset.current) {
                offset.current = next;
                ref.current?.scrollTo({ x: next, animated: false });
            }
        },
    };
}
function ChoiceGroupFrame({ label, accessibilityLabel, required, requiredLabel, readOnly, readOnlyLabel, disabled, description, error, role, orientation, presentation, grid, layoutStyle, rail, children, }) {
    const theme = useHjmNativeTheme();
    const id = useId().replaceAll(":", "");
    const labelId = `${id}-label`;
    const accessibleName = resolveControlAccessibleName(label, accessibilityLabel, "Choice group");
    const announcedName = [
        accessibleName,
        required ? requiredLabel ?? "*" : undefined,
        readOnly ? readOnlyLabel : undefined,
    ].filter(Boolean).join(", ");
    const gap = selectionGroupRecipe.orientations[orientation].gap[presentation];
    useFieldErrorAnnouncement(error);
    return (_jsxs(View, { accessibilityHint: [error ?? description, readOnly ? readOnlyLabel : undefined]
            .filter(Boolean).join(". ") || undefined, accessibilityLabel: announcedName, accessibilityLabelledBy: label ? labelId : undefined, accessibilityRole: role, accessibilityState: { disabled: disabled || readOnly }, accessibilityValue: error ? { text: error } : undefined, style: [{ direction: theme.environment.direction, gap: selectionGroupRecipe.supportGap }, layoutStyle], children: [label ? (_jsxs(Text, { nativeID: labelId, tone: "primary", variant: selectionGroupRecipe.label.textVariant, children: [label, required ? requiredLabel ? ` (${requiredLabel})` : " *" : ""] })) : null, description && !error ? (_jsx(Text, { tone: "muted", variant: selectionGroupRecipe.description.textVariant, children: description })) : null, rail ? (
            // Same scroller as SegmentedControl overflow="scroll": an LTR scroll view with the reading direction on
            // its row. selectionGroupRecipe.overflow.scrollInset pads every side (focus ring, chip hit slop, equal end
            // gap) and the negative margin keeps the chips aligned with the column.
            _jsx(ScrollView, { ref: rail.ref, horizontal: true, keyboardShouldPersistTaps: "handled", onScroll: rail.onScroll, scrollEventThrottle: 16, showsHorizontalScrollIndicator: false, onLayout: rail.onViewportLayout, style: { direction: "ltr", flexGrow: 0, margin: -selectionGroupRecipe.overflow.scrollInset }, contentContainerStyle: { padding: selectionGroupRecipe.overflow.scrollInset }, children: _jsx(View, { style: { direction: theme.environment.direction, flexDirection: "row", flexWrap: "nowrap", gap }, children: children }) })) : grid ? _jsx(Grid, { ...grid, children: children }) : (_jsx(View, { style: {
                    direction: theme.environment.direction,
                    flexDirection: presentation === "chips" || (orientation === "horizontal" && theme.environment.textScale < 1.6) ? "row" : "column",
                    flexWrap: presentation === "chips" ? "wrap" : undefined,
                    gap,
                }, children: children })), error ? (_jsx(Text, { accessibilityLiveRegion: "assertive", accessibilityRole: "alert", tone: "danger", variant: selectionGroupRecipe.error.textVariant, children: error })) : null] }));
}
export function RadioGroup(props) {
    const { label, accessibilityLabel, items, value, defaultValue, onValueChange, required = false, disabled = false, readOnly = false, invalid = false, description, error, requiredLabel, readOnlyLabel, invalidLabel, orientation = selectionGroupBehaviorDefaults.orientation, grid, presentation = selectionGroupRecipe.defaults.presentation, size = selectionControlRecipe.defaults.size, indicator = "default", renderLeading, renderLabel, renderIndicator, layoutStyle, ...slotStyles } = props;
    // Removed aliases must not silently change the selected collection in JavaScript callers.
    if ("options" in props || !Array.isArray(items))
        throw new TypeError("RadioGroup requires items; options was removed");
    const resolvedItems = items;
    const selectionItems = resolvedItems.map((item) => ({
        id: item.value,
        label: item.label,
        ...(item.description === undefined ? {} : { description: item.description }),
        ...(item.disabled === undefined ? {} : { disabled: item.disabled }),
    }));
    validateSelectionItems(selectionItems);
    if (value !== undefined)
        validateRadioSelection(selectionItems, value);
    const initialRef = useRef(null);
    initialRef.current ??= {
        value: resolveInitialRadioValue(selectionItems, value ?? defaultValue, required),
    };
    const [storedValue, setSelected] = useControllableState({
        ...(value === undefined ? {} : { value }),
        defaultValue: initialRef.current.value,
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    const selected = reconcileRadioSelection(selectionItems, storedValue, required);
    // A radio group is one tab stop: the selected option holds it, or the first
    // enabled option when nothing is selected yet.
    const webTabStop = resolveRadioTabStop(selectionItems, selected);
    useEffect(() => {
        if (value === undefined && selected !== storedValue)
            setSelected(selected);
    }, [selected, setSelected, storedValue, value]);
    const hasError = invalid || error !== undefined;
    return (_jsx(ChoiceGroupFrame, { accessibilityLabel: accessibilityLabel, description: description, disabled: disabled, error: error, label: label, orientation: orientation, grid: grid, presentation: presentation, readOnly: readOnly, readOnlyLabel: readOnlyLabel, required: required, requiredLabel: requiredLabel, role: "radiogroup", layoutStyle: layoutStyle, children: resolvedItems.map((item) => {
            const optionDisabled = disabled || item.disabled === true;
            const optionSelected = selected === item.value;
            return (_createElement(ChoiceRow, { ...slotStyles, key: item.value, accessibilityHint: item.accessibilityHint, checked: optionSelected, description: item.description, disabled: optionDisabled, indicator: indicator, invalid: hasError, invalidLabel: invalidLabel ?? error, kind: "radio", label: item.label, labelContent: renderLabel?.(item), ...(item.action ? { action: item.action } : {}), leading: item.leading, onActivate: () => setSelected(item.value), webTabIndex: !optionDisabled && !readOnly && item.value === webTabStop ? 0 : -1, presentation: presentation, readOnly: readOnly, readOnlyLabel: readOnlyLabel, renderIndicator: renderIndicator ? (props) => renderIndicator(item, props) : undefined, renderLeading: renderLeading ? (props) => renderLeading(item, props) : undefined, required: required, requiredLabel: requiredLabel, size: size }));
        }) }));
}
/** Validated controlled/uncontrolled checkbox collection using immutable Sets. */
export function CheckboxGroup({ label, accessibilityLabel, items, value, defaultValue = new Set(), onValueChange, required = false, disabled = false, readOnly = false, invalid = false, description, error, requiredLabel, readOnlyLabel, invalidLabel, orientation = selectionGroupBehaviorDefaults.orientation, grid, presentation = selectionGroupRecipe.defaults.presentation, overflow = selectionGroupRecipe.overflow.default, size = selectionControlRecipe.defaults.size, indicator = "default", renderLeading, renderIndicator, layoutStyle, ...slotStyles }) {
    validateSelectionItems(items);
    if (overflow === "scroll" && (presentation !== "chips" || grid)) {
        throw new TypeError('CheckboxGroup overflow="scroll" requires presentation="chips" without grid');
    }
    const rail = useChipRail(overflow === "scroll");
    if (value !== undefined)
        validateCheckboxSelection(items, value);
    const [storedValue, setSelected] = useControllableState({
        ...(value === undefined ? {} : { value }),
        defaultValue,
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    const selected = reconcileCheckboxSelection(items, storedValue);
    useEffect(() => {
        if (value === undefined && selected !== storedValue)
            setSelected(selected);
    }, [selected, setSelected, storedValue, value]);
    const hasError = invalid || error !== undefined;
    return (_jsx(ChoiceGroupFrame, { accessibilityLabel: accessibilityLabel, description: description, disabled: disabled, error: error, label: label, orientation: orientation, grid: grid, presentation: presentation, readOnly: readOnly, readOnlyLabel: readOnlyLabel, required: required, requiredLabel: requiredLabel, layoutStyle: layoutStyle, rail: rail, children: items.map((item) => {
            const optionDisabled = disabled || item.disabled === true;
            const optionSelected = selected.has(item.id);
            return (_createElement(ChoiceRow, { ...slotStyles, key: item.id, checked: optionSelected, description: item.description, disabled: optionDisabled, indicator: indicator, invalid: hasError, invalidLabel: invalidLabel ?? error, kind: "checkbox", label: item.label, onActivate: () => setSelected(toggleCheckboxSelection(items, selected, item.id)), presentation: presentation, readOnly: readOnly, readOnlyLabel: readOnlyLabel, renderIndicator: renderIndicator ? (props) => renderIndicator(item, props) : undefined, renderLeading: renderLeading ? (props) => renderLeading(item, props) : undefined, required: required, requiredLabel: requiredLabel, size: size, onRailLayout: rail?.itemLayout(item.id), onRailFocus: rail ? () => rail.reveal(item.id) : undefined }));
        }) }));
}
export function Switch({ label, labelVisibility = "visible", presentation = switchRecipe.presentationDefaults.native, testID, description, size = switchRecipe.defaults.size, checked, defaultChecked, onCheckedChange, disabled = false, accessibilityLabel, accessibilityHint, layoutStyle, ...props }) {
    assertNoRemovedStyleProps("Switch", props, ["style"]);
    // Reject old JavaScript callers rather than silently dropping their controlled state.
    if (["value", "defaultValue", "onValueChange"].some(key => key in props)) {
        throw new TypeError("Switch no longer accepts value/defaultValue/onValueChange; use checked/defaultChecked/onCheckedChange");
    }
    const { colors, environment, ...nativeTheme } = useHjmNativeTheme();
    const dimensions = switchRecipe.sizes[size];
    const stacked = presentation === "row" && labelVisibility === "visible"
        && environment.textScale >= switchRecipe.stackedTextScale;
    // The platform Switch takes fills only — it has no border hook — so the recipe's
    // `*Border` slots stay web-only. The fills themselves are read from the recipe
    // rather than re-picked here; hardcoding them is how `trackOn` drifted from the
    // contract in the first place.
    const twoLine = Boolean(description) && labelVisibility === "visible";
    const switchColors = switchRecipe.colors;
    const palette = nativeTheme.palette;
    const trackOff = resolveColorReference(disabled ? switchColors.trackOffDisabled : switchColors.trackOff, palette);
    const trackOn = resolveColorReference(disabled ? switchColors.trackOnDisabled : switchColors.trackOn, palette);
    const thumb = resolveColorReference(disabled ? switchColors.thumbDisabled : switchColors.thumbOff, palette);
    const [enabled, setEnabled] = useControllableState({
        ...(checked === undefined ? {} : { value: checked }),
        defaultValue: (defaultChecked ?? false),
        ...(onCheckedChange === undefined
            ? {}
            : { onChange: onCheckedChange }),
    });
    return (_jsxs(Pressable, { testID: testID, accessibilityHint: accessibilityHint ?? description, accessibilityLabel: accessibilityLabel ?? label, accessibilityRole: "switch", accessibilityState: { checked: enabled, disabled }, ...webOnly(webChoiceProps({ kind: "checkbox", checked: enabled, disabled, readOnly: false,
            onActivate: () => setEnabled(!enabled) })), disabled: disabled, onPress: () => setEnabled(!enabled), style: ({ pressed }) => [
            minimumTargetStyle,
            {
                alignItems: stacked ? "flex-start" : "center",
                alignSelf: presentation === "row" ? "stretch" : "flex-start",
                direction: environment.direction,
                flexDirection: stacked ? "column" : "row",
                gap: spacing.sm,
                // A described row pads its copy (switchRecipe.rowPaddingVertical) so stacked rows need no gap;
                // a hidden label (ListRow trailing) keeps the single control height, as on Web.
                minHeight: twoLine
                    ? switchRecipe.rowTwoLineMinHeight
                    : switchRecipe.rowMinHeight,
                paddingVertical: twoLine ? switchRecipe.rowPaddingVertical : 0,
                opacity: pressed ? switchRecipe.states.pressedOpacity : 1,
            },
            layoutStyle,
        ], children: [labelVisibility === "visible" ? _jsxs(View, { style: {
                    flex: stacked || presentation === "inline" ? undefined : 1,
                    gap: spacing.xxs,
                    opacity: disabled ? switchRecipe.states.disabledOpacity : 1,
                }, children: [_jsx(Text, { fontRole: "ui", tone: "body", variant: presentation === "row" ? switchRecipe.rowLabelTextVariant : "bodyLarge", children: label }), description ? (_jsx(Text, { tone: "muted", variant: "caption", children: description })) : null] }) : null, isWebRenderer ? _jsx(View, { ...props, "aria-hidden": true, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", pointerEvents: "none", style: { width: dimensions.width, height: dimensions.height, flexDirection: "row", alignItems: "center",
                    justifyContent: enabled ? "flex-end" : "flex-start", direction: environment.direction,
                    borderRadius: dimensions.height / 2, borderWidth: 1, padding: dimensions.inset - 1,
                    borderColor: resolveColorReference(disabled ? enabled ? switchColors.trackOnBorderDisabled : switchColors.trackOffBorderDisabled : enabled ? switchColors.trackOnBorder : switchColors.trackOffBorder, palette),
                    backgroundColor: enabled ? trackOn : trackOff }, children: _jsx(View, { style: { width: dimensions.thumb, height: dimensions.thumb, borderRadius: dimensions.thumb / 2,
                        borderWidth: enabled && !disabled ? 0 : 1,
                        borderColor: resolveColorReference(disabled ? switchColors.thumbDisabledBorder : switchColors.thumbOffBorder, palette),
                        backgroundColor: resolveColorReference(disabled ? switchColors.thumbDisabled : enabled ? switchColors.thumbOn : switchColors.thumbOff, palette) } }) }) : _jsx(NativeSwitch, { ...props, accessible: false, disabled: disabled, ios_backgroundColor: trackOff, pointerEvents: "none", style: Platform.OS === "ios"
                    ? { alignSelf: stacked ? "flex-start" : "center" }
                    : { height: dimensions.height, width: dimensions.width }, thumbColor: thumb, trackColor: { false: trackOff, true: trackOn }, value: enabled })] }));
}
function NativeSelectionHighlight({ rect, selection, reducedMotion, pills, disabled, brand }) {
    const theme = useHjmNativeTheme();
    const positions = useRef({ x: new Animated.Value(rect.x), y: new Animated.Value(rect.y), width: new Animated.Value(rect.width), height: new Animated.Value(rect.height) }).current;
    const previousSelection = useRef(selection);
    useEffect(() => {
        const keys = ["x", "y", "width", "height"];
        const settle = () => { for (const key of keys) {
            positions[key].stopAnimation();
            positions[key].setValue(rect[key]);
        } };
        const changed = previousSelection.current !== selection;
        previousSelection.current = selection;
        if (!changed || reducedMotion || AppState.currentState !== "active") {
            settle();
            return;
        }
        // Width/height must follow measured text and wrapping, so use the layout
        // driver instead of scaling labels or assuming equal-width index positions.
        // The curve matches CSS ease-out; RN's implicit ease-in-out would drift from Web.
        const animations = keys.map(key => Animated.timing(positions[key], { toValue: rect[key], duration: motionTiming.normal, easing: Easing.bezier(0, 0, 0.58, 1), useNativeDriver: false }));
        animations.forEach(animation => animation.start());
        const sub = AppState.addEventListener("change", state => { if (state !== "active")
            settle(); });
        return () => { animations.forEach(animation => animation.stop()); sub.remove(); };
    }, [rect.x, rect.y, rect.width, rect.height, selection, reducedMotion, positions]);
    return _jsx(Animated.View, { pointerEvents: "none", accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { position: "absolute", left: positions.x, top: positions.y, width: positions.width, height: positions.height, borderRadius: pills ? segmentedControlRecipe.pills.radius : theme.tokens.radius[segmentedControlRecipe.item.radius], backgroundColor: resolveColorReference(brand ? segmentedControlRecipe.selectedBrand.background : pills ? segmentedControlRecipe.pills.selectedBackground : segmentedControlRecipe.item.selectedBackground, theme.palette), borderColor: resolveColorReference(segmentedControlRecipe.item.selectedBorder, theme.palette), borderWidth: pills ? 0 : segmentedControlRecipe.item.selectedBorderWidth, opacity: disabled ? segmentedControlRecipe.item.disabledOpacity : 1 } });
}
export function SegmentedControl(props) {
    const { label, items, value, defaultValue, onValueChange, size = segmentedControlRecipe.defaults.size, presentation = "connected", 
    // Match Web's brand-filled default (2026-10-23 user review); neutral remains opt-in.
    selectionTone = "brand", textEmphasis = "strong", selectionMotion: suppliedSelectionMotion, disabled = false, layoutStyle, overflow = "wrap", actions, testID, } = props;
    // Removed aliases must not silently change the selected collection in JavaScript callers.
    if ("options" in props || !Array.isArray(items))
        throw new TypeError("SegmentedControl requires items; options was removed");
    const pills = presentation === "pills";
    const textOnly = presentation === "text";
    const resolvedItems = items;
    const theme = useHjmNativeTheme();
    const { environment } = theme;
    const sizeContract = segmentedControlRecipe.sizes[size];
    // Pills keep their row at large text (segmentedControlRecipe.pills.largeTextLayout, 1.13.1): they wrap in a
    // block and stay one line in a rail. Stacking them made a filter rail a ~440pt column (utilverse, 2026-10-06).
    const stacked = !pills && !textOnly && segmentedControlRecipe.adaptive.largeTextLayout === "stacked"
        && environment.textScale >= segmentedControlRecipe.adaptive.stackAtFontScale;
    // Connected options sit inside the track, so the option height is the shared control height minus the track
    // inset; the outer box then matches Button/Chip of the same size (segmentedControlRecipe.sizes, 2026-10-17).
    // Vertical-only slop restores the 44 target; options are 4 apart, so horizontal slop would overlap a neighbour.
    const outerHeight = visibleControlHeight(sizeContract.height, environment.minimumVisualTarget);
    // Stacked rows (large text) sit 4 apart vertically, so each option keeps a full 44 box and no slop instead.
    const itemMinHeight = stacked ? control.minTouchTarget
        : outerHeight - 2 * (segmentedControlRecipe.container.padding + segmentedControlRecipe.container.borderWidth);
    const outerSlop = Math.max(0, (control.minTouchTarget - outerHeight) / 2);
    const itemHitSlop = Math.max(0, (control.minTouchTarget - itemMinHeight) / 2);
    const descriptors = resolvedItems.map((item) => ({
        id: item.value,
        label: item.label,
        ...(item.disabled === undefined ? {} : { disabled: item.disabled }),
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
    const [itemRects, setItemRects] = useState({});
    const selectedRect = itemRects[selected];
    const selectionMotion = textOnly ? "none" : suppliedSelectionMotion ?? theme.designProfile?.interactions.selectionMotion ?? "none";
    const movingHighlight = selectionMotion === "slide" && selectedRect !== undefined;
    const highlightRect = selectedRect && pills ? { ...selectedRect, y: selectedRect.y + segmentedControlRecipe.pills.inset, height: selectedRect.height - 2 * segmentedControlRecipe.pills.inset } : selectedRect;
    // Connected rows follow Web .hjm-segmented__items: items never shrink below their label (min-inline-size:
    // max-content), spare width is shared, and an over-wide row scrolls instead of breaking labels mid-word
    // (2026-10-17 review N6). Labels are not truncated; the horizontal scroll content leaves them unconstrained.
    const scrollRow = overflow === "scroll" || (!stacked && !pills && !textOnly);
    const [trackWidth, setTrackWidth] = useState(0);
    const railRef = useRef(null);
    const railOffset = useRef(0);
    const reveal = (rect) => {
        if (!scrollRow || !rect || trackWidth <= 0)
            return;
        const offset = railOffset.current;
        const next = resolveScrollRevealOffset(offset, trackWidth, rect.x, rect.width);
        if (next !== offset) {
            railOffset.current = next;
            railRef.current?.scrollTo({ x: next, animated: false });
        }
    };
    useEffect(() => { reveal(selectedRect); }, [selectedRect, trackWidth, scrollRow]);
    const borderWidth = pills || textOnly ? 0 : segmentedControlRecipe.container.borderWidth;
    const containerStyle = {
        backgroundColor: pills || textOnly ? "transparent" : resolveColorReference(segmentedControlRecipe.container.background, theme.palette),
        borderColor: resolveColorReference(segmentedControlRecipe.container.border, theme.palette),
        borderRadius: theme.tokens.radius[segmentedControlRecipe.container.radius],
        borderWidth,
        direction: environment.direction,
    };
    const rowStyle = {
        flexDirection: stacked ? "column" : "row",
        flexWrap: pills && !scrollRow ? "wrap" : "nowrap",
        gap: textOnly ? segmentedControlRecipe.text.gap : pills ? segmentedControlRecipe.pills.gap : segmentedControlRecipe.container.gap,
        padding: pills || textOnly ? 0 : segmentedControlRecipe.container.padding,
    };
    const content = (_jsxs(_Fragment, { children: [movingHighlight && highlightRect ? _jsx(NativeSelectionHighlight, { rect: highlightRect, selection: selected, reducedMotion: environment.reducedMotion, pills: pills, disabled: disabled, brand: selectionTone === "brand" }) : null, resolvedItems.map((item) => {
                const isSelected = item.value === selected;
                const optionDisabled = disabled || item.disabled === true;
                const contentColor = resolveColorReference(isSelected
                    ? (selectionTone === "brand" && !textOnly ? segmentedControlRecipe.selectedBrand.content : pills ? segmentedControlRecipe.pills.selectedContent : segmentedControlRecipe.item.selectedContent)
                    : segmentedControlRecipe.item.idleContent, theme.palette);
                const leading = item.leading ?? item.renderLeading?.({
                    selected: isSelected,
                    disabled: optionDisabled,
                    color: textOnly ? (isSelected ? theme.colors.text : theme.colors.textMuted) : contentColor,
                    size: glyph.sm,
                });
                return (_jsxs(Pressable, { onFocus: () => reveal(itemRects[item.value]), onLayout: selectionMotion === "slide" || scrollRow ? event => {
                        const { x, y, width, height } = event.nativeEvent.layout;
                        if (width <= 0 || height <= 0)
                            return;
                        setItemRects(previous => {
                            const old = previous[item.value];
                            return old && old.x === x && old.y === y && old.width === width && old.height === height ? previous : { ...previous, [item.value]: { x, y, width, height } };
                        });
                    } : undefined, accessibilityLabel: item.accessibilityLabel ?? item.label, accessibilityRole: "radio", accessibilityState: { checked: isSelected, disabled: optionDisabled }, ...webOnly(webChoiceProps({ kind: "radio", checked: isSelected, disabled: optionDisabled,
                        readOnly: false, tabIndex: isSelected && !optionDisabled ? 0 : -1,
                        onActivate: () => setSelected(item.value) })), disabled: optionDisabled, hitSlop: pills || textOnly ? undefined : { top: itemHitSlop, bottom: itemHitSlop }, onPress: () => setSelected(item.value), style: ({ pressed }) => [
                        {
                            alignItems: "center",
                            backgroundColor: !textOnly && !movingHighlight && !pills && isSelected
                                ? resolveColorReference(selectionTone === "brand" ? segmentedControlRecipe.selectedBrand.background : segmentedControlRecipe.item.selectedBackground, theme.palette)
                                : "transparent",
                            borderColor: isSelected && !movingHighlight
                                ? resolveColorReference(segmentedControlRecipe.item.selectedBorder, theme.palette)
                                : "transparent",
                            borderRadius: theme.tokens.radius[segmentedControlRecipe.item.radius],
                            borderWidth: !textOnly && !pills && isSelected
                                ? segmentedControlRecipe.item.selectedBorderWidth
                                : 0,
                            flexBasis: scrollRow ? "auto" : undefined,
                            flexGrow: scrollRow && !pills && !textOnly ? 1 : undefined,
                            flexShrink: scrollRow ? 0 : undefined,
                            maxWidth: pills ? "100%" : undefined,
                            // Leading artwork and its label share a row; column layout squeezed theme options.
                            flexDirection: textOnly ? "column" : "row",
                            gap: segmentedControlRecipe.item.gap,
                            justifyContent: "center",
                            minHeight: pills ? Math.max(segmentedControlRecipe.pills.minHeight, outerHeight + 2 * segmentedControlRecipe.pills.inset) : textOnly ? segmentedControlRecipe.text.minHeight : itemMinHeight,
                            opacity: optionDisabled
                                ? segmentedControlRecipe.item.disabledOpacity
                                : pressed
                                    ? segmentedControlRecipe.item.pressedOpacity
                                    : 1,
                            paddingHorizontal: textOnly ? 0 : pills ? segmentedControlRecipe.pills.paddingHorizontal[size] : sizeContract.paddingHorizontal,
                            paddingVertical: pills ? segmentedControlRecipe.pills.inset : undefined,
                            width: stacked ? "100%" : undefined,
                        },
                    ], children: [pills ? _jsx(View, { pointerEvents: "none", accessible: false, style: { position: "absolute", left: 0, right: 0, top: segmentedControlRecipe.pills.inset, bottom: segmentedControlRecipe.pills.inset, borderRadius: segmentedControlRecipe.pills.radius, backgroundColor: isSelected ? (movingHighlight ? "transparent" : resolveColorReference(selectionTone === "brand" ? segmentedControlRecipe.selectedBrand.background : segmentedControlRecipe.pills.selectedBackground, theme.palette)) : resolveColorReference(segmentedControlRecipe.pills.background, theme.palette), borderWidth: segmentedControlRecipe.pills.borderWidth, borderColor: resolveColorReference(isSelected ? (selectionTone === "brand" ? segmentedControlRecipe.selectedBrand.background : segmentedControlRecipe.pills.selectedBackground) : segmentedControlRecipe.pills.border, theme.palette) } }) : null, leading ? (_jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", children: leading })) : null, _jsx(Text, { fontRole: "ui", align: "center", style: {
                                color: textOnly ? (isSelected ? theme.colors.text : theme.colors.textMuted) : contentColor,
                                fontWeight: textOnly ? segmentedControlRecipe.text[textEmphasis][isSelected ? "selected" : "idle"] : isSelected
                                    ? segmentedControlRecipe.item.selectedFontWeight
                                    : segmentedControlRecipe.item.fontWeight,
                            }, tone: isSelected ? "brand" : "muted", variant: textOnly ? "bodyLarge" : pills ? segmentedControlRecipe.pills.textVariant : sizeContract.textVariant, children: item.label }), textOnly ? _jsx(View, { accessible: false, style: { width: segmentedControlRecipe.text.indicatorWidth, height: segmentedControlRecipe.text.indicatorHeight, borderRadius: segmentedControlRecipe.text.indicatorRadius, backgroundColor: isSelected ? theme.colors.contentBrand : "transparent" } }) : null] }, item.value));
            })] }));
    // The scroller clips its content, so it reaches `outerSlop` past the 36 track on each block side (negative
    // margin, no layout growth) and the options' vertical slop can complete the 44 target like Chip's hitSlop.
    // An explicit flexGrow:0 overrides Yoga's flex:1 shorthand. Apply it only without actions,
    // otherwise the radio rail collapses to zero while its fixed actions remain visible.
    const group = scrollRow ? (_jsx(View, { accessibilityLabel: label, accessibilityRole: "radiogroup", testID: actions == null ? testID : undefined, style: [actions == null ? { flexGrow: 0 } : { flex: 1, minWidth: 0 }, actions == null ? layoutStyle : undefined], children: _jsx(ScrollView, { ref: railRef, horizontal: true, keyboardShouldPersistTaps: "handled", onScroll: event => { railOffset.current = event.nativeEvent.contentOffset.x; }, scrollEventThrottle: 16, showsHorizontalScrollIndicator: false, onLayout: event => setTrackWidth(event.nativeEvent.layout.width), style: { direction: "ltr", flexGrow: 0, marginVertical: pills || textOnly ? 0 : -outerSlop }, contentContainerStyle: { minWidth: pills || textOnly ? undefined : trackWidth, paddingVertical: pills || textOnly ? 0 : outerSlop }, children: _jsx(View, { style: [containerStyle, rowStyle, { flexGrow: 1 }], children: content }) }) })) : (_jsx(View, { accessibilityLabel: label, accessibilityRole: "radiogroup", testID: actions == null ? testID : undefined, style: [containerStyle, rowStyle, actions == null ? layoutStyle : { flex: 1, minWidth: 0 }], children: content }));
    // Actions are siblings, not radio options, and stay visible while the filter row scrolls (Spint spot rail).
    return actions == null ? group : _jsxs(View, { testID: testID, style: [{ flexDirection: "row", direction: environment.direction, alignItems: "center", gap: spacing.xs }, layoutStyle], children: [group, actions] });
}
/** Action/filter chip with role-specific, controlled selection semantics. */
/** Forwards the host View ref so a chip can be a focus-return target (2026-10-16, DiscoveryGallery). */
export const Chip = forwardRef(function Chip({ label, size = chipRecipe.defaults.size, disabled = false, leading, trailing, accessibilityLabel, accessibilityHint, layoutStyle, leadingStyle, indicatorStyle, trailingStyle, renderSelectionIndicator, selectionMode = "action", selected, onPress, }, ref) {
    const theme = useHjmNativeTheme();
    const selectable = selectionMode !== "action";
    const active = selectable && selected === true;
    const metrics = chipRecipe.sizes[size];
    const presentation = chipRecipe.states[active ? "selected" : "idle"];
    const contentColor = resolveColorReference(presentation.content, theme.palette);
    const indicatorColor = resolveColorReference(chipRecipe.selectionIndicator.color, theme.palette);
    const role = selectionMode === "single" ? "radio" : selectionMode === "multiple" ? "checkbox" : "button";
    return (_jsxs(Pressable, { ref: ref, accessibilityHint: accessibilityHint, accessibilityLabel: accessibilityLabel ?? label, accessibilityRole: role, accessibilityState: selectable ? { checked: active, disabled } : { disabled }, ...webOnly(selectable
            ? webChoiceProps({
                kind: role === "radio" ? "radio" : "checkbox",
                checked: active,
                disabled,
                readOnly: false,
                // Chip's controlled handler needs the press event, so Space
                // re-enters the element's own DOM click path instead of calling
                // the handler with a synthesised one.
                onActivate: (element) => element.click(),
                ...(role === "radio" ? { tabIndex: active && !disabled ? 0 : -1 } : {}),
            })
            : { "aria-disabled": disabled }), disabled: disabled, hitSlop: metrics.hitSlop, onPress: (event) => {
            if (selectionMode === "action") {
                onPress(event);
            }
            else {
                onPress(!active, event);
            }
        }, style: ({ pressed }) => [
            {
                alignItems: "center",
                alignSelf: "flex-start",
                backgroundColor: resolveColorReference(presentation.background, theme.palette),
                borderColor: resolveColorReference(presentation.border, theme.palette),
                borderRadius: theme.tokens.radius[chipRecipe.radius],
                borderWidth: chipRecipe.borderWidth,
                direction: theme.environment.direction,
                flexDirection: "row",
                gap: metrics.gap,
                // A floor, not a fixed height, as Button does for text content and as Web `.hjm-chip` already does
                // (min-block-size): the fixed 36 clipped the filter-trigger and suggested-query labels at accessibility-large
                // (utilverse 1.13.0 adoption, 2026-10-06). At 1x the label fits, so the chip is still 36.
                minHeight: visibleControlHeight(metrics.height, theme.environment.minimumVisualTarget),
                opacity: disabled
                    ? chipRecipe.states.disabledOpacity
                    : pressed
                        ? chipRecipe.states.pressedOpacity
                        : 1,
                paddingHorizontal: metrics.paddingHorizontal,
            },
            layoutStyle,
        ], children: [leading ? _jsx(View, { accessible: false, style: leadingStyle, children: leading }) : null, active ? (_jsx(View, { accessible: false, style: indicatorStyle, children: renderSelectionIndicator ? (renderSelectionIndicator({
                    selected: active,
                    color: indicatorColor,
                    size: glyph[chipRecipe.selectionIndicator.glyph],
                })) : (
                // Like Checkbox, the selection mark fits a fixed glyph slot; the chip label still scales.
                _jsx(NativeText, { accessible: false, allowFontScaling: false, style: { ...typography.caption, color: indicatorColor }, children: "\u2713" })) })) : null, _jsx(Text, { fontRole: "ui", align: "center", style: [
                    {
                        color: contentColor,
                        // Shrink beside the leading glyph and selection mark so a long label wraps inside the chip (chip.md: labels
                        // wrap). At its natural width the label plus the glyphs overran the chip (2026-10-23 flex audit).
                        flexShrink: 1,
                        fontWeight: active
                            ? chipRecipe.label.selectedFontWeight
                            : chipRecipe.label.fontWeight,
                    },
                ], variant: metrics.textVariant, children: label }), trailing ? _jsx(View, { accessible: false, style: trailingStyle, children: trailing }) : null] }));
});
//# sourceMappingURL=inputs.js.map