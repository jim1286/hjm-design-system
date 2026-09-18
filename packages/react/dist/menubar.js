import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { menubarRecipe, resolveMenubarNavigation, validateMenubarDescriptor, } from "@hjmds/design-contracts/components/menubar";
import { useEffect, useRef, useState } from "react";
import { classNames, useControllableState } from "./internal.js";
export function Menubar({ descriptor, openMenuId: controlledOpen, defaultOpenMenuId, onOpenMenuIdChange, onAction, className, }) {
    validateMenubarDescriptor(descriptor);
    const [openId, setOpenId] = useControllableState({
        ...(controlledOpen === undefined ? {} : { value: controlledOpen }),
        defaultValue: defaultOpenMenuId ?? null,
        ...(onOpenMenuIdChange === undefined ? {} : { onChange: onOpenMenuIdChange }),
    });
    const enabledMenus = descriptor.menus.filter((menu) => menu.disabled !== true);
    // Roving focus: the bar is one tab stop, so the bar — not each label — owns
    // which menu is reachable by Tab.
    const [focusedId, setFocusedId] = useState(enabledMenus[0]?.id ?? descriptor.menus[0].id);
    const [activeItemIndex, setActiveItemIndex] = useState(0);
    const rootRef = useRef(null);
    const labelRefs = useRef(new Map());
    const openMenu = descriptor.menus.find((menu) => menu.id === openId) ?? null;
    const openItems = openMenu?.items.filter((item) => item.disabled !== true) ?? [];
    useEffect(() => {
        if (openId === null)
            return;
        const onPointerDown = (event) => {
            if (event.target instanceof Node && rootRef.current?.contains(event.target))
                return;
            setOpenId(null);
        };
        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [openId, setOpenId]);
    const focusLabel = (id) => {
        setFocusedId(id);
        labelRefs.current.get(id)?.focus();
    };
    const move = (direction) => {
        const next = resolveMenubarNavigation(descriptor, focusedId, direction);
        focusLabel(next);
        // Left/right while a menu is open moves to the neighbour already open, which
        // is the whole reason this is a bar and not three independent Menus.
        if (openId !== null) {
            setOpenId(next);
            setActiveItemIndex(0);
        }
    };
    return (_jsx("div", { ref: rootRef, role: "menubar", "aria-label": descriptor.accessibilityLabel, className: classNames("hjm-menubar", className), style: {
            "--hjm-menubar-min-height": `${menubarRecipe.minHeight}px`,
            "--hjm-menubar-gap": `${menubarRecipe.gap}px`,
            "--hjm-menubar-padding": `${menubarRecipe.paddingHorizontal}px`,
            "--hjm-menubar-label-padding": `${menubarRecipe.label.paddingHorizontal}px`,
            "--hjm-menubar-label-radius": `${menubarRecipe.label.radius}px`,
        }, onKeyDown: (event) => {
            if (event.key === "ArrowRight") {
                event.preventDefault();
                move("next");
                return;
            }
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                move("previous");
                return;
            }
            if (event.key === "Home" || event.key === "End") {
                event.preventDefault();
                const target = (event.key === "Home" ? enabledMenus[0] : enabledMenus.at(-1))?.id;
                if (target !== undefined) {
                    focusLabel(target);
                    if (openId !== null) {
                        setOpenId(target);
                        setActiveItemIndex(0);
                    }
                }
                return;
            }
            if (event.key === "Escape" && openId !== null) {
                event.preventDefault();
                setOpenId(null);
                focusLabel(focusedId);
                return;
            }
            if (openId === null) {
                if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setOpenId(focusedId);
                    setActiveItemIndex(0);
                }
                return;
            }
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                setActiveItemIndex((previous) => {
                    const next = event.key === "ArrowDown" ? previous + 1 : previous - 1;
                    return (next + openItems.length) % Math.max(openItems.length, 1);
                });
                return;
            }
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                const item = openItems[activeItemIndex];
                if (item) {
                    onAction(item.id, openId);
                    // Activation runs an action and leaves nothing selected — unlike Tabs.
                    setOpenId(null);
                    focusLabel(openId);
                }
            }
        }, children: descriptor.menus.map((menu) => {
            const open = menu.id === openId;
            return (_jsxs("div", { className: "hjm-menubar__menu", children: [_jsx("button", { type: "button", ref: (node) => { if (node)
                            labelRefs.current.set(menu.id, node);
                        else
                            labelRefs.current.delete(menu.id); }, role: "menuitem", "aria-haspopup": "menu", "aria-expanded": open, disabled: menu.disabled, tabIndex: menu.id === focusedId ? 0 : -1, "data-open": open || undefined, className: "hjm-menubar__label", onClick: () => {
                            setFocusedId(menu.id);
                            setOpenId(open ? null : menu.id);
                            setActiveItemIndex(0);
                        }, onMouseEnter: () => {
                            // Once one menu is open, hovering the bar switches menus — the
                            // desktop convention; with nothing open, hover opens nothing.
                            if (openId !== null && menu.disabled !== true) {
                                setOpenId(menu.id);
                                setFocusedId(menu.id);
                                setActiveItemIndex(0);
                            }
                        }, children: menu.label }), open ? (_jsx("div", { role: "menu", "aria-label": menu.label, className: "hjm-menubar__panel", children: menu.items.map((item) => {
                            const index = openItems.findIndex((candidate) => candidate.id === item.id);
                            return (_jsxs("div", { role: "menuitem", "aria-disabled": item.disabled || undefined, "data-active": index === activeItemIndex && item.disabled !== true ? "" : undefined, "data-tone": item.tone, className: "hjm-menubar__item", onMouseEnter: () => { if (index >= 0)
                                    setActiveItemIndex(index); }, onClick: () => {
                                    if (item.disabled)
                                        return;
                                    onAction(item.id, menu.id);
                                    setOpenId(null);
                                    focusLabel(menu.id);
                                }, children: [_jsx("span", { children: item.label }), item.shortcut ? _jsx("kbd", { className: "hjm-menubar__shortcut", children: item.shortcut }) : null] }, item.id));
                        }) })) : null] }, menu.id));
        }) }));
}
//# sourceMappingURL=menubar.js.map