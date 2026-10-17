import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { ScreenLayout } from "./screens.js";
import { Collapsible } from "./collapsible.js";
import { EffectSurface } from "./effect-surface.js";
import { Grid, Stack, Surface } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
import { resolveDesignProfileCollection, resolveDesignProfileCollectionItem, overviewContentLayout } from "@hjmds/design-contracts/design-profile-layout";
import { Divider } from "./data-display.js";
/** Optional collection screen; ScreenLayout still owns loading/error/scrolling.
 * Unlike settings/inbox it owns a profile-selected collection and persistent tools.
 * It never owns product mutations or chooses a different component for each theme. */
export function OverviewScreen({ items, toolbar, toolbarLabel, collection: suppliedCollection, toolbarPresentation: suppliedToolbarPresentation, ...screen }) {
    const { designProfile } = useHjmNativeTheme();
    const collection = suppliedCollection ?? designProfile?.compositions.collection ?? "rows";
    const toolbarPresentation = suppliedToolbarPresentation ?? designProfile?.compositions.toolbar ?? "inline";
    const [toolsOpen, setToolsOpen] = useState(true);
    if (!toolbarLabel.trim())
        throw new TypeError("Overview tools need a localized label");
    const ids = new Set(items.map(item => item.id));
    if (ids.size !== items.length || items.some(item => !item.id.trim()))
        throw new TypeError("Overview items need unique stable ids");
    // Retain the same effect/grid/surface subtree when the profile changes: optional
    // decoration can disappear without remounting fields, focus or local state.
    const itemLayout = resolveDesignProfileCollectionItem(collection);
    const canvas = designProfile?.material.canvas ?? { layers: ["mesh"], intensity: 0, active: false };
    return _jsx(EffectSurface, { descriptor: canvas, radius: "none", style: { flex: 1 }, children: _jsx(ScreenLayout, { ...screen, children: _jsxs(Stack, { gap: "xl", layoutStyle: overviewContentLayout, children: [toolbar ? _jsx(Collapsible, { trigger: toolbarLabel, open: toolsOpen, onOpenChange: setToolsOpen, presentation: toolbarPresentation === "inline" ? "inline" : "disclosure", keepMounted: true, children: toolbar }) : null, _jsx(Grid, { ...resolveDesignProfileCollection(collection), children: items.map((item, index) => _jsxs(Surface, { padding: itemLayout.padding, tone: itemLayout.tone, bordered: itemLayout.bordered, radius: "lg", children: [itemLayout.ruled && index > 0 ? _jsx(Divider, { layoutStyle: { marginBottom: itemLayout.ruleGap } }) : null, _jsx(EffectSurface, { radius: "none", descriptor: designProfile?.material.card ?? { layers: ["mesh"], intensity: 0, active: false }, style: { backgroundColor: "transparent" }, children: item.children })] }, item.id)) })] }) }) });
}
//# sourceMappingURL=design-profile.js.map