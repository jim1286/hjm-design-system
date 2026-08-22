import { withAlpha } from "@hjm/design-contracts/colors";
import { layout, radius, spacing } from "@hjm/design-contracts/foundations";
import {
  resolveDescriptionListColumnCount,
  resolveDescriptionListDescriptor,
  type DescriptionListDescriptor,
} from "@hjm/design-contracts/components/description-list";
import {
  resolveStatisticDescriptor,
  validateStatisticGroup,
  type StatisticDescriptor,
  type StatisticGroupDescriptor,
  type StatisticTrendTone,
} from "@hjm/design-contracts/components/statistic";
import {
  resolveTagDescriptor,
  resolveTagPresentation,
  tagRecipe,
  type TagTone as ContractTagTone,
} from "@hjm/design-contracts/components/tag";
import { cardRecipe } from "@hjm/design-contracts/components/card";
import { surfaceGeometry } from "@hjm/design-contracts/recipes/base";
import {
  counterBadgeRecipe,
  formatCounterBadgeCount,
  type CounterBadgeSize,
  type CounterBadgeTone,
  type CounterBadgeVariant,
  type StatisticDensity,
  type StatisticPresentation,
} from "@hjm/design-contracts/recipes";
import { Children, isValidElement, useState, type ReactNode } from "react";
import {
  Image as NativeImage,
  Pressable,
  View,
  useWindowDimensions,
  type ImageProps as NativeImageProps,
  type ImageSourcePropType,
  type ImageStyle,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useControllableState } from "./internal/state.js";
import { minimumTargetStyle } from "./internal/styles.js";
import {
  Surface,
  Text,
  type SurfacePadding,
  type SurfaceProps,
} from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

function resolveStatusTone(
  tone: StatusTone,
  theme: ReturnType<typeof useHjmNativeTheme>,
): Readonly<{ foreground: string; background: string }> {
  if (tone === "neutral") {
    return { foreground: theme.colors.textMuted, background: theme.colors.surfaceAlt };
  }
  if (tone === "danger") {
    return {
      foreground: theme.colors.danger,
      background: withAlpha(theme.colors.danger, 0.1),
    };
  }
  const foreground = theme.palette.statusAccents[tone];
  return { foreground, background: withAlpha(foreground, 0.1) };
}

export type BadgeProps = Readonly<{
  label: string;
  tone?: StatusTone;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}>;

export function Badge({ label, tone = "neutral", accessibilityLabel, style }: BadgeProps) {
  const theme = useHjmNativeTheme();
  const presentation = resolveStatusTone(tone, theme);
  return (
    <View
      accessibilityLabel={accessibilityLabel ?? label}
      style={[
        {
          alignSelf: "flex-start",
          backgroundColor: presentation.background,
          borderRadius: radius.full,
          paddingHorizontal: spacing.xs,
          paddingVertical: spacing.xxs,
        },
        style,
      ]}
    >
      <Text align="center" style={{ color: presentation.foreground }} variant="caption">{label}</Text>
    </View>
  );
}

export type TagTone = ContractTagTone;
export type TagProps = Readonly<{
  children?: string;
  /** @deprecated Prefer renderer-neutral `children`. */
  label?: string;
  tone?: TagTone;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}>;

export function Tag({
  children,
  label,
  tone,
  accessibilityLabel,
  style,
}: TagProps) {
  const theme = useHjmNativeTheme();
  const resolvedLabel = children ?? label;
  if (resolvedLabel === undefined) {
    throw new TypeError("Tag requires children (or the deprecated label prop)");
  }
  const descriptor = resolveTagDescriptor({
    label: resolvedLabel,
    ...(tone === undefined ? {} : { tone }),
  });
  const presentation = resolveTagPresentation(descriptor.tone, theme.palette);
  return (
    <View
      accessibilityLabel={accessibilityLabel ?? descriptor.label}
      style={[
        {
          alignItems: "center",
          alignSelf: "flex-start",
          backgroundColor: presentation.background,
          borderColor: presentation.border ?? "transparent",
          borderRadius: radius[tagRecipe.radius],
          borderWidth: tagRecipe.borderWidth,
          flexDirection: "row",
          gap: tagRecipe.size.gap,
          minHeight: tagRecipe.size.minHeight,
          paddingHorizontal: tagRecipe.size.paddingHorizontal,
        },
        style,
      ]}
    >
      <Text
        align="center"
        emphasis="medium"
        style={{ color: presentation.content }}
        variant={tagRecipe.size.textVariant}
      >
        {descriptor.label}
      </Text>
    </View>
  );
}

