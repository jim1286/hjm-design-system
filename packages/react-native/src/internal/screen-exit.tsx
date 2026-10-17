import { View } from "react-native";
import { screenExitRecipe, type ScreenExitKind } from "@hjmds/design-contracts/screen-patterns";
import { IconButton } from "../actions.js";
import { useHjmNativeTheme } from "../provider.js";

/** Leaving a screen: icon-only, fixed at the header's leading edge (ScreenLayout and TopBar `exit`). */
export type ScreenExit = Readonly<{ kind: ScreenExitKind; label: string; onPress(): void; disabled?: boolean }>;

/** Drawn chevron/cross so back and close look identical on every platform and font. */
export function ScreenExitButton({ kind, label, onPress, disabled = false }: ScreenExit) {
  const { colors, environment } = useHjmNativeTheme();
  const { chevronSize, closeSize, stroke } = screenExitRecipe;
  const rtl = environment.direction === "rtl";
  const glyph = kind === "back"
    ? <View style={{ width: chevronSize, height: chevronSize, borderLeftWidth: stroke, borderBottomWidth: stroke, borderColor: colors.text, transform: [{ translateX: chevronSize / 4 * (rtl ? -1 : 1) }, { rotate: rtl ? "-135deg" : "45deg" }] }} />
    : <View style={{ width: closeSize, height: closeSize, alignItems: "center", justifyContent: "center" }}>
        {["45deg", "-45deg"].map(rotate => <View key={rotate} style={{ position: "absolute", width: closeSize * Math.SQRT2, height: stroke, borderRadius: stroke / 2, backgroundColor: colors.text, transform: [{ rotate }] }} />)}
      </View>;
  // Always on the header/row leading edge: the glyph slot sits on the gutter, the 44 target overhangs (iconButtonRecipe.edge).
  return <IconButton label={label} tone="ghost" edge="start" disabled={disabled} onPress={onPress}><View accessible={false} importantForAccessibility="no-hide-descendants">{glyph}</View></IconButton>;
}
