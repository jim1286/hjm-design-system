import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { ScreenLayout } from "./screens.js";
import { Collapsible } from "./collapsible.js";
import { EffectSurface } from "./effect-surface.js";
import { Grid, Stack, Surface } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
import { resolveDesignProfileCollection } from "@hjmds/design-contracts/design-profile-layout";
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
    const canvas = designProfile?.material.canvas ?? { layers: ["mesh"], intensity: 0, active: false };
    return _jsx(EffectSurface, { descriptor: canvas, style: { flex: 1 }, children: _jsx(ScreenLayout, { ...screen, children: _jsxs(Stack, { gap: "xl", children: [toolbar ? _jsx(Collapsible, { trigger: toolbarLabel, open: toolsOpen, onOpenChange: setToolsOpen, presentation: toolbarPresentation === "inline" ? "inline" : "disclosure", keepMounted: true, children: toolbar }) : null, _jsx(Grid, { ...resolveDesignProfileCollection(collection), children: items.map(item => _jsx(Surface, { padding: collection === "rows" ? "md" : "xl", tone: collection === "rows" ? "default" : "raised", bordered: true, radius: "lg", children: _jsx(EffectSurface, { descriptor: designProfile?.material.card ?? { layers: ["mesh"], intensity: 0, active: false }, style: { backgroundColor: "transparent" }, children: item.children }) }, item.id)) })] }) }) });
}
//# sourceMappingURL=design-profile.js.map