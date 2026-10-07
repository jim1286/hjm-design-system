import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ScrollView, Text, View } from 'react-native';
import { resolveCodeBlock } from '@hjmds/design-contracts/code-block';
import { spacing } from '@hjmds/design-contracts/foundations';
import { useHjmNativeTheme } from './provider.js';
import { resolveNativeFontStyle, resolveNativeTextScaleProps } from './internal/styles.js';
/** Product supplies its clipboard action; importing this view installs no Expo/native clipboard dependency. */
export function CodeBlock({ copyAction, ...descriptor }) {
    const spec = resolveCodeBlock(descriptor);
    const { colors, textScaling, tokens } = useHjmNativeTheme();
    // Keep a single selectable source with inherited token spans; native Text alone
    // ignores the provider's controlled text scale used by both showcases.
    const textProps = resolveNativeTextScaleProps(textScaling, tokens.typography.body);
    // Code punctuation must keep its reading order independently of an RTL product shell.
    const source = _jsx(Text, { ...textProps, selectable: true, accessibilityLabel: `${spec.label}\n${spec.code}`, style: [textProps.style, { ...resolveNativeFontStyle(tokens.fontFamily.code, "code"), writingDirection: 'ltr', textAlign: 'left', color: colors.text, padding: spacing.md }], children: spec.tokens.map((token, index) => _jsx(Text, { style: { color: token.tone === 'comment' ? colors.textMuted : token.tone === 'keyword' || token.tone === 'number' ? colors.primary : colors.text }, children: token.text }, index)) });
    return _jsxs(View, { style: { minWidth: 0, borderRadius: tokens.radius.lg, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }, children: [_jsxs(View, { style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, padding: spacing.md }, children: [_jsx(Text, { ...textProps, style: [textProps.style, { ...resolveNativeFontStyle(tokens.fontFamily.ui), color: colors.text }], children: spec.language ?? spec.label }), copyAction] }), spec.wrap ? source : _jsx(ScrollView, { horizontal: true, children: source })] });
}
//# sourceMappingURL=code-block.js.map