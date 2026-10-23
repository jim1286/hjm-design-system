import { createContext, useContext } from "react";
// Filled message surfaces scope their neutral text tones without recoloring nested controls or the product theme.
export const InheritedTextColorContext = createContext(undefined);
export const useInheritedTextColor = () => useContext(InheritedTextColorContext);
//# sourceMappingURL=text-colors.js.map