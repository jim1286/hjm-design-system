import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
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
