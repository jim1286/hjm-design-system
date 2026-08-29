import { createContext, useContext, type ReactNode } from "react";
import { HjmProvider } from "@hjmds/react/provider";

import {
  resolveDesignSystemProviderValue,
  type DesignSystemEnvironmentInput,
  type ResolvedDesignSystemEnvironment,
  type ResolvedTheme,
} from "@hjmds/design-contracts";

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
      <HjmProvider
        className="hjm-story-root"
        direction={environment.direction}
        reducedMotion={environment.reducedMotion}
        systemTheme={environment.theme}
        textScale={environment.textScale}
        theme={environment.theme}
        style={style}
      >
        {children}
      </HjmProvider>
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
