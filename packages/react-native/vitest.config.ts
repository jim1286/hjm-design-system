import { URL, fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "react-native": fileURLToPath(new URL("./test/react-native.mock.tsx", import.meta.url)),
      // The real package needs the native runtime; tests only need scheduleOnRN to call through.
      "react-native-worklets": fileURLToPath(new URL("./test/worklets.mock.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts", "test/**/*.test.tsx"],
  },
});