export type CardProps = Omit<SurfaceProps, "children" | "padding"> &
  Readonly<{
    children?: ReactNode;
    title?: ReactNode;
    description?: ReactNode;
    media?: ReactNode;
    actions?: ReactNode;
    selected?: boolean;
    padding?: SurfacePadding;
  }>;

export function Card({
  children,
  title,
  description,
  media,
  actions,
  selected = cardRecipe.defaults.selected,
  tone = cardRecipe.defaults.tone,
  bordered = cardRecipe.defaults.bordered,
  padding = cardRecipe.defaults.padding,
  style,
  ...props
}: CardProps) {
  const bodyPadding =
    typeof padding === "number" ? padding : surfaceGeometry.paddings[padding];
  return (
    <Surface
      {...props}
      bordered={bordered}
      padding="none"
      style={[{ overflow: "hidden" }, style]}
      tone={selected ? cardRecipe.selectedTone : tone}
    >
      {media === undefined ? null : <View>{media}</View>}
      <View style={{ gap: cardRecipe.body.gap, padding: bodyPadding }}>
        {title === undefined ? null : (
          <Text accessibilityRole="header" emphasis="strong" tone="primary" variant="title">
            {title}
          </Text>
        )}
        {description === undefined ? null : (
          <Text emphasis="regular" tone="muted" variant="body">
            {description}
          </Text>
        )}
        <View>{children}</View>
      </View>
      {actions === undefined ? null : (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: cardRecipe.actions.gap,
            paddingBottom: cardRecipe.actions.paddingBottom,
            paddingHorizontal: cardRecipe.actions.paddingHorizontal,
          }}
        >
          {actions}
        </View>
      )}
    </Surface>
  );
}

export type ListRowProps = Omit<
  PressableProps,
  "accessibilityLabel" | "accessibilityRole" | "children" | "disabled" | "style"
> &
  Readonly<{
    title: string;
    description?: string;
    leading?: ReactNode;
    trailing?: ReactNode;
    onPress?: PressableProps["onPress"];
    accessibilityLabel?: string;
    accessibilityHint?: string;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
  }>;

export function ListRow({
  title,
  description,
  leading,
  trailing,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  style,
  ...props
}: ListRowProps) {
  const { colors } = useHjmNativeTheme();
  const interactive = onPress !== undefined;
  return (
    <Pressable
      {...props}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={
        interactive ? accessibilityLabel ?? [title, description].filter(Boolean).join(", ") : undefined
      }
      accessibilityRole={interactive ? "button" : undefined}
      accessibilityState={interactive ? { disabled } : undefined}
      disabled={!interactive || disabled}
      onPress={onPress}
      style={({ pressed }) => [
        minimumTargetStyle,
        {
          alignItems: "center",
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
          flexDirection: "row",
          gap: spacing.sm,
          minHeight: description ? layout.rowHeight.twoLine : layout.rowHeight.singleLine,
          opacity: disabled ? 0.5 : pressed ? 0.86 : 1,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        },
        style,
      ]}
    >
      {leading ? <View accessible={false}>{leading}</View> : null}
      <View style={{ flex: 1, gap: spacing.xxs }}>
        <Text tone="primary" variant="bodyLarge">{title}</Text>
        {description ? <Text tone="muted" variant="caption">{description}</Text> : null}
      </View>
      {trailing ? <View accessible={false}>{trailing}</View> : null}
    </Pressable>
  );
}

type AccessibleMedia =
  | Readonly<{ decorative: true; accessibilityLabel?: never }>
  | Readonly<{ decorative?: false; accessibilityLabel: string }>;

type AvatarBaseProps = Readonly<{
  source?: ImageSourcePropType;
  name: string;
  initials?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}>;

