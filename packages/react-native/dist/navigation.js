import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { radius, spacing, typography } from "@hjm/design-contracts/foundations";
import { createLoadMoreController, loadMoreBehaviorDefaults, validateLoadMoreDescriptor, } from "@hjm/design-contracts/components/load-more";
import { resolveBottomNavigationActivation, resolveBottomNavigationConfiguration, resolveBottomNavigationDescriptor, } from "@hjm/design-contracts/components/bottom-navigation";
import { getTabNavigationTarget, resolveInitialTabValue, tabsBehaviorDefaults, } from "@hjm/design-contracts/behaviors";
import { useCallback, useEffect, useMemo, useRef, useState, } from "react";
import { AccessibilityInfo, Modal, Pressable, ScrollView, View, findNodeHandle, } from "react-native";
import { Button } from "./actions.js";
import { useControllableState } from "./internal/state.js";
import { minimumTargetStyle } from "./internal/styles.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
import { Spinner } from "./feedback.js";
export function Tabs(props) {
    const { label, options, value: valueProp, defaultValue, onValueChange, activationMode = tabsBehaviorDefaults.activationMode, mountPolicy = tabsBehaviorDefaults.mountPolicy, panelMode = tabsBehaviorDefaults.panelMode, orientation = tabsBehaviorDefaults.orientation, direction: directionProp, loop = tabsBehaviorDefaults.loop, children, style, tabListStyle, } = props;
    if (!label.trim())
        throw new TypeError("Tabs label must not be empty");
    if (options.length === 0)
        throw new TypeError("Tabs requires at least one option");
    if (panelMode === "dynamic" && mountPolicy !== "active") {
        throw new TypeError("Tabs dynamic panelMode requires active mountPolicy");
    }
    const { colors, environment } = useHjmNativeTheme();
    const direction = directionProp ?? environment.direction;
    const descriptors = options.map((option) => ({
        id: option.value,
        label: option.label,
        ...(option.disabled === undefined ? {} : { disabled: option.disabled }),
    }));
    const collectionFallback = resolveInitialTabValue(descriptors);
    if (collectionFallback === undefined)
        throw new TypeError("Tabs requires an enabled option");
    if (valueProp !== undefined)
        resolveInitialTabValue(descriptors, valueProp);
    const initialRef = useRef(null);
    if (initialRef.current === null) {
        const initial = resolveInitialTabValue(descriptors, valueProp ?? defaultValue);
        if (initial === undefined)
            throw new TypeError("Tabs requires an enabled option");
        initialRef.current = { value: initial };
    }
    const [storedValue, setSelected] = useControllableState({
        ...(valueProp === undefined ? {} : { value: valueProp }),
        defaultValue: initialRef.current.value,
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    const controlled = valueProp !== undefined;
    const storedValueValid = descriptors.some((item) => item.id === storedValue && !item.disabled);
    const selected = storedValueValid ? storedValue : collectionFallback;
    const [focusValue, setFocusValue] = useState(selected);
    const [visited, setVisited] = useState(() => new Set([selected]));
    const tabRefs = useRef(new Map());
    useEffect(() => {
        if (!controlled && !storedValueValid)
            setSelected(collectionFallback);
    }, [collectionFallback, controlled, setSelected, storedValueValid]);
    useEffect(() => {
        if (!descriptors.some((item) => item.id === focusValue && !item.disabled)) {
            setFocusValue(selected);
        }
    }, [descriptors, focusValue, selected]);
    useEffect(() => {
        setVisited((current) => {
            const known = new Set(options.map((option) => option.value));
            const next = new Set([...current].filter((id) => known.has(id)));
            next.add(selected);
            if (next.size === current.size && [...next].every((id) => current.has(id)))
                return current;
            return next;
        });
    }, [options, selected]);
    const focusTab = (target) => {
        setFocusValue(target);
        if (activationMode === "automatic")
            setSelected(target);
        queueMicrotask(() => {
            const node = tabRefs.current.get(target);
            if (!node)
                return;
            const handle = findNodeHandle(node);
            if (handle !== null)
                AccessibilityInfo.setAccessibilityFocus(handle);
        });
    };
    const moveFocus = (from, intent) => {
        const target = getTabNavigationTarget(descriptors, from, intent, loop);
        if (target !== undefined)
            focusTab(target);
    };
    const hasPanels = children !== undefined || options.some((option) => option.panel !== undefined);
    return (_jsxs(View, { accessibilityLabel: label, style: [
            {
                flexDirection: orientation === "vertical"
                    ? direction === "rtl" ? "row-reverse" : "row"
                    : "column",
                gap: spacing.md,
            },
            style,
        ], children: [_jsx(View, { accessibilityLabel: label, accessibilityRole: "tablist", style: [
                    {
                        flexDirection: orientation === "vertical"
                            ? "column"
                            : direction === "rtl" ? "row-reverse" : "row",
                    },
                    tabListStyle,
                ], children: options.map((option) => {
                    const active = selected === option.value;
                    return (_jsxs(Pressable, { ref: (node) => {
                            if (node)
                                tabRefs.current.set(option.value, node);
                            else
                                tabRefs.current.delete(option.value);
                        }, accessibilityActions: [
                            { name: "activate" },
                            { name: "increment" },
                            { name: "decrement" },
                        ], accessibilityLabel: option.badge
                            ? `${option.label}, ${option.badgeAccessibilityLabel ?? option.badge}`
                            : option.label, accessibilityRole: "tab", accessibilityState: { disabled: option.disabled === true, selected: active }, disabled: option.disabled, onAccessibilityAction: (event) => {
                            const action = event.nativeEvent.actionName;
                            if (action === "activate")
                                setSelected(option.value);
                            else if (action === "increment")
                                moveFocus(option.value, "next");
                            else if (action === "decrement")
                                moveFocus(option.value, "previous");
                        }, onFocus: () => {
                            setFocusValue(option.value);
                            if (activationMode === "automatic")
                                setSelected(option.value);
                        }, onPress: () => {
                            setFocusValue(option.value);
                            setSelected(option.value);
                        }, style: ({ pressed }) => [
                            minimumTargetStyle,
                            {
                                alignItems: "center",
                                borderBottomColor: orientation === "horizontal" && active ? colors.primary : "transparent",
                                borderBottomWidth: orientation === "horizontal" ? 2 : 0,
                                borderStartColor: orientation === "vertical" && active ? colors.primary : "transparent",
                                borderStartWidth: orientation === "vertical" ? 2 : 0,
                                flex: orientation === "horizontal" ? 1 : undefined,
                                flexDirection: "row",
                                gap: spacing.xs,
                                justifyContent: "center",
                                opacity: option.disabled ? 0.5 : pressed ? 0.86 : 1,
                                paddingHorizontal: spacing.sm,
                            },
                        ], children: [_jsx(Text, { align: "center", style: { fontWeight: active ? typography.label.fontWeight : typography.body.fontWeight }, tone: active ? "brand" : "muted", children: option.label }), option.badge ? (_jsx(View, { accessible: false, style: {
                                    backgroundColor: colors.surfaceAccent,
                                    borderRadius: radius.full,
                                    paddingHorizontal: spacing.xs,
                                }, children: _jsx(Text, { align: "center", tone: "brand", variant: "caption", children: option.badge }) })) : null] }, option.value));
                }) }), hasPanels ? panelMode === "dynamic" ? (_jsx(View, { accessibilityLabel: options.find((option) => option.value === selected)?.panelAccessibilityLabel, importantForAccessibility: "yes", role: "tabpanel", style: { flex: 1 }, children: options.find((option) => option.value === selected)?.panel ?? children?.(selected) })) : options.map((option) => {
                const active = option.value === selected;
                const mounted = mountPolicy === "always" ||
                    (mountPolicy === "visited" && (visited.has(option.value) || active)) ||
                    (mountPolicy === "active" && active);
                if (!mounted)
                    return null;
                return (_jsx(View, { accessibilityLabel: option.panelAccessibilityLabel, importantForAccessibility: active ? "yes" : "no-hide-descendants", role: "tabpanel", style: { display: active ? "flex" : "none", flex: 1 }, children: option.panel ?? children?.(option.value) }, option.value));
            }) : null] }));
}
/** Router-owned persistent destinations; activation emits intent without mutating selection. */
export function BottomNavigation({ descriptor, onActivate, renderIcon, configuration = {}, safeAreaBottom = 0, style, }) {
    const resolved = resolveBottomNavigationDescriptor(descriptor);
    if (resolved.items.length > 5) {
        throw new RangeError("BottomNavigation supports at most 5 destinations on Native");
    }
    if (!Number.isFinite(safeAreaBottom) || safeAreaBottom < 0) {
        throw new RangeError("BottomNavigation safeAreaBottom must be non-negative");
    }
    const { colors, environment } = useHjmNativeTheme();
    const presentation = resolveBottomNavigationConfiguration({
        ...configuration,
        direction: configuration.direction ?? environment.direction,
    }, resolved.items.length);
    const compact = presentation.density === "compact";
    return (_jsx(View, { accessibilityLabel: resolved.accessibilityLabel, accessibilityRole: "tablist", style: [
            {
                backgroundColor: colors.bg,
                borderColor: colors.border,
                borderRadius: presentation.presentation === "floating" ? radius.lg : 0,
                borderTopWidth: 1,
                flexDirection: presentation.direction === "rtl" ? "row-reverse" : "row",
                gap: presentation.distribution === "center-gap" ? spacing.md : 0,
                marginHorizontal: presentation.presentation === "floating" ? spacing.md : 0,
                paddingBottom: safeAreaBottom,
                paddingHorizontal: presentation.presentation === "floating" ? spacing.xs : 0,
            },
            style,
        ], children: resolved.items.map((item) => {
            const active = item.id === resolved.selectedKey;
            return (_jsxs(Pressable, { accessibilityLabel: item.resolvedAccessibilityLabel, accessibilityRole: "tab", accessibilityState: { disabled: item.disabled, selected: active }, disabled: item.disabled, onPress: () => {
                    const activation = resolveBottomNavigationActivation(descriptor, item.id);
                    if (activation)
                        onActivate(activation);
                }, style: ({ pressed }) => [
                    minimumTargetStyle,
                    {
                        alignItems: "center",
                        flex: presentation.distribution === "equal" ? 1 : undefined,
                        gap: spacing.xxs,
                        justifyContent: "center",
                        minHeight: compact ? 52 : 60,
                        opacity: item.disabled ? 0.5 : pressed ? 0.86 : 1,
                        paddingHorizontal: spacing.xxs,
                        paddingVertical: spacing.xs,
                    },
                ], children: [_jsx(View, { accessible: false, children: renderIcon({ name: item.icon.name, selected: active }) }), _jsxs(View, { accessible: false, style: { alignItems: "center", flexDirection: "row", gap: spacing.xxs }, children: [_jsx(Text, { align: "center", tone: active ? "brand" : "muted", variant: "caption", children: item.label }), item.badge ? (_jsx(View, { style: { backgroundColor: colors.dangerFill, borderRadius: radius.full, paddingHorizontal: spacing.xxs }, children: _jsx(Text, { align: "center", tone: "inverse", variant: "caption", children: item.badge.visibleLabel }) })) : null] })] }, item.id));
        }) }));
}
/** Native screen top bar with logical action slots and large-text reflow. */
export function TopBar({ title, leading, trailing, centered = true, accessibilityLabel = title, safeAreaTop = 0, style, }) {
    if (!Number.isFinite(safeAreaTop) || safeAreaTop < 0) {
        throw new RangeError("TopBar safeAreaTop must be non-negative");
    }
    const { colors, environment } = useHjmNativeTheme();
    const largeText = environment.textScale >= 1.6;
    const logicalLeading = environment.direction === "rtl" ? trailing : leading;
    const logicalTrailing = environment.direction === "rtl" ? leading : trailing;
    return (_jsx(View, { accessibilityLabel: accessibilityLabel, accessibilityRole: "toolbar", style: [
            {
                alignItems: largeText ? "stretch" : "center",
                backgroundColor: colors.bg,
                flexDirection: largeText ? "column" : "row",
                gap: spacing.xs,
                minHeight: 52 + safeAreaTop,
                paddingHorizontal: spacing.md,
                paddingTop: safeAreaTop,
            },
            style,
        ], children: largeText ? (_jsxs(_Fragment, { children: [_jsxs(View, { style: { flexDirection: environment.direction === "rtl" ? "row-reverse" : "row", justifyContent: "space-between" }, children: [_jsx(View, { style: { minWidth: 44 }, children: leading }), _jsx(View, { style: { minWidth: 44 }, children: trailing })] }), _jsx(Text, { accessibilityRole: "header", tone: "primary", variant: "bodyLarge", children: title })] })) : (_jsxs(_Fragment, { children: [_jsx(View, { style: { alignItems: "flex-start", flex: 1, minWidth: 44 }, children: logicalLeading }), _jsx(Text, { accessibilityRole: "header", align: centered ? "center" : undefined, numberOfLines: 1, style: { flex: 2 }, tone: "primary", variant: "bodyLarge", children: title }), _jsx(View, { style: { alignItems: "flex-end", flex: 1, minWidth: 44 }, children: logicalTrailing })] })) }));
}
/** A compact Modal-backed action menu suitable for touch and screen readers. */
export function Menu({ triggerLabel, title = triggerLabel, items, onSelect, open, defaultOpen = false, onOpenChange, disabled = false, dismissLabel, trigger, style, ...modalProps }) {
    if (items.length === 0)
        throw new Error("Menu requires at least one item");
    if (new Set(items.map((item) => item.value)).size !== items.length) {
        throw new TypeError("Menu values must be unique");
    }
    const { colors, environment } = useHjmNativeTheme();
    const [visible, setVisible] = useControllableState({
        ...(open === undefined ? {} : { value: open }),
        defaultValue: defaultOpen,
        ...(onOpenChange === undefined ? {} : { onChange: onOpenChange }),
    });
    const triggerRef = useRef(null);
    const itemRefs = useRef(new Map());
    const previouslyVisible = useRef(visible);
    useEffect(() => {
        if (previouslyVisible.current && !visible && triggerRef.current) {
            const handle = findNodeHandle(triggerRef.current);
            if (handle !== null)
                AccessibilityInfo.setAccessibilityFocus(handle);
        }
        previouslyVisible.current = visible;
    }, [visible]);
    const close = () => setVisible(false);
    const focusFirstItem = () => {
        const first = items.find((item) => !item.disabled) ?? items[0];
        const target = itemRefs.current.get(first.value);
        if (target) {
            const handle = findNodeHandle(target);
            if (handle !== null)
                AccessibilityInfo.setAccessibilityFocus(handle);
        }
    };
    return (_jsxs(View, { style: style, children: [_jsx(Pressable, { ref: triggerRef, accessibilityLabel: triggerLabel, accessibilityRole: "button", accessibilityState: { disabled, expanded: visible }, disabled: disabled, onPress: () => setVisible(true), style: ({ pressed }) => [
                    minimumTargetStyle,
                    {
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: disabled ? 0.5 : pressed ? 0.86 : 1,
                    },
                ], children: trigger ?? _jsx(Text, { tone: "brand", variant: "label", children: triggerLabel }) }), _jsx(Modal, { ...modalProps, animationType: environment.reducedMotion ? "none" : "fade", onRequestClose: close, onShow: focusFirstItem, transparent: true, visible: visible, children: _jsxs(View, { style: { flex: 1, justifyContent: "center", padding: spacing.md }, children: [_jsx(Pressable, { accessibilityLabel: dismissLabel, accessibilityRole: "button", onPress: close, style: {
                                backgroundColor: "#00000088",
                                bottom: 0,
                                left: 0,
                                position: "absolute",
                                right: 0,
                                top: 0,
                            } }), _jsxs(View, { accessibilityLabel: title, accessibilityRole: "menu", accessibilityViewIsModal: true, style: {
                                alignSelf: "center",
                                backgroundColor: colors.bg,
                                borderRadius: radius.lg,
                                gap: spacing.sm,
                                maxHeight: "75%",
                                maxWidth: 520,
                                padding: spacing.md,
                                width: "100%",
                            }, children: [_jsx(Text, { tone: "primary", variant: "title", children: title }), _jsx(ScrollView, { children: items.map((item) => (_jsxs(Pressable, { ref: (node) => {
                                            if (node)
                                                itemRefs.current.set(item.value, node);
                                            else
                                                itemRefs.current.delete(item.value);
                                        }, accessibilityHint: item.accessibilityHint ?? item.description, accessibilityLabel: item.label, accessibilityRole: "menuitem", accessibilityState: { disabled: item.disabled === true }, disabled: item.disabled, onPress: () => {
                                            try {
                                                void onSelect(item.value);
                                            }
                                            finally {
                                                close();
                                            }
                                        }, style: ({ pressed }) => [
                                            minimumTargetStyle,
                                            {
                                                alignItems: "center",
                                                borderRadius: radius.md,
                                                flexDirection: environment.direction === "rtl" ? "row-reverse" : "row",
                                                gap: spacing.sm,
                                                opacity: item.disabled ? 0.5 : pressed ? 0.86 : 1,
                                                paddingHorizontal: spacing.sm,
                                            },
                                        ], children: [item.icon ? _jsx(View, { accessible: false, children: item.icon }) : null, _jsxs(View, { style: { flex: 1, gap: spacing.xxs }, children: [_jsx(Text, { tone: item.tone === "danger" ? "danger" : "body", variant: "bodyLarge", children: item.label }), item.description ? _jsx(Text, { tone: "muted", variant: "caption", children: item.description }) : null] })] }, item.value))) }), _jsx(Button, { onPress: close, tone: "secondary", children: dismissLabel })] })] }) })] }));
}
/** Collection footer that de-duplicates automatic and manual page requests. */
export function LoadMore({ descriptor, onLoadMore, mode = loadMoreBehaviorDefaults.mode, style, }) {
    validateLoadMoreDescriptor(descriptor);
    const controller = useMemo(() => createLoadMoreController({ mode, onLoadMore }), [mode, onLoadMore]);
    const lastAutomaticKey = useRef(null);
    const request = useCallback((state, reason) => {
        void controller.request(state, reason).catch(() => undefined);
    }, [controller]);
    useEffect(() => () => {
        controller.dispose();
    }, [controller]);
    useEffect(() => {
        const state = descriptor.state;
        if (mode === "automatic" &&
            state.status === "ready" &&
            lastAutomaticKey.current !== state.requestKey) {
            lastAutomaticKey.current = state.requestKey;
            request(state, "viewport");
        }
    }, [descriptor.state, mode, request]);
    const { state, labels } = descriptor;
    return (_jsx(View, { style: [{ alignItems: "center", gap: spacing.xs, padding: spacing.sm }, style], children: state.status === "ready" ? (mode === "manual" ? (_jsx(Button, { onPress: () => request(state, "manual"), tone: "secondary", children: labels.loadMore })) : (_jsx(Text, { accessibilityLiveRegion: "polite", tone: "muted", variant: "caption", children: labels.loading }))) : state.status === "loading" ? (_jsx(Spinner, { label: labels.loading })) : state.status === "error" ? (_jsxs(_Fragment, { children: [_jsx(Text, { accessibilityLiveRegion: "assertive", tone: "danger", children: state.message }), _jsx(Button, { onPress: () => request(state, "retry"), tone: "secondary", children: labels.retry })] })) : (_jsx(Text, { accessibilityLiveRegion: "polite", tone: "muted", variant: "caption", children: labels.complete })) }));
}
//# sourceMappingURL=navigation.js.map