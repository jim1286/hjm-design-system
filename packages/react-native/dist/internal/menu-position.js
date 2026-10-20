import { menuRecipe } from "@hjmds/design-contracts/recipes";
/** Coordinates are relative to the measured Modal root, not assumed screen/status-bar offsets. */
export function resolveNativeMenuPosition(anchor, viewport, menuHeight, direction, menuWidth) {
    const edge = menuRecipe.collisionPadding;
    const minX = viewport.left + edge;
    const maxX = viewport.width - viewport.right - edge;
    const minY = viewport.top + edge;
    const maxY = viewport.height - viewport.bottom - edge;
    const width = Math.max(0, Math.min(menuWidth, maxX - minX));
    const below = Math.max(0, maxY - anchor.y - anchor.height - menuRecipe.sideOffset);
    const above = Math.max(0, anchor.y - menuRecipe.sideOffset - minY);
    const placement = menuHeight <= below || below >= above ? "bottom" : "top";
    const maxHeight = Math.max(0, placement === "bottom" ? below : above);
    const height = Math.min(menuHeight, maxHeight);
    return {
        left: Math.max(minX, Math.min(direction === "rtl" ? anchor.x : anchor.x + anchor.width - width, maxX - width)),
        top: Math.max(minY, Math.min(placement === "bottom" ? anchor.y + anchor.height + menuRecipe.sideOffset : anchor.y - menuRecipe.sideOffset - height, maxY - height)),
        width,
        maxHeight,
        placement,
    };
}
//# sourceMappingURL=menu-position.js.map