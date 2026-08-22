import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { resolveBottomNavigationActivation, resolveBottomNavigationConfiguration, resolveBottomNavigationDescriptor, } from "@hjm/design-contracts/components/bottom-navigation";
import { bottomNavigationRecipe, iconRecipe, } from "@hjm/design-contracts/recipes";
import { forwardRef, useEffect, useState, } from "react";
import { classNames } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";
const virtualKeyboardMinimumOcclusion = 120;
export function isUnmodifiedPrimaryBottomNavigationClick(event) {
    return (!event.defaultPrevented &&
        event.button === 0 &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey);
}
export function shouldHideBottomNavigationForKeyboard(input) {
    if (input.behavior !== "hide")
        return false;
    if ((input.visualViewportScale ?? 1) !== 1)
        return false;
    const visibleBottom = input.visualViewportHeight + (input.visualViewportOffsetTop ?? 0);
    return layoutViewportHeightIsValid(input.layoutViewportHeight) &&
        input.layoutViewportHeight - visibleBottom >= virtualKeyboardMinimumOcclusion;
}
function layoutViewportHeightIsValid(value) {
    return Number.isFinite(value) && value >= 0;
}
export function getBottomNavigationGridColumn(index, itemCount, distribution) {
    if (distribution !== "center-gap")
        return undefined;
    const middle = itemCount / 2;
    return index < middle ? index + 1 : index + 2;
}
function useKeyboardHidden(behavior) {
    const [hidden, setHidden] = useState(false);
    useEffect(() => {
        const viewport = window.visualViewport;
        if (!viewport)
            return;
        const update = () => {
            setHidden(shouldHideBottomNavigationForKeyboard({
                behavior,
                layoutViewportHeight: window.innerHeight,
                visualViewportHeight: viewport.height,
                visualViewportOffsetTop: viewport.offsetTop,
                visualViewportScale: viewport.scale,
            }));
        };
        update();
        viewport.addEventListener("resize", update);
        viewport.addEventListener("scroll", update);
        return () => {
            viewport.removeEventListener("resize", update);
            viewport.removeEventListener("scroll", update);
        };
    }, [behavior]);
    return hidden;
}
function BottomNavigationInner({ descriptor, configuration = {}, getHref, renderIcon, renderLink, primaryAction, onActivate, className, style, ...props }, ref) {
    const resolved = resolveBottomNavigationDescriptor(descriptor);
    const theme = useOptionalHjmTheme();
    const direction = configuration.direction ?? theme?.environment.direction;
    const presentation = resolveBottomNavigationConfiguration({
        ...configuration,
        ...(direction === undefined ? {} : { direction }),
    }, resolved.items.length);
    const hidden = useKeyboardHidden(presentation.keyboardBehavior);
    const density = bottomNavigationRecipe.density[presentation.density];
    const presentationRecipe = bottomNavigationRecipe.presentations[presentation.presentation];
    const centerGap = bottomNavigationRecipe.distributions[presentation.distribution].centerGap;
    const iconSize = iconRecipe.sizes[density.icon];
    if (hidden)
        return null;
    return (_jsx("nav", { ...props, ref: ref, "aria-label": resolved.accessibilityLabel, className: classNames("hjm-bottom-navigation", className), "data-density": presentation.density, "data-distribution": presentation.distribution, "data-keyboard-behavior": presentation.keyboardBehavior, "data-presentation": presentation.presentation, dir: presentation.direction, style: {
            "--hjm-bottom-navigation-center-gap": `${centerGap}px`,
            "--hjm-bottom-navigation-columns": resolved.items.length,
            "--hjm-bottom-navigation-half-columns": resolved.items.length / 2,
            "--hjm-bottom-navigation-item-gap": `${density.gap}px`,
            "--hjm-bottom-navigation-item-min-height": `${density.itemMinHeight}px`,
            "--hjm-bottom-navigation-item-min-width": `${density.itemMinWidth}px`,
            "--hjm-bottom-navigation-item-padding": `${density.padding}px`,
            "--hjm-bottom-navigation-max-width": presentationRecipe.maxWidth
                ? `${presentationRecipe.maxWidth}px`
                : "none",
            "--hjm-bottom-navigation-outer-inline": `${presentationRecipe.outerPaddingHorizontal}px`,
            "--hjm-bottom-navigation-outer-top": `${presentationRecipe.outerPaddingTop}px`,
            ...style,
        }, children: _jsxs("div", { className: "hjm-bottom-navigation__surface", children: [_jsx("ul", { className: "hjm-bottom-navigation__list", children: resolved.items.map((item, index) => {
                        const selected = item.id === resolved.selectedKey;
                        const content = (_jsxs(_Fragment, { children: [_jsxs("span", { "aria-hidden": "true", className: "hjm-bottom-navigation__indicator", "data-state": selected ? "selected" : "idle", children: [renderIcon({
                                            item,
                                            name: item.icon.name,
                                            selected,
                                            color: "currentColor",
                                            size: iconSize,
                                            strokeWidth: selected
                                                ? bottomNavigationRecipe.icon.selectedEmphasis.strokeWidth.selected
                                                : bottomNavigationRecipe.icon.selectedEmphasis.strokeWidth.idle,
                                            scale: selected
                                                ? bottomNavigationRecipe.icon.selectedEmphasis.scale.selected
                                                : bottomNavigationRecipe.icon.selectedEmphasis.scale.idle,
                                        }), item.badge ? (_jsx("span", { "aria-hidden": "true", className: "hjm-bottom-navigation__badge", children: item.badge.visibleLabel })) : null] }), _jsx("span", { className: "hjm-bottom-navigation__label", children: item.label })] }));
                        const itemStyle = {
                            gridColumn: getBottomNavigationGridColumn(index, resolved.items.length, presentation.distribution),
                        };
                        if (item.disabled) {
                            return (_jsx("li", { style: itemStyle, children: _jsx("span", { "aria-disabled": "true", "aria-label": item.resolvedAccessibilityLabel, className: "hjm-bottom-navigation__item", "data-state": "disabled", role: "link", children: content }) }, item.id));
                        }
                        const href = getHref(item);
                        if (!href.trim()) {
                            throw new TypeError(`BottomNavigation href must not be empty: ${item.id}`);
                        }
                        const linkProps = {
                            "aria-current": selected ? "page" : undefined,
                            "aria-label": item.resolvedAccessibilityLabel,
                            className: "hjm-bottom-navigation__item",
                            "data-state": selected ? "selected" : "idle",
                            href,
                            onClick: (event) => {
                                if (!isUnmodifiedPrimaryBottomNavigationClick(event))
                                    return;
                                const activation = resolveBottomNavigationActivation(descriptor, item.id);
                                if (activation)
                                    onActivate?.(activation);
                            },
                            children: content,
                        };
                        return (_jsx("li", { style: itemStyle, children: renderLink ? renderLink(linkProps) : _jsx("a", { ...linkProps }) }, item.id));
                    }) }), primaryAction ? (_jsx("div", { className: "hjm-bottom-navigation__primary-action", children: primaryAction })) : null] }) }));
}
export const BottomNavigation = forwardRef(BottomNavigationInner);
//# sourceMappingURL=bottom-navigation.js.map