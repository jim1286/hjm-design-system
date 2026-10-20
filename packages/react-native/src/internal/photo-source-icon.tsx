import { View } from "react-native";
import { listRowRecipe } from "@hjmds/design-contracts/recipes";
import type { PhotoSource } from "@hjmds/design-contracts/screen-patterns";
import { glyph } from "@hjmds/design-contracts/foundations";
import { useHjmNativeTheme } from "../provider.js";

/** Built-in source marks use Views so opening the core sheet never requires an optional SVG peer. */
export function PhotoSourceIcon({ source }: { source: PhotoSource }) {
  const { environment, tokens } = useHjmNativeTheme();
  // Shared neutral colors use a stronger plate/line contrast after device feedback (2026-10-20).
  const colors = environment.theme === "dark"
    ? { surfaceAccent: "#334155", contentBrand: "#F1F5F9" }
    : { surfaceAccent: "#E2E8F0", contentBrand: "#334155" };
  const size = glyph.md;
  const stroke = { borderColor: colors.contentBrand, borderWidth: 2 };
  return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={{ width: listRowRecipe.leadingSize, height: listRowRecipe.leadingSize, borderRadius: tokens.radius.md,
      backgroundColor: colors.surfaceAccent, alignItems: "center", justifyContent: "center" }}>
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      {source === "camera" ? <>
        <View style={{ ...stroke, position: "absolute", top: size * .12, width: size * .34, height: size * .2, borderRadius: 2 }} />
        <View style={{ ...stroke, width: size * .88, height: size * .62, marginTop: size * .12, borderRadius: 3, backgroundColor: colors.surfaceAccent, alignItems: "center", justifyContent: "center" }}>
          <View style={{ ...stroke, width: size * .3, height: size * .3, borderRadius: size }} />
        </View>
      </> : <>
        <View style={{ ...stroke, width: size * .7, height: size * .7, position: "absolute", top: 0, start: 0, borderRadius: 3 }} />
        <View style={{ ...stroke, width: size * .78, height: size * .72, position: "absolute", bottom: 0, end: 0, borderRadius: 3, backgroundColor: colors.surfaceAccent, overflow: "hidden" }}>
          <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: colors.contentBrand, position: "absolute", top: 3, end: 3 }} />
          <View style={{ ...stroke, width: size * .45, height: size * .45, position: "absolute", bottom: -size * .3, start: 1, transform: [{ rotate: "45deg" }] }} />
        </View>
      </>}
    </View>
  </View>;
}
