import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getTabNavigationIntent, getTabNavigationTarget, resolveInitialTabValue, tabsBehaviorDefaults, } from "@hjm/design-contracts/behaviors";
import { tabsRecipe, } from "@hjm/design-contracts/recipes";
import { forwardRef, useEffect, useId, useRef, useState, } from "react";
import { classNames, useControllableState } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";
function validateItems(items) {
    if (items.length === 0)
        throw new TypeError("Tabs requires at least one item");
    const ids = new Set();
    for (const item of items) {
        if (item.id.trim().length === 0)
            throw new TypeError("Tabs item id must not be empty");
        if (ids.has(item.id))
            throw new TypeError(`Duplicate Tabs item id: ${item.id}`);
        ids.add(item.id);
    }
    if (!items.some((item) => !item.disabled)) {
        throw new TypeError("Tabs requires at least one enabled item");
    }
}
const panelFocusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
].join(",");
function TabPanel({ id, labelledBy, selected, dynamic, children }) {
    const ref = useRef(null);
    const [hasFocusableContent, setHasFocusableContent] = useState(false);
    useEffect(() => {
        setHasFocusableContent(ref.current?.querySelector(panelFocusableSelector) !== null);
    }, [children]);
    return (_jsx("div", { ref: ref, id: id, role: "tabpanel", className: "hjm-tabs__panel", "aria-labelledby": labelledBy, tabIndex: selected && !hasFocusableContent ? 0 : undefined, hidden: !selected, inert: selected ? undefined : true, "data-state": selected ? "active" : "inactive", "data-panel-mode": dynamic ? "dynamic" : "keyed", children: children }));
}
export const Tabs = forwardRef(function Tabs(props, ref) {
    const { label, items, activationMode = tabsBehaviorDefaults.activationMode, mountPolicy = tabsBehaviorDefaults.mountPolicy, panelMode = tabsBehaviorDefaults.panelMode, orientation = tabsBehaviorDefaults.orientation, direction: directionProp, loop = tabsBehaviorDefaults.loop, size = tabsRecipe.defaults.size, layout = tabsRecipe.defaults.layout, className, value: valueProp, defaultValue, onValueChange, ...rest } = props;
    validateItems(items);
    if (label.trim().length === 0)
        throw new TypeError("Tabs label must not be empty");
    if (panelMode === "dynamic" && mountPolicy !== "active") {
        throw new TypeError("Tabs dynamic panelMode requires active mountPolicy");
    }
    const descriptors = items.map((item) => ({
        id: item.id,
        label: item.id,
        ...(item.disabled === undefined ? {} : { disabled: item.disabled }),
    }));
    const initialValueRef = useRef(null);
    if (initialValueRef.current === null) {
        const resolved = resolveInitialTabValue(descriptors, defaultValue);
        if (resolved === undefined)
            throw new TypeError("Tabs requires an enabled item");
        initialValueRef.current = { value: resolved };
    }
    const initialValue = initialValueRef.current.value;
    const collectionFallback = items.find((item) => !item.disabled)?.id;
    if (collectionFallback === undefined)
        throw new TypeError("Tabs requires an enabled item");
    const [storedValue, setValue] = useControllableState({
        ...(valueProp === undefined ? {} : { value: valueProp }),
        defaultValue: initialValue,
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    const controlled = valueProp !== undefined;
    const storedSelectionIsValid = items.some((item) => item.id === storedValue && !item.disabled);
    if (controlled && !storedSelectionIsValid) {
        throw new RangeError(`Tabs value must identify an enabled item: ${storedValue}`);
    }
    const value = storedSelectionIsValid ? storedValue : collectionFallback;
    const [focusValue, setFocusValue] = useState(value);
    const resolvedFocusValue = items.some((item) => item.id === focusValue && !item.disabled)
        ? focusValue
        : value;
    const [visited, setVisited] = useState(() => new Set([value]));
    const tabRefs = useRef(new Map());
    const baseId = useId().replaceAll(":", "");
    const theme = useOptionalHjmTheme();
    const direction = directionProp ?? theme?.environment.direction ?? tabsBehaviorDefaults.direction;
    useEffect(() => {
        if (!controlled && !storedSelectionIsValid)
            setValue(collectionFallback);
    }, [collectionFallback, controlled, setValue, storedSelectionIsValid]);
    useEffect(() => {
        if (!items.some((item) => item.id === focusValue && !item.disabled)) {
            setFocusValue(value);
        }
    }, [focusValue, items, value]);
    useEffect(() => {
        setVisited((current) => {
            const known = new Set(items.map((item) => item.id));
            const next = new Set([...current].filter((id) => known.has(id)));
            next.add(value);
            if (next.size === current.size &&
                [...next].every((id) => current.has(id)))
                return current;
            return next;
        });
    }, [items, value]);
    const focusItem = (id) => {
        setFocusValue(id);
        if (activationMode === "automatic")
            setValue(id);
        queueMicrotask(() => tabRefs.current.get(id)?.focus());
    };
    const handleKeyDown = (event, id) => {
        const intent = getTabNavigationIntent(event.key === " " ? "Space" : event.key, orientation, direction);
        if (intent !== undefined) {
            const target = getTabNavigationTarget(descriptors, id, intent, loop);
            if (target !== undefined) {
                event.preventDefault();
                focusItem(target);
            }
            return;
        }
        if (activationMode === "manual" &&
            (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            setValue(id);
        }
    };
    const panelId = (index) => panelMode === "dynamic" ? `${baseId}-panel` : `${baseId}-panel-${index}`;
    return (_jsxs("div", { ...rest, ref: ref, className: classNames("hjm-tabs", className), "data-size": size, "data-layout": layout, "data-orientation": orientation, "data-mount-policy": mountPolicy, "data-panel-mode": panelMode, "data-state": "ready", dir: direction, children: [_jsx("div", { className: "hjm-tabs__list", role: "tablist", "aria-label": label, "aria-orientation": orientation, children: items.map((item, index) => {
                    const selected = item.id === value;
                    const tabId = `${baseId}-tab-${index}`;
                    return (_jsx("button", { ref: (node) => {
                            if (node)
                                tabRefs.current.set(item.id, node);
                            else
                                tabRefs.current.delete(item.id);
                        }, id: tabId, type: "button", role: "tab", className: "hjm-tabs__tab", "data-state": selected ? "selected" : "idle", "aria-selected": selected, "aria-controls": panelId(index), tabIndex: item.id === resolvedFocusValue ? 0 : -1, disabled: item.disabled, onClick: () => {
                            setFocusValue(item.id);
                            setValue(item.id);
                        }, onKeyDown: (event) => handleKeyDown(event, item.id), children: item.label }, item.id));
                }) }), panelMode === "dynamic" ? (_jsx(TabPanel, { id: panelId(0), labelledBy: `${baseId}-tab-${items.findIndex((item) => item.id === value)}`, selected: true, dynamic: true, children: items.find((item) => item.id === value)?.panel })) : items.map((item, index) => {
                const selected = item.id === value;
                const mounted = mountPolicy === "always" ||
                    (mountPolicy === "visited" && (visited.has(item.id) || selected)) ||
                    (mountPolicy === "active" && selected);
                return mounted ? (_jsx(TabPanel, { id: panelId(index), labelledBy: `${baseId}-tab-${index}`, selected: selected, dynamic: false, children: item.panel }, item.id)) : null;
            })] }));
});
//# sourceMappingURL=navigation.js.map