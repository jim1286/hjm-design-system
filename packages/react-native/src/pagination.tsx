import { resolvePaginationDescriptor, paginationRecipe as recipe, type ComposePaginationAccessibleName, type PaginationChangeHandler, type PaginationDescriptor, type PaginationLabels } from '@hjmds/design-contracts/components/pagination';
import { resolveColorReference } from '@hjmds/design-contracts/color-references';
import { Pressable, View } from 'react-native';
import { Text } from './primitives.js';
import { useHjmNativeTheme } from './provider.js';
import type { HjmCompositionStyleProp } from './composition-style.js';

export type PaginationProps = Readonly<{
  label: string;
  descriptor: PaginationDescriptor;
  labels: PaginationLabels;
  composeAccessibleName: ComposePaginationAccessibleName;
  onPageChange: PaginationChangeHandler;
  disabled?: boolean;
  testID?: string;
  layoutStyle?: HjmCompositionStyleProp;
}>;

/** Bounded Native archives need the same page window and validation as Web; feeds still use LoadMore. */
export function Pagination({ label, descriptor, labels, composeAccessibleName, onPageChange, disabled = false, testID, layoutStyle }: PaginationProps) {
  const theme = useHjmNativeTheme();
  if (!label.trim()) throw new TypeError('Pagination label must not be empty');
  const resolved = resolvePaginationDescriptor(descriptor, { labels, composeAccessibleName });
  const rtl = theme.environment.direction === 'rtl';
  const button = (key: string | number, text: string, accessibleName: string, unavailable: boolean, current: boolean, onPress: () => void) => (
    <Pressable key={key} accessibilityRole="button" accessibilityLabel={accessibleName}
      accessibilityState={{ disabled: disabled || unavailable, selected: current }} disabled={disabled || unavailable}
      onPress={() => { if (!disabled && !unavailable && !current) onPress(); }}
      style={({ pressed }) => ({ minWidth: recipe.item.minSize, minHeight: recipe.item.minSize,
        paddingHorizontal: theme.tokens.spacing.xs, alignItems: 'center', justifyContent: 'center',
        borderRadius: theme.tokens.radius[recipe.item.radius], borderWidth: 1,
        borderColor: current ? resolveColorReference(recipe.item.border.current, theme.palette) : 'transparent',
        backgroundColor: pressed ? resolveColorReference(recipe.item.background.hover, theme.palette) : 'transparent',
        opacity: disabled || unavailable ? recipe.states.disabledOpacity : 1 })}>
      <Text accessible={false} style={{ color: resolveColorReference(recipe.item.color[current ? 'current' : 'default'], theme.palette) }}>{text}</Text>
    </Pressable>
  );
  return <View accessibilityLabel={label} testID={testID} style={[{ flexDirection: rtl ? 'row-reverse' : 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: recipe.gap }, layoutStyle]}>
    {button('previous', rtl ? '›' : '‹', resolved.labels.previous, !resolved.hasPrevious, false, () => onPageChange(resolved.currentPage - 1, 'previous'))}
    {resolved.items.map((item, index) => item.type === 'ellipsis'
      ? <Text key={`ellipsis-${index}`} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" tone="muted">…</Text>
      : button(item.page, String(item.page), item.accessibleName, false, item.current, () => onPageChange(item.page, 'page')))}
    {button('next', rtl ? '‹' : '›', resolved.labels.next, !resolved.hasNext, false, () => onPageChange(resolved.currentPage + 1, 'next'))}
  </View>;
}
