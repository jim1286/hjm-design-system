export const nativeRendererStoryGroups = {
  foundations: [
    "design-system-provider", "text", "surface", "stack", "container", "aspect-ratio", "grid", "layout", "icon", "section", "divider", "top", "heading", "auth-screen",
  ],
  actions: ["button", "icon-button", "link", "bottom-cta", "auth-provider-button"],
  agreement: ["agreement"],
  calendar: ["calendar"],
  floatingActionButton: ["floating-action-button"],
  inputs: [
    "field", "search-field", "text-area", "password-field", "otp-field", "number-field", "slider", "form", "date-picker", "file-picker", "checkbox", "radio", "checkbox-group", "radio-group", "switch",
    "segmented-control", "select", "combobox", "chip", "toggle-group",
    "tags-input", "date-range-picker", "mentions", "transfer-list",
  ],
  navigation: ["tabs", "steps", "top-bar", "menu", "bottom-navigation", "load-more"],
  dataDisplay: [
    "badge", "avatar", "card", "list-row", "tag", "timeline", "description-list", "image", "counter-badge",
    "list", "carousel", "statistic", "upload-item", "accordion", "collapsible", "asset",
  ],
  feedback: ["empty-state", "result", "notice", "progress", "skeleton", "spinner", "toast", "bottom-info"],
  overlays: ["dialog", "alert-dialog", "sheet"],
} as const;

export const nativeRendererStoryIds = Object.values(nativeRendererStoryGroups).flat();
