import type { StorybookConfig } from "@storybook/react-vite";

import { fileURLToPath } from "node:url";
import { vitePlugin } from "../../../scripts/hjm-local-source.mjs";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(config) {
    config.plugins = [...(config.plugins ?? []), vitePlugin(fileURLToPath(new URL("../", import.meta.url)))];
    return config;
  },
  docs: {
    defaultName: "Documentation",
  },
};

export default config;
