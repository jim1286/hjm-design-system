import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { resolveBottomNavigationActivation, resolveBottomNavigationConfiguration, resolveBottomNavigationDescriptor, validateBottomNavigationProminence, } from "@hjmds/design-contracts/components/bottom-navigation";
import { bottomNavigationRecipe, iconRecipe, } from "@hjmds/design-contracts/recipes";
import { createContext, forwardRef, useContext, useEffect, useMemo, useRef, useState, } from "react";
import { assignRef, classNames } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";
const virtualKeyboardMinimumOcclusion = 120;
/**
 * Height of the viewport bottom covered by the fixed bar (safe area and a raised center circle included); 0 when
 * there is no bar or it is hidden for the keyboard. The provider also exposes it as `--hjm-bottom-navigation-inset`,
 * which ScreenLayout's last region adds to its bottom padding, so products stop hand-keeping a bottom spacer
 * (2026-10-18; Native shares the same API for its `placement="overlay"` bar).
 */
const BottomNavigationInsetContext = createContext(0);
const BottomNavigationInsetReporterContext = createContext(null);
/** Wrap the app shell that holds both the screens and the BottomNavigation. */
export function BottomNavigationInsetProvider({ children }) {
    const [inset, setInset] = useState(0);
    const report = useMemo(() => (height) => {
        const next = Number.isFinite(height) && height > 0 ? height : 0;
        setInset(current => current === next ? current : next);
    }, []);
    return (_jsx(BottomNavigationInsetReporterContext.Provider, { value: report, children: _jsx(BottomNavigationInsetContext.Provider, { value: inset, children: _jsx("div", { style: { display: "contents", "--hjm-bottom-navigation-inset": `${inset}px` }, children: children }) }) }));
}
/**
 * Bottom height covered by the BottomNavigation inside the nearest provider; 0 outside one. For layouts that are not
 * a ScreenLayout: inside one the shell already pads by it, so adding it again doubles the space.
 */
