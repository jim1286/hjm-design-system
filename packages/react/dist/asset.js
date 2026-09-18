import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { assetRecipe, shouldAnimateAsset, validateAssetDescriptor, } from "@hjmds/design-contracts/components/asset";
import { forwardRef } from "react";
import { classNames } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";
export const Asset = forwardRef(function Asset({ descriptor, children, accessory, className }, forwardedRef) {
    validateAssetDescriptor(descriptor);
    const theme = useOptionalHjmTheme();
    const size = assetRecipe.sizes[descriptor.size ?? assetRecipe.defaults.size];
    const shape = assetRecipe.shapes[descriptor.shape ?? assetRecipe.defaults.shape];
    const decorative = descriptor.decorative ?? false;
    // The frame reports whether motion is allowed so the product's player can
    // read one answer instead of re-deriving the preference per surface.
    const animate = shouldAnimateAsset(descriptor.kind, theme?.environment.reducedMotion ?? false);
    return (_jsxs("div", { ref: forwardedRef, className: classNames("hjm-asset", className), "data-kind": descriptor.kind, "data-animate": animate || undefined, role: decorative ? "presentation" : "img", "aria-hidden": decorative || undefined, "aria-label": decorative ? undefined : descriptor.accessibilityLabel, style: {
            "--hjm-asset-size": `${size}px`,
            "--hjm-asset-radius": `${shape}px`,
            "--hjm-asset-accessory-offset": `${assetRecipe.accessory.offset}px`,
        }, children: [_jsx("div", { className: "hjm-asset__frame", children: _jsx("div", { className: "hjm-asset__media", children: typeof children === "function" ? children({ animate }) : children }) }), accessory ? _jsx("span", { className: "hjm-asset__accessory", children: accessory }) : null] }));
});
/** Overlaps assets with the same ratio Avatar uses — they share a row on purpose. */
export function AssetGroup({ label, size = assetRecipe.defaults.size, children, className }) {
    const pixels = assetRecipe.sizes[size];
    return (_jsx("div", { className: classNames("hjm-asset-group", className), role: "group", "aria-label": label, style: { "--hjm-asset-overlap": `${-Math.round(pixels * assetRecipe.overlapRatio)}px` }, children: children }));
}
//# sourceMappingURL=asset.js.map