import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";
import { THEMES, fontFamily, radius } from "@hjm/design-system";

addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "HJM Design System",
    brandUrl: "?path=/story/home-overview--overview",
    colorPrimary: THEMES.light.primary,
    colorSecondary: THEMES.light.contentBrand,
    appBorderRadius: radius.md,
    fontBase: fontFamily.ui.join(", "),
  }),
  brandTitle: "HJM Design System",
  layout: {
    panelPosition: "bottom",
    showPanel: false,
  },
  sidebar: { showRoots: true },
});