export function useBottomNavigationInset() {
    return useContext(BottomNavigationInsetContext);
}
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
function BottomNavigationInner({ descriptor, configuration = {}, getHref, renderIcon, renderLink, primaryAction, onActivate, className, style, layoutStyle, ...props }, ref) {
    const resolved = resolveBottomNavigationDescriptor(descriptor);
    const theme = useOptionalHjmTheme();
    const direction = configuration.direction ?? theme?.environment.direction;
    const presentation = resolveBottomNavigationConfiguration({
        ...configuration,
        ...(direction === undefined ? {} : { direction }),
    }, resolved.items.length);
    validateBottomNavigationProminence(resolved.items, presentation);
    const hidden = useKeyboardHidden(presentation.keyboardBehavior);
    const density = bottomNavigationRecipe.density[presentation.density];
    const presentationRecipe = bottomNavigationRecipe.presentations[presentation.presentation];
    const centerGap = bottomNavigationRecipe.distributions[presentation.distribution].centerGap;
    const iconSize = presentation.iconSize === "standard"
        ? iconRecipe.sizes[density.icon]
        : bottomNavigationRecipe.iconSizes[presentation.iconSize];
    // `shape` reframes the floating surface (radius + inner padding); `standard` keeps the presentation recipe.
    const shapeRecipe = presentation.shape === "standard"
        ? null
        : bottomNavigationRecipe.shapes[presentation.shape];
    const liftRecipe = bottomNavigationRecipe.icon.liftEmphasis;
    const prominentRecipe = bottomNavigationRecipe.prominentDestination;
    // Lifting by (diameter - indicator height) keeps the prominent label on the other labels' line; an app-icon
    // slot taller than the indicator minimum raises that height.
    const prominentLift = prominentRecipe.diameter - Math.max(bottomNavigationRecipe.indicator.minHeight, iconSize);
    // The part of the circle above the nav box still covers content, so the reported inset includes it.
    const prominentOverflow = resolved.items.some((item) => item.prominent)
        ? Math.max(0, prominentLift - density.padding - presentationRecipe.outerPaddingTop)
        : 0;
    const navRef = useRef(null);
    const reportInset = useContext(BottomNavigationInsetReporterContext);
    useEffect(() => {
        const nav = navRef.current;
        if (!reportInset)
            return;
        if (hidden || !nav) {
            reportInset(0);
            return;
        }
        const update = () => reportInset(nav.getBoundingClientRect().height + prominentOverflow);
        update();
        const observer = new ResizeObserver(update);
        observer.observe(nav);
        return () => {
            observer.disconnect();
            reportInset(0);
        };
    }, [reportInset, hidden, prominentOverflow]);
    if (hidden)
        return null;
    return (_jsx("nav", { ...props, ref: (node) => {
            navRef.current = node;
            assignRef(ref, node);
        }, "aria-label": resolved.accessibilityLabel, className: classNames("hjm-bottom-navigation", className), "data-expanded-labels": (theme?.environment.textScale ?? 1) >= 1.5 || resolved.items.length > 4 ? "true" : "false", "data-density": presentation.density, "data-distribution": presentation.distribution, "data-keyboard-behavior": presentation.keyboardBehavior, "data-labels": presentation.labels, "data-selection": presentation.selection, "data-surface": presentation.surface, "data-presentation": presentation.presentation, "data-shape": presentation.shape, "data-icon-emphasis": presentation.iconEmphasis, dir: presentation.direction, style: {
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
            "--hjm-bottom-navigation-content-max-width": presentationRecipe.contentMaxWidth
                ? `${presentationRecipe.contentMaxWidth}px`
                : "none",
            "--hjm-bottom-navigation-outer-inline": `${presentationRecipe.outerPaddingHorizontal}px`,
            "--hjm-bottom-navigation-outer-top": `${presentationRecipe.outerPaddingTop}px`,
            "--hjm-bottom-navigation-prominent-diameter": `${prominentRecipe.diameter}px`,
            "--hjm-bottom-navigation-prominent-lift": `${prominentLift}px`,
            ...(shapeRecipe ? {
                "--hjm-bottom-navigation-shape-radius": `var(--hjm-radius-${shapeRecipe.radius})`,
                "--hjm-bottom-navigation-shape-padding": `${shapeRecipe.surfacePadding}px`,
            } : {}),
            ...(presentation.iconEmphasis === "lift" ? {
                "--hjm-bottom-navigation-lift-offset": `${liftRecipe.translateY}px`,
                "--hjm-bottom-navigation-lift-idle-opacity": liftRecipe.idleOpacity,
            } : {}),
            ...style,
            ...layoutStyle,
        }, children: _jsxs("div", { className: "hjm-bottom-navigation__surface", children: [_jsx("ul", { className: "hjm-bottom-navigation__list", children: resolved.items.map((item, index) => {
                        const selected = item.id === resolved.selectedKey;
                        const content = (_jsxs(_Fragment, { children: [_jsxs("span", { "aria-hidden": "true", className: "hjm-bottom-navigation__indicator", "data-state": selected ? "selected" : "idle", children: [renderIcon({
                                            item,
                                            name: item.icon.name,
                                            selected,
                                            color: "currentColor",
                                            size: item.prominent ? iconRecipe.sizes[prominentRecipe.icon] : iconSize,
                                            strokeWidth: selected
                                                ? bottomNavigationRecipe.icon.selectedEmphasis.strokeWidth.selected
                                                : bottomNavigationRecipe.icon.selectedEmphasis.strokeWidth.idle,
                                            scale: selected
                                                ? bottomNavigationRecipe.icon.selectedEmphasis.scale.selected
                                                : bottomNavigationRecipe.icon.selectedEmphasis.scale.idle,
                                        }), item.badge ? (_jsx("span", { "aria-hidden": "true", className: "hjm-bottom-navigation__badge", children: item.badge.visibleLabel })) : null] }), presentation.labels === "visible" ? (_jsx("span", { className: "hjm-bottom-navigation__label", children: item.label })) : null] }));
                        const itemStyle = {
                            gridColumn: getBottomNavigationGridColumn(index, resolved.items.length, presentation.distribution),
                        };
                        if (item.disabled) {
                            return (_jsx("li", { style: itemStyle, "data-selected": "false", "data-prominent": item.prominent || undefined, children: _jsx("span", { "aria-disabled": "true", "aria-label": item.resolvedAccessibilityLabel, className: "hjm-bottom-navigation__item", "data-state": "disabled", role: "link", children: content }) }, item.id));
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
                        return (_jsx("li", { style: itemStyle, "data-selected": selected, "data-prominent": item.prominent || undefined, children: renderLink ? renderLink(linkProps) : _jsx("a", { ...linkProps }) }, item.id));
                    }) }), primaryAction ? (_jsx("div", { className: "hjm-bottom-navigation__primary-action", children: primaryAction })) : null] }) }));
}
export const BottomNavigation = forwardRef(BottomNavigationInner);
//# sourceMappingURL=bottom-navigation.js.map