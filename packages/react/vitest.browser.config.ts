import { fileURLToPath } from "node:url";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // The native provider's Expo-web hydration regression reuses this DOM runtime;
  // alias the platform boundary so Vite never parses React Native's Flow entry.
  resolve: {
    alias: {
      "react-native": fileURLToPath(new URL("./test/native-provider-platform.mock.ts", import.meta.url)),
    },
  },
  optimizeDeps: { include: ["react-dom/server"] },
  test: {
    include: ["test/**/*.browser.test.tsx"],
    /**
     * These tests intentionally exercise document-level focus, portals, and
     * global keyboard handling. Running files in parallel lets one page steal
     * focus from another and makes blur/Tooltip assertions nondeterministic.
     */
    fileParallelism: false,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});
