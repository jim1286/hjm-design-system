import type { Preview } from "@storybook/react-vite";

import { WebDesignSystemProvider } from "../src/runtime/WebDesignSystemProvider";
import "@hjmds/react/styles.css";
import "../src/showcase.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      name: "Theme",
      description: "HJM semantic color theme",
      defaultValue: "light",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
    direction: {
      name: "Direction",
      defaultValue: "ltr",
      toolbar: {
        icon: "transfer",
        items: [
          { value: "ltr", title: "LTR" },
          { value: "rtl", title: "RTL" },
        ],
        dynamicTitle: true,
      },
    },
    textScale: {
      name: "Text scale",
      defaultValue: "1",
      toolbar: {
        icon: "paragraph",
        items: [
          { value: "1", title: "100%" },
          { value: "1.5", title: "150%" },
          { value: "2", title: "200%" },
        ],
        dynamicTitle: true,
      },
    },
    motion: {
      name: "Motion",
      defaultValue: "full",
      toolbar: {
        icon: "lightning",
        items: [
          { value: "full", title: "Full motion" },
          { value: "reduced", title: "Reduced motion" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme === "dark" ? "dark" : "light";
      const direction = context.globals.direction === "rtl" ? "rtl" : "ltr";
      const rawTextScale = Number(context.globals.textScale);
      const textScale = [1, 1.5, 2].includes(rawTextScale) ? rawTextScale : 1;
      const reducedMotion = context.globals.motion === "reduced";

      return (
        <WebDesignSystemProvider
          input={{ direction, reducedMotion, textScale, theme }}
          systemTheme="light"
        >
          <Story />
        </WebDesignSystemProvider>
      );
    },
  ],
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
    a11y: { test: "error" },
    options: {
      storySort: {
        order: [
          "Home",
          "Foundations",
          "Components",
          [
            "Overview",
            "Foundation",
            "Layout",
            "Actions",
            "Inputs",
            "Navigation",
            "Data Display",
            "Feedback",
            "Overlays",
            "Infrastructure",
            "Catalog",
          ],
          "Patterns",
          "Accessibility",
        ],
      },
    },
  },
};

export default preview;
