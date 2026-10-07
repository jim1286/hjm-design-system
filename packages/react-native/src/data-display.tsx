import { resolveAvatarInitials, type AvatarFallbackContext } from "@hjmds/design-contracts/avatar-fallback";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { fontWeight, glyph, radius, spacing } from "@hjmds/design-contracts/foundations";
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
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { warnDeprecatedStyleProps } from "./internal/deprecated-style.js";
import type { ListRowPrivateProps } from "./internal/list-row-private.js";
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
import { surfaceDefaults, surfaceGeometry } from "@hjmds/design-contracts/recipes/base";
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
  type ListRowLeadingShape,
  type StatisticDensity,
  type StatisticPresentation,
} from "@hjmds/design-contracts/recipes";
import {
  Children,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
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
import { webDisclosureProps, webOnly } from "./internal/web-a11y.js";
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
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and
   * `tone`/`size`/`variant` for appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  style?: StyleProp<ViewStyle>;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `tone`/`size`/`variant` / typography recipe
   * for appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  labelStyle?: StyleProp<TextStyle>;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
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
  layoutStyle,
  ...props
}: BadgeProps) {
  warnDeprecatedStyleProps("Badge", { style, labelStyle }, "layoutStyle for placement and tone/size/variant for appearance");
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
        layoutStyle,
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
  children: string;
  tone?: TagTone;
  accessibilityLabel?: string;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and
   * `tone` for appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  style?: StyleProp<ViewStyle>;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `tone` / typography recipe
   * for appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  labelStyle?: StyleProp<TextStyle>;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function Tag({
  children,
  tone,
  accessibilityLabel,
  layoutStyle,
  style,
  labelStyle,
  ...props
}: TagProps) {
  warnDeprecatedStyleProps("Tag", { style, labelStyle }, "layoutStyle for placement and tone for appearance");
  const theme = useHjmNativeTheme();
  const resolvedLabel = children;
  if (resolvedLabel === undefined) {
    throw new TypeError("Tag requires children");
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
        layoutStyle,
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
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
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
  layoutStyle,
  radius: cornerRadius = surfaceDefaults.radius,
  ...props
}: CardProps) {
  const { environment, tokens } = useHjmNativeTheme();
  const bodyPadding = surfaceGeometry.paddings[padding];
  const hasHeader =
    leading !== undefined || title !== undefined || description !== undefined;
  return (
    <Surface
      {...props}
      bordered={bordered}
      padding="none"
      radius={cornerRadius}
      {...(layoutStyle === undefined ? {} : { layoutStyle })}
      tone={selected ? cardRecipe.selectedTone : tone}
    >
      {/* The inner clip must use the same theme radius as Surface; foundation-only
          geometry left images mismatched after profile changes. Keep shadows outside. */}
      <View
        style={{
          overflow: "hidden",
          borderRadius: tokens.radius[cornerRadius],
        }}
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
                  <Text
                    accessibilityRole="header"
                    emphasis="strong"
                    tone="primary"
                    variant="title"
                  >
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
      </View>
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
    /** Frame the ListRow paints around `leading`; the recipe owns its size. */
    leadingShape?: ListRowLeadingShape;
    /** Canonical layout-only placement. Controlled visual and state keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    leadingStyle?: HjmCompositionStyleProp;
    contentStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`selected` / typography recipe
     * for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    titleStyle?: StyleProp<TextStyle>;
    titleRowStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`selected` / typography recipe
     * for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    descriptionStyle?: StyleProp<TextStyle>;
    trailingStyle?: HjmCompositionStyleProp;
    trailingActionStyle?: HjmCompositionStyleProp;
    containerProps?: Omit<ViewProps, "children" | "style">;
  }>;

export function ListRow({
  title,
  description,
  leading,
  trailing,
  titleMetadata,
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
  leadingShape = "square",
  layoutStyle,

  leadingStyle,
  contentStyle,
  titleStyle,
  titleRowStyle,
  descriptionStyle,
  trailingStyle,
  trailingActionStyle,
  containerProps,
  accessibilityState,
  ...forwarded
}: ListRowProps) {
  const { hjmTitleEmphasis, ...props } = forwarded as typeof forwarded & ListRowPrivateProps;
  warnDeprecatedStyleProps("ListRow", { titleStyle, descriptionStyle }, "density/selected and the listRowRecipe typography for appearance");
  const theme = useHjmNativeTheme();
  const metrics = listRowRecipe.density[density];
  const interactive = onPress !== undefined;
  const selected = selectedProp ?? listRowRecipe.defaults.selected;
  const resolvedMetadata = titleMetadata;
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
  // `leadingSize` was declared by the recipe but unbound, so consumers rebuilt
  // the avatar box themselves. The frame belongs here; `leadingStyle` keeps
  // only composition keys.
  const leadingRadius = listRowRecipe.leadingShapes[leadingShape];
  const leadingFrameStyle = {
    alignItems: "center",
    height: listRowRecipe.leadingSize,
    justifyContent: "center",
    overflow: "hidden",
    width: listRowRecipe.leadingSize,
    ...(leadingRadius === null ? {} : { borderRadius: radius[leadingRadius] }),
  } as const satisfies ViewStyle;
  const rowContent = (
    <>
      {leading ? (
        <View
          accessible={interactive ? false : undefined}
          importantForAccessibility={interactive ? "no-hide-descendants" : "auto"}
          style={[leadingFrameStyle, leadingStyle]}
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
                fontWeight: hjmTitleEmphasis === "regular" ? fontWeight.regular : listRowRecipe.title.fontWeight,
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
      borderColor: selected && !trailingAction ? theme.colors.contentBrand : "transparent",
      borderWidth: trailingAction ? 0 : 1,
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
    trailingAction ? undefined : layoutStyle,
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
          borderColor: selected ? theme.colors.contentBrand : "transparent",
          borderWidth: 1,
          direction: visualState.direction,
          flexDirection: "row",
          minHeight: visualState.minHeight,
          opacity: visualState.opacity,
        },
        layoutStyle,
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

export type AvatarImageRenderProps = Readonly<{
  source: ImageSourcePropType;
  size: number;
  /** Canonical initials/custom fallback, for the host to keep visible until display. */
  fallback: ReactNode;
  /** Report a failure for this source generation; replaced-source callbacks are ignored. */
  onError: () => void;
}>;

type AvatarBaseProps = Readonly<{
  source?: ImageSourcePropType;
  /** Product image host (e.g. Expo disk caching), without changing the avatar frame. */
  renderImage?: (props: AvatarImageRenderProps) => ReactNode;
  name: string;
  initials?: string;
  renderFallback?: (context: AvatarFallbackContext) => ReactNode;
  size?: number;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and
   * `size`/`renderFallback` for appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  style?: StyleProp<ViewStyle>;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `size` / typography recipe
   * for appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  imageStyle?: StyleProp<ImageStyle>;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

export type AvatarProps = AvatarBaseProps & AccessibleMedia;

export function Avatar({
  source,
  renderImage,
  name,
  initials,
  renderFallback,
  size = 44,
  decorative = false,
  accessibilityLabel,
  style,
  imageStyle,
  layoutStyle,
}: AvatarProps) {
  if (!Number.isFinite(size) || size < 24) throw new RangeError("Avatar size must be at least 24");
  warnDeprecatedStyleProps("Avatar", { style, imageStyle }, "layoutStyle for placement and size/renderFallback for appearance");
  const { colors } = useHjmNativeTheme();
  const sourceKey = source === undefined ? "none" : resolveImageSourceKey(source);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  // URI equality alone cannot reject an old A callback after A→B→A. A source
  // generation token preserves product cache/display hosts without stale failures.
  const sourceGeneration = useMemo(() => ({ key: sourceKey }), [sourceKey]);
  const currentGeneration = useRef(sourceGeneration);
  currentGeneration.current = sourceGeneration;
  const failImage = () => {
    if (currentGeneration.current === sourceGeneration) setFailedSource(sourceKey);
  };
  // A replacement photo must retry even when the previous URI failed. Key by
  // content rather than object identity, since hosts commonly inline { uri }.
  const failed = failedSource === sourceKey;
  useEffect(() => setFailedSource(null), [sourceKey]);
  const fallback = resolveAvatarInitials(name, initials);
  const mediaAccessibility = decorative
    ? { accessible: false as const }
    : { accessible: true as const, accessibilityLabel, accessibilityRole: "image" as const };
  return (
    <View
      {...mediaAccessibility}
      style={[
        {
          alignItems: "center",
          backgroundColor: colors.bg,
          borderColor: colors.borderControl,
          borderWidth: 1,
          borderRadius: radius.full,
          height: size,
          justifyContent: "center",
          overflow: "hidden",
          width: size,
        },
        style,
        layoutStyle,
      ]}
    >
      {source !== undefined && !failed ? (
        renderImage ? (
          <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ height: size, width: size }}>
            {renderImage({ source, size, onError: failImage,
              fallback: renderFallback?.({ size, decorative: true }) ?? <Text align="center" style={{ color: colors.contentBrand }} variant="label">{fallback}</Text> })}
          </View>
        ) : (
          <NativeImage accessible={false} onError={failImage} source={source}
            style={[{ height: size, width: size }, imageStyle]} />
        )
      ) : (
        <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {renderFallback?.({ size, decorative: true }) ?? <Text align="center" style={{ color: colors.contentBrand }} variant="label">{fallback}</Text>}
        </View>
      )}
    </View>
  );
}

export type DividerProps = Readonly<{
  orientation?: "horizontal" | "vertical";
  inset?: number;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and
   * `orientation`/`inset` for appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  style?: StyleProp<ViewStyle>;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function Divider({ orientation = "horizontal", inset = 0, style, layoutStyle }: DividerProps) {
  if (!Number.isFinite(inset) || inset < 0) throw new RangeError("Divider inset must be non-negative");
  warnDeprecatedStyleProps("Divider", { style }, "layoutStyle for placement and orientation/inset for appearance");
  const { colors } = useHjmNativeTheme();
  return (
    <View
      accessible={false}
      style={[
        orientation === "horizontal"
          ? { backgroundColor: colors.border, height: 1, marginHorizontal: inset, width: "auto" }
          : { alignSelf: "stretch", backgroundColor: colors.border, marginVertical: inset, width: 1 },
        style,
        layoutStyle,
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
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and
   * `density`/`renderIndicator` for appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  style?: StyleProp<ViewStyle>;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`renderIndicator` / typography recipe
   * for appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  itemStyle?: StyleProp<ViewStyle>;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`renderIndicator` / typography recipe
   * for appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  triggerStyle?: StyleProp<ViewStyle>;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`renderIndicator` / typography recipe
   * for appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  titleStyle?: StyleProp<TextStyle>;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`renderIndicator` / typography recipe
   * for appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  indicatorStyle?: StyleProp<ViewStyle>;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`renderIndicator` / typography recipe
   * for appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  panelStyle?: StyleProp<ViewStyle>;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
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
  layoutStyle,
}: AccordionProps<Value>) {
  warnDeprecatedStyleProps(
    "Accordion",
    { style, itemStyle, triggerStyle, titleStyle, indicatorStyle, panelStyle },
    "layoutStyle for placement and density/renderIndicator for appearance",
  );
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
    <View accessibilityLabel={label} accessibilityRole="list" style={[style, layoutStyle]}>
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
              {...webOnly(webDisclosureProps(isExpanded, item.disabled === true))}
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
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and
   * `descriptor.columns` for appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  style?: StyleProp<ViewStyle>;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `descriptor.columns` / typography recipe
   * for appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  itemStyle?: StyleProp<ViewStyle>;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function DescriptionList<Id extends string = string>({
  label,
  descriptor,
  availableWidth,
  style,
  itemStyle,
  layoutStyle,
  onLayout,
  ...props
}: DescriptionListProps<Id>) {
  warnDeprecatedStyleProps("DescriptionList", { style, itemStyle }, "layoutStyle for placement and descriptor.columns for arrangement");
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
        layoutStyle,
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
  }>;

export type ImageRenderProps = CanonicalImageRenderProps;

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
    /** Image-host style. `layoutStyle` places the reserved root frame. */
    style?: StyleProp<ImageStyle>;
    /** Canonical layout-only placement of the reserved frame. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

type CanonicalImageProps = ImageSharedProps &
  ImageDescriptor &
  Readonly<{
    source?: never;
    /** Convert the canonical URL to a React Native source (headers/cache included). */
    sourceAdapter?: ImageSourceAdapter;
    renderImage?: (props: CanonicalImageRenderProps) => ReactNode;
  }>;

export type ImageProps = CanonicalImageProps;

type ImageState = Readonly<{
  sourceKey: string;
  status: Extract<ImageLoadStatus, "loading" | "loaded" | "error">;
}>;

function resolveImageSourceKey(source: ImageSourcePropType): string {
  if (typeof source === "number") return `asset:${source}`;
  try {
    return `source:${JSON.stringify(source)}`;
  } catch {
    return `source:${String(source)}`;
  }
}

/** Intrinsic-size Native image with canonical fit, accessibility, and fallback semantics. */
export function Image(imageProps: ImageProps) {
  const {
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
    layoutStyle,

    ...nativeProps
  } = imageProps;
  const theme = useHjmNativeTheme();
  const descriptor = resolveImageDescriptor({
    src, width, height,
    ...(fit === undefined ? {} : { fit }),
    ...(decorative === undefined ? {} : { decorative }),
    ...(accessibilityLabel === undefined ? {} : { accessibilityLabel }),
  } as ImageDescriptor);
  const resolvedDecorative = descriptor.decorative;
  const resolvedAccessibilityLabel = descriptor.decorative ? undefined : descriptor.accessibilityLabel;
  const resolvedResizeMode = nativeResizeModes[descriptor.fit];
  const sourceKey = `src:${descriptor.src}`;
  const source = useMemo(
    () => sourceAdapter?.(descriptor) ?? { uri: descriptor.src },
    [descriptor.accessibilityLabel, descriptor.decorative, descriptor.fit,
      descriptor.height, descriptor.src, descriptor.width, sourceAdapter],
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
  const assetStyle: StyleProp<ImageStyle> = [StyleSheet.absoluteFill, style];
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
      ...(resolvedResizeMode === undefined ? {} : { resizeMode: resolvedResizeMode }),
    },
  } satisfies ImageAdapterBaseProps;
  const placeholderBackground = resolveColorReference(
    imageRecipe.placeholder.background,
    theme.palette,
  );
  const fallbackLabel = resolveImageFallbackAccessibilityLabel(descriptor);
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
  } else {
    visual = (renderImage as (props: CanonicalImageRenderProps) => ReactNode)({
      ...adapterBase,
      descriptor,
      src: descriptor.src,
      width: descriptor.width,
      height: descriptor.height,
      fit: descriptor.fit,
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
          aspectRatio: resolveImageAspectRatio(descriptor.width, descriptor.height),
          width: descriptor.width,
        },
        layoutStyle,
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
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and
   * `tone`/`size`/`variant` for appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  style?: StyleProp<ViewStyle>;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function CounterBadge({
  count,
  accessibilityLabel,
  max = counterBadgeRecipe.defaults.max,
  tone = counterBadgeRecipe.defaults.tone,
  size = counterBadgeRecipe.defaults.size,
  variant = counterBadgeRecipe.defaults.variant,
  style,
  layoutStyle,
}: CounterBadgeProps) {
  warnDeprecatedStyleProps("CounterBadge", { style }, "layoutStyle for placement and tone/size/variant for appearance");
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
        layoutStyle,
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
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and
   * `appearance`/`separator` for appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  style?: StyleProp<ViewStyle>;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

/** Semantic list container that owns separator rhythm around composed rows. */
export function List({
  label,
  children,
  separator = listRecipe.defaults.separator,
  appearance = "plain",
  style,
  layoutStyle,
  ...props
}: ListProps) {
  warnDeprecatedStyleProps("List", { style }, "layoutStyle for placement and appearance/separator for appearance");
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
                backgroundColor: colors.bg,
                borderRadius: radius.lg,
                overflow: "hidden" as const,
              }
            : {}),
        },
        style,
        layoutStyle,
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
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and
   * `density`/`presentation` for appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  style?: StyleProp<ViewStyle>;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`presentation` / typography recipe
   * for appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  labelStyle?: StyleProp<TextStyle>;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`presentation` / typography recipe
   * for appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  valueStyle?: StyleProp<TextStyle>;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`presentation` / typography recipe
   * for appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  affixStyle?: StyleProp<TextStyle>;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`presentation` / typography recipe
   * for appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  trendStyle?: StyleProp<TextStyle>;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`presentation` / typography recipe
   * for appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  hintStyle?: StyleProp<TextStyle>;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function Statistic<Id extends string = string>(props: StatisticProps<Id>) {
  warnDeprecatedStyleProps(
    "Statistic",
    {
      style: props.style,
      labelStyle: props.labelStyle,
      valueStyle: props.valueStyle,
      affixStyle: props.affixStyle,
      trendStyle: props.trendStyle,
      hintStyle: props.hintStyle,
    },
    "layoutStyle for placement and density/presentation for appearance",
  );
  return renderStatistic(props);
}

// StatisticGroup composes Statistic with its own item width and the group's deprecated `itemStyle`.
// Routing through this plain function (called in the same component, so hook order is unchanged)
// keeps those internal values from being reported as caller misuse of Statistic.style. A private
// prop on the public component was rejected because it would leak into the exported type.
function renderStatistic<Id extends string = string>({
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
  layoutStyle,
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
        layoutStyle,
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
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and
   * `density`/`presentation`/`descriptor.columns` for appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  style?: StyleProp<ViewStyle>;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `density`/`presentation` / typography recipe
   * for appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  itemStyle?: StyleProp<ViewStyle>;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
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
  layoutStyle,
  onLayout,
  ...props
}: StatisticGroupProps<Id>) {
  warnDeprecatedStyleProps("StatisticGroup", { style, itemStyle }, "layoutStyle for placement and density/presentation for appearance");
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
        layoutStyle,
      ]}
    >
      {descriptor.items.map((item, index) => (
        <StatisticGroupItem
          key={item.id}
          contextLabel={label}
          descriptor={item}
          {...(composeAccessibilityLabel === undefined ? {} : { composeAccessibilityLabel })}
          {...(density === undefined ? {} : { density })}
          {...(presentation === undefined ? {} : { presentation })}
          {...(renderTrendMark === undefined ? {} : { renderTrendMark })}
          layoutStyle={{ width: index >= finalRowStart ? finalRowItemWidth : itemWidth }}
          {...(itemStyle === undefined ? {} : { style: itemStyle })}
        />
      ))}
    </View>
  );
}

/** Group cell: same render as Statistic without attributing the group's styles to the caller. */
function StatisticGroupItem<Id extends string = string>(props: StatisticProps<Id>) {
  return renderStatistic(props);
}

export type TimelineProps<Id extends string = string> = Omit<
  ViewProps,
  "children" | "style"
> &
  Readonly<{
    items: readonly TimelineItemDescriptor<Id>[];
    composeAccessibleName: ComposeTimelineAccessibleName;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement and
     * item `tone` for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

/** Ordered record of completed events; unlike Steps it has no current cursor. */
export function Timeline<Id extends string = string>({
  items,
  composeAccessibleName,
  style,
  layoutStyle,
  ...props
}: TimelineProps<Id>) {
  warnDeprecatedStyleProps("Timeline", { style }, "layoutStyle for placement and item tone for appearance");
  const theme = useHjmNativeTheme();
  const resolved = resolveTimelineDescriptor(
    { items },
    { composeAccessibleName },
  );
  return (
    <View {...props} style={[{ gap: timelineRecipe.gap }, style, layoutStyle]}>
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
