import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { formRecipe, } from "@hjm/design-contracts/components/form";
import { comboboxBehaviorDefaults, resolveControlAccessibleName, } from "@hjm/design-contracts/behaviors";
import { flattenCollectionItems, isComboboxResultCurrent, reconcileSelectSelection, resolveComboboxSelectedItem, resolveSelectSelectedItem, validateCollection, } from "@hjm/design-contracts/components/collection";
import { resolveColorReference } from "@hjm/design-contracts/color-references";
import { glyph, radius, spacing } from "@hjm/design-contracts/foundations";
import { comboboxRecipe, selectRecipe, } from "@hjm/design-contracts/recipes";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, } from "react";
import { AccessibilityInfo, ActivityIndicator, Modal, Pressable, ScrollView, TextInput, View, findNodeHandle, } from "react-native";
import { Button } from "./actions.js";
import { useControllableState } from "./internal/state.js";
import { scheduleAfterNativeModalTeardown, shouldAwaitNativeModalDismiss, } from "./internal/modal-lifecycle.js";
import { logicalTextAlign, minimumTargetStyle, resolveNativeTextScaleProps, } from "./internal/styles.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
function useAfterModalDismiss(visible) {
    const shownRef = useRef(false);
    const previousVisibleRef = useRef(visible);
    const pendingRef = useRef(null);
    const teardownTaskRef = useRef(null);
    const complete = useCallback(() => {
        teardownTaskRef.current?.cancel();
        teardownTaskRef.current = null;
        shownRef.current = false;
        const pending = pendingRef.current;
        pendingRef.current = null;
        if (pending)
            void pending();
    }, []);
    useLayoutEffect(() => {
        const wasVisible = previousVisibleRef.current;
        previousVisibleRef.current = visible;
        if (!wasVisible || visible || shouldAwaitNativeModalDismiss(shownRef.current))
            return;
        teardownTaskRef.current?.cancel();
        teardownTaskRef.current = scheduleAfterNativeModalTeardown(complete);
    }, [complete, visible]);
    useEffect(() => () => teardownTaskRef.current?.cancel(), []);
    return {
        queue(action) {
            pendingRef.current = action;
        },
        onDismiss: complete,
        onShow() {
            shownRef.current = true;
        },
    };
}
/** A renderer-neutral field frame for custom Native controls. */
export function Field({ label, children, description, error, required = false, disabled = false, style, }) {
    const visibleLabel = `${label}${required ? " *" : ""}`;
    const hint = error ?? description;
    const controlProps = {
        accessibilityLabel: visibleLabel,
        ...(hint === undefined ? {} : { accessibilityHint: hint }),
        accessibilityState: { disabled },
    };
    return (_jsxs(View, { style: [{ gap: spacing.xs }, style], children: [_jsx(Text, { tone: "primary", variant: "label", children: visibleLabel }), typeof children === "function" ? children(controlProps) : children, error ? (_jsx(Text, { accessibilityLiveRegion: "assertive", tone: "danger", variant: "caption", children: error })) : description ? (_jsx(Text, { tone: "muted", variant: "caption", children: description })) : null] }));
}
/**
 * A Native submit boundary. Products retain ownership of values and validation;
 * this renderer only owns submit re-entrancy, feedback, and field rhythm.
 */
