import { mergeConfig } from "vitest/config";
import rendererBrowserConfig from "../../packages/react/vitest.browser.config.ts";

// Showcase fixtures use Bundler resolution, including shared Native-compatible
// extensionless imports. Keep their browser tests with the consuming surface.
export default mergeConfig(rendererBrowserConfig, {
  // Workspace-linked optional renderers must share the test host's React. Discover
  // these before tests start so first-use optimization cannot reload a live fixture.
  resolve: { dedupe: ["react", "react-dom"] },
  optimizeDeps: { include: ["framer-motion", "lucide-react"] },
  test: { include: ["src/**/*.browser.test.tsx"] },
});
