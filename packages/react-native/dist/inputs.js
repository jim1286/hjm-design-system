import { createElement as _createElement } from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { resolveColorReference } from "@hjm/design-contracts/color-references";
import { glyph, radius, spacing, typography } from "@hjm/design-contracts/foundations";
import { fieldRecipe, } from "@hjm/design-contracts/recipes/base";
import { chipRecipe, searchFieldRecipe, segmentedControlRecipe, selectionControlRecipe, selectionGroupRecipe, switchRecipe, } from "@hjm/design-contracts/recipes";
import { getCheckboxNextState, reconcileCheckboxSelection, resolveControlAccessibleName, resolveInitialRadioValue, resolveInitialTabValue, reconcileRadioSelection, selectionGroupBehaviorDefaults, toggleCheckboxSelection, validateCheckboxSelection, validateRadioSelection, validateSelectionItems, } from "@hjm/design-contracts/behaviors";
import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Switch as NativeSwitch, TextInput, View, } from "react-native";
import { useControllableState } from "./internal/state.js";
import { logicalTextAlign, minimumTargetStyle, resolveNativeTextScaleProps, } from "./internal/styles.js";
import { Text } from "./primitives.js";
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
function FieldMessage({ error, supportText }) {
    if (!error && !supportText)
        return null;
    return (_jsx(Text, { accessibilityLiveRegion: error ? "assertive" : "none", tone: error ? "danger" : "muted", variant: fieldRecipe.support.textVariant, children: error ?? supportText }));
}
const FieldRenderer = forwardRef(function FieldRenderer({ label, value, defaultValue = "", onValueChange, supportText, error, required = false, disabled = false, busy = false, variant = fieldRecipe.defaults.variant, shape, accessibilityLabel, inputStyle, containerStyle, allowFontScaling, multiline, search, searchSize = searchFieldRecipe.defaults.size, leading, trailing, onBlur, onFocus, ...props }, ref) {
    const theme = useHjmNativeTheme();
    const { colors, environment, textScaling } = theme;
    const [focused, setFocused] = useState(false);
    const [currentValue, setCurrentValue] = useControllableState({
        ...(value === undefined ? {} : { value }),
        defaultValue,
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    const hint = error ?? supportText;
    const { accessibleName, visibleLabel } = resolveFieldAccessibleName(label, accessibilityLabel);
    const resolvedShape = shape ?? (search ? searchFieldRecipe.defaults.shape : fieldRecipe.defaults.shape);
    const searchSizing = searchFieldRecipe.sizes[searchSize];
    const minHeight = multiline
        ? fieldRecipe.multilineMinHeight
        : search
            ? searchSizing.minHeight
            : fieldRecipe.minHeight;
    const borderWidth = search ? searchFieldRecipe.borderWidth : fieldRecipe.borderWidth;
    const borderColor = search
        ? resolveColorReference(error
            ? searchFieldRecipe.colors.invalid
            : focused
                ? searchFieldRecipe.colors.focus
                : searchFieldRecipe.colors.border, theme.palette)
        : colors[error
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
    const textStyle = typography[search ? searchSizing.textVariant : fieldRecipe.textVariant];
    const controlRadius = radius[search ? searchFieldRecipe.shapes[resolvedShape] : fieldRecipe.shapes[resolvedShape]];
    const inputTextScaleProps = resolveNativeTextScaleProps(textScaling, [
        {
            color: search
                ? resolveColorReference(searchFieldRecipe.colors.content, theme.palette)
                : colors.text,
            flex: 1,
            fontSize: textStyle.fontSize,
            fontWeight: textStyle.fontWeight,
            lineHeight: textStyle.lineHeight,
            minHeight: minHeight - (borderWidth * 2),
            paddingHorizontal: 0,
            paddingVertical: fieldRecipe.paddingVertical,
            textAlign: logicalTextAlign(environment.direction),
            textAlignVertical: multiline ? "top" : "center",
        },
        inputStyle,
    ], allowFontScaling);
    return (_jsxs(View, { style: [
            {
                gap: fieldRecipe.label.gap,
                opacity: disabled
                    ? search
                        ? searchFieldRecipe.states.disabledOpacity
                        : fieldRecipe.disabledOpacity
                    : 1,
            },
            containerStyle,
        ], children: [visibleLabel ? (_jsxs(Text, { style: {
                    color: colors[fieldRecipe.label.color],
                    fontWeight: fieldRecipe.label.fontWeight,
                }, tone: "body", variant: fieldRecipe.label.textVariant, children: [visibleLabel, required ? " *" : ""] })) : null, _jsxs(View, { style: { gap: fieldRecipe.support.gap }, children: [_jsxs(View, { style: {
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
                        }, children: [leading ? (_jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", children: leading })) : null, _jsx(TextInput, { ...props, ...inputTextScaleProps, ref: ref, accessibilityHint: hint, accessibilityLabel: accessibleName, accessibilityRole: search ? "search" : undefined, accessibilityState: { busy, disabled }, editable: !disabled && !busy, multiline: multiline, onBlur: (event) => {
                                    setFocused(false);
                                    onBlur?.(event);
                                }, onChangeText: setCurrentValue, onFocus: (event) => {
                                    setFocused(true);
                                    onFocus?.(event);
                                }, placeholderTextColor: placeholderColor, value: currentValue }), trailing] }), _jsx(FieldMessage, { ...(error === undefined ? {} : { error }), ...(supportText === undefined ? {} : { supportText }) })] })] }));
});
export const TextField = forwardRef(function TextField(props, ref) {
    return _jsx(FieldRenderer, { ...props, ref: ref, multiline: false, search: false });
});
export const TextArea = forwardRef(function TextArea(props, ref) {
    return _jsx(FieldRenderer, { ...props, ref: ref, multiline: true, search: false });
});
export const SearchField = forwardRef(function SearchField({ clearLabel, busyLabel, onClear, leading: leadingNode, trailing: trailingNode, renderLeading, renderClearIcon, renderBusyIndicator, value, defaultValue, onValueChange, size = searchFieldRecipe.defaults.size, busy = false, disabled = false, ...props }, ref) {
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
        }, children: renderBusyIndicator?.(iconProps) ?? (_jsx(ActivityIndicator, { color: iconProps.color, size: iconProps.size })) })) : searchValue.length > 0 ? (_jsx(Pressable, { accessibilityLabel: clearLabel, accessibilityRole: "button", disabled: disabled, hitSlop: searchSizing.clearHitSlop, onPress: () => {
            setSearchValue("");
            onClear?.();
        }, style: {
            alignItems: "center",
            height: searchSizing.clearDiameter,
            justifyContent: "center",
            width: searchSizing.clearDiameter,
        }, children: renderClearIcon?.(iconProps) ?? (_jsx(Text, { align: "center", style: { fontSize: iconProps.size, lineHeight: iconProps.size }, tone: "muted", children: "\u00D7" })) })) : trailingNode;
    return (_jsx(FieldRenderer, { ...props, ref: ref, busy: busy, disabled: disabled, leading: leading, multiline: false, onValueChange: (next) => {
            if (!busy && !disabled)
                setSearchValue(next);
        }, search: true, searchSize: size, trailing: trailing, value: searchValue }));
});
function ChoiceRow({ kind, label, description, checked, disabled, readOnly, required, invalid, readOnlyLabel, requiredLabel, invalidLabel, accessibilityHint, presentation = selectionControlRecipe.defaults.presentation, size = selectionControlRecipe.defaults.size, indicator = "default", leading, renderLeading, renderIndicator, onActivate, style, controlStyle, indicatorStyle, leadingStyle, contentStyle, labelStyle, descriptionStyle, }) {
    const theme = useHjmNativeTheme();
    const metrics = selectionControlRecipe.sizes[size];
    const plate = selectionControlRecipe.presentations[presentation];
    const selected = checked === true || checked === "mixed";
    const indicatorColor = resolveColorReference(selectionControlRecipe.states.indicator, theme.palette);
    const appearance = {
        checked,
        selected,
        disabled,
        readOnly,
        color: indicatorColor,
        size: metrics.control,
    };
    const resolvedLeading = leading ?? renderLeading?.(appearance);
    const plateBackground = selected
        ? selectionControlRecipe.states.selectedBackground
        : plate.background ?? selectionControlRecipe.states.idleBackground;
    const plateBorder = invalid
        ? selectionControlRecipe.states.invalidBorder
        : selected
            ? selectionControlRecipe.states.selectedBorder
            : plate.border;
    const controlBorder = invalid
        ? selectionControlRecipe.states.invalidBorder
        : selected
            ? selectionControlRecipe.states.checkedBorder
            : selectionControlRecipe.states.idleBorder;
    const resolvedHint = [
        accessibilityHint ?? description,
        required ? requiredLabel : undefined,
        readOnly ? readOnlyLabel : undefined,
        invalid ? invalidLabel : undefined,
    ].filter(Boolean).join(". ") || undefined;
    const defaultIndicator = kind === "radio" ? (checked === true ? (_jsx(View, { style: {
            backgroundColor: indicatorColor,
            borderRadius: radius.full,
            height: metrics.control * selectionControlRecipe.radioDotRatio,
            width: metrics.control * selectionControlRecipe.radioDotRatio,
        } })) : null) : checked === "mixed" ? (_jsx(Text, { accessible: false, align: "center", style: { color: indicatorColor }, variant: "label", children: "\u2212" })) : checked ? (_jsx(Text, { accessible: false, align: "center", style: { color: indicatorColor }, variant: "label", children: "\u2713" })) : null;
    return (_jsxs(Pressable, { accessibilityHint: resolvedHint, accessibilityLabel: label, accessibilityRole: kind, accessibilityState: { checked, disabled: disabled || readOnly }, disabled: disabled || readOnly, hitSlop: plate.useSizePadding ? 0 : metrics.hitSlop, onPress: () => {
            if (!readOnly)
                onActivate();
        }, style: ({ pressed }) => [
            {
                alignItems: "center",
                alignSelf: "stretch",
                backgroundColor: resolveColorReference(plateBackground, theme.palette),
                borderColor: plateBorder
                    ? resolveColorReference(plateBorder, theme.palette)
                    : "transparent",
                borderRadius: radius[plate.radius],
                borderWidth: plate.borderWidth,
                direction: theme.environment.direction,
                flexDirection: "row",
                gap: metrics.gap,
                minHeight: metrics.rowMinHeight,
                opacity: disabled
                    ? selectionControlRecipe.states.disabledOpacity
                    : pressed && !readOnly
                        ? 0.86
                        : 1,
                paddingHorizontal: plate.useSizePadding ? metrics.paddingHorizontal : 0,
                paddingVertical: plate.useSizePadding ? metrics.paddingVertical : 0,
            },
            style,
        ], children: [indicator === "default" ? (_jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", style: [
                    {
                        alignItems: "center",
                        backgroundColor: resolveColorReference(selected
                            ? selectionControlRecipe.states.checkedBackground
                            : selectionControlRecipe.states.idleBackground, theme.palette),
                        borderColor: resolveColorReference(controlBorder, theme.palette),
                        borderRadius: radius[selectionControlRecipe.shapes[kind]],
                        borderWidth: 1,
                        height: metrics.control,
                        justifyContent: "center",
                        width: metrics.control,
                    },
                    controlStyle,
                ], children: _jsx(View, { style: indicatorStyle, children: renderIndicator?.(appearance) ?? defaultIndicator }) })) : null, resolvedLeading ? (_jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", style: leadingStyle, children: resolvedLeading })) : null, _jsxs(View, { style: [{ flex: 1, gap: spacing.xxs, minWidth: 0 }, contentStyle], children: [_jsx(Text, { style: [
                            {
                                color: resolveColorReference(selectionControlRecipe.label.color, theme.palette),
                                fontWeight: selected
                                    ? selectionControlRecipe.label.checkedFontWeight
                                    : selectionControlRecipe.label.fontWeight,
                            },
                            labelStyle,
                        ], variant: metrics.labelVariant, children: label }), description ? (_jsx(Text, { style: [
                            {
                                color: resolveColorReference(selectionControlRecipe.description.color, theme.palette),
                            },
                            descriptionStyle,
                        ], variant: metrics.descriptionVariant, children: description })) : null] })] }));
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
function ChoiceGroupFrame({ label, accessibilityLabel, required, requiredLabel, readOnly, readOnlyLabel, disabled, description, error, role, orientation, presentation, style, children, }) {
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
    return (_jsxs(View, { accessibilityHint: [error ?? description, readOnly ? readOnlyLabel : undefined]
            .filter(Boolean).join(". ") || undefined, accessibilityLabel: announcedName, accessibilityLabelledBy: label ? labelId : undefined, accessibilityRole: role, accessibilityState: { disabled: disabled || readOnly }, accessibilityValue: error ? { text: error } : undefined, style: [{ direction: theme.environment.direction, gap: selectionGroupRecipe.supportGap }, style], children: [label ? (_jsxs(Text, { nativeID: labelId, tone: "primary", variant: selectionGroupRecipe.label.textVariant, children: [label, required ? requiredLabel ? ` (${requiredLabel})` : " *" : ""] })) : null, _jsx(View, { style: {
                    direction: theme.environment.direction,
                    flexDirection: orientation === "horizontal" && theme.environment.textScale < 1.6
                        ? "row"
                        : "column",
                    gap,
                }, children: children }), error ? (_jsx(Text, { accessibilityLiveRegion: "assertive", accessibilityRole: "alert", tone: "danger", variant: selectionGroupRecipe.error.textVariant, children: error })) : description ? (_jsx(Text, { tone: "muted", variant: selectionGroupRecipe.description.textVariant, children: description })) : null] }));
}
export function RadioGroup({ label, accessibilityLabel, options, value, defaultValue, onValueChange, required = false, disabled = false, readOnly = false, invalid = false, description, error, requiredLabel, readOnlyLabel, invalidLabel, orientation = selectionGroupBehaviorDefaults.orientation, presentation = selectionGroupRecipe.defaults.presentation, size = selectionControlRecipe.defaults.size, indicator = "default", renderLeading, renderIndicator, style, ...slotStyles }) {
    const selectionItems = options.map((option) => ({
        id: option.value,
        label: option.label,
        ...(option.description === undefined ? {} : { description: option.description }),
        ...(option.disabled === undefined ? {} : { disabled: option.disabled }),
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
    useEffect(() => {
        if (value === undefined && selected !== storedValue)
            setSelected(selected);
    }, [selected, setSelected, storedValue, value]);
    const hasError = invalid || error !== undefined;
    return (_jsx(ChoiceGroupFrame, { accessibilityLabel: accessibilityLabel, description: description, disabled: disabled, error: error, label: label, orientation: orientation, presentation: presentation, readOnly: readOnly, readOnlyLabel: readOnlyLabel, required: required, requiredLabel: requiredLabel, role: "radiogroup", style: style, children: options.map((option) => {
            const optionDisabled = disabled || option.disabled === true;
            const optionSelected = selected === option.value;
            return (_createElement(ChoiceRow, { ...slotStyles, key: option.value, accessibilityHint: option.accessibilityHint, checked: optionSelected, description: option.description, disabled: optionDisabled, indicator: indicator, invalid: hasError, invalidLabel: invalidLabel ?? error, kind: "radio", label: option.label, leading: option.leading, onActivate: () => setSelected(option.value), presentation: presentation, readOnly: readOnly, readOnlyLabel: readOnlyLabel, renderIndicator: renderIndicator ? (props) => renderIndicator(option, props) : undefined, renderLeading: renderLeading ? (props) => renderLeading(option, props) : undefined, required: required, requiredLabel: requiredLabel, size: size }));
        }) }));
}
/** Validated controlled/uncontrolled checkbox collection using immutable Sets. */
export function CheckboxGroup({ label, accessibilityLabel, items, value, defaultValue = new Set(), onValueChange, required = false, disabled = false, readOnly = false, invalid = false, description, error, requiredLabel, readOnlyLabel, invalidLabel, orientation = selectionGroupBehaviorDefaults.orientation, presentation = selectionGroupRecipe.defaults.presentation, size = selectionControlRecipe.defaults.size, indicator = "default", renderLeading, renderIndicator, style, ...slotStyles }) {
    validateSelectionItems(items);
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
    return (_jsx(ChoiceGroupFrame, { accessibilityLabel: accessibilityLabel, description: description, disabled: disabled, error: error, label: label, orientation: orientation, presentation: presentation, readOnly: readOnly, readOnlyLabel: readOnlyLabel, required: required, requiredLabel: requiredLabel, style: style, children: items.map((item) => {
            const optionDisabled = disabled || item.disabled === true;
            const optionSelected = selected.has(item.id);
            return (_createElement(ChoiceRow, { ...slotStyles, key: item.id, checked: optionSelected, description: item.description, disabled: optionDisabled, indicator: indicator, invalid: hasError, invalidLabel: invalidLabel ?? error, kind: "checkbox", label: item.label, onActivate: () => setSelected(toggleCheckboxSelection(items, selected, item.id)), presentation: presentation, readOnly: readOnly, readOnlyLabel: readOnlyLabel, renderIndicator: renderIndicator ? (props) => renderIndicator(item, props) : undefined, renderLeading: renderLeading ? (props) => renderLeading(item, props) : undefined, required: required, requiredLabel: requiredLabel, size: size }));
        }) }));
}
export function Switch({ label, description, size = switchRecipe.defaults.size, value, defaultValue = false, onValueChange, disabled = false, accessibilityLabel, accessibilityHint, style, ...props }) {
    const { colors, environment } = useHjmNativeTheme();
    const dimensions = switchRecipe.sizes[size];
    const [enabled, setEnabled] = useControllableState({
        ...(value === undefined ? {} : { value }),
        defaultValue,
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    return (_jsxs(Pressable, { accessibilityHint: accessibilityHint ?? description, accessibilityLabel: accessibilityLabel ?? label, accessibilityRole: "switch", accessibilityState: { checked: enabled, disabled }, disabled: disabled, onPress: () => setEnabled(!enabled), style: ({ pressed }) => [
            minimumTargetStyle,
            {
                alignItems: "center",
                direction: environment.direction,
                flexDirection: "row",
                gap: spacing.sm,
                minHeight: description
                    ? switchRecipe.rowTwoLineMinHeight
                    : switchRecipe.rowMinHeight,
                opacity: disabled ? 0.5 : pressed ? 0.86 : 1,
            },
            style,
        ], children: [_jsxs(View, { style: { flex: 1, gap: spacing.xxs }, children: [_jsx(Text, { tone: "body", variant: "bodyLarge", children: label }), description ? (_jsx(Text, { tone: "muted", variant: "caption", children: description })) : null] }), _jsx(NativeSwitch, { ...props, accessible: false, disabled: disabled, ios_backgroundColor: colors.surfaceAlt, pointerEvents: "none", style: { height: dimensions.height, width: dimensions.width }, thumbColor: colors.bg, trackColor: { false: colors.surfaceAlt, true: colors.primary }, value: enabled })] }));
}
export function SegmentedControl({ label, options, value, defaultValue, onValueChange, size = segmentedControlRecipe.defaults.size, disabled = false, style, }) {
    const theme = useHjmNativeTheme();
    const { environment } = theme;
    const sizeContract = segmentedControlRecipe.sizes[size];
    const stacked = segmentedControlRecipe.adaptive.largeTextLayout === "stacked"
        && environment.textScale >= segmentedControlRecipe.adaptive.stackAtFontScale;
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
                backgroundColor: resolveColorReference(segmentedControlRecipe.container.background, theme.palette),
                borderColor: resolveColorReference(segmentedControlRecipe.container.border, theme.palette),
                borderRadius: radius[segmentedControlRecipe.container.radius],
                borderWidth: segmentedControlRecipe.container.borderWidth,
                direction: environment.direction,
                flexDirection: stacked ? "column" : "row",
                gap: segmentedControlRecipe.container.gap,
                padding: segmentedControlRecipe.container.padding,
            },
            style,
        ], children: options.map((option) => {
            const isSelected = option.value === selected;
            const optionDisabled = disabled || option.disabled === true;
            const contentColor = resolveColorReference(isSelected
                ? segmentedControlRecipe.item.selectedContent
                : segmentedControlRecipe.item.idleContent, theme.palette);
            const leading = option.leading ?? option.renderLeading?.({
                selected: isSelected,
                disabled: optionDisabled,
                color: contentColor,
                size: glyph.sm,
            });
            return (_jsxs(Pressable, { accessibilityLabel: option.label, accessibilityRole: "radio", accessibilityState: { checked: isSelected, disabled: optionDisabled }, disabled: optionDisabled, hitSlop: sizeContract.hitSlop, onPress: () => setSelected(option.value), style: ({ pressed }) => [
                    {
                        alignItems: "center",
                        backgroundColor: isSelected
                            ? resolveColorReference(segmentedControlRecipe.item.selectedBackground, theme.palette)
                            : "transparent",
                        borderColor: isSelected
                            ? resolveColorReference(segmentedControlRecipe.item.selectedBorder, theme.palette)
                            : "transparent",
                        borderRadius: radius[segmentedControlRecipe.item.radius],
                        borderWidth: isSelected
                            ? segmentedControlRecipe.item.selectedBorderWidth
                            : 0,
                        flex: stacked ? undefined : 1,
                        gap: segmentedControlRecipe.item.gap,
                        justifyContent: "center",
                        minHeight: sizeContract.minHeight,
                        opacity: optionDisabled
                            ? segmentedControlRecipe.item.disabledOpacity
                            : pressed
                                ? segmentedControlRecipe.item.pressedOpacity
                                : 1,
                        paddingHorizontal: sizeContract.paddingHorizontal,
                        width: stacked ? "100%" : undefined,
                    },
                ], children: [leading ? (_jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", children: leading })) : null, _jsx(Text, { align: "center", style: {
                            color: contentColor,
                            fontWeight: isSelected
                                ? segmentedControlRecipe.item.selectedFontWeight
                                : segmentedControlRecipe.item.fontWeight,
                        }, tone: isSelected ? "brand" : "muted", variant: sizeContract.textVariant, children: option.label })] }, option.value));
        }) }));
}
/** Action/filter chip with role-specific, controlled selection semantics. */
export function Chip({ label, size = chipRecipe.defaults.size, disabled = false, leading, trailing, accessibilityLabel, accessibilityHint, style, leadingStyle, indicatorStyle, labelStyle, trailingStyle, renderSelectionIndicator, selectionMode = "action", selected, onPress, }) {
    const theme = useHjmNativeTheme();
    const selectable = selectionMode !== "action";
    const active = selectable && selected === true;
    const metrics = chipRecipe.sizes[size];
    const presentation = chipRecipe.states[active ? "selected" : "idle"];
    const contentColor = resolveColorReference(presentation.content, theme.palette);
    const indicatorColor = resolveColorReference(chipRecipe.selectionIndicator.color, theme.palette);
    const role = selectionMode === "single" ? "radio" : selectionMode === "multiple" ? "checkbox" : "button";
    return (_jsxs(Pressable, { accessibilityHint: accessibilityHint, accessibilityLabel: accessibilityLabel ?? label, accessibilityRole: role, accessibilityState: selectable ? { checked: active, disabled } : { disabled }, disabled: disabled, hitSlop: metrics.hitSlop, onPress: (event) => {
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
                borderRadius: radius[chipRecipe.radius],
                borderWidth: chipRecipe.borderWidth,
                direction: theme.environment.direction,
                flexDirection: "row",
                gap: metrics.gap,
                height: metrics.height,
                opacity: disabled
                    ? chipRecipe.states.disabledOpacity
                    : pressed
                        ? chipRecipe.states.pressedOpacity
                        : 1,
                paddingHorizontal: metrics.paddingHorizontal,
            },
            style,
        ], children: [leading ? _jsx(View, { accessible: false, style: leadingStyle, children: leading }) : null, active ? (_jsx(View, { accessible: false, style: indicatorStyle, children: renderSelectionIndicator ? (renderSelectionIndicator({
                    selected: active,
                    color: indicatorColor,
                    size: glyph[chipRecipe.selectionIndicator.glyph],
                })) : (_jsx(Text, { style: { color: indicatorColor }, variant: "caption", children: "\u2713" })) })) : null, _jsx(Text, { align: "center", style: [
                    {
                        color: contentColor,
                        fontWeight: active
                            ? chipRecipe.label.selectedFontWeight
                            : chipRecipe.label.fontWeight,
                    },
                    labelStyle,
                ], variant: metrics.textVariant, children: label }), trailing ? _jsx(View, { accessible: false, style: trailingStyle, children: trailing }) : null] }));
}
//# sourceMappingURL=inputs.js.map