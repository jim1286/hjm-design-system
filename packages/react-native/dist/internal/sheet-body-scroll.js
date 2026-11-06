import { createContext, useContext } from "react";
export const SheetBodyScrollContext = createContext(null);
export function useSheetBodyScroll() {
    return useContext(SheetBodyScrollContext);
}
/** Present even below a scrollable Sheet: an inner input must prevent its outer body from dragging. */
export const SheetScrollOwnershipContext = createContext(null);
//# sourceMappingURL=sheet-body-scroll.js.map