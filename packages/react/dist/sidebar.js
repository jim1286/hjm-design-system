import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { sidebarDefaults, sidebarRecipe, validateSidebarDescriptor, } from "@hjmds/design-contracts/components/sidebar";
import { forwardRef, useState, } from "react";
import { useOptionalHjmTheme } from "./provider.js";
import { classNames, useControllableState } from "./internal.js";
export const Sidebar = forwardRef(function Sidebar({ descriptor, appearance = "standard", collapsed: controlledCollapsed, defaultCollapsed, onCollapsedChange, collapseLabels, onNavigate, renderIcon, renderBadge, className, layoutStyle, }, forwardedRef) {
    validateSidebarDescriptor(descriptor);
    const theme = useOptionalHjmTheme();
    const animate = theme !== null && !theme.environment.reducedMotion;
    const [activatedId, setActivatedId] = useState(null);
    const [collapsed, setCollapsed] = useControllableState({
        ...(controlledCollapsed === undefined ? {} : { value: controlledCollapsed }),
        defaultValue: defaultCollapsed ?? sidebarDefaults.collapsed,
        ...(onCollapsedChange === undefined ? {} : { onChange: onCollapsedChange }),
    });
    return (_jsxs("nav", { ref: forwardedRef, "aria-label": descriptor.accessibilityLabel, className: classNames("hjm-sidebar", className), "data-collapsed": collapsed || undefined, "data-appearance": appearance, "data-animate": animate || undefined, onPointerMove: event => {
            if (appearance !== "proximity" || !animate || event.pointerType === "touch")
                return;
            // Only icon decoration responds to distance; moving links would shift click/focus targets.
            for (const item of event.currentTarget.querySelectorAll(".hjm-sidebar__item")) {
                const bounds = item.getBoundingClientRect();
                const distance = Math.abs(event.clientY - (bounds.top + bounds.height / 2));
                const proximity = item.getAttribute("aria-disabled") === "true" ? 0 : Math.max(0, 1 - distance / (bounds.height * 2));
                item.style.setProperty("--hjm-sidebar-proximity", String(proximity));
            }
        }, onPointerLeave: event => {
            for (const item of event.currentTarget.querySelectorAll(".hjm-sidebar__item"))
                item.style.removeProperty("--hjm-sidebar-proximity");
        }, style: { ...layoutStyle,
            "--hjm-sidebar-width": `${collapsed ? sidebarRecipe.widths.collapsed : sidebarRecipe.widths.expanded}px`,
            "--hjm-sidebar-item-height": `${sidebarRecipe.itemMinHeight}px`,
            "--hjm-sidebar-item-radius": `${sidebarRecipe.itemRadius}px`,
            "--hjm-sidebar-gap": `${sidebarRecipe.gap}px`,
            "--hjm-sidebar-group-gap": `${sidebarRecipe.groupGap}px`,
        }, children: [collapseLabels ? (_jsx("button", { type: "button", className: "hjm-sidebar__toggle", "aria-expanded": !collapsed, "aria-label": collapsed ? collapseLabels.expand : collapseLabels.collapse, onClick: () => setCollapsed(!collapsed), children: _jsx("span", { "aria-hidden": "true", children: collapsed ? "»" : "«" }) })) : null, descriptor.groups.map((group) => (_jsxs("div", { className: "hjm-sidebar__group", role: "group", "aria-label": group.label, children: [group.label ? _jsx("p", { className: "hjm-sidebar__group-label", "aria-hidden": "true", children: group.label }) : null, _jsx("ul", { className: "hjm-sidebar__list", children: group.items.map((item) => {
                            const current = descriptor.currentId === item.id;
                            return (_jsx("li", { children: _jsxs("a", { className: "hjm-sidebar__item", href: item.destination?.kind === "internal" ? item.destination.href : item.destination?.href, "aria-current": current ? "page" : undefined, "data-bounce": current && activatedId === item.id || undefined, "aria-disabled": item.disabled || undefined, "aria-label": collapsed ? item.label : undefined, tabIndex: item.disabled ? -1 : undefined, onClick: (event) => {
                                        if (item.disabled) {
                                            event.preventDefault();
                                            return;
                                        }
                                        if (appearance === "bounce" && animate)
                                            setActivatedId(item.id);
                                        onNavigate?.(item.id);
                                    }, children: [renderIcon ? _jsx("span", { "aria-hidden": "true", className: "hjm-sidebar__icon", children: renderIcon(item) }) : null, _jsx("span", { className: "hjm-sidebar__label", children: item.label }), item.badgeCount !== undefined ? (_jsx("span", { className: "hjm-sidebar__badge", children: renderBadge?.(item.badgeCount, item) ?? item.badgeCount })) : null] }) }, item.id));
                        }) })] }, group.id)))] }));
});
//# sourceMappingURL=sidebar.js.map