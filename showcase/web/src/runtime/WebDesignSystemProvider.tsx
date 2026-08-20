import { createContext, useContext, type ReactNode } from "react";

import {
  resolveDesignSystemProviderValue,
  type DesignSystemEnvironmentInput,
  type ResolvedDesignSystemEnvironment,
  type ResolvedTheme,
} from "@hjm/design-system";

import { createWebThemeStyle } from "./web-theme";

const WebDesignSystemEnvironmentContext =
  createContext<ResolvedDesignSystemEnvironment | null>(null);

type WebDesignSystemProviderProps = Readonly<{
  children: ReactNode;
  input: DesignSystemEnvironmentInput;
  systemTheme?: ResolvedTheme;
}>;

/** Showcase's thin React adapter over the renderer-neutral provider contract. */
export function WebDesignSystemProvider({
  children,
  input,
  systemTheme = "light",
}: WebDesignSystemProviderProps) {
  const parent = useContext(WebDesignSystemEnvironmentContext);
  const providerValue = resolveDesignSystemProviderValue(
    input,
    parent ? { parent, systemTheme } : { systemTheme },
  );
  const { environment } = providerValue;
  const style = createWebThemeStyle(providerValue);

  return (
    <WebDesignSystemEnvironmentContext.Provider value={environment}>
      <div
        className="hjm-story-root"
        data-motion={environment.reducedMotion ? "reduced" : "full"}
        data-theme={environment.theme}
        data-text-scale={environment.textScale}
        dir={environment.direction}
        style={style}
      >
        {children}
      </div>
    </WebDesignSystemEnvironmentContext.Provider>
  );
}

export function useWebDesignSystemEnvironment(): ResolvedDesignSystemEnvironment {
  const environment = useContext(WebDesignSystemEnvironmentContext);
  if (!environment) {
    throw new Error("WebDesignSystemProvider is required for Showcase renderers");
  }
  return environment;
}
