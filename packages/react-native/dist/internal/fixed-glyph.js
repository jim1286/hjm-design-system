import { jsx as _jsx } from "react/jsx-runtime";
import { Text as NativeText } from "react-native";
import { typography } from "@hjmds/design-contracts/foundations";
import { useHjmNativeTheme } from "../provider.js";
// A text glyph drawn as icon artwork (×, ···) inside a fixed frame — IconButton's glyph box, a
// SearchField clear circle, an attachment badge. HJM Text scales with text in both modes (OS Dynamic
// Type through allowFontScaling in native mode, textScale in controlled mode, even with
// allowFontScaling=false), so the glyph outgrew the frame and was clipped: Dialog close at 200% (1.11)
// and SearchScreen's recent remove read as "⌄" at iOS large text (utilverse 1.13.1, 2026-10-06).
// The control keeps its accessible name and target; labels around it still scale. Growing the frame
// instead was rejected because IconButton's diameter is a recipe contract shared with Web.
export function FixedGlyph({ children, tone = "primary", color, fontSize = typography.body.fontSize, lineHeight = fontSize === typography.body.fontSize ? typography.body.lineHeight : fontSize }) {
    const { colors } = useHjmNativeTheme();
    return _jsx(NativeText, { accessible: false, allowFontScaling: false, style: { color: color ?? (tone === "muted" ? colors.textMuted : colors.text), fontSize, lineHeight }, children: children });
}
//# sourceMappingURL=fixed-glyph.js.map