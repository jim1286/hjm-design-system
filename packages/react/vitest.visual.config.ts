import { fileURLToPath } from "node:url";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

/**
 * Visual baselines for the cross-product core (1.5.0). Screenshots depend on
 * the OS font stack and rasterizer, so baselines are platform-suffixed and are
 * generated and compared only on the CI image (.github/workflows/visual.yml,
 * ubuntu-latest). This config is not part of `pnpm test`/`ci:check`, because a
 * macOS run has no matching baseline and would fail for reasons unrelated to a
 * change.
 */
export default defineConfig({
  resolve: {
    alias: {
      "react-native": fileURLToPath(new URL("./test/native-provider-platform.mock.ts", import.meta.url)),
    },
  },
  test: {
    include: ["test/**/*.visual.test.tsx"],
    fileParallelism: false,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium", viewport: { width: 480, height: 900 } }],
      expect: {
        toMatchScreenshot: {
          comparatorName: "pixelmatch",
          // Tolerate rasterization noise while catching geometry and larger pixel changes.
          // Subtle fill changes use computed-style regression tests: pale blue/gray
          // can remain within pixelmatch's color threshold (2026-09-29 audit).
          comparatorOptions: { threshold: 0.2, allowedMismatchedPixelRatio: 0.005 },
          resolveScreenshotPath: ({ root, testFileName, arg, browserName, platform, ext }) =>
            `${root}/test/visual-baselines/${testFileName}/${arg}-${browserName}-${platform}${ext}`,
        },
      },
    },
  },
});
