import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { assetRecipe, shouldAnimateAsset, validateAssetDescriptor, } from "@hjmds/design-contracts/components/asset";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { View } from "react-native";
import { useHjmNativeTheme } from "./provider.js";
export function Asset({ descriptor, children, accessory, style }) {
    validateAssetDescriptor(descriptor);
    const { palette, environment } = useHjmNativeTheme();
    const size = assetRecipe.sizes[descriptor.size ?? assetRecipe.defaults.size];
    const shape = assetRecipe.shapes[descriptor.shape ?? assetRecipe.defaults.shape];
    const decorative = descriptor.decorative ?? false;
    // The frame freezes nothing itself — it has no player. It hands the one
    // answer to the slot so the product does not re-derive the preference.
    const animate = shouldAnimateAsset(descriptor.kind, environment.reducedMotion);
    return (_jsxs(View, { style: [{ position: "relative" }, style], accessible: !decorative, accessibilityRole: decorative ? "none" : "image", ...(decorative
            ? { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" }
            : { accessibilityLabel: descriptor.accessibilityLabel }), children: [_jsx(View, { style: {
                    width: size,
                    height: size,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    borderRadius: shape,
                    borderWidth: 1,
                    borderColor: resolveColorReference(assetRecipe.border, palette),
                    backgroundColor: resolveColorReference(assetRecipe.background, palette),
                }, children: typeof children === "function" ? children({ animate }) : children }), accessory ? (_jsx(View
            // Outside the frame's corner so it never covers the media's middle.
            , { 
                // Outside the frame's corner so it never covers the media's middle.
                style: { position: "absolute", bottom: -assetRecipe.accessory.offset, right: -assetRecipe.accessory.offset }, children: accessory })) : null] }));
}
/** Overlaps assets with the same ratio Avatar uses — they share a row on purpose. */
export function AssetGroup({ label, size = assetRecipe.defaults.size, children, style }) {
    const overlap = -Math.round(assetRecipe.sizes[size] * assetRecipe.overlapRatio);
    return (_jsx(View, { accessibilityRole: "none", accessible: true, accessibilityLabel: label, style: [{ flexDirection: "row", alignItems: "center" }, style], children: Array.isArray(children)
            ? children.map((child, index) => (_jsx(View, { style: index === 0 ? undefined : { marginStart: overlap }, children: child }, index)))
            : children }));
}
//# sourceMappingURL=asset.js.map