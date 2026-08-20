import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "HJM Design System",
    brandUrl: "?path=/story/home-overview--overview",
    colorPrimary: "#5b5bd6",
    colorSecondary: "#5b5bd6",
    appBorderRadius: 10,
    fontBase: 'Inter, Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  }),
  brandTitle: "HJM Design System",
  panelPosition: "bottom",
  showPanel: false,
  sidebar: { showRoots: true },
});
