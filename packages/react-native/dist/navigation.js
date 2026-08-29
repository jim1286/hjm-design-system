import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { glyph, radius, spacing } from "@hjmds/design-contracts/foundations";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { bottomNavigationRecipe, counterBadgeRecipe, loadMoreRecipe, menuRecipe, spinnerRecipe, tabsRecipe, topBarRecipe, } from "@hjmds/design-contracts/recipes";
import { createLoadMoreController, validateLoadMoreDescriptor, } from "@hjmds/design-contracts/components/load-more";
import { resolveBottomNavigationActivation, resolveBottomNavigationConfiguration, resolveBottomNavigationDescriptor, } from "@hjmds/design-contracts/components/bottom-navigation";
import { getTabNavigationTarget, resolveInitialTabValue, tabsBehaviorDefaults, } from "@hjmds/design-contracts/behaviors";
import { flattenCollectionItems, validateCollection, } from "@hjmds/design-contracts/components/collection";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, } from "react";
import { ActivityIndicator, AccessibilityInfo, Keyboard, Modal, Platform, Pressable, ScrollView, View, findNodeHandle, } from "react-native";
import { Button } from "./actions.js";
import { useControllableState } from "./internal/state.js";
import { scheduleAfterNativeModalTeardown, shouldAwaitNativeModalDismiss, } from "./internal/modal-lifecycle.js";
import { minimumTargetStyle } from "./internal/styles.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
import { Spinner } from "./feedback.js";
function encodedTabId(value) {
    return encodeURIComponent(value);
}
export function getTabId(tabsId, value) {
    return `${tabsId}-tab-${encodedTabId(value)}`;
}
export function getTabPanelId(tabsId, value, mode = "keyed") {
    return mode === "dynamic"
        ? `${tabsId}-panel`
        : `${tabsId}-panel-${encodedTabId(value)}`;
}
export function getDynamicTabPanelId(tabsId) {
    return getTabPanelId(tabsId, "", "dynamic");
}
/** External panel host for products that keep routing, query, or list state outside Tabs. */
export function TabPanel(props) {
    const { tabsId, activeValue, label, children, style } = props;
    const dynamic = props.mode === "dynamic";
    const value = dynamic ? activeValue : props.value;
    const selected = value === activeValue;
    const mountPolicy = dynamic
        ? "active"
        : props.mountPolicy ?? tabsBehaviorDefaults.mountPolicy;
    const [visited, setVisited] = useState(selected);
    useEffect(() => {
        if (selected)
            setVisited(true);
    }, [selected]);
    const mounted = dynamic || selected || mountPolicy === "always" ||
        (mountPolicy === "visited" && visited);
    if (!mounted)
        return null;
    return (_jsx(View, { nativeID: getTabPanelId(tabsId, value, dynamic ? "dynamic" : "keyed"), accessibilityLabel: label, accessibilityLabelledBy: getTabId(tabsId, dynamic ? activeValue : value), accessibilityElementsHidden: !selected, importantForAccessibility: selected ? "auto" : "no-hide-descendants", pointerEvents: selected ? "auto" : "none", role: "tabpanel", style: [style, selected ? null : { display: "none" }], children: children }));
}
export function Tabs(props) {
    const { id, label, options, value: valueProp, defaultValue, onValueChange, activationMode = tabsBehaviorDefaults.activationMode, mountPolicy = tabsBehaviorDefaults.mountPolicy, panelMode = tabsBehaviorDefaults.panelMode, orientation = tabsBehaviorDefaults.orientation, direction: directionProp, loop = tabsBehaviorDefaults.loop, size = tabsRecipe.defaults.size, layout = tabsRecipe.defaults.layout, overflow = tabsRecipe.defaults.overflow, renderPanels = true, children, style, tabListStyle, } = props;
    if (!label.trim())
        throw new TypeError("Tabs label must not be empty");
    if (options.length === 0)
        throw new TypeError("Tabs requires at least one option");
    if (panelMode === "dynamic" && mountPolicy !== "active") {
        throw new TypeError("Tabs dynamic panelMode requires active mountPolicy");
    }
    const theme = useHjmNativeTheme();
    const { colors, environment } = theme;
    const direction = directionProp ?? environment.direction;
    const sizeContract = tabsRecipe.sizes[size];
    const fitted = tabsRecipe.layouts[layout].fitted;
    const scrollable = tabsRecipe.overflow[overflow].scrollable;
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
    const hasPanels = renderPanels &&
        (children !== undefined || options.some((option) => option.panel !== undefined));
    return (_jsxs(View, { accessibilityLabel: label, style: [
            {
                direction,
                flexDirection: orientation === "vertical" ? "row" : "column",
                gap: spacing.md,
            },
            style,
        ], children: [_jsx(ScrollView, { nativeID: id, accessibilityLabel: label, accessibilityRole: "tablist", horizontal: orientation === "horizontal", scrollEnabled: scrollable && !fitted, showsHorizontalScrollIndicator: false, showsVerticalScrollIndicator: false, style: tabListStyle, contentContainerStyle: [
                    {
                        borderBottomColor: orientation === "horizontal"
                            ? resolveColorReference(tabsRecipe.colors.divider, theme.palette)
                            : undefined,
                        borderBottomWidth: orientation === "horizontal"
                            ? tabsRecipe.indicatorHeight / 2
                            : 0,
                        borderEndColor: orientation === "vertical"
                            ? resolveColorReference(tabsRecipe.colors.divider, theme.palette)
                            : undefined,
                        borderEndWidth: orientation === "vertical"
                            ? tabsRecipe.indicatorHeight / 2
                            : 0,
                        direction,
                        flexGrow: fitted ? 1 : 0,
                        flexDirection: orientation === "vertical" ? "column" : "row",
                    },
                ], children: options.map((option) => {
                    const active = selected === option.value;
                    return (_jsxs(Pressable, { nativeID: id ? getTabId(id, option.value) : undefined, role: Platform.OS === "ios" ? "button" : "tab", ref: (node) => {
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
                                backgroundColor: pressed
                                    ? resolveColorReference(tabsRecipe.states.pressedBackground, theme.palette)
                                    : "transparent",
                                direction,
                                flex: fitted ? 1 : undefined,
                                flexDirection: "row",
                                gap: tabsRecipe.gap,
                                justifyContent: "center",
                                minHeight: sizeContract.minHeight,
                                opacity: option.disabled ? tabsRecipe.states.disabledOpacity : 1,
                                paddingHorizontal: sizeContract.paddingHorizontal,
                                position: "relative",
                            },
                        ], children: [option.renderLeading ? (_jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", children: option.renderLeading({
                                    selected: active,
                                    disabled: option.disabled === true,
                                    color: resolveColorReference(active ? tabsRecipe.colors.selected : tabsRecipe.colors.idle, theme.palette),
                                    size: glyph[tabsRecipe.icon.glyph],
                                    glyphSize: glyph[tabsRecipe.icon.glyph],
                                }) })) : null, _jsx(Text, { align: "center", style: {
                                    color: resolveColorReference(active ? tabsRecipe.colors.selected : tabsRecipe.colors.idle, theme.palette),
                                    fontWeight: active
                                        ? tabsRecipe.label.selectedFontWeight
                                        : tabsRecipe.label.fontWeight,
                                }, variant: sizeContract.textVariant, children: option.label }), option.badge ? (_jsx(View, { accessible: false, style: {
                                    backgroundColor: colors.surfaceAccent,
                                    borderRadius: radius.full,
                                    paddingHorizontal: spacing.xs,
                                }, children: _jsx(Text, { align: "center", tone: "brand", variant: "caption", children: option.badge }) })) : null, active ? (_jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", style: {
                                    backgroundColor: resolveColorReference(tabsRecipe.colors.indicator, theme.palette),
                                    ...(orientation === "horizontal"
                                        ? {
                                            bottom: -tabsRecipe.indicatorHeight / 2,
                                            height: tabsRecipe.indicatorHeight,
                                            left: 0,
                                            right: 0,
                                        }
                                        : {
                                            bottom: 0,
                                            end: -tabsRecipe.indicatorHeight / 2,
                                            top: 0,
                                            width: tabsRecipe.indicatorHeight,
                                        }),
                                    position: "absolute",
                                } })) : null] }, option.value));
                }) }), hasPanels ? panelMode === "dynamic" ? (_jsx(View, { accessibilityLabel: options.find((option) => option.value === selected)?.panelAccessibilityLabel, accessibilityLabelledBy: id ? getTabId(id, selected) : undefined, nativeID: id ? getDynamicTabPanelId(id) : undefined, importantForAccessibility: "yes", role: "tabpanel", style: { flex: 1 }, children: options.find((option) => option.value === selected)?.panel ?? children?.(selected) })) : options.map((option) => {
                const active = option.value === selected;
                const mounted = mountPolicy === "always" ||
                    (mountPolicy === "visited" && (visited.has(option.value) || active)) ||
                    (mountPolicy === "active" && active);
                if (!mounted)
                    return null;
                return (_jsx(View, { accessibilityLabel: option.panelAccessibilityLabel, accessibilityLabelledBy: id ? getTabId(id, option.value) : undefined, nativeID: id ? getTabPanelId(id, option.value) : undefined, importantForAccessibility: active ? "yes" : "no-hide-descendants", role: "tabpanel", style: { display: active ? "flex" : "none", flex: 1 }, children: option.panel ?? children?.(option.value) }, option.value));
            }) : null] }));
}
function useBottomNavigationKeyboardVisible() {
    const [visible, setVisible] = useState(() => Keyboard.isVisible());
    useEffect(() => {
        const show = Keyboard.addListener("keyboardDidShow", () => setVisible(true));
        const hide = Keyboard.addListener("keyboardDidHide", () => setVisible(false));
        return () => {
            show.remove();
            hide.remove();
        };
    }, []);
    return visible;
}
/** Router-owned persistent destinations; activation emits intent without mutating selection. */
export function BottomNavigation({ descriptor, onActivate, onLongActivate, renderIcon, renderBadge, getItemTestID, primaryAction, configuration = {}, safeAreaBottom = 0, style, surfaceStyle, listStyle, primaryActionStyle, }) {
    const resolved = resolveBottomNavigationDescriptor(descriptor);
    if (!Number.isFinite(safeAreaBottom) || safeAreaBottom < 0) {
        throw new RangeError("BottomNavigation safeAreaBottom must be non-negative");
    }
    const theme = useHjmNativeTheme();
    const presentation = resolveBottomNavigationConfiguration({
        ...configuration,
        direction: configuration.direction ?? theme.environment.direction,
    }, resolved.items.length);
    const keyboardVisible = useBottomNavigationKeyboardVisible();
    const density = bottomNavigationRecipe.density[presentation.density];
    const presentationRecipe = bottomNavigationRecipe.presentations[presentation.presentation];
    const centerGap = bottomNavigationRecipe.distributions[presentation.distribution].centerGap;
    const middleIndex = resolved.items.length / 2 - 1;
    const idleColor = resolveColorReference(bottomNavigationRecipe.colors.idle, theme.palette);
    const selectedIconColor = resolveColorReference(bottomNavigationRecipe.colors.selectedIcon, theme.palette);
    const selectedLabelColor = resolveColorReference(bottomNavigationRecipe.colors.selectedLabel, theme.palette);
    const pressedBackground = resolveColorReference(bottomNavigationRecipe.states.pressedBackground, theme.palette);
    const surfaceBackground = resolveColorReference(presentationRecipe.background, theme.palette);
    const surfaceBorder = resolveColorReference(presentationRecipe.border, theme.palette);
    const badgeMetrics = counterBadgeRecipe.sizes[bottomNavigationRecipe.badge.size];
    const badgeTone = counterBadgeRecipe.tones.danger;
    const badgeVariant = counterBadgeRecipe.variants[bottomNavigationRecipe.badge.variant];
    const [focusedKey, setFocusedKey] = useState(null);
    if (presentation.keyboardBehavior === "hide" && keyboardVisible)
        return null;
    return (_jsx(View, { style: [
            {
                backgroundColor: presentation.presentation === "bar" ? surfaceBackground : "transparent",
                direction: presentation.direction,
                paddingBottom: safeAreaBottom + bottomNavigationRecipe.safeArea.minimumBottomPadding,
                paddingHorizontal: presentationRecipe.outerPaddingHorizontal,
                paddingTop: presentationRecipe.outerPaddingTop,
                width: "100%",
            },
            style,
        ], children: _jsxs(View, { style: [
                {
                    alignSelf: "center",
                    backgroundColor: surfaceBackground,
                    borderColor: surfaceBorder,
                    borderRadius: presentationRecipe.radius
                        ? radius[presentationRecipe.radius]
                        : 0,
                    borderTopWidth: presentation.presentation === "bar" ? presentationRecipe.borderWidth : 0,
                    borderWidth: presentation.presentation === "floating" ? presentationRecipe.borderWidth : 0,
                    elevation: presentationRecipe.shadow ? 8 : 0,
                    maxWidth: presentationRecipe.maxWidth ?? undefined,
                    position: "relative",
                    shadowColor: presentationRecipe.shadow?.color,
                    shadowOffset: presentationRecipe.shadow
                        ? { width: 0, height: presentationRecipe.shadow.offsetY }
                        : undefined,
                    shadowOpacity: presentationRecipe.shadow?.opacity,
                    shadowRadius: presentationRecipe.shadow?.radius,
                    width: "100%",
                },
                surfaceStyle,
            ], children: [_jsx(View, { accessibilityLabel: resolved.accessibilityLabel, accessibilityRole: "tablist", style: [
                        {
                            alignItems: "flex-start",
                            direction: presentation.direction,
                            flexDirection: "row",
                            width: "100%",
                        },
                        listStyle,
                    ], children: resolved.items.map((item, index) => {
                        const selected = item.id === resolved.selectedKey;
                        const focused = focusedKey === item.id;
                        const sourceBadge = descriptor.items[index]?.badge;
                        return (_jsxs(Pressable, { accessibilityLabel: item.resolvedAccessibilityLabel, accessibilityRole: "tab", accessibilityState: { disabled: item.disabled, selected }, disabled: item.disabled, onBlur: () => {
                                setFocusedKey((current) => current === item.id ? null : current);
                            }, onFocus: () => setFocusedKey(item.id), onLongPress: onLongActivate
                                ? () => {
                                    const activation = resolveBottomNavigationActivation(descriptor, item.id);
                                    if (activation)
                                        onLongActivate(activation);
                                }
                                : undefined, onPress: () => {
                                const activation = resolveBottomNavigationActivation(descriptor, item.id);
                                if (activation)
                                    onActivate(activation);
                            }, testID: getItemTestID?.(item), style: ({ pressed }) => [
                                minimumTargetStyle,
                                {
                                    alignItems: "center",
                                    backgroundColor: pressed ? pressedBackground : "transparent",
                                    borderRadius: radius.lg,
                                    flex: 1,
                                    flexShrink: 1,
                                    gap: density.gap,
                                    justifyContent: "flex-start",
                                    marginEnd: index === middleIndex ? centerGap : 0,
                                    minHeight: density.itemMinHeight,
                                    minWidth: density.itemMinWidth,
                                    opacity: item.disabled
                                        ? bottomNavigationRecipe.states.disabledOpacity
                                        : 1,
                                    outlineColor: focused
                                        ? resolveColorReference(bottomNavigationRecipe.states.focus.color, theme.palette)
                                        : "transparent",
                                    outlineOffset: focused
                                        ? bottomNavigationRecipe.states.focus.offset
                                        : 0,
                                    outlineStyle: focused ? "solid" : undefined,
                                    outlineWidth: focused
                                        ? bottomNavigationRecipe.states.focus.width
                                        : 0,
                                    padding: density.padding,
                                },
                            ], children: [_jsxs(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", style: {
                                        alignItems: "center",
                                        borderRadius: radius[bottomNavigationRecipe.indicator.radius],
                                        borderWidth: bottomNavigationRecipe.indicator.borderWidth,
                                        justifyContent: "center",
                                        minHeight: bottomNavigationRecipe.indicator.minHeight,
                                        minWidth: bottomNavigationRecipe.indicator.minWidth,
                                        position: "relative",
                                        transform: [{
                                                scale: selected
                                                    ? bottomNavigationRecipe.icon.selectedEmphasis.scale.selected
                                                    : bottomNavigationRecipe.icon.selectedEmphasis.scale.idle,
                                            }],
                                    }, children: [renderIcon({
                                            item,
                                            name: item.icon.name,
                                            selected,
                                            color: selected ? selectedIconColor : idleColor,
                                            size: glyph[density.icon],
                                            strokeWidth: selected
                                                ? bottomNavigationRecipe.icon.selectedEmphasis.strokeWidth.selected
                                                : bottomNavigationRecipe.icon.selectedEmphasis.strokeWidth.idle,
                                        }), item.badge && sourceBadge ? (_jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", style: {
                                                end: bottomNavigationRecipe.badge.anchor.inlineEnd,
                                                position: "absolute",
                                                top: bottomNavigationRecipe.badge.anchor.blockStart,
                                            }, children: renderBadge ? renderBadge({
                                                item,
                                                badge: item.badge,
                                                count: sourceBadge.count,
                                                ...(sourceBadge.max === undefined ? {} : { max: sourceBadge.max }),
                                                selected,
                                            }) : (_jsx(View, { style: {
                                                    alignItems: "center",
                                                    backgroundColor: resolveColorReference(badgeTone.background, theme.palette),
                                                    borderColor: badgeVariant.border
                                                        ? resolveColorReference(badgeVariant.border, theme.palette)
                                                        : "transparent",
                                                    borderRadius: radius[counterBadgeRecipe.radius],
                                                    borderWidth: badgeVariant.borderWidth,
                                                    justifyContent: "center",
                                                    minHeight: badgeMetrics.height,
                                                    minWidth: badgeMetrics.minWidth,
                                                    paddingHorizontal: badgeMetrics.paddingHorizontal,
                                                }, children: _jsx(Text, { accessible: false, align: "center", style: {
                                                        color: resolveColorReference(badgeTone.content, theme.palette),
                                                        fontWeight: counterBadgeRecipe.fontWeight,
                                                    }, variant: badgeMetrics.textVariant, children: item.badge.visibleLabel }) })) })) : null] }), _jsx(Text, { align: "center", allowFontScaling: bottomNavigationRecipe.largeText.allowFontScaling, maxFontSizeMultiplier: bottomNavigationRecipe.largeText.maxFontSizeMultiplier, style: {
                                        color: selected ? selectedLabelColor : idleColor,
                                        flexShrink: 1,
                                        fontWeight: selected
                                            ? bottomNavigationRecipe.label.selectedFontWeight
                                            : bottomNavigationRecipe.label.fontWeight,
                                        minWidth: 0,
                                    }, variant: density.label, children: item.label })] }, item.id));
                    }) }), primaryAction ? (_jsx(View, { pointerEvents: "box-none", style: [
                        {
                            alignItems: "center",
                            bottom: 0,
                            justifyContent: "center",
                            left: 0,
                            position: "absolute",
                            right: 0,
                            top: 0,
                        },
                        primaryActionStyle,
                    ], children: primaryAction })) : null] }) }));
}
/** Recipe-owned icon-over-micro-label action for Native screen chrome. */
export function TopBarAction(props) {
    const { label, accessibilityLabel, accessibilityState, children, disabled = false, labelVisibility = "visible", labelStyle, style, ...intentAndHostProps } = props;
    if (!label.trim())
        throw new TypeError("TopBarAction label must not be empty");
    const resolvedAccessibilityLabel = accessibilityLabel ?? label;
    if (!resolvedAccessibilityLabel.trim()) {
        throw new TypeError("TopBarAction accessibilityLabel must not be empty");
    }
    if (children === undefined || children === null || children === false) {
        throw new TypeError("TopBarAction requires icon or visual children");
    }
    const theme = useHjmNativeTheme();
    const intent = props.intent ?? "button";
    const hostProps = intent === "link"
        ? (() => {
            const { intent: _intent, destination: _destination, onNavigate: _onNavigate, renderLink: _renderLink, ...rest } = intentAndHostProps;
            return rest;
        })()
        : (() => {
            const { intent: _intent, onPress: _onPress, renderAction: _renderAction, ...rest } = intentAndHostProps;
            return rest;
        })();
    const handlePress = (event) => {
        if (disabled)
            return;
        if (props.intent === "link") {
            void props.onNavigate?.(props.destination);
        }
        else {
            props.onPress(event);
        }
    };
    const controlProps = {
        ...hostProps,
        accessible: true,
        accessibilityLabel: resolvedAccessibilityLabel,
        accessibilityRole: intent,
        accessibilityState: { ...accessibilityState, disabled },
        children: (_jsxs(_Fragment, { children: [_jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", pointerEvents: "none", children: children }), labelVisibility === "visible" ? (_jsx(Text, { accessible: false, style: [
                        {
                            color: resolveColorReference(topBarRecipe.actionLabel.color, theme.palette),
                            fontWeight: topBarRecipe.actionLabel.fontWeight,
                        },
                        labelStyle,
                    ], variant: topBarRecipe.actionLabel.textVariant, children: label })) : null] })),
        disabled,
        onPress: handlePress,
        role: intent,
        style: ({ pressed }) => [
            {
                alignItems: "center",
                direction: theme.environment.direction,
                gap: topBarRecipe.action.gap,
                justifyContent: "center",
                minHeight: topBarRecipe.action.minHeight,
                minWidth: topBarRecipe.action.minWidth,
                opacity: disabled
                    ? topBarRecipe.action.disabledOpacity
                    : pressed
                        ? topBarRecipe.action.pressedOpacity
                        : 1,
                paddingHorizontal: topBarRecipe.action.paddingHorizontal,
            },
            style,
        ],
    };
    if (props.intent === "link") {
        if (!props.renderLink && !props.onNavigate) {
            throw new TypeError("TopBarAction link intent requires renderLink or onNavigate");
        }
        const linkProps = { ...controlProps, destination: props.destination };
        return props.renderLink?.(linkProps) ?? _jsx(Pressable, { ...controlProps });
    }
    return props.renderAction?.(controlProps) ?? _jsx(Pressable, { ...controlProps });
}
/** Native screen top bar with logical action slots and large-text reflow. */
export function TopBar({ title, titleLeading, onTitlePress, titleAccessibilityLabel, titleAccessibilityHint, leading, trailing, actions, centered = topBarRecipe.defaults.centered, safeAreaTop = 0, style, leadingStyle, titleStyle, trailingStyle, }) {
    if (!Number.isFinite(safeAreaTop) || safeAreaTop < 0) {
        throw new RangeError("TopBar safeAreaTop must be non-negative");
    }
    if (title !== undefined && !title.trim()) {
        throw new TypeError("TopBar title must be omitted or contain non-whitespace copy");
    }
    if (titleAccessibilityLabel !== undefined && !titleAccessibilityLabel.trim()) {
        throw new TypeError("TopBar titleAccessibilityLabel must not be empty");
    }
    const hasLeading = leading !== undefined && leading !== null && leading !== false;
    const hasTrailing = trailing !== undefined && trailing !== null && trailing !== false;
    const hasActions = actions !== undefined && actions !== null && actions !== false;
    if (hasTrailing && hasActions) {
        throw new TypeError("TopBar accepts either trailing or actions, not both");
    }
    const trailingContent = hasTrailing ? trailing : actions;
    const hasTrailingContent = hasTrailing || hasActions;
    const hasTitle = title !== undefined;
    const resolvedTitle = title ?? "";
    if (!hasTitle && (titleLeading !== undefined ||
        onTitlePress !== undefined ||
        titleAccessibilityLabel !== undefined ||
        titleAccessibilityHint !== undefined)) {
        throw new TypeError("TopBar title affordance props require a title");
    }
    if (titleAccessibilityHint !== undefined && onTitlePress === undefined) {
        throw new TypeError("TopBar titleAccessibilityHint requires onTitlePress");
    }
    const renderCompactLeadingSlot = hasLeading || (hasTitle && centered);
    const renderCompactTrailingSlot = hasTrailingContent || (hasTitle && centered);
    const theme = useHjmNativeTheme();
    const largeText = theme.environment.textScale >= topBarRecipe.largeTextThreshold;
    const resolvedTitleStyle = [
        {
            color: resolveColorReference(topBarRecipe.title.color, theme.palette),
            fontWeight: topBarRecipe.title.fontWeight,
        },
        titleStyle,
    ];
    const renderTitle = (containerStyle, numberOfLines) => {
        const titleContent = (_jsxs(_Fragment, { children: [titleLeading !== undefined && titleLeading !== null && titleLeading !== false ? (_jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", pointerEvents: "none", children: titleLeading })) : null, _jsx(Text, { ...(onTitlePress
                        ? { accessible: false }
                        : {
                            accessibilityLabel: titleAccessibilityLabel,
                            accessibilityRole: "header",
                        }), numberOfLines: numberOfLines, style: [{ flexShrink: 1, minWidth: 0 }, resolvedTitleStyle], variant: topBarRecipe.title.textVariant, children: resolvedTitle })] }));
        const commonStyle = [
            containerStyle,
            {
                alignItems: "center",
                direction: theme.environment.direction,
                flexDirection: "row",
                gap: topBarRecipe.titleAction.gap,
                justifyContent: centered ? "center" : "flex-start",
                minHeight: topBarRecipe.titleAction.minHeight,
                minWidth: topBarRecipe.titleAction.minWidth,
            },
        ];
        if (onTitlePress) {
            return (_jsx(Pressable, { accessible: true, accessibilityHint: titleAccessibilityHint, accessibilityLabel: titleAccessibilityLabel ?? resolvedTitle, accessibilityRole: "button", onPress: onTitlePress, style: ({ pressed }) => [
                    commonStyle,
                    { opacity: pressed ? topBarRecipe.titleAction.pressedOpacity : 1 },
                ], children: titleContent }));
        }
        return (_jsx(View, { accessible: false, style: commonStyle, children: titleContent }));
    };
    return (_jsx(View, { accessibilityRole: "toolbar", style: [
            {
                alignItems: largeText ? "stretch" : "center",
                backgroundColor: resolveColorReference(topBarRecipe.background, theme.palette),
                direction: theme.environment.direction,
                flexDirection: largeText ? "column" : "row",
                gap: topBarRecipe.gap,
                minHeight: topBarRecipe.minHeight + safeAreaTop,
                paddingHorizontal: topBarRecipe.paddingHorizontal,
                paddingTop: safeAreaTop,
            },
            style,
        ], children: largeText ? (_jsxs(_Fragment, { children: [hasLeading || hasTitle ? (_jsxs(View, { style: {
                        alignItems: "center",
                        direction: theme.environment.direction,
                        flexDirection: "row",
                        gap: topBarRecipe.gap,
                        width: "100%",
                    }, children: [hasLeading ? (_jsx(View, { style: [
                                {
                                    alignItems: "flex-start",
                                    direction: theme.environment.direction,
                                    flexDirection: "row",
                                    minWidth: topBarRecipe.sideMinWidth,
                                },
                                leadingStyle,
                            ], children: leading })) : null, hasTitle ? (renderTitle({ flex: 1, flexShrink: 1, minWidth: 0 })) : null, hasTitle && centered && hasLeading ? (_jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", pointerEvents: "none", style: { minWidth: topBarRecipe.sideMinWidth } })) : null] })) : null, hasTrailingContent ? (_jsx(View, { style: [
                        {
                            direction: theme.environment.direction,
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: topBarRecipe.gap,
                            justifyContent: "flex-end",
                            minWidth: topBarRecipe.sideMinWidth,
                            width: "100%",
                        },
                        trailingStyle,
                    ], children: trailingContent })) : null] })) : (_jsxs(_Fragment, { children: [renderCompactLeadingSlot ? (_jsx(View, { style: [
                        {
                            alignItems: "center",
                            direction: theme.environment.direction,
                            flex: hasTitle ? 1 : undefined,
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            minWidth: topBarRecipe.sideMinWidth,
                        },
                        leadingStyle,
                    ], children: hasLeading ? leading : null })) : null, hasTitle ? (renderTitle({ flex: 2, flexShrink: 1, minWidth: 0 }, 1)) : null, renderCompactTrailingSlot ? (_jsx(View, { style: [
                        {
                            alignItems: "center",
                            direction: theme.environment.direction,
                            flex: hasTitle ? 1 : undefined,
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: topBarRecipe.gap,
                            justifyContent: "flex-end",
                            marginStart: hasTitle ? undefined : "auto",
                            minWidth: topBarRecipe.sideMinWidth,
                        },
                        trailingStyle,
                    ], children: hasTrailingContent ? trailingContent : null })) : null] })) }));
}
function useMenuAfterDismiss(visible) {
    const shownRef = useRef(false);
    const previousVisibleRef = useRef(visible);
    const pendingRef = useRef(null);
    const taskRef = useRef(null);
    const complete = useCallback(() => {
        taskRef.current?.cancel();
        taskRef.current = null;
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
        taskRef.current?.cancel();
        taskRef.current = scheduleAfterNativeModalTeardown(complete);
    }, [complete, visible]);
    useEffect(() => () => taskRef.current?.cancel(), []);
    return {
        queue(callback) {
            pendingRef.current = callback;
        },
        onDismiss: complete,
        onShow() {
            shownRef.current = true;
        },
    };
}
/** Sectioned Native action/selection menu with teardown-safe action callbacks. */
export function Menu({ triggerLabel, title = triggerLabel, items, sections, source: sourceProp, selection = { mode: "none" }, onSelect, onAction, onActionAfterDismiss, onSelectionAfterDismiss, open, defaultOpen = false, onOpenChange, onDismiss, disabled = false, readOnly = false, busy = false, readOnlyLabel, asyncState = { status: "idle" }, onRetry, retryLabel, density = menuRecipe.defaults.density, renderLeading, renderTrailing, dismissLabel, trigger, renderTrigger, style, ...modalProps }) {
    const providedSources = [sourceProp, items, sections].filter((candidate) => candidate !== undefined).length;
    if (providedSources !== 1) {
        throw new TypeError("Menu requires exactly one of source, items, or sections");
    }
    const source = sourceProp ?? (sections
        ? { sections }
        : {
            items: (items ?? []).map((item) => ({
                id: item.value,
                label: item.label,
                textValue: item.textValue ?? item.label,
                ...(item.description === undefined ? {} : { description: item.description }),
                ...(item.shortcut === undefined ? {} : { shortcut: item.shortcut }),
                ...(item.tone === undefined
                    ? {}
                    : { tone: item.tone === "danger" ? "danger" : "neutral" }),
                ...(item.disabled === undefined ? {} : { disabled: item.disabled }),
            })),
        });
    validateCollection(source);
    const collectionItems = flattenCollectionItems(source);
    const legacyItems = new Map((items ?? []).map((item) => [item.value, item]));
    if (collectionItems.length === 0 && asyncState.status === "idle") {
        throw new Error("Menu requires an item or a non-idle asyncState");
    }
    const theme = useHjmNativeTheme();
    const { colors, environment } = theme;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const visible = open ?? uncontrolledOpen;
    const [uncontrolledSingle, setUncontrolledSingle] = useState(selection.mode === "single" ? selection.defaultSelectedKey ?? null : null);
    const [uncontrolledMultiple, setUncontrolledMultiple] = useState(selection.mode === "multiple"
        ? selection.defaultSelectedKeys ?? new Set()
        : new Set());
    const selectedSingle = selection.mode === "single"
        ? selection.selectedKey ?? uncontrolledSingle
        : null;
    const selectedMultiple = selection.mode === "multiple"
        ? selection.selectedKeys ?? uncontrolledMultiple
        : new Set();
    for (const key of selection.mode === "multiple"
        ? selectedMultiple
        : selectedSingle === null ? [] : [selectedSingle]) {
        if (!collectionItems.some((item) => item.id === key)) {
            throw new RangeError(`Menu selection must identify an item: ${key}`);
        }
    }
    const triggerRef = useRef(null);
    const itemRefs = useRef(new Map());
    const modalDismiss = useMenuAfterDismiss(visible);
    const densityContract = menuRecipe.density[density];
    const requestOpen = useCallback((next, reason) => {
        if (next === visible)
            return;
        if (open === undefined)
            setUncontrolledOpen(next);
        onOpenChange?.(next, reason);
    }, [onOpenChange, open, visible]);
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
    const focusFirstItem = () => {
        const first = collectionItems.find((item) => !item.disabled) ?? collectionItems[0];
        if (!first)
            return;
        const target = itemRefs.current.get(first.id);
        if (target) {
            const handle = findNodeHandle(target);
            if (handle !== null)
                AccessibilityInfo.setAccessibilityFocus(handle);
        }
    };
    const activate = (item) => {
        if (item.disabled || disabled || readOnly || busy)
            return;
        if (selection.mode === "single") {
            if (selection.selectedKey === undefined)
                setUncontrolledSingle(item.id);
            selection.onSelectionChange?.(item.id);
            close("selection", onSelectionAfterDismiss
                ? () => onSelectionAfterDismiss(item.id)
                : null);
            return;
        }
        if (selection.mode === "multiple") {
            const next = new Set(selectedMultiple);
            if (next.has(item.id))
                next.delete(item.id);
            else
                next.add(item.id);
            if (selection.selectedKeys === undefined)
                setUncontrolledMultiple(next);
            selection.onSelectionChange?.(next);
            return;
        }
        void onSelect?.(item.id);
        void onAction?.(item.id);
        close("selection", onActionAfterDismiss ? () => onActionAfterDismiss(item.id) : null);
    };
    const renderItem = (item) => {
        const legacyItem = legacyItems.get(item.id);
        const selected = selection.mode === "single"
            ? selectedSingle === item.id
            : selection.mode === "multiple"
                ? selectedMultiple.has(item.id)
                : false;
        const itemDisabled = item.disabled === true || disabled || readOnly || busy;
        const contentColor = resolveColorReference(item.tone === "danger" ? menuRecipe.tones.danger : menuRecipe.tones.neutral, theme.palette);
        const leading = renderLeading?.(item, {
            selected,
            disabled: itemDisabled,
            color: resolveColorReference(menuRecipe.leading.color, theme.palette),
            size: glyph[menuRecipe.leading.glyph],
        }) ?? legacyItem?.icon;
        const trailing = renderTrailing?.(item);
        return (_jsxs(Pressable, { ref: (node) => {
                if (node)
                    itemRefs.current.set(item.id, node);
                else
                    itemRefs.current.delete(item.id);
            }, accessibilityHint: legacyItem?.accessibilityHint ?? item.description, accessibilityLabel: item.label, accessibilityRole: "menuitem", accessibilityState: {
                disabled: itemDisabled,
                ...(selection.mode === "single" ? { selected } : {}),
                ...(selection.mode === "multiple" ? { checked: selected } : {}),
            }, disabled: itemDisabled, onPress: () => activate(item), style: ({ pressed }) => [
                minimumTargetStyle,
                {
                    alignItems: "center",
                    backgroundColor: selected
                        ? resolveColorReference(densityContract.selectedBackground, theme.palette)
                        : pressed
                            ? resolveColorReference(densityContract.highlightedBackground, theme.palette)
                            : "transparent",
                    borderRadius: radius[densityContract.radius],
                    direction: environment.direction,
                    flexDirection: "row",
                    gap: densityContract.gap,
                    minHeight: densityContract.minHeight,
                    opacity: itemDisabled ? menuRecipe.states.disabledOpacity : 1,
                    paddingHorizontal: densityContract.paddingHorizontal,
                },
            ], children: [leading ? (_jsx(View, { accessibilityElementsHidden: true, accessible: false, importantForAccessibility: "no-hide-descendants", children: leading })) : null, _jsxs(View, { style: { flex: 1, gap: spacing.xxs, minWidth: 0 }, children: [_jsx(Text, { style: { color: contentColor }, variant: densityContract.label.textVariant, children: item.label }), item.description ? _jsx(Text, { tone: "muted", variant: densityContract.description.textVariant, children: item.description }) : null] }), item.shortcut ? _jsx(Text, { accessible: false, tone: "muted", variant: menuRecipe.shortcut.textVariant, children: item.shortcut }) : null, trailing ? _jsx(View, { accessibilityElementsHidden: true, accessible: false, children: trailing }) : null, selection.mode !== "none" && selected ? _jsx(Text, { accessible: false, tone: "brand", children: "\u2713" }) : null] }, item.id));
    };
    const collection = source.sections ? source.sections.map((section) => (_jsxs(View, { accessibilityLabel: section.accessibilityLabel ?? section.label, children: [section.label ? (_jsx(Text, { style: {
                    color: resolveColorReference(menuRecipe.sectionLabel.color, theme.palette),
                    paddingHorizontal: menuRecipe.sectionLabel.paddingHorizontal,
                    paddingVertical: menuRecipe.sectionLabel.paddingVertical,
                }, variant: menuRecipe.sectionLabel.textVariant, children: section.label })) : null, section.items.map(renderItem)] }, section.id))) : collectionItems.map(renderItem);
    const triggerProps = {
        accessibilityState: { busy, disabled: disabled || readOnly || busy, expanded: visible },
        onPress: () => {
            if (!disabled && !readOnly && !busy)
                requestOpen(!visible, "trigger");
        },
    };
    return (_jsxs(View, { style: style, children: [_jsx(View, { ref: triggerRef, children: renderTrigger ? renderTrigger(triggerProps) : (_jsx(Pressable, { accessibilityHint: readOnly ? readOnlyLabel : undefined, accessibilityLabel: triggerLabel, accessibilityRole: "button", accessibilityState: triggerProps.accessibilityState, disabled: disabled || readOnly || busy, onPress: triggerProps.onPress, style: ({ pressed }) => [
                        minimumTargetStyle,
                        {
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: disabled || busy ? menuRecipe.states.disabledOpacity : pressed ? 0.86 : 1,
                        },
                    ], children: trigger ?? _jsx(Text, { tone: "brand", variant: "label", children: triggerLabel }) })) }), _jsx(Modal, { ...modalProps, animationType: "none", onDismiss: modalDismiss.onDismiss, onRequestClose: () => close("escape"), onShow: () => {
                    modalDismiss.onShow();
                    focusFirstItem();
                }, transparent: true, visible: visible, children: _jsxs(View, { style: { flex: 1, justifyContent: "center", padding: spacing.md }, children: [_jsx(Pressable, { accessibilityLabel: dismissLabel, accessibilityRole: "button", onPress: () => close("outside"), style: {
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
                            }, children: [_jsx(Text, { tone: "primary", variant: "title", children: title }), _jsxs(ScrollView, { children: [asyncState.status === "loading" || asyncState.status === "error" || asyncState.status === "empty" ? (_jsxs(View, { style: { gap: spacing.sm, minHeight: densityContract.minHeight }, children: [asyncState.status === "loading" ? _jsx(Spinner, { label: asyncState.message }) : (_jsx(Text, { accessibilityLiveRegion: asyncState.status === "error" ? "assertive" : "polite", accessibilityRole: asyncState.status === "error" ? "alert" : undefined, tone: asyncState.status === "error" ? "danger" : "muted", children: asyncState.message })), asyncState.status === "error" && onRetry ? (_jsx(Button, { onPress: onRetry, tone: "secondary", children: retryLabel ?? dismissLabel })) : null] })) : collection, asyncState.status === "loadingMore" ? _jsx(Spinner, { label: asyncState.message }) : null] }), _jsx(Button, { onPress: () => close("programmatic"), tone: "secondary", children: dismissLabel })] })] }) })] }));
}
function createNativeLoadMoreControllerFacade() {
    let active = null;
    return {
        request(state, reason) {
            if (!active)
                throw new Error("Cannot use a detached LoadMore controller");
            return active.request(state, reason);
        },
        attach(controller) {
            active = controller;
            return () => {
                if (active === controller)
                    active = null;
            };
        },
    };
}
/** Collection footer that de-duplicates automatic and manual page requests. */
export const LoadMore = forwardRef(function LoadMore({ descriptor, onLoadMore, mode = loadMoreRecipe.defaults.mode, density = loadMoreRecipe.defaults.density, onRequestOutcome, onRequestError, style, }, ref) {
    validateLoadMoreDescriptor(descriptor);
    const stateRef = useRef(descriptor.state);
    const handlerRef = useRef(onLoadMore);
    stateRef.current = descriptor.state;
    handlerRef.current = onLoadMore;
    const [controllerFacade] = useState(createNativeLoadMoreControllerFacade);
    const lastViewportRequest = useRef(null);
    useLayoutEffect(() => {
        const controller = createLoadMoreController({
            mode,
            onLoadMore: (request) => handlerRef.current(request),
        });
        const detach = controllerFacade.attach(controller);
        lastViewportRequest.current = null;
        return () => {
            detach();
            controller.dispose();
        };
    }, [controllerFacade, mode]);
    const request = useCallback(async (reason) => {
        const state = stateRef.current;
        if (reason === "viewport" && mode === "automatic" && state.status === "ready") {
            const previous = lastViewportRequest.current;
            if (previous?.mode === mode &&
                previous.requestKey === state.requestKey) {
                const outcome = "already-requesting";
                onRequestOutcome?.(outcome, reason);
                return outcome;
            }
            lastViewportRequest.current = {
                mode,
                requestKey: state.requestKey,
            };
        }
        try {
            const outcome = await controllerFacade.request(state, reason);
            onRequestOutcome?.(outcome, reason);
            return outcome;
        }
        catch (error) {
            onRequestError?.(error, reason);
            // The request was accepted and started; product error state arrives
            // through the controlled descriptor and optional callback. Keep the
            // FlatList imperative bridge rejection-free like the Web observer.
            return "started";
        }
    }, [controllerFacade, mode, onRequestError, onRequestOutcome]);
    useImperativeHandle(ref, () => ({
        onEndReached: () => request("viewport"),
    }), [request]);
    const { state, labels } = descriptor;
    const densityContract = loadMoreRecipe.density[density];
    const theme = useHjmNativeTheme();
    return (_jsx(View, { style: [
            {
                alignItems: "center",
                gap: densityContract.gap,
                paddingVertical: densityContract.paddingVertical,
            },
            style,
        ], children: state.status === "ready" ? (_jsx(Button, { onPress: () => {
                void request("manual").catch(() => undefined);
            }, labelStyle: {
                color: resolveColorReference(loadMoreRecipe.trigger.color, theme.palette),
                fontWeight: loadMoreRecipe.trigger.fontWeight,
            }, size: "small", style: {
                borderRadius: radius[loadMoreRecipe.trigger.radius],
                minHeight: loadMoreRecipe.trigger.minHeight,
                paddingHorizontal: loadMoreRecipe.trigger.paddingHorizontal,
            }, tone: "link", children: labels.loadMore })) : state.status === "loading" ? (_jsxs(View, { accessibilityLabel: labels.loading, accessibilityRole: "progressbar", accessibilityState: { busy: true }, accessible: true, style: {
                alignItems: "center",
                flexDirection: "row",
                gap: densityContract.gap,
                justifyContent: "center",
            }, children: [_jsx(ActivityIndicator, { color: resolveColorReference(spinnerRecipe.tones[loadMoreRecipe.spinner.tone], theme.palette), size: loadMoreRecipe.spinner.size }), _jsx(Text, { accessible: false, style: {
                        color: resolveColorReference(loadMoreRecipe.status.color, theme.palette),
                    }, variant: loadMoreRecipe.status.textVariant, children: labels.loading })] })) : state.status === "error" ? (_jsxs(_Fragment, { children: [_jsx(Text, { accessibilityLiveRegion: "assertive", style: { color: resolveColorReference(loadMoreRecipe.error.color, theme.palette) }, variant: loadMoreRecipe.error.textVariant, children: state.message }), _jsx(Button, { onPress: () => {
                        void request("retry").catch(() => undefined);
                    }, labelStyle: {
                        color: resolveColorReference(loadMoreRecipe.trigger.color, theme.palette),
                        fontWeight: loadMoreRecipe.trigger.fontWeight,
                    }, size: "small", style: {
                        borderRadius: radius[loadMoreRecipe.trigger.radius],
                        minHeight: loadMoreRecipe.trigger.minHeight,
                        paddingHorizontal: loadMoreRecipe.trigger.paddingHorizontal,
                    }, tone: "link", children: labels.retry })] })) : (_jsx(Text, { accessibilityLiveRegion: "polite", style: { color: resolveColorReference(loadMoreRecipe.end.color, theme.palette) }, variant: loadMoreRecipe.end.textVariant, children: labels.complete })) }));
});
//# sourceMappingURL=navigation.js.map