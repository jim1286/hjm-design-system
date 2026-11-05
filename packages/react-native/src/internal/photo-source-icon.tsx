import { View } from "react-native";
import { listRowRecipe } from "@hjmds/design-contracts/recipes";
import type { PhotoSource } from "@hjmds/design-contracts/screen-patterns";
import { glyph } from "@hjmds/design-contracts/foundations";
import Camera from "lucide-react-native/icons/camera";
import Images from "lucide-react-native/icons/images";
import { useHjmNativeTheme } from "../provider.js";
import { LucideGlyph } from "./lucide-glyph.js";

/** Built-in source marks are Lucide icons (the only icon source, 2026-11-05) on a neutral plate. */
export function PhotoSourceIcon({ source }: { source: PhotoSource }) {
  const { environment, tokens } = useHjmNativeTheme();
  // Shared neutral colors use a stronger plate/line contrast after device feedback (2026-10-20).
  const colors = environment.theme === "dark"
    ? { surfaceAccent: "#334155", contentBrand: "#F1F5F9" }
    : { surfaceAccent: "#E2E8F0", contentBrand: "#334155" };
  return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={{ width: listRowRecipe.leadingSize, height: listRowRecipe.leadingSize, borderRadius: tokens.radius.md,
      backgroundColor: colors.surfaceAccent, alignItems: "center", justifyContent: "center" }}>
    <PhotoSourceGlyph source={source} color={colors.contentBrand} />
  </View>;
}

/**
 * The source mark without its plate, for a quiet inline action (PhotoAttachmentField's choose button, 2026-11-03):
 * Lucide Camera and Images.
 */
export function PhotoSourceGlyph({ source, color, size = glyph.md }: Readonly<{ source: PhotoSource; color: string; size?: number }>) {
  return <LucideGlyph icon={source === "camera" ? Camera : Images} size={size} color={color} />;
}