export function Form({ label, values, onSubmit, children, submitLabel, status, defaultStatus = "idle", onStatusChange, error, fallbackErrorMessage, disabled = false, density = "comfortable", style, }) {
    const [submitStatus, setSubmitStatus] = useControllableState({
        ...(status === undefined ? {} : { value: status }),
        defaultValue: defaultStatus,
        ...(onStatusChange === undefined ? {} : { onChange: onStatusChange }),
    });
    const [internalError, setInternalError] = useState();
    const submittingRef = useRef(false);
    const mountedRef = useRef(true);
    const busy = submitStatus === "submitting";
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);
    const submit = async () => {
        if (disabled || busy || submittingRef.current)
            return;
        submittingRef.current = true;
        setInternalError(undefined);
        setSubmitStatus("submitting");
        try {
            await onSubmit(values);
            if (mountedRef.current)
                setSubmitStatus("succeeded");
        }
        catch (caught) {
            if (mountedRef.current) {
                setInternalError(caught instanceof Error && caught.message.trim().length > 0
                    ? caught.message
                    : fallbackErrorMessage);
                setSubmitStatus("failed");
            }
        }
        finally {
            submittingRef.current = false;
        }
    };
    return (_jsxs(View, { accessibilityLabel: label, accessibilityState: { busy, disabled }, style: [{ gap: formRecipe.density[density].fieldGap }, style], children: [children, error ?? internalError ? (_jsx(View, { accessibilityLiveRegion: "assertive", accessibilityRole: "alert", children: _jsx(Text, { tone: "danger", children: error ?? internalError }) })) : null, _jsx(Button, { disabled: disabled, loading: busy, onPress: () => void submit(), children: submitLabel })] }));
}
/** Native adaptive Select with shared sections, async states, and teardown-safe commits. */
export function Select({ label, accessibilityLabel, options, source: sourceProp, items, sections, value, defaultValue, onValueChange, selectedKey, defaultSelectedKey, onSelectionChange, selectedItem, disallowEmptySelection = false, open, defaultOpen = false, onOpenChange, placeholder, description, error, required = false, disabled = false, readOnly = false, busy = false, size = selectRecipe.defaults.size, density = selectRecipe.defaults.density, asyncState = { status: "idle" }, onRetry, retryLabel, readOnlyLabel, openHint, renderLeading, renderOptionLeading, onSelectionAfterDismiss, onDismiss, dismissLabel, optionsAccessibilityLabel, style, ...modalProps }) {
    const providedSources = [sourceProp, options, items, sections].filter((candidate) => candidate !== undefined).length;
    if (providedSources !== 1) {
        throw new TypeError("Select requires exactly one of source, options, items, or sections");
    }
    if (value !== undefined && selectedKey !== undefined) {
        throw new TypeError("Select cannot combine value and selectedKey");
    }
    if (defaultValue !== undefined && defaultSelectedKey !== undefined) {
        throw new TypeError("Select cannot combine defaultValue and defaultSelectedKey");
    }
    const source = useMemo(() => {
        if (sourceProp)
            return sourceProp;
        if (sections)
            return { sections };
        if (items)
            return { items };
        return {
            items: (options ?? []).map((option) => ({
                id: option.value,
                label: option.label,
                textValue: option.label,
                ...(option.description === undefined ? {} : { description: option.description }),
                ...(option.disabled === undefined ? {} : { disabled: option.disabled }),
            })),
        };
    }, [items, options, sections, sourceProp]);
    validateCollection(source);
    const collectionItems = flattenCollectionItems(source);
    if (collectionItems.length === 0 && asyncState.status === "idle") {
        throw new Error("Select requires an option or a non-idle asyncState");
    }
    const accessibleName = resolveControlAccessibleName(label, accessibilityLabel, "Select");
    const theme = useHjmNativeTheme();
    const { colors, environment } = theme;
    const requestedControlled = selectedKey !== undefined ? selectedKey : value;
    const requestedDefault = defaultSelectedKey ?? defaultValue ?? null;
    const requestedValue = requestedControlled ?? requestedDefault;
    if (requestedValue !== null &&
        requestedValue !== undefined &&
        !collectionItems.some((option) => option.id === requestedValue) &&
        selectedItem?.id !== requestedValue &&
        asyncState.status === "idle") {
        throw new RangeError("Select selection must match an option");
    }
    const [selected, setSelected] = useControllableState({
        ...(requestedControlled === undefined ? {} : { value: requestedControlled }),
        defaultValue: requestedDefault,
        onChange: (next) => {
            if (next !== null)
                onValueChange?.(next);
            onSelectionChange?.(next);
        },
    });
    const reconciledSelected = reconcileSelectSelection(source, selected, {
        disallowEmptySelection,
        asyncState,
        ...(selectedItem === undefined ? {} : { selectedItem }),
    });
    useEffect(() => {
        if (requestedControlled === undefined && reconciledSelected !== selected) {
            setSelected(reconciledSelected);
        }
    }, [reconciledSelected, requestedControlled, selected, setSelected]);
    const resolvedSelectedItem = resolveSelectSelectedItem(source, reconciledSelected, selectedItem);
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const visible = open ?? uncontrolledOpen;
    const requestOpen = useCallback((next, reason) => {
        if (next === visible)
            return;
        if (open === undefined)
            setUncontrolledOpen(next);
        onOpenChange?.(next, reason);
    }, [onOpenChange, open, visible]);
    const triggerRef = useRef(null);
    const optionRefs = useRef(new Map());
    const modalDismiss = useAfterModalDismiss(visible);
    const sizeContract = selectRecipe.sizes[size];
    const densityContract = selectRecipe.density[density];
    const close = useCallback((reason, after) => {
        modalDismiss.queue(async () => {
            const handle = findNodeHandle(triggerRef.current);
            if (handle !== null)
                AccessibilityInfo.setAccessibilityFocus(handle);
            onDismiss?.(reason);
            await after?.();
        });
        requestOpen(false, reason);
    }, [modalDismiss, onDismiss, requestOpen]);
    useEffect(() => {
        if (visible && (disabled || readOnly))
            close("programmatic");
    }, [close, disabled, readOnly, visible]);
    const focusInitialOption = () => {
        const initialValue = reconciledSelected ?? collectionItems.find((option) => !option.disabled)?.id;
        if (initialValue === undefined)
            return;
        const target = optionRefs.current.get(initialValue);
        if (target) {
            const handle = findNodeHandle(target);
            if (handle !== null)
                AccessibilityInfo.setAccessibilityFocus(handle);
        }
    };
    const leadingColor = resolveColorReference(selectRecipe.leading.color, theme.palette);
    const triggerLeading = renderLeading?.(resolvedSelectedItem, {
        placement: "trigger",
        selected: resolvedSelectedItem !== null,
        disabled: disabled || busy,
        color: leadingColor,
        size: glyph[sizeContract.glyph],
    });
    const renderOption = (option) => {
        const checked = option.id === reconciledSelected;
        const optionDisabled = option.disabled === true || disabled || readOnly || busy;
        const optionLeading = renderOptionLeading?.(option, {
            placement: "option",
            selected: checked,
            disabled: optionDisabled,
            color: resolveColorReference(selectRecipe.optionLeading.color, theme.palette),
            size: glyph[selectRecipe.optionLeading.glyph],
        });
        return (_jsxs(Pressable, { ref: (node) => {
                if (node)
                    optionRefs.current.set(option.id, node);
                else
                    optionRefs.current.delete(option.id);
            }, accessibilityHint: option.description, accessibilityLabel: option.label, accessibilityRole: "radio", accessibilityState: { checked, disabled: optionDisabled }, disabled: optionDisabled, onPress: () => {
                setSelected(option.id);
                close("selection", onSelectionAfterDismiss
                    ? () => onSelectionAfterDismiss(option.id)
                    : null);
            }, style: ({ pressed }) => [
                minimumTargetStyle,
                {
                    alignItems: "center",
                    backgroundColor: checked
                        ? resolveColorReference(densityContract.selectedBackground, theme.palette)
                        : pressed
                            ? resolveColorReference(densityContract.highlightedBackground, theme.palette)
                            : "transparent",
                    borderRadius: radius[densityContract.radius],
                    direction: environment.direction,
                    flexDirection: "row",
                    gap: densityContract.gap,
                    minHeight: densityContract.minHeight,
                    opacity: optionDisabled ? selectRecipe.states.disabledOpacity : 1,
                    paddingHorizontal: densityContract.paddingHorizontal,
                },
            ], children: [optionLeading ? (_jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", children: optionLeading })) : null, _jsxs(View, { style: { flex: 1, gap: spacing.xxs, minWidth: 0 }, children: [_jsx(Text, { style: {
                                color: resolveColorReference(densityContract.label.color, theme.palette),
                                fontWeight: checked
                                    ? selectRecipe.optionLabel.selectedFontWeight
                                    : selectRecipe.optionLabel.fontWeight,
                            }, variant: densityContract.label.textVariant, children: option.label }), option.description ? (_jsx(Text, { style: { color: resolveColorReference(densityContract.description.color, theme.palette) }, variant: densityContract.description.textVariant, children: option.description })) : null] }), checked ? _jsx(Text, { accessible: false, tone: "brand", children: "\u2713" }) : null] }, option.id));
    };
    const collection = source.sections ? source.sections.map((section) => (_jsxs(View, { accessibilityLabel: section.accessibilityLabel ?? section.label, children: [section.label ? (_jsx(Text, { style: {
                    color: resolveColorReference(selectRecipe.sectionLabel.color, theme.palette),
                    paddingHorizontal: selectRecipe.sectionLabel.paddingHorizontal,
                    paddingVertical: selectRecipe.sectionLabel.paddingVertical,
                }, variant: selectRecipe.sectionLabel.textVariant, children: section.label })) : null, section.items.map(renderOption)] }, section.id))) : collectionItems.map(renderOption);
    const blockingState = asyncState.status === "loading" || asyncState.status === "error" || asyncState.status === "empty";
    return (_jsxs(View, { style: [{ gap: spacing.xs }, style], children: [label ? _jsxs(Text, { tone: "primary", variant: "label", children: [label, required ? " *" : ""] }) : null, _jsxs(Pressable, { ref: triggerRef, accessibilityLabel: accessibleName, accessibilityHint: readOnly ? readOnlyLabel : error ?? description ?? openHint, accessibilityRole: "combobox", accessibilityState: {
                    busy: busy || asyncState.status === "loading",
                    disabled: disabled || readOnly || busy,
                    expanded: visible,
                }, accessibilityValue: { text: resolvedSelectedItem?.label ?? placeholder }, disabled: disabled || readOnly || busy, onPress: () => {
                    if (!readOnly)
                        requestOpen(!visible, "trigger");
                }, style: ({ pressed }) => [
                    minimumTargetStyle,
                    {
                        alignItems: "center",
                        backgroundColor: colors.bg,
                        borderColor: error ? colors.danger : colors.border,
                        borderRadius: radius.md,
                        borderWidth: error ? 2 : 1,
                        direction: environment.direction,
                        flexDirection: "row",
                        gap: selectRecipe.value.gap,
                        minHeight: sizeContract.minHeight,
                        opacity: disabled || busy ? selectRecipe.states.disabledOpacity : pressed ? 0.86 : 1,
                        paddingHorizontal: sizeContract.paddingHorizontal,
                    },
                ], children: [triggerLeading ? (_jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", children: triggerLeading })) : null, _jsx(Text, { style: { flex: 1 }, tone: resolvedSelectedItem ? "body" : "muted", variant: sizeContract.textVariant, children: resolvedSelectedItem?.label ?? placeholder }), busy ? _jsx(ActivityIndicator, { size: glyph[selectRecipe.busyIndicator.glyph] }) : _jsx(Text, { accessible: false, tone: "muted", children: "\u2304" })] }), error ? (_jsx(Text, { accessibilityLiveRegion: "assertive", tone: "danger", variant: "caption", children: error })) : description ? (_jsx(Text, { tone: "muted", variant: "caption", children: description })) : null, _jsx(Modal, { ...modalProps, animationType: "none", onDismiss: modalDismiss.onDismiss, onRequestClose: () => close("escape"), onShow: () => {
                    modalDismiss.onShow();
                    focusInitialOption();
                }, transparent: true, visible: visible, children: _jsxs(View, { style: { flex: 1, justifyContent: "flex-end" }, children: [_jsx(Pressable, { accessibilityLabel: dismissLabel, accessibilityRole: "button", onPress: () => close("outside"), style: {
                                backgroundColor: "#00000088",
                                bottom: 0,
                                left: 0,
                                position: "absolute",
                                right: 0,
                                top: 0,
                            } }), _jsxs(View, { accessibilityLabel: optionsAccessibilityLabel ?? accessibleName, accessibilityRole: "radiogroup", accessibilityViewIsModal: true, style: {
                                backgroundColor: colors.bg,
                                borderTopLeftRadius: radius.lg,
                                borderTopRightRadius: radius.lg,
                                gap: spacing.sm,
                                maxHeight: "75%",
                                padding: spacing.md,
                            }, children: [_jsx(Text, { tone: "primary", variant: "title", children: label ?? accessibleName }), _jsxs(ScrollView, { children: [blockingState ? (_jsxs(View, { style: { gap: spacing.sm, minHeight: selectRecipe.stateMessage.minHeight }, children: [asyncState.status === "loading" ? _jsx(ActivityIndicator, {}) : null, _jsx(Text, { accessibilityLiveRegion: "polite", accessibilityRole: asyncState.status === "error" ? "alert" : undefined, tone: asyncState.status === "error" ? "danger" : "muted", children: asyncState.message }), asyncState.status === "error" && onRetry ? (_jsx(Button, { onPress: onRetry, tone: "secondary", children: retryLabel ?? dismissLabel })) : null] })) : collection, asyncState.status === "loadingMore" ? (_jsxs(View, { accessibilityLiveRegion: "polite", accessibilityState: { busy: true }, style: { alignItems: "center", flexDirection: "row", gap: spacing.xs }, children: [_jsx(ActivityIndicator, {}), _jsx(Text, { tone: "muted", children: asyncState.message })] })) : null] }), _jsx(Button, { onPress: () => close("programmatic"), tone: "secondary", children: dismissLabel })] })] }) })] }));
}
/** Editable Native combobox with sectioned async results and teardown-safe commits. */
export function Combobox({ label, accessibilityLabel, items, sections, source: sourceProp, selectedKey, defaultSelectedKey = null, selectedItem, onSelectionChange, inputValue, defaultInputValue, onInputValueChange, open, defaultOpen = false, onOpenChange, onCommit, onCommitAfterDismiss, onDismiss, filtering = comboboxBehaviorDefaults.filtering, queryValue, resultQuery, asyncState, loading = false, emptyMessage, loadingMessage, loadingMoreMessage, errorMessage, promptMessage, minimumQueryLength = 0, onRetry, retryLabel, description, error, placeholder, required = false, disabled = false, readOnly = false, busy = false, openOnFocus = true, size = comboboxRecipe.defaults.size, density = comboboxRecipe.defaults.density, readOnlyLabel, renderLeading, clearLabel, dismissLabel, resultsAccessibilityLabel, style, ...modalProps }) {
    const providedSources = [sourceProp, items, sections].filter((candidate) => candidate !== undefined).length;
    if (providedSources !== 1) {
        throw new TypeError("Combobox requires exactly one of source, items, or sections");
    }
    const source = useMemo(() => {
        if (sourceProp)
            return sourceProp;
        if (sections)
            return { sections };
        return { items: items ?? [] };
    }, [items, sections, sourceProp]);
    validateCollection(source);
    const collectionItems = flattenCollectionItems(source);
    const requestedSelection = selectedKey === undefined ? defaultSelectedKey : selectedKey;
    if (requestedSelection !== null && selectedItem?.id !== requestedSelection &&
        !collectionItems.some((item) => item.id === requestedSelection)) {
        throw new RangeError(`Combobox selectedKey needs a matching item snapshot: ${requestedSelection}`);
    }
    if (!emptyMessage.trim() || !loadingMessage.trim()) {
        throw new TypeError("Combobox state messages must not be empty");
    }
    if (!Number.isInteger(minimumQueryLength) || minimumQueryLength < 0) {
        throw new RangeError("Combobox minimumQueryLength must be a non-negative integer");
    }
    const accessibleName = resolveControlAccessibleName(label, accessibilityLabel, "Combobox");
    const theme = useHjmNativeTheme();
    const { colors, environment } = theme;
    const [committedKey, setCommittedKey] = useControllableState({
        ...(selectedKey === undefined ? {} : { value: selectedKey }),
        defaultValue: defaultSelectedKey,
        ...(onSelectionChange === undefined ? {} : { onChange: onSelectionChange }),
    });
    const committedItem = resolveComboboxSelectedItem(source, committedKey, selectedItem);
    const [query, setQuery] = useControllableState({
        ...(inputValue === undefined ? {} : { value: inputValue }),
        defaultValue: defaultInputValue ?? committedItem?.label ?? "",
        ...(onInputValueChange === undefined ? {} : { onChange: onInputValueChange }),
    });
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const visible = open ?? uncontrolledOpen;
    const requestOpen = useCallback((next, reason) => {
        if (next === visible)
            return;
        if (open === undefined)
            setUncontrolledOpen(next);
        onOpenChange?.(next, reason);
    }, [onOpenChange, open, visible]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const inputRef = useRef(null);
    const optionRefs = useRef(new Map());
    const modalDismiss = useAfterModalDismiss(visible);
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const resultsAreCurrent = filtering !== "external" ||
        isComboboxResultCurrent(queryValue ?? query, resultQuery ?? query);
    const filteredItems = useMemo(() => filtering === "external"
        ? collectionItems
        : collectionItems.filter((item) => `${item.label} ${item.textValue}`.toLocaleLowerCase().includes(normalizedQuery)), [collectionItems, filtering, normalizedQuery]);
    const resolvedAsyncState = asyncState ??
        (loading ? { status: "loading", message: loadingMessage } : { status: "idle" });
    const sizeContract = comboboxRecipe.sizes[size];
    const densityContract = comboboxRecipe.density[density];
    const inputTypography = theme.tokens.typography[sizeContract.textVariant];
    const inputTextScaleProps = resolveNativeTextScaleProps(theme.textScaling, {
        color: colors.text,
        flex: 1,
        fontSize: inputTypography.fontSize,
        fontWeight: inputTypography.fontWeight,
        lineHeight: inputTypography.lineHeight,
        minHeight: sizeContract.minHeight,
        textAlign: logicalTextAlign(environment.direction),
    });
    const close = useCallback((reason, after) => {
        modalDismiss.queue(async () => {
            const handle = findNodeHandle(inputRef.current);
            if (handle !== null)
                AccessibilityInfo.setAccessibilityFocus(handle);
            onDismiss?.(reason);
            await after?.();
        });
        requestOpen(false, reason);
        setActiveIndex(-1);
    }, [modalDismiss, onDismiss, requestOpen]);
    useEffect(() => {
        if (visible && (disabled || readOnly))
            close("programmatic");
    }, [close, disabled, readOnly, visible]);
    const firstEnabledIndex = () => filteredItems.findIndex((item) => !item.disabled);
    const lastEnabledIndex = () => {
        for (let index = filteredItems.length - 1; index >= 0; index -= 1) {
            if (!filteredItems[index]?.disabled)
                return index;
        }
        return -1;
    };
    const moveActive = (delta) => {
        if (filteredItems.length === 0)
            return;
        let next = activeIndex;
        for (let offset = 0; offset < filteredItems.length; offset += 1) {
            next = (next + delta + filteredItems.length) % filteredItems.length;
            if (!filteredItems[next]?.disabled) {
                setActiveIndex(next);
                return;
            }
        }
    };
    const restoreCommittedQuery = () => setQuery(committedItem?.label ?? "");
    const dismiss = (reason) => {
        restoreCommittedQuery();
        close(reason);
    };
    const commit = (item) => {
        if (item.disabled || disabled || readOnly || busy || !resultsAreCurrent)
            return;
        setCommittedKey(item.id);
        setQuery(item.label);
        onCommit?.(item.id, "selection");
        close("selection", onCommitAfterDismiss
            ? () => onCommitAfterDismiss(item.id, "selection")
            : null);
    };
    const clear = () => {
        setCommittedKey(null);
        setQuery("");
        onCommit?.(null, "clear");
    };
    const focusInitialOption = () => {
        const initial = (committedKey === null ? undefined : optionRefs.current.get(committedKey)) ??
            optionRefs.current.get(filteredItems.find((item) => !item.disabled)?.id);
        if (initial) {
            const handle = findNodeHandle(initial);
            if (handle !== null)
                AccessibilityInfo.setAccessibilityFocus(handle);
        }
    };
    const leading = committedItem && renderLeading ? renderLeading(committedItem, {
        placement: "trigger",
        selected: true,
        disabled: disabled || busy,
        color: resolveColorReference(comboboxRecipe.leading.color, theme.palette),
        size: glyph[sizeContract.glyph],
    }) : null;
    const queryTooShort = query.trim().length < minimumQueryLength;
    const viewStatus = queryTooShort
        ? "prompt"
        : !resultsAreCurrent || resolvedAsyncState.status === "loading"
            ? "loading"
            : resolvedAsyncState.status === "error"
                ? "error"
                : resolvedAsyncState.status === "empty" || filteredItems.length === 0
                    ? "empty"
                    : resolvedAsyncState.status === "loadingMore"
                        ? "loadingMore"
                        : "ready";
    const stateMessage = viewStatus === "prompt"
        ? promptMessage ?? emptyMessage
        : viewStatus === "loading"
            ? resolvedAsyncState.status === "loading" ? resolvedAsyncState.message : loadingMessage
            : viewStatus === "error"
                ? resolvedAsyncState.status === "error" ? resolvedAsyncState.message : errorMessage ?? emptyMessage
                : viewStatus === "empty"
                    ? resolvedAsyncState.status === "empty" ? resolvedAsyncState.message : emptyMessage
                    : viewStatus === "loadingMore"
                        ? resolvedAsyncState.status === "loadingMore" ? resolvedAsyncState.message : loadingMoreMessage ?? loadingMessage
                        : "";
    const filteredIds = new Set(filteredItems.map((item) => item.id));
    const renderOption = (item, index) => {
        const checked = item.id === committedKey;
        const active = index === activeIndex;
        const itemDisabled = item.disabled === true || disabled || readOnly || busy || !resultsAreCurrent;
        const optionLeading = renderLeading?.(item, {
            placement: "option",
            selected: checked,
            disabled: itemDisabled,
            color: resolveColorReference(comboboxRecipe.optionLeading.color, theme.palette),
            size: glyph[comboboxRecipe.optionLeading.glyph],
        });
        return (_jsxs(Pressable, { ref: (node) => {
                if (node)
                    optionRefs.current.set(item.id, node);
                else
                    optionRefs.current.delete(item.id);
            }, accessibilityHint: item.description, accessibilityLabel: item.label, accessibilityRole: "radio", accessibilityState: { checked, disabled: itemDisabled }, disabled: itemDisabled, onPress: () => commit(item), style: ({ pressed }) => [
                minimumTargetStyle,
                {
                    alignItems: "center",
                    backgroundColor: checked || active
                        ? resolveColorReference(densityContract.selectedBackground, theme.palette)
                        : pressed
                            ? resolveColorReference(comboboxRecipe.states.pressedBackground, theme.palette)
                            : "transparent",
                    borderRadius: radius[densityContract.radius],
                    direction: environment.direction,
                    flexDirection: "row",
                    gap: densityContract.gap,
                    minHeight: densityContract.minHeight,
                    opacity: itemDisabled ? comboboxRecipe.states.disabledOpacity : 1,
                    paddingHorizontal: densityContract.paddingHorizontal,
                },
            ], children: [optionLeading ? (_jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", children: optionLeading })) : null, _jsxs(View, { style: { flex: 1, gap: spacing.xxs, minWidth: 0 }, children: [_jsx(Text, { tone: checked ? "brand" : "body", variant: densityContract.label.textVariant, children: item.label }), item.description ? _jsx(Text, { tone: "muted", variant: densityContract.description.textVariant, children: item.description }) : null] }), checked ? _jsx(Text, { accessible: false, tone: "brand", children: "\u2713" }) : null] }, item.id));
    };
    let optionIndex = -1;
    const collection = source.sections ? source.sections.map((section) => {
        const visibleItems = section.items.filter((item) => filteredIds.has(item.id));
        if (visibleItems.length === 0)
            return null;
        return (_jsxs(View, { accessibilityLabel: section.accessibilityLabel ?? section.label, children: [section.label ? (_jsx(Text, { style: {
                        color: resolveColorReference(comboboxRecipe.sectionLabel.color, theme.palette),
                        paddingHorizontal: comboboxRecipe.sectionLabel.paddingHorizontal,
                        paddingVertical: comboboxRecipe.sectionLabel.paddingVertical,
                    }, variant: comboboxRecipe.sectionLabel.textVariant, children: section.label })) : null, visibleItems.map((item) => {
                    optionIndex += 1;
                    return renderOption(item, optionIndex);
                })] }, section.id));
    }) : filteredItems.map(renderOption);
    return (_jsxs(View, { style: [{ gap: spacing.xs }, style], children: [label ? _jsxs(Text, { tone: "primary", variant: "label", children: [label, required ? " *" : ""] }) : null, _jsxs(View, { style: {
                    alignItems: "center",
                    backgroundColor: colors.bg,
                    borderColor: error ? colors.danger : colors.border,
                    borderRadius: radius.md,
                    borderWidth: error ? 2 : 1,
                    direction: environment.direction,
                    flexDirection: "row",
                    minHeight: sizeContract.minHeight,
                    paddingStart: spacing.sm,
                }, children: [leading ? (_jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", children: leading })) : null, _jsx(TextInput, { ...inputTextScaleProps, ref: inputRef, accessibilityHint: readOnly ? readOnlyLabel : error ?? description, accessibilityLabel: accessibleName, accessibilityRole: "combobox", accessibilityState: {
                            busy: busy || viewStatus === "loading" || viewStatus === "loadingMore",
                            disabled: disabled || readOnly || busy,
                            expanded: visible,
                        }, editable: !disabled && !readOnly && !busy, onChangeText: (next) => {
                            setQuery(next);
                            setActiveIndex(-1);
                            if (!visible && !readOnly)
                                requestOpen(true, "keyboard");
                        }, onFocus: () => {
                            if (openOnFocus && !disabled && !readOnly && !busy)
                                requestOpen(true, "trigger");
                        }, onKeyPress: (event) => {
                            const key = event.nativeEvent.key;
                            if (key === "Escape") {
                                dismiss("escape");
                            }
                            else if (key === "ArrowDown") {
                                if (!visible)
                                    requestOpen(true, "keyboard");
                                moveActive(1);
                            }
                            else if (key === "ArrowUp") {
                                if (!visible)
                                    requestOpen(true, "keyboard");
                                moveActive(-1);
                            }
                            else if (key === "Home") {
                                setActiveIndex(firstEnabledIndex());
                            }
                            else if (key === "End") {
                                setActiveIndex(lastEnabledIndex());
                            }
                            else if (key === "Enter" && activeIndex >= 0) {
                                const active = filteredItems[activeIndex];
                                if (active)
                                    commit(active);
                            }
                        }, placeholder: placeholder, placeholderTextColor: colors.textWeak, value: query }), query.length > 0 && !readOnly ? (_jsx(Pressable, { accessibilityLabel: clearLabel, accessibilityRole: "button", disabled: disabled || busy || viewStatus === "loading", onPress: clear, style: minimumTargetStyle, children: _jsx(Text, { align: "center", tone: "muted", variant: "title", children: "\u00D7" }) })) : null] }), error ? (_jsx(Text, { accessibilityLiveRegion: "assertive", tone: "danger", variant: "caption", children: error })) : description ? (_jsx(Text, { tone: "muted", variant: "caption", children: description })) : null, _jsx(Modal, { ...modalProps, animationType: "none", onDismiss: modalDismiss.onDismiss, onRequestClose: () => dismiss("escape"), onShow: () => {
                    modalDismiss.onShow();
                    focusInitialOption();
                }, transparent: true, visible: visible, children: _jsxs(View, { style: { flex: 1, justifyContent: "flex-end" }, children: [_jsx(Pressable, { accessibilityLabel: dismissLabel, accessibilityRole: "button", onPress: () => dismiss("outside"), style: { backgroundColor: "#00000088", bottom: 0, left: 0, position: "absolute", right: 0, top: 0 } }), _jsxs(View, { accessibilityLabel: resultsAccessibilityLabel ?? accessibleName, accessibilityRole: "radiogroup", accessibilityViewIsModal: true, style: {
                                backgroundColor: colors.bg,
                                borderTopLeftRadius: radius.lg,
                                borderTopRightRadius: radius.lg,
                                gap: spacing.sm,
                                maxHeight: "75%",
                                padding: spacing.md,
                            }, children: [_jsx(Text, { tone: "primary", variant: "title", children: label ?? accessibleName }), viewStatus === "loading" || viewStatus === "prompt" || viewStatus === "error" || viewStatus === "empty" ? (_jsxs(View, { style: { gap: spacing.sm, minHeight: comboboxRecipe.stateMessage.minHeight }, children: [viewStatus === "loading" ? _jsx(ActivityIndicator, {}) : null, _jsx(Text, { accessibilityLiveRegion: viewStatus === "error" ? "assertive" : "polite", accessibilityRole: viewStatus === "error" ? "alert" : undefined, tone: viewStatus === "error" ? "danger" : "muted", children: stateMessage }), viewStatus === "error" && onRetry ? (_jsx(Button, { onPress: onRetry, tone: "secondary", children: retryLabel ?? dismissLabel })) : null] })) : (_jsxs(ScrollView, { keyboardShouldPersistTaps: "handled", children: [collection, viewStatus === "loadingMore" ? (_jsxs(View, { accessibilityLiveRegion: "polite", accessibilityState: { busy: true }, style: { alignItems: "center", flexDirection: "row", gap: spacing.xs }, children: [_jsx(ActivityIndicator, {}), _jsx(Text, { tone: "muted", children: stateMessage || loadingMoreMessage || loadingMessage })] })) : null] })), _jsx(Button, { onPress: () => dismiss("programmatic"), tone: "secondary", children: dismissLabel })] })] }) })] }));
}
//# sourceMappingURL=forms.js.map