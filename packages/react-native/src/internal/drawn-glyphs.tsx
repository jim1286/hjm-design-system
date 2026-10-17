import { View } from "react-native";
import { useHjmNativeTheme } from "../provider.js";

// Native Icon needs a product glyph renderer and react-native-svg is an optional peer, so the few semantic glyphs a
// built-in control must draw on its own (calendar, chevrons) are drawn with Views in a fixed frame, like the
// Agreement check and PasswordField eye. They mirror Web's built-in `calendar` / `chevron*` paths (24-unit grid)
// instead of the text placeholders "▣" and "→" these controls used before (2026-10-17 review).

const hidden = { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" } as const;

export type DrawnChevronDirection = "up" | "down" | "start" | "end";

const chevronTurn: Readonly<Record<DrawnChevronDirection, number>> = { up: 45, down: 225, start: -45, end: 135 };

export function DrawnChevron({ direction, size, color, strokeWidth = 2 }: Readonly<{ direction: DrawnChevronDirection; size: number; color: string; strokeWidth?: number }>) {
  const arm = size * 0.36;
  // Physical sides follow the reading direction (scenario matrix rtl): the top+start corner rotated toward the
  // tip draws the same up/down chevron in LTR and RTL, and start/end chevrons point to the reading start/end.
  const rtl = useHjmNativeTheme().environment.direction === "rtl";
  const turn = chevronTurn[direction] * (rtl ? -1 : 1);
  const vertical = direction === "up" || direction === "down";
  const tipLeft = (direction === "start") !== rtl;
  return <View {...hidden} style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
    <View style={{
      width: arm, height: arm, borderColor: color, borderTopWidth: strokeWidth, ...(rtl ? { borderRightWidth: strokeWidth } : { borderLeftWidth: strokeWidth }),
      // A rotated corner: 45deg opens downward (points up), 225deg points down, -45/135 point left/right in LTR.
      // The offset keeps the tip optically centered.
      transform: [vertical ? { translateY: direction === "up" ? arm * 0.2 : -arm * 0.2 } : { translateX: tipLeft ? arm * 0.2 : -arm * 0.2 }, { rotate: `${turn}deg` }],
    }} />
  </View>;
}

export function DrawnCalendar({ size, color, strokeWidth = 2 }: Readonly<{ size: number; color: string; strokeWidth?: number }>) {
  const body = size * 0.75;
  return <View {...hidden} style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
    <View style={{ width: body, height: body * 0.92, borderWidth: strokeWidth, borderColor: color, borderRadius: strokeWidth * 1.5, marginTop: size * 0.08 }}>
      <View style={{ height: strokeWidth, backgroundColor: color, marginTop: body * 0.22 }} />
    </View>
    {[0.32, 0.68].map(x => <View key={x} style={{ position: "absolute", top: size * 0.06, start: size * x - strokeWidth / 2, width: strokeWidth, height: size * 0.2, borderRadius: strokeWidth, backgroundColor: color }} />)}
  </View>;
}
