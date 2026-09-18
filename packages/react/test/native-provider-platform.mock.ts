import { useEffect, useState } from "react";

export const appearance = {
  colorScheme: "light" as "light" | "dark",
  listeners: new Set<(scheme: "light" | "dark") => void>(),
};

export const Platform = { OS: "web" };
export const I18nManager = { isRTL: false };
export const AccessibilityInfo = {
  isReduceMotionEnabled: async () => true,
  addEventListener: () => ({ remove: () => undefined }),
};
export const useWindowDimensions = () => ({ fontScale: 1 });

// Match react-native-web 0.21.2's useState(Appearance) initialization and change
// subscription. Unlike an SSR-aware store, the initial client value can differ.
export function useColorScheme() {
  const [scheme, setScheme] = useState(appearance.colorScheme);
  useEffect(() => {
    appearance.listeners.add(setScheme);
    return () => { appearance.listeners.delete(setScheme); };
  });
  return scheme;
}