export type AvatarProps = AvatarBaseProps & AccessibleMedia;

function resolveInitials(name: string, provided: string | undefined): string {
  if (provided?.trim()) return provided.trim().slice(0, 3).toLocaleUpperCase();
  const parts = name.trim().split(/\s+/u).filter(Boolean);
  if (parts.length === 0) throw new TypeError("Avatar name must not be empty");
  return `${parts[0]![0] ?? ""}${parts.length > 1 ? parts.at(-1)![0] ?? "" : ""}`
    .toLocaleUpperCase();
}

export function Avatar({
  source,
  name,
  initials,
  size = 44,
  decorative = false,
  accessibilityLabel,
  style,
  imageStyle,
}: AvatarProps) {
  if (!Number.isFinite(size) || size < 24) throw new RangeError("Avatar size must be at least 24");
  const { colors } = useHjmNativeTheme();
  const [failed, setFailed] = useState(false);
  const fallback = resolveInitials(name, initials);
  const mediaAccessibility = decorative
    ? { accessible: false as const }
    : { accessible: true as const, accessibilityLabel, accessibilityRole: "image" as const };
  return (
    <View
      {...mediaAccessibility}
      style={[
        {
          alignItems: "center",
          backgroundColor: colors.surfaceAccent,
          borderRadius: radius.full,
          height: size,
          justifyContent: "center",
          overflow: "hidden",
          width: size,
        },
        style,
      ]}
    >
      {source !== undefined && !failed ? (
        <NativeImage
          accessible={false}
          onError={() => setFailed(true)}
          source={source}
          style={[{ height: size, width: size }, imageStyle]}
        />
      ) : (
        <Text align="center" style={{ color: colors.contentBrand }} variant="label">{fallback}</Text>
      )}
    </View>
  );
}

export type DividerProps = Readonly<{
  orientation?: "horizontal" | "vertical";
  inset?: number;
  style?: StyleProp<ViewStyle>;
}>;

export function Divider({ orientation = "horizontal", inset = 0, style }: DividerProps) {
  if (!Number.isFinite(inset) || inset < 0) throw new RangeError("Divider inset must be non-negative");
  const { colors } = useHjmNativeTheme();
  return (
    <View
      accessible={false}
      style={[
        orientation === "horizontal"
          ? { backgroundColor: colors.border, height: 1, marginHorizontal: inset, width: "auto" }
          : { alignSelf: "stretch", backgroundColor: colors.border, marginVertical: inset, width: 1 },
        style,
      ]}
    />
  );
}

export type AccordionItem<Value extends string = string> = Readonly<{
  value: Value;
  title: string;
  description?: string;
  content: ReactNode;
  disabled?: boolean;
  accessibilityHint?: string;
  /** Optional localized name for the expanded content region. */
  contentAccessibilityLabel?: string;
}>;

