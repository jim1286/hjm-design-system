export const nativeRendererStoryGroups = {
  foundations: [
    "design-system-provider", "text", "surface", "stack", "container", "aspect-ratio", "grid", "layout", "icon", "section", "divider", "top", "heading", "auth-screen",
  ],
  actions: ["button", "icon-button", "link", "bottom-cta", "auth-provider-button"],
  agreement: ["agreement"],
  calendar: ["calendar"],
  floatingActionButton: ["floating-action-button"],
  inputs: [
    "field", "search-field", "text-area", "password-field", "otp-field", "image-choice-group", "number-field", "slider", "form", "date-picker", "file-picker", "checkbox", "radio", "checkbox-group", "radio-group", "switch",
    "segmented-control", "select", "combobox", "chip", "toggle-group",
    "tags-input", "date-range-picker", "mentions", "transfer-list",
  ],
  navigation: ["tabs", "steps", "top-bar", "menu", "bottom-navigation", "load-more"],
  dataDisplay: [
    "badge", "avatar", "card", "list-row", "tag", "timeline", "description-list", "image", "counter-badge",
    "list", "carousel", "statistic", "upload-item", "accordion", "collapsible", "asset",
  ],
  feedback: ["empty-state", "result", "notice", "progress", "skeleton", "spinner", "toast", "bottom-info"],
  dataLayouts: ["masonry", "virtual-list", "qr-code"],
  thinkingOrb: ["thinking-orb"],
  overlays: ["dialog", "alert-dialog", "sheet"],
  // 2026-10-17 screen compositions registered (onboarding-screen waits for a Native default proof; see evidence.ts).
  screens: [
    "screen-layout", "composition-layout", "settings-screen", "search-screen", "editor-screen", "permission-screen", "moderation-screen", "chat-screen", "notification-inbox-screen", "comment-thread-screen", "list-detail-screen", "media-selection-screen", "profile-screen", "chat-message", "notification-row", "notification-item", "comment-thread-row", "profile-summary", "icon-tile", "message-composer", "photo-source-sheet",
  ],
} as const;

export const nativeRendererStoryIds = Object.values(nativeRendererStoryGroups).flat();
