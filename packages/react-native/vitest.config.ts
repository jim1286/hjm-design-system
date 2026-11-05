import { URL, fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "react-native": fileURLToPath(new URL("./test/react-native.mock.tsx", import.meta.url)),
      // The real package needs the native runtime; tests only need scheduleOnRN to call through.
      "react-native-worklets": fileURLToPath(new URL("./test/worklets.mock.ts", import.meta.url)),
      // Core controls draw Lucide marks over react-native-svg (required peer since 2026-11-05); Node cannot load the
      // native package, so every test resolves it to named host components.
      "react-native-svg": fileURLToPath(new URL("./test/react-native-svg.mock.tsx", import.meta.url)),
    },
  },
  test: {
    // Inline these SVG adapters so their imports use our native host mock;
    // Node otherwise loads React Native Flow before Vitest can substitute it.
    server: { deps: { inline: ["@blobatar/react-native", "lucide-react-native"] } },
    environment: "node",
    include: ["test/**/*.test.ts", "test/**/*.test.tsx"],
  },
});