export type AccordionProps<Value extends string = string> = Readonly<{
  label: string;
  items: readonly AccordionItem<Value>[];
  expandedValues?: readonly Value[];
  defaultExpandedValues?: readonly Value[];
  onExpandedValuesChange?: (values: readonly Value[]) => void;
  multiple?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

export function Accordion<Value extends string = string>({
  label,
  items,
  expandedValues,
  defaultExpandedValues = [],
  onExpandedValuesChange,
  multiple = false,
  style,
}: AccordionProps<Value>) {
  if (items.length === 0) throw new Error("Accordion requires at least one item");
  const itemValues = new Set(items.map((item) => item.value));
  if (itemValues.size !== items.length) throw new TypeError("Accordion values must be unique");
  const initial = expandedValues ?? defaultExpandedValues;
  if (initial.some((value) => !itemValues.has(value))) {
    throw new RangeError("Accordion expanded values must match items");
  }
  if (!multiple && initial.length > 1) {
    throw new RangeError("Accordion only accepts one expanded value unless multiple is true");
  }
  const { colors, environment } = useHjmNativeTheme();
  const [expanded, setExpanded] = useControllableState<readonly Value[]>({
    ...(expandedValues === undefined ? {} : { value: expandedValues }),
    defaultValue: defaultExpandedValues,
    ...(onExpandedValuesChange === undefined ? {} : { onChange: onExpandedValuesChange }),
  });

  return (
    <View accessibilityLabel={label} accessibilityRole="list" style={[{ gap: spacing.xxs }, style]}>
      {items.map((item) => {
        const isExpanded = expanded.includes(item.value);
        return (
          <View key={item.value} style={{ borderBottomColor: colors.border, borderBottomWidth: 1 }}>
            <Pressable
              accessibilityHint={item.accessibilityHint}
              accessibilityLabel={item.title}
              accessibilityRole="button"
              accessibilityState={{ disabled: item.disabled === true, expanded: isExpanded }}
              disabled={item.disabled}
              onPress={() => {
                if (isExpanded) {
                  setExpanded(expanded.filter((value) => value !== item.value));
                } else {
                  setExpanded(multiple ? [...expanded, item.value] : [item.value]);
                }
              }}
              style={({ pressed }) => [
                minimumTargetStyle,
                {
                  alignItems: "center",
                  flexDirection: environment.direction === "rtl" ? "row-reverse" : "row",
                  gap: spacing.sm,
                  opacity: item.disabled ? 0.5 : pressed ? 0.86 : 1,
                  paddingVertical: spacing.sm,
                },
              ]}
            >
              <View style={{ flex: 1, gap: spacing.xxs }}>
                <Text tone="primary" variant="bodyLarge">{item.title}</Text>
                {item.description ? <Text tone="muted" variant="caption">{item.description}</Text> : null}
              </View>
              <Text accessible={false} tone="muted">{isExpanded ? "−" : "+"}</Text>
            </Pressable>
            {isExpanded ? (
              <View
                accessibilityLabel={item.contentAccessibilityLabel}
                style={{ paddingBottom: spacing.md }}
              >
                {item.content}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export type DescriptionListProps<Id extends string = string> = Readonly<{
  label: string;
  descriptor: DescriptionListDescriptor<Id>;
  availableWidth?: number;
  style?: StyleProp<ViewStyle>;
  itemStyle?: StyleProp<ViewStyle>;
}>;

export function DescriptionList<Id extends string = string>({
  label,
  descriptor,
  availableWidth,
  style,
  itemStyle,
}: DescriptionListProps<Id>) {
  const resolved = resolveDescriptionListDescriptor(descriptor);
  const { width } = useWindowDimensions();
  const { environment } = useHjmNativeTheme();
  const innerWidth = availableWidth ?? width;
  if (!Number.isFinite(innerWidth) || innerWidth <= 0) {
    throw new RangeError("DescriptionList availableWidth must be positive");
  }
  const columns = resolveDescriptionListColumnCount(
    innerWidth,
    resolved.columns,
    environment.textScale,
  );
  const itemWidth = (innerWidth - spacing.sm * (columns - 1)) / columns;
  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="list"
      style={[
        {
          flexDirection: environment.direction === "rtl" ? "row-reverse" : "row",
          flexWrap: "wrap",
          gap: spacing.sm,
        },
        style,
      ]}
    >
      {resolved.items.map((item) => (
        <View
          key={item.id}
          accessibilityLabel={`${item.label}, ${item.value}`}
          accessible
          style={[{ gap: spacing.xxs, width: itemWidth }, itemStyle]}
        >
          <Text accessible={false} tone="muted" variant="label">{item.label}</Text>
          <Text accessible={false} tone="primary">{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

type ImageBaseProps = Omit<
  NativeImageProps,
  "accessibilityLabel" | "accessibilityRole" | "accessible" | "onError" | "source" | "style"
> &
  Readonly<{
    source: ImageSourcePropType;
    fallback?: ReactNode;
    onError?: NativeImageProps["onError"];
    style?: StyleProp<ImageStyle>;
    containerStyle?: StyleProp<ViewStyle>;
  }>;

export type ImageProps = ImageBaseProps & AccessibleMedia;

/** Native image with an explicit decorative/label contract and error fallback. */
export function Image({
  source,
  fallback,
  decorative = false,
  accessibilityLabel,
  onError,
  style,
  containerStyle,
  ...props
}: ImageProps) {
  const { colors } = useHjmNativeTheme();
  const [failed, setFailed] = useState(false);
  if (failed && fallback) {
    return (
      <View
        {...(decorative
          ? { accessible: false as const }
          : { accessible: true as const, accessibilityLabel, accessibilityRole: "image" as const })}
        style={[{ alignItems: "center", backgroundColor: colors.surfaceAlt, justifyContent: "center" }, containerStyle]}
      >
        {fallback}
      </View>
    );
  }
  return (
    <NativeImage
      {...props}
      {...(decorative
        ? { accessible: false as const }
        : { accessible: true as const, accessibilityLabel, accessibilityRole: "image" as const })}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
      source={source}
      style={style}
    />
  );
}

export type CounterBadgeProps = Readonly<{
  count: number;
  accessibilityLabel: string;
  max?: number;
  tone?: CounterBadgeTone;
  size?: CounterBadgeSize;
  variant?: CounterBadgeVariant;
  style?: StyleProp<ViewStyle>;
}>;

export function CounterBadge({
  count,
  accessibilityLabel,
  max = counterBadgeRecipe.defaults.max,
  tone = counterBadgeRecipe.defaults.tone,
  size = counterBadgeRecipe.defaults.size,
  variant = counterBadgeRecipe.defaults.variant,
  style,
}: CounterBadgeProps) {
  if (!accessibilityLabel.trim()) throw new TypeError("CounterBadge accessibilityLabel must not be empty");
  const visibleLabel = formatCounterBadgeCount(count, max);
  if (visibleLabel === null) return null;
  const { colors } = useHjmNativeTheme();
  const presentation = {
    danger: { background: colors.dangerFill, content: colors.onDanger },
    brand: { background: colors.primary, content: colors.onPrimary },
    neutral: { background: colors.textBody, content: colors.bg },
  } as const;
  const metrics = counterBadgeRecipe.sizes[size];
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
      accessible
      style={[
        {
          alignItems: "center",
          alignSelf: "flex-start",
          backgroundColor: presentation[tone].background,
          borderColor: variant === "floating" ? colors.bg : "transparent",
          borderRadius: radius.full,
          borderWidth: variant === "floating" ? 2 : 0,
          justifyContent: "center",
          minHeight: metrics.height,
          minWidth: metrics.minWidth,
          paddingHorizontal: metrics.paddingHorizontal,
        },
        style,
      ]}
    >
      <Text accessible={false} align="center" style={{ color: presentation[tone].content, fontWeight: "700" }} variant="caption">
        {visibleLabel}
      </Text>
    </View>
  );
}

export type ListProps = Readonly<{
  label: string;
  children: ReactNode;
  separator?: "none" | "full" | "indented";
  style?: StyleProp<ViewStyle>;
}>;

/** Semantic list container that owns separator rhythm around composed rows. */
export function List({
  label,
  children,
  separator = "indented",
  style,
}: ListProps) {
  const { colors, environment } = useHjmNativeTheme();
  const items = Children.toArray(children);
  const inset = separator === "indented" ? 52 : 0;
  return (
    <View accessibilityLabel={label} accessibilityRole="list" style={style}>
      {items.map((item, index) => (
        <View key={isValidElement(item) && item.key !== null ? item.key : `hjm-list-${index}`}>
          {item}
          {separator !== "none" && index < items.length - 1 ? (
            <View
              accessible={false}
              style={{
                backgroundColor: colors.border,
                height: 1,
                marginEnd: 0,
                marginStart: environment.direction === "rtl" && separator === "indented" ? 0 : inset,
                ...(environment.direction === "rtl" && separator === "indented" ? { marginEnd: inset } : {}),
              }}
            />
          ) : null}
        </View>
      ))}
    </View>
  );
}

export type StatisticProps<Id extends string = string> = Readonly<{
  descriptor: StatisticDescriptor<Id>;
  density?: StatisticDensity;
  presentation?: StatisticPresentation;
  style?: StyleProp<ViewStyle>;
}>;

function statisticTrendColor(tone: StatisticTrendTone, theme: ReturnType<typeof useHjmNativeTheme>) {
  if (tone === "success") return theme.palette.statusAccents.success;
  if (tone === "warning") return theme.palette.statusAccents.warning;
  if (tone === "danger") return theme.colors.danger;
  return theme.colors.textMuted;
}

export function Statistic<Id extends string = string>({
  descriptor,
  density = "comfortable",
  presentation = "plain",
  style,
}: StatisticProps<Id>) {
  const resolved = resolveStatisticDescriptor(descriptor);
  const theme = useHjmNativeTheme();
  const compact = density === "compact";
  const valueCopy = `${resolved.prefix ?? ""}${resolved.value}${resolved.suffix ?? ""}`;
  const announcement = [resolved.label, valueCopy, resolved.trend?.label, resolved.hint]
    .filter(Boolean)
    .join(", ");
  const trendMark = resolved.trend?.direction === "up" ? "↑" : resolved.trend?.direction === "down" ? "↓" : "—";
  return (
    <View
      accessibilityLabel={announcement}
      accessible
      style={[
        {
          backgroundColor: presentation === "surface" ? theme.colors.surface : "transparent",
          borderColor: presentation === "surface" ? theme.colors.border : "transparent",
          borderRadius: radius.md,
          borderWidth: presentation === "surface" ? 1 : 0,
          gap: compact ? spacing.xxs : spacing.xs,
          padding: compact ? spacing.sm : spacing.md,
        },
        style,
      ]}
    >
      <Text accessible={false} tone="muted" variant={compact ? "caption" : "label"}>{resolved.label}</Text>
      <View accessible={false} style={{ alignItems: "baseline", flexDirection: theme.environment.direction === "rtl" ? "row-reverse" : "row", gap: spacing.xxs }}>
        {resolved.prefix ? <Text tone="muted">{resolved.prefix}</Text> : null}
        <Text tone="primary" variant={compact ? "title" : "heading"}>{resolved.value}</Text>
        {resolved.suffix ? <Text tone="muted">{resolved.suffix}</Text> : null}
      </View>
      {resolved.trend ? (
        <Text accessible={false} style={{ color: statisticTrendColor(resolved.trend.tone, theme) }} variant="caption">
          {trendMark} {resolved.trend.label}
        </Text>
      ) : null}
      {resolved.hint ? <Text accessible={false} tone="muted" variant="caption">{resolved.hint}</Text> : null}
    </View>
  );
}

export type StatisticGroupProps<Id extends string = string> = Readonly<{
  label: string;
  descriptor: StatisticGroupDescriptor<Id>;
  availableWidth?: number;
  density?: StatisticDensity;
  presentation?: StatisticPresentation;
  style?: StyleProp<ViewStyle>;
}>;

export function StatisticGroup<Id extends string = string>({
  label,
  descriptor,
  availableWidth,
  density,
  presentation,
  style,
}: StatisticGroupProps<Id>) {
  validateStatisticGroup(descriptor);
  const { width } = useWindowDimensions();
  const { environment } = useHjmNativeTheme();
  const innerWidth = availableWidth ?? width;
  if (!Number.isFinite(innerWidth) || innerWidth <= 0) {
    throw new RangeError("StatisticGroup availableWidth must be positive");
  }
  const requested = descriptor.columns ?? 3;
  const minItemWidth = 120 * Math.max(1, environment.textScale);
  let columns = requested;
  while (columns > 1 && (innerWidth - spacing.xs * (columns - 1)) / columns < minItemWidth) {
    columns -= 1;
  }
  const itemWidth = (innerWidth - spacing.xs * (columns - 1)) / columns;
  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="list"
      style={[
        {
          flexDirection: environment.direction === "rtl" ? "row-reverse" : "row",
          flexWrap: "wrap",
          gap: spacing.xs,
        },
        style,
      ]}
    >
      {descriptor.items.map((item) => (
        <Statistic
          key={item.id}
          descriptor={item}
          {...(density === undefined ? {} : { density })}
          {...(presentation === undefined ? {} : { presentation })}
          style={{ width: itemWidth }}
        />
      ))}
    </View>
  );
}
