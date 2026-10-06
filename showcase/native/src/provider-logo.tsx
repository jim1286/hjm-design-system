import { Image } from "react-native";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { authProviderButtonRecipe } from "@hjmds/design-contracts/components/provider-button";

// Injected by the private portfolio sync tool; trademark bytes never enter the public package.
export function ProviderLogo({ provider }: { provider: "google" | "apple" }) {
  const { environment } = useHjmNativeTheme();
  const uri = provider === "google" ? process.env.EXPO_PUBLIC_HJM_AUTH_GOOGLE : environment.theme === "dark" ? process.env.EXPO_PUBLIC_HJM_AUTH_APPLE_BLACK : process.env.EXPO_PUBLIC_HJM_AUTH_APPLE_WHITE;
  return uri ? <Image source={{ uri }} style={{ width: authProviderButtonRecipe.logoSize, height: authProviderButtonRecipe.logoSize }} resizeMode="contain" accessible={false} /> : null;
}
