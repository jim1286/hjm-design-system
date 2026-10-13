import { requireOptionalNativeModule, useEvent } from "expo";
// Older development clients can lack this Showcase-only module. Keep native
// loading at this boundary so the preview can explain missing playback support.
export const videoDialogHost = {
  useEvent,
  player: requireOptionalNativeModule("ExpoVideo") ? require("expo-video") as typeof import("expo-video") : null,
  clip: require("../../shared/assets/reference-video/preview.mp4"),
};
