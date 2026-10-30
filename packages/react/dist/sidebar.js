"use client";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { sidebarDefaults, sidebarRecipe, validateSidebarDescriptor, } from "@hjmds/design-contracts/components/sidebar";
import { forwardRef, useState, } from "react";
import { useOptionalHjmTheme } from "./provider.js";
import { classNames, useControllableState } from "./internal.js";
export const Sidebar = forwardRef(function Sidebar({ descriptor, appearance = "standard", size = sidebarDefaults.size, collapsed: controlledCollapsed, defaultCollapsed, onCollapsedChange, collapseLabels, onNavigate, renderLink, renderIcon, renderBadge, header, footer, className, layoutStyle, }, forwardedRef) {
    validateSidebarDescriptor(descriptor);
    const theme = useOptionalHjmTheme();
    const animate = theme !== null && !theme.environment.reducedMotion;
    const [activatedId, setActivatedId] = useState(null);
    const [collapsed, setCollapsed] = useControllableState({
        ...(controlledCollapsed === undefined ? {} : { value: controlledCollapsed }),
        defaultValue: defaultCollapsed ?? sidebarDefaults.collapsed,
        ...(onCollapsedChange === undefined ? {} : { onChange: onCollapsedChange }),
    });
    return (_jsxs("nav", { ref: forwardedRef, "aria-label": descriptor.accessibilityLabel, className: classNames("hjm-sidebar", className), "data-collapsed": collapsed || undefined, "data-appearance": appearance, "data-size": size, "data-animate": animate || undefined, onPointerMove: event => {
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
            "--hjm-sidebar-width": `${collapsed ? sidebarRecipe.widths.collapsed : sidebarRecipe.sizes[size]}px`,
            "--hjm-sidebar-item-height": `${sidebarRecipe.itemMinHeight}px`,
            // CSS inheritance preserves nested profiles without adding a Provider dependency.
            "--hjm-sidebar-item-radius": `var(--hjm-radius-md, ${sidebarRecipe.itemRadius}px)`,
            "--hjm-sidebar-gap": `${sidebarRecipe.gap}px`,
            "--hjm-sidebar-group-gap": `${sidebarRecipe.groupGap}px`,
        }, children: [collapseLabels ? (_jsx("button", { type: "button", className: "hjm-sidebar__toggle", "aria-expanded": !collapsed, "aria-label": collapsed ? collapseLabels.expand : collapseLabels.collapse, onClick: () => setCollapsed(!collapsed), children: _jsx("span", { "aria-hidden": "true", children: collapsed ? "»" : "«" }) })) : null, header ? _jsx("div", { className: "hjm-sidebar__header", children: header }) : null, descriptor.groups.map((group) => (_jsxs("div", { className: "hjm-sidebar__group", role: "group", "aria-label": group.label, children: [group.label ? _jsx("p", { className: "hjm-sidebar__group-label", "aria-hidden": "true", children: group.label }) : null, _jsx("ul", { className: "hjm-sidebar__list", children: group.items.map((item) => {
                            const current = descriptor.currentId === item.id;
                            const href = item.destination?.href;
                            const content = (_jsxs(_Fragment, { children: [renderIcon ? _jsx("span", { "aria-hidden": "true", className: "hjm-sidebar__icon", children: renderIcon(item) }) : null, _jsx("span", { className: "hjm-sidebar__label", children: item.label }), item.badgeCount !== undefined ? (_jsx("span", { className: "hjm-sidebar__badge", children: renderBadge?.(item.badgeCount, item) ?? item.badgeCount })) : null] }));
                            const linkProps = {
                                className: "hjm-sidebar__item",
                                href,
                                "aria-current": current ? "page" : undefined,
                                "data-bounce": current && activatedId === item.id || undefined,
                                "aria-disabled": item.disabled || undefined,
                                // Collapsed labels are hidden visually, so the name comes
                                // from the attribute instead of disappearing with the text.
                                "aria-label": collapsed ? item.label : undefined,
                                // Router-owned destinations may omit href; role/tabIndex/Enter keep
                                // their link keyboard path without inventing a URL.
                                role: item.destination === undefined ? "link" : undefined,
                                tabIndex: item.disabled ? -1 : item.destination === undefined ? 0 : undefined,
                                onKeyDown: (event) => {
                                    if (item.destination === undefined && !item.disabled && event.key === "Enter") {
                                        event.preventDefault();
                                        event.currentTarget.click();
                                    }
                                },
                                onClick: (event) => {
                                    if (item.disabled) {
                                        event.preventDefault();
                                        return;
                                    }
                                    if (appearance === "bounce" && animate)
                                        setActivatedId(item.id);
                                    onNavigate?.(item.id);
                                },
                                children: content,
                            };
                            return (_jsx("li", { children: renderLink && href !== undefined && !item.disabled
                                    ? renderLink({ ...linkProps, href })
                                    : _jsx("a", { ...linkProps }) }, item.id));
                        }) })] }, group.id))), footer ? _jsx("div", { className: "hjm-sidebar__footer", children: footer }) : null] }));
});
//# sourceMappingURL=sidebar.js.map