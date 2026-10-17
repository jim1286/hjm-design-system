import { listRowRecipe } from "@hjmds/design-contracts/recipes";
/**
 * Inline room a clipping scroll viewport keeps for the ListRow surface bleed.
 *
 * A ListRow puts its text on the container's content edge and bleeds its pressed/selected surface
 * `listRowRecipe.surfaceBleed` outward (2026-10-17 user decision). ScrollView/FlatList clip at their own bounds, so the
 * viewport reaches `outset` past its box and pads the same amount inside its content: content keeps its position and
 * the bleed lands inside the clip. VirtualList reaches by the bleed; the scrollable Sheet reaches to its own padding
 * edge (its padding sat outside the ScrollView and cut the rows, 2026-10-17 1.27.2 adoption finding), as the Web sheet
 * body scroll box does. A bleeding CollectionRail reaches across the ScreenLayout body gutter the same way. The outset
 * must land on room the owner really has.
 */
export function listRowScrollRoom(outset = listRowRecipe.surfaceBleed) {
    return {
        viewport: { marginHorizontal: -outset },
        content: { paddingHorizontal: outset },
    };
}
//# sourceMappingURL=list-row-scroll-room.js.map