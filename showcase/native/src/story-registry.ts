export const nativeRendererStoryGroups = {
  foundations: [
    "design-system-provider", "text", "surface", "stack", "grid", "layout", "icon", "section", "divider",
  ],
  actions: ["button", "icon-button", "link", "bottom-cta"],
  inputs: [
    "field", "search-field", "text-area", "password-field", "otp-field", "number-field", "slider", "form", "date-picker", "file-picker", "checkbox", "radio", "checkbox-group", "radio-group", "switch",
    "segmented-control", "select", "combobox", "chip",
  ],
  navigation: ["tabs", "steps", "top-bar", "menu", "bottom-navigation", "load-more"],
  dataDisplay: [
    "badge", "avatar", "card", "list-row", "tag", "timeline", "description-list", "image", "counter-badge",
    "list", "statistic", "upload-item", "accordion",
  ],
  feedback: ["empty-state", "result", "notice", "progress", "skeleton", "spinner", "toast"],
  overlays: ["dialog", "alert-dialog", "sheet"],
} as const;

export const nativeRendererStoryIds = Object.values(nativeRendererStoryGroups).flat();
