import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.browser.test.tsx"],
    browser: {
      enabled: true,
      headless: true,
      /**
       * Browser test files run in parallel pages, so every file except the
       * foreground one is a background tab. Chromium throttles background timers
       * to whole seconds, which stalls the `setTimeout` that opens focus-driven
       * overlays such as Tooltip well past the fixed waits these tests use.
       */
      provider: playwright({
        launchOptions: {
          args: [
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
          ],
        },
      }),
      instances: [{ browser: "chromium" }],
    },
  },
});
