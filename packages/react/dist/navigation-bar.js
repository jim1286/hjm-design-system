import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useOptionalHjmTheme } from "./provider.js";
/** Site navigation composition; Menu/SearchField continue to own their behavior. */
export function NavigationBar({ label, brand, children, actions }) {
    const theme = useOptionalHjmTheme();
    if (!label.trim())
        throw new TypeError("NavigationBar requires an accessible label");
    return _jsxs("nav", { "aria-label": label, className: "hjm-navigation-bar", dir: theme?.environment.direction, children: [_jsx("div", { className: "hjm-navigation-bar__brand", children: brand }), _jsx("div", { className: "hjm-navigation-bar__destinations", children: children }), actions && _jsx("div", { className: "hjm-navigation-bar__actions", children: actions })] });
}
//# sourceMappingURL=navigation-bar.js.map