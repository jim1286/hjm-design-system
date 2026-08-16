import type { CSSProperties } from "react";
import type { Preview } from "@storybook/react-vite";

import { THEMES } from "@hjm/design-system";

import "../src/showcase.css";

type ShowcaseStyle = CSSProperties & Record<`--hjm-${string}`, string | number>;

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
      const themeName = context.globals.theme === "dark" ? "dark" : "light";
      const direction = context.globals.direction === "rtl" ? "rtl" : "ltr";
      const textScale = ["1", "1.5", "2"].includes(String(context.globals.textScale))
        ? String(context.globals.textScale)
        : "1";
      const motion = context.globals.motion === "reduced" ? "reduced" : "full";
      const colors = THEMES[themeName];
      const style: ShowcaseStyle = {
        "--hjm-bg": colors.bg,
        "--hjm-surface": colors.surface,
        "--hjm-surface-alt": colors.surfaceAlt,
        "--hjm-surface-accent": colors.surfaceAccent,
        "--hjm-border": colors.border,
        "--hjm-text": colors.text,
        "--hjm-text-body": colors.textBody,
        "--hjm-text-muted": colors.textMuted,
        "--hjm-text-sub": colors.textSub,
        "--hjm-text-weak": colors.textWeak,
        "--hjm-primary": colors.primary,
        "--hjm-content-brand": colors.contentBrand,
        "--hjm-danger": colors.danger,
        "--hjm-on-primary": colors.onPrimary,
        "--hjm-text-scale": textScale,
        backgroundColor: colors.bg,
        color: colors.text,
      };

      return (
        <div
          className="hjm-story-root"
          data-motion={motion}
          data-theme={themeName}
          dir={direction}
          style={style}
        >
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
    a11y: { test: "error" },
    options: {
      storySort: {
        order: ["Introduction", "Foundations", "Components", "Patterns", "Accessibility"],
      },
    },
  },
};

export default preview;
