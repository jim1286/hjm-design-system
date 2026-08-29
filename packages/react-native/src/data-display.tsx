import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { glyph, radius, spacing } from "@hjmds/design-contracts/foundations";
import {
  resolveDescriptionListColumnCount,
  resolveDescriptionListDescriptor,
  type DescriptionListDescriptor,
} from "@hjmds/design-contracts/components/description-list";
import {
  resolveStatisticDescriptor,
  validateStatisticGroup,
  type ResolvedStatisticDescriptor,
  type StatisticDescriptor,
  type StatisticGroupDescriptor,
} from "@hjmds/design-contracts/components/statistic";
import {
  resolveTagDescriptor,
  resolveTagPresentation,
  tagRecipe,
  type TagTone as ContractTagTone,
} from "@hjmds/design-contracts/components/tag";
import { cardRecipe } from "@hjmds/design-contracts/components/card";
import {
  imageRecipe,
  nativeResizeModes,
  resolveImageAspectRatio,
  resolveImageDescriptor,
  resolveImageFallbackAccessibilityLabel,
  type ImageDescriptor,
  type ImageFit,
  type ImageLoadStatus,
  type ResolvedImageDescriptor,
} from "@hjmds/design-contracts/components/image";
import {
  resolveTimelineDescriptor,
  timelineRecipe,
  type ComposeTimelineAccessibleName,
  type TimelineItemDescriptor,
} from "@hjmds/design-contracts/components/timeline";
import { surfaceGeometry } from "@hjmds/design-contracts/recipes/base";
import {
  accordionRecipe,
  counterBadgeRecipe,
  badgeRecipe,
  listRecipe,
  formatCounterBadgeCount,
  listRowRecipe,
  statisticRecipe,
  type AccordionDensity,
  type BadgeSize,
  type BadgeTone,
  type BadgeVariant as ContractBadgeVariant,
  type CounterBadgeSize,
  type CounterBadgeTone,
  type CounterBadgeVariant,
  type ListRowDensity,
  type StatisticDensity,
  type StatisticPresentation,
} from "@hjmds/design-contracts/recipes";
import {
  Children,
  isValidElement,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Image as NativeImage,
  LayoutAnimation,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type ImageProps as NativeImageProps,
  type ImageSourcePropType,
  type ImageStyle,
  type LayoutChangeEvent,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewProps,
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

export type StatusTone = BadgeTone;
export type BadgeVariant = ContractBadgeVariant;

export type BadgeProps = Omit<
  ViewProps,
  "accessibilityLabel" | "accessible" | "children" | "style"
> & Readonly<{
  label: string | number;
  tone?: StatusTone;
  size?: BadgeSize;
  variant?: BadgeVariant;
  leading?: ReactNode;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}>;

export function Badge({
  label,
  tone = badgeRecipe.defaults.tone,
  size = badgeRecipe.defaults.size,
  variant = badgeRecipe.defaults.variant,
  leading,
  accessibilityLabel,
  style,
  labelStyle,
  ...props
}: BadgeProps) {
  const theme = useHjmNativeTheme();
  const presentation = badgeRecipe.tones[tone];
  const metrics = badgeRecipe.sizes[size];
  const variantPresentation = badgeRecipe.variants[variant];
  const outlined = !variantPresentation.usesToneBackground;
  const borderColor = presentation.border
    ? resolveColorReference(presentation.border, theme.palette)
    : variantPresentation.borderFallback === null
      ? "transparent"
      : resolveColorReference(variantPresentation.borderFallback, theme.palette);
  return (
    <View
      {...props}
      accessibilityLabel={accessibilityLabel ?? String(label)}
      accessible
      style={[
        {
          alignSelf: "flex-start",
          alignItems: "center",
          backgroundColor: outlined
            ? "transparent"
            : resolveColorReference(presentation.background, theme.palette),
          borderColor,
          borderRadius: radius[badgeRecipe.radius],
          borderWidth: presentation.border || variantPresentation.borderFallback
            ? badgeRecipe.borderWidth
            : 0,
          direction: theme.environment.direction,
          flexDirection: "row",
          gap: metrics.gap,
          justifyContent: "center",
          minHeight: metrics.minHeight,
          paddingHorizontal: metrics.paddingHorizontal,
        },
        style,
      ]}
    >
      {leading === undefined ? null : (
        <View
          accessibilityElementsHidden
          accessible={false}
          importantForAccessibility="no-hide-descendants"
        >
          {leading}
        </View>
      )}
      <Text
        accessible={false}
        align="center"
        emphasis="strong"
        style={[
          {
            color: resolveColorReference(
              outlined ? presentation.outlineContent : presentation.content,
              theme.palette,
            ),
          },
          labelStyle,
        ]}
        variant={metrics.textVariant}
      >
        {label}
      </Text>
    </View>
  );
}

export type TagTone = ContractTagTone;
export type TagProps = Omit<
  ViewProps,
  "accessibilityLabel" | "accessible" | "children" | "style"
> & Readonly<{
  children?: string;
  /** @deprecated Prefer renderer-neutral `children`. */
  label?: string;
  tone?: TagTone;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}>;

export function Tag({
  children,
  label,
  tone,
  accessibilityLabel,
  style,
  labelStyle,
  ...props
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
      {...props}
      accessibilityLabel={accessibilityLabel ?? descriptor.label}
      accessible
      style={[
        {
          alignItems: "center",
          alignSelf: "flex-start",
          backgroundColor: presentation.background,
          borderColor: presentation.border ?? "transparent",
          borderRadius: radius[tagRecipe.radius],
          borderWidth: tagRecipe.borderWidth,
          direction: theme.environment.direction,
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
        style={[{ color: presentation.content }, labelStyle]}
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
    leading?: ReactNode;
    media?: ReactNode;
    actions?: ReactNode;
    selected?: boolean;
    padding?: SurfacePadding;
  }>;

export function Card({
  children,
  title,
  description,
  leading,
  media,
  actions,
  selected = cardRecipe.defaults.selected,
  tone = cardRecipe.defaults.tone,
  bordered = cardRecipe.defaults.bordered,
  padding = cardRecipe.defaults.padding,
  style,
  ...props
}: CardProps) {
  const { environment } = useHjmNativeTheme();
  const bodyPadding =
    typeof padding === "number" ? padding : surfaceGeometry.paddings[padding];
  const hasHeader =
    leading !== undefined || title !== undefined || description !== undefined;
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
        {hasHeader ? (
          <View
            style={{
              alignItems: "flex-start",
              direction: environment.direction,
              flexDirection: "row",
              gap: cardRecipe.header.gap,
            }}
          >
            {leading === undefined ? null : (
              <View style={{ flexShrink: 0 }}>{leading}</View>
            )}
            <View style={{ flex: 1, gap: cardRecipe.body.gap, minWidth: 0 }}>
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
            </View>
          </View>
        ) : null}
        {children === undefined ? null : <View>{children}</View>}
      </View>
      {actions === undefined ? null : (
        <View
          style={{
            direction: environment.direction,
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
    /** Visible metadata placed beside the title, such as a Badge. */
    titleMetadata?: ReactNode;
    /** @deprecated Prefer the renderer-neutral `titleMetadata` slot. */
    badge?: ReactNode;
    /** A separate accessible target rendered beside, never inside, the row command. */
    trailingAction?: ReactNode;
    trailingText?: string;
    /** Spoken equivalent for meaningful metadata or decorative trailing content. */
    metadataLabel?: string;
    trailingLabel?: string;
    onPress?: PressableProps["onPress"];
    accessibilityLabel?: string;
    accessibilityHint?: string;
    disabled?: boolean;
    density?: ListRowDensity;
    selected?: boolean;
    style?: StyleProp<ViewStyle>;
    leadingStyle?: StyleProp<ViewStyle>;
    contentStyle?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    titleRowStyle?: StyleProp<ViewStyle>;
    descriptionStyle?: StyleProp<TextStyle>;
    trailingStyle?: StyleProp<ViewStyle>;
    trailingActionStyle?: StyleProp<ViewStyle>;
    containerProps?: Omit<ViewProps, "children" | "style">;
  }>;

export function ListRow({
  title,
  description,
  leading,
  trailing,
  titleMetadata,
  badge,
  trailingAction,
  trailingText,
  metadataLabel,
  trailingLabel,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  density = listRowRecipe.defaults.density,
  selected: selectedProp,
  style,
  leadingStyle,
  contentStyle,
  titleStyle,
  titleRowStyle,
  descriptionStyle,
  trailingStyle,
  trailingActionStyle,
  containerProps,
  accessibilityState,
  ...props
}: ListRowProps) {
  const theme = useHjmNativeTheme();
  const metrics = listRowRecipe.density[density];
  const interactive = onPress !== undefined;
  const selected = selectedProp ?? listRowRecipe.defaults.selected;
  const resolvedMetadata = titleMetadata ?? badge;
  const resolvedTrailingLabel = trailingLabel ?? trailingText;
  const composedLabel = accessibilityLabel ?? [
    title,
    metadataLabel,
    description,
    resolvedTrailingLabel,
  ].filter(Boolean).join(", ");
  const visualState = {
    backgroundColor: selected
      ? resolveColorReference(listRowRecipe.states.selectedBackground, theme.palette)
      : "transparent",
    direction: theme.environment.direction,
    minHeight: description ? metrics.twoLineMinHeight : metrics.oneLineMinHeight,
    opacity: disabled ? listRowRecipe.states.disabledOpacity : 1,
  } as const;
  const rowContent = (
    <>
      {leading ? (
        <View
          accessible={interactive ? false : undefined}
          importantForAccessibility={interactive ? "no-hide-descendants" : "auto"}
          style={leadingStyle}
        >
          {leading}
        </View>
      ) : null}
      <View style={[{ flex: 1, gap: spacing.xxs, minWidth: 0 }, contentStyle]}>
        <View
          style={[
            {
              alignItems: "center",
              direction: theme.environment.direction,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: spacing.xxs,
            },
            titleRowStyle,
          ]}
        >
          <Text
            style={[
              {
                color: resolveColorReference(listRowRecipe.title.color, theme.palette),
                flexShrink: 1,
                fontWeight: listRowRecipe.title.fontWeight,
              },
              titleStyle,
            ]}
            variant={listRowRecipe.title.textVariant}
          >
            {title}
          </Text>
          {resolvedMetadata === undefined ? null : (
            <View
              accessible={interactive ? false : undefined}
              importantForAccessibility={interactive ? "no-hide-descendants" : "auto"}
            >
              {resolvedMetadata}
            </View>
          )}
        </View>
        {description ? (
          <Text
            style={[
              { color: resolveColorReference(listRowRecipe.description.color, theme.palette) },
              descriptionStyle,
            ]}
            variant={listRowRecipe.description.textVariant}
          >
            {description}
          </Text>
        ) : null}
      </View>
      {trailingText || trailing ? (
        <View
          accessible={interactive ? false : undefined}
          importantForAccessibility={interactive ? "no-hide-descendants" : "auto"}
          style={[{ flexShrink: 0 }, trailingStyle]}
        >
          {trailingText ? (
            <Text
              style={{ color: resolveColorReference(listRowRecipe.trailing.textColor, theme.palette) }}
              variant={listRowRecipe.trailing.textVariant}
            >
              {trailingText}
            </Text>
          ) : trailing}
        </View>
      ) : null}
    </>
  );
  const contentStyleFor = (pressed: boolean): StyleProp<ViewStyle> => [
    minimumTargetStyle,
    {
      alignItems: "center",
      backgroundColor: pressed
        ? resolveColorReference(listRowRecipe.states.pressedBackground, theme.palette)
        : trailingAction
          ? "transparent"
          : visualState.backgroundColor,
      direction: visualState.direction,
      flex: trailingAction ? 1 : undefined,
      flexDirection: "row",
      gap: listRowRecipe.gap,
      minHeight: visualState.minHeight,
      opacity: trailingAction ? 1 : visualState.opacity,
      ...(trailingAction
        ? { paddingStart: metrics.paddingHorizontal }
        : { paddingHorizontal: metrics.paddingHorizontal }),
      paddingVertical: metrics.paddingVertical,
    },
    trailingAction ? undefined : style,
  ];
  const main = interactive ? (
    <Pressable
      {...props}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={composedLabel}
      accessibilityRole="button"
      accessibilityState={{
        ...accessibilityState,
        disabled,
        ...(selectedProp === undefined ? {} : { selected: selectedProp }),
      }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => contentStyleFor(pressed)}
    >
      {rowContent}
    </Pressable>
  ) : (
    <View
      {...(props as Omit<ViewProps, "children" | "style">)}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessible={accessibilityLabel === undefined ? undefined : true}
      style={contentStyleFor(false)}
    >
      {rowContent}
    </View>
  );

  if (trailingAction === undefined || trailingAction === null) return main;
  return (
    <View
      {...containerProps}
      style={[
        {
          alignItems: "center",
          backgroundColor: visualState.backgroundColor,
          direction: visualState.direction,
          flexDirection: "row",
          minHeight: visualState.minHeight,
          opacity: visualState.opacity,
        },
        style,
      ]}
    >
      {main}
      <View
        style={[
          { flexShrink: 0, paddingEnd: metrics.paddingHorizontal },
          trailingActionStyle,
        ]}
      >
        {trailingAction}
      </View>
    </View>
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
  /** Optional localized name for the disclosure trigger. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Optional localized name for the expanded content region. */
  contentAccessibilityLabel?: string;
}>;

export type AccordionIndicatorRenderProps<Value extends string = string> = Readonly<{
  value: Value;
  expanded: boolean;
  disabled: boolean;
  color: string;
  size: number;
}>;

export type AccordionProps<Value extends string = string> = Readonly<{
  label: string;
  items: readonly AccordionItem<Value>[];
  expandedValues?: readonly Value[];
  defaultExpandedValues?: readonly Value[];
  onExpandedValuesChange?: (values: readonly Value[]) => void;
  multiple?: boolean;
  density?: AccordionDensity;
  renderIndicator?: (props: AccordionIndicatorRenderProps<Value>) => ReactNode;
  style?: StyleProp<ViewStyle>;
  itemStyle?: StyleProp<ViewStyle>;
  triggerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  indicatorStyle?: StyleProp<ViewStyle>;
  panelStyle?: StyleProp<ViewStyle>;
}>;

export function Accordion<Value extends string = string>({
  label,
  items,
  expandedValues,
  defaultExpandedValues = [],
  onExpandedValuesChange,
  multiple = accordionRecipe.defaults.allowsMultipleExpanded,
  density = accordionRecipe.defaults.density,
  renderIndicator,
  style,
  itemStyle,
  triggerStyle,
  titleStyle,
  indicatorStyle,
  panelStyle,
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
  const theme = useHjmNativeTheme();
  const metrics = accordionRecipe.density[density];
  const indicatorColor = resolveColorReference(
    accordionRecipe.indicator.color,
    theme.palette,
  );
  const [expanded, setExpanded] = useControllableState<readonly Value[]>({
    ...(expandedValues === undefined ? {} : { value: expandedValues }),
    defaultValue: defaultExpandedValues,
    ...(onExpandedValuesChange === undefined ? {} : { onChange: onExpandedValuesChange }),
  });

  return (
    <View accessibilityLabel={label} accessibilityRole="list" style={style}>
      {items.map((item) => {
        const isExpanded = expanded.includes(item.value);
        return (
          <View
            key={item.value}
            style={[
              {
                borderBottomColor: resolveColorReference(
                  accordionRecipe.divider,
                  theme.palette,
                ),
                borderBottomWidth: 1,
              },
              itemStyle,
            ]}
          >
            <Pressable
              accessibilityHint={item.accessibilityHint}
              accessibilityLabel={item.accessibilityLabel ?? item.title}
              accessibilityRole="button"
              accessibilityState={{ disabled: item.disabled === true, expanded: isExpanded }}
              disabled={item.disabled}
              onPress={() => {
                if (!theme.environment.reducedMotion) {
                  LayoutAnimation.configureNext({
                    duration: accordionRecipe.transition.duration,
                    update: { type: LayoutAnimation.Types.easeInEaseOut },
                  });
                }
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
                  backgroundColor: pressed
                    ? resolveColorReference(
                        accordionRecipe.states.pressedBackground,
                        theme.palette,
                      )
                    : "transparent",
                  direction: theme.environment.direction,
                  flexDirection: "row",
                  gap: accordionRecipe.gap,
                  minHeight: metrics.triggerMinHeight,
                  opacity: item.disabled
                    ? accordionRecipe.states.disabledOpacity
                    : 1,
                  paddingHorizontal: accordionRecipe.paddingHorizontal,
                  paddingVertical: metrics.paddingVertical,
                },
                triggerStyle,
              ]}
            >
              <View style={{ flex: 1, gap: spacing.xxs }}>
                <Text
                  style={[
                    {
                      color: resolveColorReference(
                        accordionRecipe.title.color,
                        theme.palette,
                      ),
                      fontWeight: accordionRecipe.title.fontWeight,
                    },
                    titleStyle,
                  ]}
                  variant={accordionRecipe.title.textVariant}
                >
                  {item.title}
                </Text>
                {item.description ? <Text tone="muted" variant="caption">{item.description}</Text> : null}
              </View>
              <View accessible={false} style={indicatorStyle}>
                {renderIndicator ? (
                  renderIndicator({
                    value: item.value,
                    expanded: isExpanded,
                    disabled: item.disabled === true,
                    color: indicatorColor,
                    size: glyph[accordionRecipe.indicator.glyph],
                  })
                ) : (
                  <Text style={{ color: indicatorColor }}>
                    {isExpanded ? "−" : "+"}
                  </Text>
                )}
              </View>
            </Pressable>
            {isExpanded ? (
              <View
                accessibilityLabel={item.contentAccessibilityLabel}
                style={[
                  {
                    paddingBottom: accordionRecipe.panel.paddingBottom,
                    paddingStart: accordionRecipe.panel.paddingInlineStart,
                  },
                  panelStyle,
                ]}
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

export type DescriptionListProps<Id extends string = string> = Omit<
  ViewProps,
  "accessibilityLabel" | "accessibilityRole" | "children" | "style"
> & Readonly<{
  label: string;
  descriptor: DescriptionListDescriptor<Id>;
  /** Explicit inner width wins; otherwise the rendered container is measured. */
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
  onLayout,
  ...props
}: DescriptionListProps<Id>) {
  const resolved = resolveDescriptionListDescriptor(descriptor);
  const { width: windowWidth } = useWindowDimensions();
  const { environment } = useHjmNativeTheme();
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const innerWidth = availableWidth ?? measuredWidth ?? windowWidth;
  if (!Number.isFinite(innerWidth) || innerWidth <= 0) {
    throw new RangeError("DescriptionList availableWidth must be positive");
  }
  const columns = resolveDescriptionListColumnCount(
    innerWidth,
    resolved.columns,
    environment.textScale,
  );
  const itemWidth = (innerWidth - spacing.sm * (columns - 1)) / columns;
  const handleLayout = (event: LayoutChangeEvent) => {
    onLayout?.(event);
    if (availableWidth !== undefined) return;
    const nextWidth = event.nativeEvent.layout.width;
    if (Number.isFinite(nextWidth) && nextWidth > 0) {
      setMeasuredWidth((current) => current === nextWidth ? current : nextWidth);
    }
  };
  return (
    <View
      {...props}
      accessibilityLabel={label}
      accessibilityRole="list"
      onLayout={handleLayout}
      style={[
        {
          direction: environment.direction,
          flexDirection: "row",
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

type ImageNativeProps = Omit<
  NativeImageProps,
  | "accessibilityElementsHidden"
  | "accessibilityLabel"
  | "accessibilityRole"
  | "accessible"
  | "alt"
  | "aria-hidden"
  | "aria-label"
  | "height"
  | "importantForAccessibility"
  | "onError"
  | "onLoad"
  | "resizeMode"
  | "role"
  | "source"
  | "src"
  | "srcSet"
  | "style"
  | "width"
>;

type ImageAdapterBaseProps = Readonly<{
  source: ImageSourcePropType;
  accessible: boolean;
  accessibilityRole?: "image";
  accessibilityLabel?: string;
  onError: NonNullable<NativeImageProps["onError"]>;
  onLoad: NonNullable<NativeImageProps["onLoad"]>;
  /** Event-shape-neutral callbacks for expo-image and other transports. */
  reportError: (event?: unknown) => void;
  reportLoad: (event?: unknown) => void;
  resizeMode?: NativeImageProps["resizeMode"];
  status: Extract<ImageLoadStatus, "loading" | "loaded">;
  style?: StyleProp<ImageStyle>;
  nativeProps: ImageNativeProps &
    Readonly<{
      height?: number;
      resizeMode?: NativeImageProps["resizeMode"];
      width?: number;
    }>;
}>;

/** Canonical props handed to an optimized image host such as `expo-image`. */
export type CanonicalImageRenderProps = ImageAdapterBaseProps &
  Readonly<{
    descriptor: ResolvedImageDescriptor;
    src: string;
    width: number;
    height: number;
    fit: ImageFit;
    legacySource: false;
  }>;

/** @deprecated Migrate the caller to canonical `src`/`width`/`height` props. */
export type LegacyImageRenderProps = ImageAdapterBaseProps &
  Readonly<{
    descriptor?: never;
    src?: never;
    width?: number;
    height?: number;
    fit?: ImageFit;
    legacySource: true;
  }>;

export type ImageRenderProps = CanonicalImageRenderProps | LegacyImageRenderProps;

export type ImageSourceAdapter = (
  descriptor: ResolvedImageDescriptor,
) => ImageSourcePropType;

type ImageSharedProps = ImageNativeProps &
  Readonly<{
    /** Visual content only; HJM retains the image's accessible name. */
    fallback?: ReactNode;
    onError?: NativeImageProps["onError"];
    onLoad?: NativeImageProps["onLoad"];
    onLoadStatusChange?: (
      status: Extract<ImageLoadStatus, "loaded" | "error">,
    ) => void;
    resizeMode?: NativeImageProps["resizeMode"];
    /** Image-host style. `containerStyle` owns the reserved root frame. */
    style?: StyleProp<ImageStyle>;
    containerStyle?: StyleProp<ViewStyle>;
  }>;

type CanonicalImageProps = ImageSharedProps &
  ImageDescriptor &
  Readonly<{
    source?: never;
    /** Convert the canonical URL to a React Native source (headers/cache included). */
    sourceAdapter?: ImageSourceAdapter;
    renderImage?: (props: CanonicalImageRenderProps) => ReactNode;
  }>;

type LegacyImageProps = ImageSharedProps &
  AccessibleMedia &
  Readonly<{
    /** @deprecated Use canonical `src`, `width`, `height`, and optional `fit`. */
    source: ImageSourcePropType;
    src?: never;
    /** @deprecated Used only by the legacy Native source path. */
    width?: number;
    /** @deprecated Used only by the legacy Native source path. */
    height?: number;
    fit?: ImageFit;
    sourceAdapter?: never;
    /** @deprecated Migrate the host adapter to canonical Image props. */
    renderImage?: (props: LegacyImageRenderProps) => ReactNode;
  }>;

export type ImageProps = CanonicalImageProps | LegacyImageProps;

type ImageState = Readonly<{
  sourceKey: string;
  status: Extract<ImageLoadStatus, "loading" | "loaded" | "error">;
}>;

function resolveLegacyImageSourceKey(source: ImageSourcePropType): string {
  if (typeof source === "number") return `asset:${source}`;
  try {
    return `source:${JSON.stringify(source)}`;
  } catch {
    return `source:${String(source)}`;
  }
}

function resolveLegacyMedia(
  decorative: boolean | undefined,
  accessibilityLabel: string | undefined,
): Readonly<{ decorative: boolean; accessibilityLabel?: string }> {
  const resolvedDecorative = decorative ?? accessibilityLabel === undefined;
  if (resolvedDecorative) {
    if (accessibilityLabel !== undefined) {
      throw new TypeError("Decorative Image must not provide accessibilityLabel");
    }
    return { decorative: true };
  }
  if (accessibilityLabel === undefined || accessibilityLabel.trim().length === 0) {
    throw new TypeError("Informative Image accessibilityLabel must not be empty");
  }
  return { decorative: false, accessibilityLabel };
}

/** Intrinsic-size Native image with canonical fit, accessibility, and fallback semantics. */
export function Image(imageProps: ImageProps) {
  const {
    source: legacySource,
    src,
    width,
    height,
    fit,
    decorative,
    accessibilityLabel,
    sourceAdapter,
    fallback,
    onError,
    onLoad,
    onLoadStatusChange,
    renderImage,
    resizeMode,
    style,
    containerStyle,
    ...nativeProps
  } = imageProps;
  const theme = useHjmNativeTheme();
  if (src !== undefined && legacySource !== undefined) {
    throw new TypeError("Image accepts either canonical src or legacy source, not both");
  }
  if (src === undefined && legacySource === undefined) {
    throw new TypeError("Image requires src or legacy source");
  }

  const descriptor = src === undefined
    ? undefined
    : resolveImageDescriptor({
        src,
        width: width as number,
        height: height as number,
        ...(fit === undefined ? {} : { fit }),
        ...(decorative === undefined ? {} : { decorative }),
        ...(accessibilityLabel === undefined ? {} : { accessibilityLabel }),
      } as ImageDescriptor);
  const legacyMedia = descriptor === undefined
    ? resolveLegacyMedia(decorative, accessibilityLabel)
    : undefined;
  const resolvedDecorative = descriptor?.decorative ?? legacyMedia!.decorative;
  const resolvedAccessibilityLabel = descriptor?.decorative === false
    ? descriptor.accessibilityLabel
    : legacyMedia?.accessibilityLabel;
  const resolvedFit = descriptor?.fit ?? fit;
  const resolvedResizeMode = descriptor === undefined
    ? resizeMode ?? (resolvedFit === undefined ? undefined : nativeResizeModes[resolvedFit])
    : nativeResizeModes[descriptor.fit];
  const sourceKey = descriptor === undefined
    ? resolveLegacyImageSourceKey(legacySource!)
    : `src:${descriptor.src}`;
  const source = useMemo(
    () => descriptor === undefined
      ? legacySource!
      : sourceAdapter?.(descriptor) ?? { uri: descriptor.src },
    [
      descriptor?.accessibilityLabel,
      descriptor?.decorative,
      descriptor?.fit,
      descriptor?.height,
      descriptor?.src,
      descriptor?.width,
      legacySource,
      sourceAdapter,
    ],
  );
  const [state, setState] = useState<ImageState>({ sourceKey, status: "loading" });
  const status = state.sourceKey === sourceKey ? state.status : "loading";
  useEffect(() => {
    setState((current) => current.sourceKey === sourceKey
      ? current
      : { sourceKey, status: "loading" });
  }, [sourceKey]);

  const reportLoad = (event?: unknown) => {
    setState((current) => current.sourceKey === sourceKey
      ? { sourceKey, status: "loaded" }
      : current);
    onLoadStatusChange?.("loaded");
    onLoad?.(event as Parameters<NonNullable<NativeImageProps["onLoad"]>>[0]);
  };
  const reportError = (event?: unknown) => {
    setState((current) => current.sourceKey === sourceKey
      ? { sourceKey, status: "error" }
      : current);
    onLoadStatusChange?.("error");
    onError?.(event as Parameters<NonNullable<NativeImageProps["onError"]>>[0]);
  };
  const handleLoad = reportLoad as NonNullable<NativeImageProps["onLoad"]>;
  const handleError = reportError as NonNullable<NativeImageProps["onError"]>;
  const assetStyle: StyleProp<ImageStyle> = descriptor === undefined
    ? style
    : [StyleSheet.absoluteFill, style];
  const adapterBase = {
    source,
    accessible: !resolvedDecorative,
    ...(!resolvedDecorative && resolvedAccessibilityLabel !== undefined
      ? {
          accessibilityRole: "image" as const,
          accessibilityLabel: resolvedAccessibilityLabel,
        }
      : {}),
    onError: handleError,
    onLoad: handleLoad,
    reportError,
    reportLoad,
    ...(resolvedResizeMode === undefined ? {} : { resizeMode: resolvedResizeMode }),
    status: status === "loaded" ? "loaded" as const : "loading" as const,
    ...(assetStyle === undefined ? {} : { style: assetStyle }),
    nativeProps: {
      ...nativeProps,
      ...(descriptor === undefined && width !== undefined ? { width } : {}),
      ...(descriptor === undefined && height !== undefined ? { height } : {}),
      ...(resolvedResizeMode === undefined ? {} : { resizeMode: resolvedResizeMode }),
    },
  } satisfies ImageAdapterBaseProps;
  const placeholderBackground = resolveColorReference(
    imageRecipe.placeholder.background,
    theme.palette,
  );
  const fallbackLabel = descriptor === undefined
    ? resolvedAccessibilityLabel
    : resolveImageFallbackAccessibilityLabel(descriptor);
  let visual: ReactNode;
  if (status === "error") {
    visual = (
      <View
        {...(resolvedDecorative
          ? {
              accessibilityElementsHidden: true as const,
              accessible: false as const,
              importantForAccessibility: "no-hide-descendants" as const,
            }
          : {
              accessible: true as const,
              accessibilityLabel: fallbackLabel,
              accessibilityRole: "image" as const,
            })}
        style={StyleSheet.absoluteFill}
      >
        <View
          accessibilityElementsHidden
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          style={styles.imageFallbackContent}
        >
          {fallback ?? (
            <View
              accessible={false}
              style={[
                styles.imageFallbackIcon,
                { borderColor: theme.colors.textMuted },
              ]}
            >
              <Text
                accessible={false}
                emphasis="strong"
                style={{ color: theme.colors.textMuted }}
                variant="label"
              >
                !
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  } else if (renderImage === undefined) {
    visual = (
      <NativeImage
        {...adapterBase.nativeProps}
        {...(resolvedDecorative
          ? { accessible: false as const }
          : {
              accessible: true as const,
              accessibilityLabel: resolvedAccessibilityLabel,
              accessibilityRole: "image" as const,
            })}
        onError={handleError}
        onLoad={handleLoad}
        resizeMode={resolvedResizeMode}
        source={source}
        style={assetStyle}
      />
    );
  } else if (descriptor === undefined) {
    visual = (renderImage as (props: LegacyImageRenderProps) => ReactNode)({
      ...adapterBase,
      ...(resolvedFit === undefined ? {} : { fit: resolvedFit }),
      ...(width === undefined ? {} : { width }),
      ...(height === undefined ? {} : { height }),
      legacySource: true,
    });
  } else {
    visual = (renderImage as (props: CanonicalImageRenderProps) => ReactNode)({
      ...adapterBase,
      descriptor,
      src: descriptor.src,
      width: descriptor.width,
      height: descriptor.height,
      fit: descriptor.fit,
      legacySource: false,
    });
  }

  return (
    <View
      style={[
        {
          alignItems: "center",
          backgroundColor: placeholderBackground,
          borderRadius: radius[imageRecipe.radius],
          justifyContent: "center",
          overflow: "hidden",
          ...(descriptor === undefined
            ? {}
            : {
                aspectRatio: resolveImageAspectRatio(
                  descriptor.width,
                  descriptor.height,
                ),
                width: descriptor.width,
              }),
        },
        containerStyle,
      ]}
    >
      {visual}
    </View>
  );
}

const styles = StyleSheet.create({
  imageFallbackContent: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  imageFallbackIcon: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 2,
    height: glyph.lg,
    justifyContent: "center",
    width: glyph.lg,
  },
});

export type CounterBadgeProps = Readonly<{
  count: number;
  /** Omit only when a labelled parent already announces the counter. */
  accessibilityLabel?: string;
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
  if (accessibilityLabel !== undefined && !accessibilityLabel.trim()) {
    throw new TypeError("CounterBadge accessibilityLabel must not be empty");
  }
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
      accessibilityRole={accessibilityLabel === undefined ? undefined : "text"}
      accessible={accessibilityLabel !== undefined}
      importantForAccessibility={accessibilityLabel === undefined ? "no-hide-descendants" : "yes"}
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

export type ListAppearance = "grouped" | "plain";

export type ListProps = Omit<
  ViewProps,
  "accessibilityLabel" | "accessibilityRole" | "children" | "style"
> & Readonly<{
  /** Localized accessible name for this list. */
  label: string;
  children: ReactNode;
  separator?: "none" | "full" | "indented";
  appearance?: ListAppearance;
  style?: StyleProp<ViewStyle>;
}>;

/** Semantic list container that owns separator rhythm around composed rows. */
export function List({
  label,
  children,
  separator = listRecipe.defaults.separator,
  appearance = "plain",
  style,
  ...props
}: ListProps) {
  const { colors, environment } = useHjmNativeTheme();
  const items = Children.toArray(children);
  const separatorContract = listRecipe.separators[separator];
  if (!label.trim()) throw new TypeError("List label must not be empty");
  return (
    <View
      {...props}
      accessibilityLabel={label}
      accessibilityRole="list"
      style={[
        {
          direction: environment.direction,
          ...(appearance === "grouped"
            ? {
                backgroundColor: colors.surface,
                borderRadius: radius.lg,
                overflow: "hidden" as const,
              }
            : {}),
        },
        style,
      ]}
    >
      {items.map((item, index) => (
        <View key={isValidElement(item) && item.key !== null ? item.key : `hjm-list-${index}`}>
          {item}
          {separatorContract && index < items.length - 1 ? (
            <View
              accessible={false}
              style={{
                backgroundColor: colors.border,
                height: 1,
                marginEnd: separatorContract.insetEnd,
                marginStart: separatorContract.insetStart,
              }}
            />
          ) : null}
        </View>
      ))}
    </View>
  );
}

export type StatisticTrendMarkRenderProps = Readonly<{
  name: (typeof statisticRecipe.trend.marks)[keyof typeof statisticRecipe.trend.marks];
  color: string;
  size: number;
}>;

export type ComposeStatisticAccessibilityLabel<Id extends string = string> = (
  input: Readonly<{
    contextLabel?: string;
    descriptor: ResolvedStatisticDescriptor<Id>;
    valueText: string;
  }>,
) => string;

export type StatisticProps<Id extends string = string> = Readonly<{
  descriptor: StatisticDescriptor<Id>;
  density?: StatisticDensity;
  presentation?: StatisticPresentation;
  contextLabel?: string;
  accessibilityLabel?: string;
  composeAccessibilityLabel?: ComposeStatisticAccessibilityLabel<Id>;
  renderTrendMark?: (props: StatisticTrendMarkRenderProps) => ReactNode;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
  affixStyle?: StyleProp<TextStyle>;
  trendStyle?: StyleProp<TextStyle>;
  hintStyle?: StyleProp<TextStyle>;
}>;

export function Statistic<Id extends string = string>({
  descriptor,
  density = "comfortable",
  presentation = "plain",
  contextLabel,
  accessibilityLabel,
  composeAccessibilityLabel,
  renderTrendMark,
  style,
  labelStyle,
  valueStyle,
  affixStyle,
  trendStyle,
  hintStyle,
}: StatisticProps<Id>) {
  const resolved = resolveStatisticDescriptor(descriptor);
  const theme = useHjmNativeTheme();
  const densityContract = statisticRecipe.density[density];
  const presentationContract = statisticRecipe.presentations[presentation];
  const valueCopy = `${resolved.prefix ?? ""}${resolved.value}${resolved.suffix ?? ""}`;
  if (contextLabel !== undefined && !contextLabel.trim()) {
    throw new TypeError("Statistic contextLabel must not be empty");
  }
  const announcement = accessibilityLabel ?? composeAccessibilityLabel?.({
    ...(contextLabel === undefined ? {} : { contextLabel }),
    descriptor: resolved,
    valueText: valueCopy,
  }) ?? [contextLabel, resolved.label, valueCopy, resolved.trend?.label, resolved.hint]
    .filter(Boolean)
    .join(", ");
  if (!announcement.trim()) {
    throw new TypeError("Statistic accessibility label must not be empty");
  }
  const trendMark = resolved.trend
    ? statisticRecipe.trend.marks[resolved.trend.direction]
    : undefined;
  const trendColor = resolved.trend
    ? resolveColorReference(statisticRecipe.trend.tones[resolved.trend.tone], theme.palette)
    : undefined;
  return (
    <View
      accessibilityLabel={announcement}
      accessible
      style={[
        {
          backgroundColor: presentationContract.background
            ? resolveColorReference(presentationContract.background, theme.palette)
            : "transparent",
          borderColor: presentationContract.border
            ? resolveColorReference(presentationContract.border, theme.palette)
            : "transparent",
          borderRadius: radius[presentationContract.radius],
          borderWidth: presentationContract.borderWidth,
          gap: densityContract.gap,
          minWidth: 0,
          padding: densityContract.padding,
        },
        style,
      ]}
    >
      <Text
        accessible={false}
        style={[
          {
            color: resolveColorReference(statisticRecipe.label.color, theme.palette),
            fontWeight: statisticRecipe.label.fontWeight,
          },
          labelStyle,
        ]}
        variant={densityContract.labelVariant}
      >
        {resolved.label}
      </Text>
      <View
        accessible={false}
        style={{
          alignItems: "baseline",
          direction: theme.environment.direction,
          flexDirection: "row",
          flexWrap: "wrap",
          gap: spacing.xxs,
          minWidth: 0,
        }}
      >
        {resolved.prefix ? (
          <Text
            accessible={false}
            style={[
              {
                color: resolveColorReference(statisticRecipe.affix.color, theme.palette),
                fontWeight: statisticRecipe.affix.fontWeight,
              },
              affixStyle,
            ]}
            variant={statisticRecipe.affix.textVariant}
          >
            {resolved.prefix}
          </Text>
        ) : null}
        <Text
          accessible={false}
          style={[
            {
              color: resolveColorReference(statisticRecipe.value.color, theme.palette),
              flexShrink: 1,
              fontVariant: ["tabular-nums"],
              fontWeight: statisticRecipe.value.fontWeight,
            },
            valueStyle,
          ]}
          variant={densityContract.valueVariant}
        >
          {resolved.value}
        </Text>
        {resolved.suffix ? (
          <Text
            accessible={false}
            style={[
              {
                color: resolveColorReference(statisticRecipe.affix.color, theme.palette),
                fontWeight: statisticRecipe.affix.fontWeight,
              },
              affixStyle,
            ]}
            variant={statisticRecipe.affix.textVariant}
          >
            {resolved.suffix}
          </Text>
        ) : null}
      </View>
      {resolved.trend ? (
        <View
          accessible={false}
          style={{
            alignItems: "center",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: statisticRecipe.trend.gap,
            minWidth: 0,
          }}
        >
          {renderTrendMark && trendMark && trendColor ? (
            <View accessible={false}>
              {renderTrendMark({ name: trendMark, color: trendColor, size: glyph.sm })}
            </View>
          ) : (
            <Text accessible={false} style={{ color: trendColor }} variant="caption">
              {resolved.trend.direction === "up" ? "↑" : resolved.trend.direction === "down" ? "↓" : "—"}
            </Text>
          )}
          <Text
            accessible={false}
            style={[
              {
                color: trendColor,
                flexShrink: 1,
                fontWeight: statisticRecipe.trend.fontWeight,
              },
              trendStyle,
            ]}
            variant={statisticRecipe.trend.textVariant}
          >
            {resolved.trend.label}
          </Text>
        </View>
      ) : null}
      {resolved.hint ? (
        <Text
          accessible={false}
          style={[
            { color: resolveColorReference(statisticRecipe.hint.color, theme.palette) },
            hintStyle,
          ]}
          variant={statisticRecipe.hint.textVariant}
        >
          {resolved.hint}
        </Text>
      ) : null}
    </View>
  );
}

export type StatisticGroupProps<Id extends string = string> = Omit<
  ViewProps,
  "accessibilityLabel" | "accessibilityRole" | "children" | "style"
> & Readonly<{
  label: string;
  descriptor: StatisticGroupDescriptor<Id>;
  availableWidth?: number;
  density?: StatisticDensity;
  presentation?: StatisticPresentation;
  composeAccessibilityLabel?: ComposeStatisticAccessibilityLabel<Id>;
  renderTrendMark?: (props: StatisticTrendMarkRenderProps) => ReactNode;
  style?: StyleProp<ViewStyle>;
  itemStyle?: StyleProp<ViewStyle>;
}>;

export function StatisticGroup<Id extends string = string>({
  label,
  descriptor,
  availableWidth,
  density,
  presentation,
  composeAccessibilityLabel,
  renderTrendMark,
  style,
  itemStyle,
  onLayout,
  ...props
}: StatisticGroupProps<Id>) {
  validateStatisticGroup(descriptor);
  const { width: windowWidth } = useWindowDimensions();
  const { environment } = useHjmNativeTheme();
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const innerWidth = availableWidth ?? measuredWidth ?? windowWidth;
  if (!Number.isFinite(innerWidth) || innerWidth <= 0) {
    throw new RangeError("StatisticGroup availableWidth must be positive");
  }
  const requested = descriptor.columns ?? statisticRecipe.defaults.columns;
  const minItemWidth = statisticRecipe.group.minItemWidth * Math.max(1, environment.textScale);
  let columns = requested;
  while (
    columns > 1 &&
    (innerWidth - statisticRecipe.group.gap * (columns - 1)) / columns < minItemWidth
  ) {
    columns -= 1;
  }
  const itemWidth =
    (innerWidth - statisticRecipe.group.gap * (columns - 1)) / columns;
  const remainder = descriptor.items.length % columns;
  const finalRowCount = remainder === 0 ? columns : remainder;
  const finalRowStart = descriptor.items.length - finalRowCount;
  const finalRowItemWidth = finalRowCount === columns
    ? itemWidth
    : (innerWidth - statisticRecipe.group.gap * (finalRowCount - 1)) / finalRowCount;
  const handleLayout = (event: LayoutChangeEvent) => {
    onLayout?.(event);
    if (availableWidth !== undefined) return;
    const nextWidth = event.nativeEvent.layout.width;
    if (Number.isFinite(nextWidth) && nextWidth > 0) {
      setMeasuredWidth((current) => current === nextWidth ? current : nextWidth);
    }
  };
  return (
    <View
      {...props}
      accessibilityLabel={label}
      accessibilityRole="list"
      onLayout={handleLayout}
      style={[
        {
          direction: environment.direction,
          flexDirection: "row",
          flexWrap: "wrap",
          gap: statisticRecipe.group.gap,
        },
        style,
      ]}
    >
      {descriptor.items.map((item, index) => (
        <Statistic
          key={item.id}
          contextLabel={label}
          descriptor={item}
          {...(composeAccessibilityLabel === undefined ? {} : { composeAccessibilityLabel })}
          {...(density === undefined ? {} : { density })}
          {...(presentation === undefined ? {} : { presentation })}
          {...(renderTrendMark === undefined ? {} : { renderTrendMark })}
          style={[
            { width: index >= finalRowStart ? finalRowItemWidth : itemWidth },
            itemStyle,
          ]}
        />
      ))}
    </View>
  );
}

export type TimelineProps<Id extends string = string> = Omit<
  ViewProps,
  "children"
> &
  Readonly<{
    items: readonly TimelineItemDescriptor<Id>[];
    composeAccessibleName: ComposeTimelineAccessibleName;
  }>;

/** Ordered record of completed events; unlike Steps it has no current cursor. */
export function Timeline<Id extends string = string>({
  items,
  composeAccessibleName,
  style,
  ...props
}: TimelineProps<Id>) {
  const theme = useHjmNativeTheme();
  const resolved = resolveTimelineDescriptor(
    { items },
    { composeAccessibleName },
  );
  return (
    <View {...props} style={[{ gap: timelineRecipe.gap }, style]}>
      {resolved.map((item, index) => {
        const tone = timelineRecipe.dot.tones[item.tone];
        const accessibilityLabel = [
          item.accessibleName,
          item.timestamp,
          item.description,
        ]
          .filter(Boolean)
          .join(", ");
        return (
          <View
            accessible
            accessibilityLabel={accessibilityLabel}
            key={item.id}
            style={{ flexDirection: "row", gap: spacing.sm }}
          >
            <View
              importantForAccessibility="no-hide-descendants"
              style={{ alignItems: "center", width: 16 }}
            >
              <View
                style={{
                  backgroundColor: resolveColorReference(
                    tone.fill,
                    theme.palette,
                  ),
                  borderColor: tone.border
                    ? resolveColorReference(tone.border, theme.palette)
                    : "transparent",
                  borderRadius: radius.full,
                  borderWidth: tone.border
                    ? timelineRecipe.dot.borderWidth
                    : 0,
                  height: timelineRecipe.dot.diameter,
                  width: timelineRecipe.dot.diameter,
                }}
              />
              {index < resolved.length - 1 ? (
                <View
                  style={{
                    backgroundColor: resolveColorReference(
                      timelineRecipe.connector.tone,
                      theme.palette,
                    ),
                    flex: 1,
                    width: timelineRecipe.connector.width,
                  }}
                />
              ) : null}
            </View>
            <View
              importantForAccessibility="no-hide-descendants"
              style={{ flex: 1, gap: spacing.xxs, minWidth: 0, paddingBottom: spacing.xxs }}
            >
              <View
                style={{
                  alignItems: "baseline",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: spacing.xs,
                  justifyContent: "space-between",
                }}
              >
                <Text
                  emphasis="medium"
                  style={{
                    color: resolveColorReference(
                      timelineRecipe.label.color,
                      theme.palette,
                    ),
                  }}
                  variant={timelineRecipe.label.textVariant}
                >
                  {item.label}
                </Text>
                {item.timestamp ? (
                  <Text
                    style={{
                      color: resolveColorReference(
                        timelineRecipe.timestamp.color,
                        theme.palette,
                      ),
                    }}
                    variant={timelineRecipe.timestamp.textVariant}
                  >
                    {item.timestamp}
                  </Text>
                ) : null}
              </View>
              {item.description ? (
                <Text
                  style={{
                    color: resolveColorReference(
                      timelineRecipe.description.color,
                      theme.palette,
                    ),
                  }}
                  variant={timelineRecipe.description.textVariant}
                >
                  {item.description}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
