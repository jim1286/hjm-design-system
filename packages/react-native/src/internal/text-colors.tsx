import { createContext, useContext } from "react";

// Filled message surfaces scope their neutral text tones without recoloring nested controls or the product theme.
export const InheritedTextColorContext = createContext<string | undefined>(undefined);
export const useInheritedTextColor = () => useContext(InheritedTextColorContext);
