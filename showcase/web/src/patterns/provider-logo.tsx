import { useHjmTheme } from "@hjmds/react/provider";
import { authProviderButtonRecipe } from "@hjmds/design-contracts/components/provider-button";

// Injected by the private portfolio sync tool; trademark bytes never enter the public package.
export function ProviderLogo({ provider }: { provider: "google" | "apple" }) {
  const { environment } = useHjmTheme();
  const uri = provider === "google" ? import.meta.env.VITE_HJM_AUTH_GOOGLE : environment.theme === "dark" ? import.meta.env.VITE_HJM_AUTH_APPLE_BLACK : import.meta.env.VITE_HJM_AUTH_APPLE_WHITE;
  return uri ? <img src={uri} width={authProviderButtonRecipe.logoSize} height={authProviderButtonRecipe.logoSize} alt="" /> : null;
}
