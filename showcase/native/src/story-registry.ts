export const nativeRendererStoryGroups = {
  foundations: [
    "design-system-provider", "text", "surface", "stack", "grid", "layout", "icon", "section", "divider",
  ],
  actions: ["button", "icon-button", "bottom-cta"],
  inputs: [
    "field", "search-field", "text-area", "checkbox", "checkbox-group", "radio-group", "switch",
    "segmented-control", "select", "combobox", "chip",
  ],
  navigation: ["tabs", "top-bar", "menu", "bottom-navigation", "load-more"],
  dataDisplay: [
    "badge", "card", "list-row", "tag", "timeline", "description-list", "image", "counter-badge",
    "list", "statistic", "accordion",
  ],
  feedback: ["empty-state", "result", "notice", "progress", "skeleton", "toast"],
  overlays: ["dialog", "alert-dialog", "sheet"],
} as const;

export const nativeRendererStoryIds = Object.values(nativeRendererStoryGroups).flat();
