import { createContext, useContext } from "react";
export const SheetBodyScrollContext = createContext(null);
export function useSheetBodyScroll() {
    return useContext(SheetBodyScrollContext);
}
//# sourceMappingURL=sheet-body-scroll.js.map