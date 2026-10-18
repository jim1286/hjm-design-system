import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { isPaginationOpenEndedDescriptor, resolvePaginationDescriptor, resolvePaginationOpenEndedDescriptor, paginationRecipe as recipe } from '@hjmds/design-contracts/components/pagination';
import { resolveColorReference } from '@hjmds/design-contracts/color-references';
import { Pressable, View } from 'react-native';
import { Text } from './primitives.js';
import { useHjmNativeTheme } from './provider.js';
/** Bounded Native archives need the same page window and validation as Web; feeds still use LoadMore. */
export function Pagination({ label, descriptor, labels, composeAccessibleName, composeCurrentPageLabel, onPageChange, disabled = false, testID, layoutStyle }) {
    const theme = useHjmNativeTheme();
    if (!label.trim())
        throw new TypeError('Pagination label must not be empty');
    // The resolvers validate that the matching composer is a function, so a mismatched pair fails loudly.
    const openEnded = isPaginationOpenEndedDescriptor(descriptor)
        ? resolvePaginationOpenEndedDescriptor(descriptor, { labels, composeCurrentPageLabel: composeCurrentPageLabel })
        : null;
    const resolved = openEnded ?? resolvePaginationDescriptor(descriptor, { labels, composeAccessibleName: composeAccessibleName });
    const rtl = theme.environment.direction === 'rtl';
    const button = (key, text, accessibleName, unavailable, current, onPress) => (_jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: accessibleName, accessibilityState: { disabled: disabled || unavailable, selected: current }, disabled: disabled || unavailable, onPress: () => { if (!disabled && !unavailable && !current)
            onPress(); }, style: ({ pressed }) => ({ minWidth: recipe.item.minSize, minHeight: recipe.item.minSize,
            paddingHorizontal: theme.tokens.spacing.xs, alignItems: 'center', justifyContent: 'center',
            borderRadius: theme.tokens.radius[recipe.item.radius], borderWidth: 1,
            borderColor: current ? resolveColorReference(recipe.item.border.current, theme.palette) : 'transparent',
            backgroundColor: pressed ? resolveColorReference(recipe.item.background.hover, theme.palette) : 'transparent',
            opacity: disabled || unavailable ? recipe.states.disabledOpacity : 1 }), children: _jsx(Text, { accessible: false, style: { color: resolveColorReference(recipe.item.color[current ? 'current' : 'default'], theme.palette) }, children: text }) }, key));
    return _jsxs(View, { accessibilityLabel: label, testID: testID, style: [{ flexDirection: rtl ? 'row-reverse' : 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: recipe.gap }, layoutStyle], children: [button('previous', rtl ? '›' : '‹', resolved.labels.previous, !resolved.hasPrevious, false, () => onPageChange(resolved.currentPage - 1, 'previous')), openEnded ? (
            // Plain text, not a button: it is the only page the control can address. `selected` mirrors the bounded
            // current page so assistive tech reports it the same way.
            _jsx(View, { accessible: true, accessibilityRole: "text", accessibilityLabel: openEnded.currentPageLabel, accessibilityState: { selected: true }, style: { minHeight: recipe.pageLabel.minHeight, paddingHorizontal: recipe.pageLabel.paddingHorizontal, alignItems: 'center', justifyContent: 'center' }, children: _jsx(Text, { accessible: false, style: { color: resolveColorReference(recipe.pageLabel.color, theme.palette) }, children: openEnded.currentPageLabel }) })) : null, 'items' in resolved && resolved.items.map((item, index) => item.type === 'ellipsis'
                ? _jsx(Text, { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", tone: "muted", children: "\u2026" }, `ellipsis-${index}`)
                : button(item.page, String(item.page), item.accessibleName, false, item.current, () => onPageChange(item.page, 'page'))), button('next', rtl ? '‹' : '›', resolved.labels.next, !resolved.hasNext, false, () => onPageChange(resolved.currentPage + 1, 'next'))] });
}
//# sourceMappingURL=pagination.js.map