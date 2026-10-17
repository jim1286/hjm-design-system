import { createContext, useContext } from "react";
import type { TextStyle } from "react-native";

/**
 * React Native text does not inherit `text-align` like CSS does. Containers whose Web counterpart sets
 * `text-align` (e.g. the AuthScreenLayout hero, `.hjm-auth-screen__hero { text-align: center }`) provide
 * it here so nested Text without an explicit `align` matches Web (2026-10-17 web/native comparison).
 */
export const InheritedTextAlignContext = createContext<TextStyle["textAlign"] | undefined>(undefined);
export const useInheritedTextAlign = () => useContext(InheritedTextAlignContext);
