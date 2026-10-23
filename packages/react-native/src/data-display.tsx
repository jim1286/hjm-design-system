import { resolveDensityDefault } from "@hjmds/design-contracts/components/design-system-provider";
import { assertNoRemovedStyleProps } from "./internal/diagnostics.js";
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
  validateTimelineSelection,
  type ComposeTimelineAccessibleName,
  type ResolvedTimelineItemDescriptor,
  type TimelineItemDescriptor,
} from "@hjmds/design-contracts/components/timeline";
import { surfaceDefaults, surfaceGeometry } from "@hjmds/design-contracts/recipes/base";
import { avatarRecipe, resolveAvatarInitialsTextVariant, skeletonRecipe } from "@hjmds/design-contracts/recipes";
import {
  accordionRecipe,
  counterBadgeRecipe,
  badgeRecipe,
  listRecipe,
  formatCounterBadgeCount,
  iconRecipe,
  listRowRecipe,
  statisticRecipe,
  type AccordionDensity,
  type BadgeAdornmentContext,
  type BadgeSize,
  type BadgeTone,
  type BadgeVariant as ContractBadgeVariant,
  type CounterBadgeSize,
  type CounterBadgeTone,
  type CounterBadgeVariant,
  resolveBadgeCategoryColor,
  validateListRowTrailingAccessory,
  type BadgeCategoryColor,
  type ListRowDensity,
  type ListRowLeadingShape,
  type ListRowTrailingAccessory,
  type StatisticDensity,
  type StatisticPresentation,
} from "@hjmds/design-contracts/recipes";
import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useLayoutEffect,
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
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useControllableState } from "./internal/state.js";
import { minimumTargetStyle } from "./internal/styles.js";
import { webDisclosureProps, webOnly } from "./internal/web-a11y.js";
import { DrawnChevron } from "./internal/drawn-glyphs.js";
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
  /**
   * Product classification color per theme (series, grade…) in place of `tone`. HJM keeps the frame and picks the
   * label ink; a color whose label cannot reach AA 4.5 throws instead of rendering unreadable.
   */
  categoryColor?: BadgeCategoryColor;
  size?: BadgeSize;
  variant?: BadgeVariant;
  leading?: ReactNode | ((context: BadgeAdornmentContext) => ReactNode);
  trailing?: ReactNode | ((context: BadgeAdornmentContext) => ReactNode);
  accessibilityLabel?: string;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function Badge({
  label,
  tone: toneProp,
  categoryColor,
  size = badgeRecipe.defaults.size,
  variant = badgeRecipe.defaults.variant,
  leading,
  trailing,
  accessibilityLabel,
  layoutStyle,
  ...props
}: BadgeProps) {
  assertNoRemovedStyleProps("Badge", props, ["style","labelStyle"]);
  if (categoryColor !== undefined && toneProp !== undefined) throw new TypeError("Badge takes either tone or categoryColor, not both");
  const tone = toneProp ?? badgeRecipe.defaults.tone;
  const theme = useHjmNativeTheme();
  const presentation = badgeRecipe.tones[tone];
  const metrics = badgeRecipe.sizes[size];
  const variantPresentation = badgeRecipe.variants[variant];
  const outlined = !variantPresentation.usesToneBackground;
  const category = categoryColor === undefined ? null : resolveBadgeCategoryColor(categoryColor, {
    theme: theme.environment.theme,
    variant,
    palette: theme.palette.theme,
  });
  const contentColor = category?.content ?? resolveColorReference(outlined ? presentation.outlineContent : presentation.content, theme.palette);
  const iconContext = { color: contentColor, size: metrics.iconSize, strokeWidth: badgeRecipe.iconStrokeWidth };
  const borderReference = outlined ? presentation.border ?? variantPresentation.borderFallback : null;
  const borderColor = category
    ? category.border ?? "transparent"
    : borderReference === null ? "transparent" : resolveColorReference(borderReference, theme.palette);
  const hasBorder = category ? category.border !== null : borderReference !== null;
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
            : category?.background ?? resolveColorReference(presentation.background, theme.palette),
          borderColor,
          borderRadius: theme.tokens.radius[badgeRecipe.radius],
          borderWidth: hasBorder ? badgeRecipe.borderWidth : 0,
          direction: theme.environment.direction,
          flexDirection: "row",
          gap: metrics.gap,
          justifyContent: "center",
          minHeight: metrics.minHeight,
          paddingHorizontal: metrics.paddingHorizontal,
        },
        layoutStyle,
      ]}
    >
      {leading === undefined ? null : (
        <View
          accessibilityElementsHidden
          accessible={false}
          importantForAccessibility="no-hide-descendants"
        >
          {typeof leading === "function" ? leading(iconContext) : leading}
        </View>
      )}
      <Text
        accessible={false}
        align="center"
        emphasis="strong"
        style={[
          {
            fontWeight: badgeRecipe.fontWeight,
            color: contentColor,
          },
        ]}
        variant={metrics.textVariant}
      >
        {label}
      </Text>
      {trailing === undefined ? null : (
        <View accessibilityElementsHidden accessible={false} importantForAccessibility="no-hide-descendants">
          {typeof trailing === "function" ? trailing(iconContext) : trailing}
        </View>
      )}
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
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function Tag({
  children,
  tone,
  accessibilityLabel,
  layoutStyle,
  ...props
}: TagProps) {
  assertNoRemovedStyleProps("Tag", props, ["style","labelStyle"]);
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
          borderRadius: theme.tokens.radius[tagRecipe.radius],
          borderWidth: tagRecipe.borderWidth,
          direction: theme.environment.direction,
          flexDirection: "row",
          gap: tagRecipe.size.gap,
          minHeight: tagRecipe.size.minHeight,
          paddingHorizontal: tagRecipe.size.paddingHorizontal,
        },
        layoutStyle,
      ]}
    >
      <Text
        align="center"
        emphasis="medium"
        style={[{ color: presentation.content }]}
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
    /** Decorative artwork behind the shared body/actions; its host determines the available height. */
    backgroundMedia?: ReactNode;
    /** Platform gesture/accessibility host behind content. Requires backgroundMedia; never put metadata/actions here. */
    backgroundInteraction?: ReactNode;
    /** Non-interactive cover classification at the shared top/end inset. Requires backgroundMedia. */
    mediaBadges?: ReactNode;
    badges?: ReactNode;
    /** Centre short metadata beneath artwork without product-owned badge layout. */
    badgesAlign?: "start" | "center";
    /** Activate only the passive cover; other card content/actions keep independent targets. */
    mediaAction?: Readonly<{ label: string; onActivate(): void; icon?: (context: Readonly<{ color: string; size: number }>) => ReactNode }>;
    actions?: ReactNode;
    /** Independent commands at the header end; never nested in whole-card activation. */
    headerActions?: ReactNode;
    selected?: boolean;
    /**
     * Whole-card activation. With `actions`, media and body become one Pressable and the actions row stays a sibling,
     * so each action is its own accessible target (an accessible Pressable would swallow nested buttons for screen
     * readers). Keep other children passive.
     */
    onActivate?: () => void;
    disabled?: boolean;
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
  backgroundMedia,
  backgroundInteraction,
  mediaBadges,
  badges,
  badgesAlign = cardRecipe.defaults.badgesAlign,
  mediaAction,
  actions,
  headerActions,
  selected = cardRecipe.defaults.selected,
  onActivate,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  tone = cardRecipe.defaults.tone,
  bordered = cardRecipe.defaults.bordered,
  padding = cardRecipe.defaults.padding,
  layoutStyle,
  radius: cornerRadius = surfaceDefaults.radius,
  ...props
}: CardProps) {
  const { environment, tokens, colors } = useHjmNativeTheme();
  if (onActivate && !accessibilityLabel?.trim()) {
    throw new TypeError("Interactive Card requires accessibilityLabel");
  }
  if (mediaAction && (onActivate || !media || !mediaAction.label.trim())) throw new TypeError("Card mediaAction requires passive media, a label, and no whole-card onActivate");
  if (backgroundMedia && (media || mediaAction || onActivate)) throw new TypeError("Card backgroundMedia is decorative and cannot combine with media, mediaAction or onActivate");
  if ((backgroundInteraction !== undefined || mediaBadges !== undefined) && !backgroundMedia) throw new TypeError("Card backgroundInteraction/mediaBadges require backgroundMedia");
  const [headerActionSize, setHeaderActionSize] = useState({ width: 0, height: 0 });
  const [headerBodyTop, setHeaderBodyTop] = useState(0);
  const [headerRow, setHeaderRow] = useState<{ top: number; height: number } | null>(null);
  const bodyPadding = surfaceGeometry.paddings[padding];
  const hasHeader =
    leading !== undefined || title !== undefined || description !== undefined || headerActions !== undefined;
  // Whole-card open plus separate commands (2026-10-18 unairplane journey card: open + delete); see `onActivate`.
  const split = onActivate !== undefined && Boolean(actions || headerActions);
  const activate = () => { if (!disabled) onActivate?.(); };
  const activationA11y = {
    accessibilityRole: "button" as const,
    accessibilityLabel,
    accessibilityHint,
    accessibilityState: { selected, disabled },
  };
  const feedbackOpacity = (pressed: boolean) =>
    disabled ? cardRecipe.interaction.disabledOpacity : pressed ? cardRecipe.interaction.pressedOpacity : 1;
  // The activation host owns placement; its inner frame/body fill a stretched collection slot.
  const frame = (
    <Surface
      {...props}
      bordered={bordered}
      padding="none"
      radius={cornerRadius}
      {...(onActivate ? {} : { accessibilityLabel, accessibilityHint })}
      {...(onActivate && !split ? { layoutStyle: { flexGrow: 1 } } : layoutStyle === undefined ? {} : { layoutStyle })}
      tone={selected ? cardRecipe.selectedTone : tone}
    >
      {/* The inner clip must use the same theme radius as Surface; foundation-only
          geometry left images mismatched after profile changes. Keep shadows outside. */}
      <View
        pointerEvents={backgroundMedia ? "box-none" : "auto"}
        style={{
          overflow: "hidden",
          flexGrow: 1,
          borderRadius: tokens.radius[cornerRadius],
          ...(backgroundMedia ? { flex: 1, justifyContent: "flex-end" } as const : {}),
        }}
      >
        {backgroundMedia ? <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
          {backgroundMedia}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: cardRecipe.backgroundMedia.scrim }]} />
        </View> : null}
        {backgroundInteraction === undefined ? null : <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>{backgroundInteraction}</View>}
        {mediaBadges === undefined ? null : <View pointerEvents="box-none" style={{ position: "absolute", top: cardRecipe.mediaAction.inset, end: cardRecipe.mediaAction.inset, flexDirection: "row", flexWrap: "wrap", gap: cardRecipe.body.gap, zIndex: 1 }}>{mediaBadges}</View>}
        <CardActivationRegion split={split} activation={activationA11y} disabled={disabled} onPress={activate} feedbackOpacity={feedbackOpacity}>
        {media === undefined ? null : mediaAction ? <Pressable accessibilityRole="button" accessibilityLabel={mediaAction.label} accessibilityState={{ disabled }} disabled={disabled}
          onPress={() => { if (!disabled) mediaAction.onActivate(); }}
          style={({ pressed }) => [minimumTargetStyle, { opacity: feedbackOpacity(pressed) }]}>
          {media}
          {mediaAction.icon ? <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: "absolute", end: cardRecipe.mediaAction.inset, bottom: cardRecipe.mediaAction.inset, width: cardRecipe.mediaAction.diameter, height: cardRecipe.mediaAction.diameter, alignItems: "center", justifyContent: "center", borderRadius: tokens.radius.full, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border }}>{mediaAction.icon({ color: colors.text, size: cardRecipe.mediaAction.iconSize })}</View> : null}
        </Pressable> : <View>{media}</View>}
        <View onLayout={({ nativeEvent: { layout } }) => setHeaderBodyTop(layout.y)} style={{ gap: cardRecipe.body.gap, padding: bodyPadding, flexGrow: backgroundMedia ? 0 : 1 }}>
          {badges === undefined ? null : <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: badgesAlign === "center" ? "center" : "flex-start", gap: cardRecipe.body.gap }}>{badges}</View>}
          {hasHeader ? (
            <View
              onLayout={({ nativeEvent: { layout } }) => setHeaderRow(current => current?.top === layout.y && current.height === layout.height ? current : { top: layout.y, height: layout.height })}
              style={{
                alignItems: cardRecipe.header.alignItems,
                direction: environment.direction,
                flexDirection: "row",
                gap: cardRecipe.header.gap,
                ...(headerActionSize.width > 0 ? { marginEnd: headerActionSize.width + cardRecipe.header.gap, minHeight: headerActionSize.height } : {}),
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
                    {...(backgroundMedia ? { color: cardRecipe.backgroundMedia.foreground } : {})}
                    variant="title"
                  >
                    {title}
                  </Text>
                )}
                {description === undefined ? null : (
                  <Text emphasis="regular" tone="muted" {...(backgroundMedia ? { color: cardRecipe.backgroundMedia.foreground } : {})} variant="body">
                    {description}
                  </Text>
                )}
              </View>
            </View>
          ) : null}
          {children === undefined ? null : <View style={{ flexGrow: 1 }}>{children}</View>}
        </View>
        </CardActivationRegion>
        {/* Keep header commands outside the accessible Pressable. Measure their real width instead of reserving an app-specific icon size. */}
        {headerActions === undefined ? null : <View
          onLayout={({ nativeEvent: { layout } }) => setHeaderActionSize(current => current.width === layout.width && current.height === layout.height ? current : { width: layout.width, height: layout.height })}
          // Commands stay outside the accessible card target; measured row height also centers wrapped copy.
          style={{ position: "absolute", top: headerBodyTop + (headerRow?.top ?? bodyPadding) + Math.max(0, ((headerRow?.height ?? headerActionSize.height) - headerActionSize.height) / 2), end: bodyPadding, flexDirection: "row", alignItems: cardRecipe.header.alignItems, gap: cardRecipe.body.gap, zIndex: 1 }}>
          {headerActions}
        </View>}
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
  if (!onActivate || split) return frame;
  // Keep Surface's material/clip inside one native action host. App-owned wrappers
  // previously had to reinvent disabled/selected naming and press feedback.
  return <Pressable {...activationA11y}
    disabled={disabled} onPress={activate}
    style={({ pressed }) => [minimumTargetStyle, { opacity: feedbackOpacity(pressed) }, layoutStyle]}>{frame}</Pressable>;
}

/** Media and body as the card's own target when actions sit beside it; otherwise a transparent passthrough. */
function CardActivationRegion({ split, activation, disabled, onPress, feedbackOpacity, children }: Readonly<{
  split: boolean;
  activation: Pick<PressableProps, "accessibilityRole" | "accessibilityLabel" | "accessibilityHint" | "accessibilityState">;
  disabled: boolean;
  onPress: () => void;
  feedbackOpacity: (pressed: boolean) => number;
  children: ReactNode;
}>) {
  if (!split) return <>{children}</>;
  return <Pressable {...activation} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [minimumTargetStyle, { flexGrow: 1, opacity: feedbackOpacity(pressed) }]}>{children}</Pressable>;
}

export type QuoteCardProps = Omit<ViewProps, "children" | "style"> & Readonly<{
  children: ReactNode;
  attribution?: string;
  renderMark?: (context: { color: string; size: number }) => ReactNode;
  layoutStyle?: HjmCompositionStyleProp;
}>;

/** The quotation and caption stay one visual unit; nested disclosures remain independently accessible. */
export function QuoteCard({ children, attribution, renderMark, ...props }: QuoteCardProps) {
  const { colors } = useHjmNativeTheme();
  return <Card {...props} leading={<View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    {renderMark?.({ color: colors.contentBrand, size: cardRecipe.quotation.markSize }) ?? <Text variant="heading" tone="brand">“</Text>}
  </View>}>
    <View style={{ gap: cardRecipe.quotation.gap }}>
      {children}
      {attribution === undefined ? null : <Text variant="caption" tone="muted">{attribution}</Text>}
    </View>
  </Card>;
}

/**
 * A List item hands its rows this reporter so the indented separator drawn after the item follows the row's text
 * column: measured leading width + gap when the row has a leading frame, the content edge when it has none (2026-10-17 user
 * report: a fixed 52 cut the line off midway under rows without leading). Web reads the same fact from the ListRow
 * root's `data-leading` attribute in CSS.
 */
const ListItemLeadingContext = createContext<((contentInset: number) => void) | null>(null);

export type ListRowProps = Omit<
  PressableProps,
  "accessibilityLabel" | "accessibilityRole" | "children" | "disabled" | "style"
> &
  Readonly<{
    title: string;
    description?: string;
    leading?: ReactNode;
    trailing?: ReactNode;
    /**
     * `disclosure`: the row opens another screen. HJM draws the decorative chevron after `trailing`/`trailingText`,
     * inside the row command (before any `trailingAction`), mirrored in RTL; size and color come from
     * `listRowRecipe.accessories`.
     */
    trailingAccessory?: ListRowTrailingAccessory;
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
    /** Semantic emphasis for destructive destinations; selection stays independent. */
    tone?: keyof typeof listRowRecipe.tones;
    /** Reserve the real row geometry without exposing its commands or content. */
    loading?: boolean;
    /** Localized status name; omit on duplicate placeholder rows. */
    loadingLabel?: string;
    selected?: boolean;
    /** Frame the ListRow paints around `leading`; the recipe owns its size. */
    leadingShape?: ListRowLeadingShape;
    /** Canonical layout-only placement. Controlled visual and state keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    leadingStyle?: HjmCompositionStyleProp;
    contentStyle?: HjmCompositionStyleProp;
    titleRowStyle?: HjmCompositionStyleProp;
    trailingStyle?: HjmCompositionStyleProp;
    trailingActionStyle?: HjmCompositionStyleProp;
    containerProps?: Omit<ViewProps, "children" | "style">;
  }>;

export function ListRow({
  title,
  tone = listRowRecipe.defaults.tone,
  description,
  leading,
  trailing,
  trailingAccessory = listRowRecipe.defaults.trailingAccessory,
  titleMetadata,
  trailingAction,
  trailingText,
  metadataLabel,
  trailingLabel,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  density: suppliedDensity,
  loading = false,
  loadingLabel,
  selected: selectedProp,
  leadingShape = "square",
  layoutStyle,

  leadingStyle,
  contentStyle,
  titleRowStyle,
  trailingStyle,
  trailingActionStyle,
  containerProps,
  accessibilityState,
  ...forwarded
}: ListRowProps) {
  assertNoRemovedStyleProps("ListRow", forwarded, ["titleStyle","descriptionStyle"]);
  const { hjmTitleEmphasis, hjmMeta, ...props } = forwarded as typeof forwarded & ListRowPrivateProps;
  const theme = useHjmNativeTheme();
  const density = suppliedDensity ?? resolveDensityDefault(theme.environment.density, { comfortable: listRowRecipe.defaults.density, compact: "compact" } as const);
  // Tell the enclosing List item whether this row has a leading frame, so the indented separator after it starts at
  // this row's text column (listRecipe.separators). Runs before the loading early return to keep hook order.
  const reportLeading = useContext(ListItemLeadingContext);
  const hasLeading = Boolean(leading);
  const [leadingWidth, setLeadingWidth] = useState<number>(listRowRecipe.leadingSize);
  const measureLeading = (event: LayoutChangeEvent) => {
    if (!reportLeading) return;
    const width = event.nativeEvent.layout.width;
    if (Number.isFinite(width) && width >= 0) setLeadingWidth(current => current === width ? current : width);
  };
  useLayoutEffect(() => {
    if (!reportLeading) return undefined;
    // Ranking rows may compose rank + portrait in a wider public leading slot (2026-10-19).
    reportLeading(hasLeading ? leadingWidth + listRowRecipe.gap : 0);
    return () => reportLeading(0);
  }, [reportLeading, hasLeading, leadingWidth]);
  const metrics = listRowRecipe.density[density];
  validateListRowTrailingAccessory(trailingAccessory);
  const accessory = trailingAccessory === "none" ? null : listRowRecipe.accessories[trailingAccessory];
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
    minHeight: description || hjmMeta ? metrics.twoLineMinHeight : metrics.oneLineMinHeight,
    opacity: disabled ? listRowRecipe.states.disabledOpacity : 1,
  } as const;
  // `leadingSize` was declared by the recipe but unbound, so consumers rebuilt
  // the avatar box themselves. The frame belongs here; `leadingStyle` keeps
  // only composition keys.
  // Inline placement (listRowRecipe.surfaceBleed, 2026-10-17 user decision): the row content sits on the container's
  // content edge and the pressable surface (pressed/selected fill, border, hit area) bleeds outward by
  // `paddingHorizontal` through the same negative margin. The selection border is part of that padding, not added to
  // it: the always-present 1pt border used to push content 1pt further than Web's inset ring (text at 25, not 24).
  const rowBorder = 1;
  const leadingRadius = listRowRecipe.leadingShapes[leadingShape];
  const leadingFrameStyle = {
    alignItems: "center",
    height: listRowRecipe.leadingSize,
    justifyContent: "center",
    overflow: "hidden",
    width: listRowRecipe.leadingSize,
    ...(leadingRadius === null ? {} : { borderRadius: theme.tokens.radius[leadingRadius] }),
  } as const satisfies ViewStyle;
  if (loading) {
    // Search and other collections share ListRow geometry instead of approximating it with
    // loose Skeletons. Never mount placeholder actions or forward touch handlers while loading.
    // Same placeholder fill as Skeleton so a loading screen mixing both reads as one state (2026-10-17).
    const placeholder = { backgroundColor: resolveColorReference(skeletonRecipe.background, theme.palette), borderRadius: theme.tokens.radius.sm };
    return <View testID={props.testID} onLayout={props.onLayout}
      accessible={Boolean(loadingLabel)} accessibilityRole="progressbar"
      accessibilityLabel={loadingLabel} accessibilityState={{ busy: true }}
      importantForAccessibility={loadingLabel ? "yes" : "no-hide-descendants"}
      style={[{ alignItems: "center", flexDirection: "row", direction: theme.environment.direction,
        gap: listRowRecipe.gap, minHeight: visualState.minHeight, marginHorizontal: -metrics.paddingHorizontal,
        paddingHorizontal: metrics.paddingHorizontal - rowBorder, paddingVertical: metrics.paddingVertical - rowBorder,
        borderWidth: rowBorder, borderColor: "transparent" }, layoutStyle]}>
      {leading ? <View onLayout={measureLeading} style={[placeholder, leadingFrameStyle, leadingStyle]} /> : null}
      <View style={{ flex: 1, minWidth: 0, gap: spacing.xxs }}>
        <View style={[placeholder, { width: `${listRowRecipe.loading.titleWidthPercent}%`, height: theme.tokens.typography[listRowRecipe.title.textVariant].lineHeight }]} />
        {description ? <View style={[placeholder, { width: `${listRowRecipe.loading.descriptionWidthPercent}%`, height: theme.tokens.typography[listRowRecipe.description.textVariant].lineHeight }]} /> : null}
      </View>
      {trailing || trailingText ? <View style={[placeholder, { width: listRowRecipe.loading.trailingWidth, height: theme.tokens.typography[listRowRecipe.trailing.textVariant].lineHeight }]} /> : null}
      {/* Keep the accessory's box so the text column does not shift when the real row arrives. */}
      {accessory ? <View testID="hjm-list-row-accessory" style={{ width: glyph[accessory.glyph], height: glyph[accessory.glyph],
        ...(trailing || trailingText ? { marginStart: accessory.gap - listRowRecipe.gap } : {}) }} /> : null}
    </View>;
  }
  const rowContent = (
    <>
      {leading ? (
        <View
          onLayout={measureLeading}
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
                color: resolveColorReference(listRowRecipe.tones[tone].titleColor, theme.palette),
                flexShrink: 1,
                fontWeight: hjmTitleEmphasis === "regular" ? fontWeight.regular : listRowRecipe.title.fontWeight,
              },
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
            ]}
            variant={listRowRecipe.description.textVariant}
          >
            {description}
          </Text>
        ) : null}
        {hjmMeta ? <Text variant="caption" tone="muted">{hjmMeta}</Text> : null}
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
      {accessory ? (
        <View
          testID="hjm-list-row-accessory"
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          // A preceding trailing value pulls the chevron to the tighter accessory gap (iOS detail → chevron).
          style={{ flexShrink: 0, ...(trailing || trailingText ? { marginStart: accessory.gap - listRowRecipe.gap } : {}) }}
        >
          <DrawnChevron
            direction="end"
            size={glyph[accessory.glyph]}
            color={resolveColorReference(accessory.color, theme.palette)}
            strokeWidth={iconRecipe.weights[accessory.weight]}
          />
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
      borderColor: selected && !trailingAction ? theme.colors.borderControl : "transparent",
      borderWidth: trailingAction ? 0 : rowBorder,
      direction: visualState.direction,
      flex: trailingAction ? 1 : undefined,
      flexDirection: "row",
      gap: listRowRecipe.gap,
      minHeight: visualState.minHeight,
      opacity: trailingAction ? 1 : visualState.opacity,
      // With trailingAction the outer frame owns the bleed and border; the command keeps the start padding.
      ...(trailingAction
        ? { paddingStart: metrics.paddingHorizontal - rowBorder, paddingVertical: metrics.paddingVertical - rowBorder }
        : { marginHorizontal: -metrics.paddingHorizontal, paddingHorizontal: metrics.paddingHorizontal - rowBorder,
            paddingVertical: metrics.paddingVertical - rowBorder }),
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
          borderColor: selected ? theme.colors.borderControl : "transparent",
          borderWidth: rowBorder,
          direction: visualState.direction,
          flexDirection: "row",
          // Command and action sit listRowRecipe.gap apart, as Web's frame.
          gap: listRowRecipe.gap,
          marginHorizontal: -metrics.paddingHorizontal,
          minHeight: visualState.minHeight,
          opacity: visualState.opacity,
        },
        layoutStyle,
      ]}
    >
      {main}
      <View
        style={[
          // The action box ends on the content edge, so an `edge="end"` IconButton puts its glyph on that line.
          { flexShrink: 0, paddingEnd: metrics.paddingHorizontal - rowBorder },
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
  layoutStyle,
}: AvatarProps) {
  if (!Number.isFinite(size) || size < 24) throw new RangeError("Avatar size must be at least 24");
  const { palette } = useHjmNativeTheme();
  // Same colors and initials step as Web (avatarRecipe); Native previously used brand 12pt initials.
  const initialsColor = resolveColorReference(avatarRecipe.content, palette);
  const initialsVariant = resolveAvatarInitialsTextVariant(size);
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
          backgroundColor: resolveColorReference(avatarRecipe.background, palette),
          borderColor: resolveColorReference(avatarRecipe.border, palette),
          borderWidth: 1,
          borderRadius: radius.full,
          height: size,
          justifyContent: "center",
          overflow: "hidden",
          width: size,
        },
        layoutStyle,
      ]}
    >
      {source !== undefined && !failed ? (
        renderImage ? (
          <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ height: size, width: size }}>
            {renderImage({ source, size, onError: failImage,
              fallback: renderFallback?.({ size, decorative: true }) ?? <Text align="center" style={{ color: initialsColor }} variant={initialsVariant} emphasis={avatarRecipe.initialsWeight}>{fallback}</Text> })}
          </View>
        ) : (
          <NativeImage accessible={false} onError={failImage} source={source}
            style={[{ height: size, width: size }]} />
        )
      ) : (
        <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {renderFallback?.({ size, decorative: true }) ?? <Text align="center" style={{ color: initialsColor }} variant={initialsVariant} emphasis={avatarRecipe.initialsWeight}>{fallback}</Text>}
        </View>
      )}
    </View>
  );
}

export type DividerProps = Readonly<{
  orientation?: "horizontal" | "vertical";
  inset?: number;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function Divider({ orientation = "horizontal", inset = 0, layoutStyle }: DividerProps) {
  if (!Number.isFinite(inset) || inset < 0) throw new RangeError("Divider inset must be non-negative");
  const { colors } = useHjmNativeTheme();
  return (
    <View
      accessible={false}
      style={[
        orientation === "horizontal"
          ? { backgroundColor: colors.border, height: 1, marginHorizontal: inset, width: "auto" }
          : { alignSelf: "stretch", backgroundColor: colors.border, marginVertical: inset, width: 1 },
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
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;


// UI control labels keep the ui font even when their metric variant is body; content still uses reading.
export function Accordion<Value extends string = string>({
  label,
  items,
  expandedValues,
  defaultExpandedValues = [],
  onExpandedValuesChange,
  multiple = accordionRecipe.defaults.allowsMultipleExpanded,
  density = accordionRecipe.defaults.density,
  renderIndicator,
  layoutStyle,
}: AccordionProps<Value>) {
  if (items.length === 0) throw new Error("Accordion requires at least one item");
  const itemValues = new Set(items.map((item) => item.value));
  if (itemValues.size !== items.length) throw new TypeError("Accordion values must be unique");
  const theme = useHjmNativeTheme();
  const metrics = accordionRecipe.density[density];
  const indicatorColor = resolveColorReference(
    accordionRecipe.indicator.color,
    theme.palette,
  );
  const [storedExpanded, setExpanded] = useControllableState<readonly Value[]>({
    ...(expandedValues === undefined ? {} : { value: expandedValues }),
    defaultValue: defaultExpandedValues,
    ...(onExpandedValuesChange === undefined ? {} : { onChange: onExpandedValuesChange }),
  });

  const committed = useRef(false);
  const expanded = expandedValues === undefined && committed.current ? storedExpanded.filter(value => itemValues.has(value)) : storedExpanded;
  if (expanded.some(value => !itemValues.has(value))) throw new RangeError("Accordion expanded values must match items");
  if (!multiple && expanded.length > 1) throw new RangeError("Accordion only accepts one expanded value unless multiple is true");
  useLayoutEffect(() => {
    committed.current = true;
    // Retire expansion with the deleted item instead of reopening it when its key returns.
    if (expanded.length !== storedExpanded.length) setExpanded(expanded);
  }, [expanded, storedExpanded, setExpanded]);
  return (
    <View accessibilityLabel={label} accessibilityRole="list" style={[layoutStyle]}>
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
              ]}
            >
              <View style={{ flex: 1, gap: spacing.xxs }}>
                <Text
              fontRole="ui"
                  style={[
                    {
                      color: resolveColorReference(
                        accordionRecipe.title.color,
                        theme.palette,
                      ),
                      fontWeight: accordionRecipe.title.fontWeight,
                    },
                  ]}
                  variant={accordionRecipe.title.textVariant}
                >
                  {item.title}
                </Text>
                {item.description ? <Text tone="muted" variant="caption">{item.description}</Text> : null}
              </View>
              <View accessible={false}>
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
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function DescriptionList<Id extends string = string>({
  label,
  descriptor,
  availableWidth,
  layoutStyle,
  onLayout,
  ...props
}: DescriptionListProps<Id>) {
  assertNoRemovedStyleProps("DescriptionList", props, ["style","itemStyle"]);
  const resolved = resolveDescriptionListDescriptor(descriptor);
  const { width: windowWidth } = useWindowDimensions();
  const { environment, colors } = useHjmNativeTheme();
  const inline = resolved.layout === "inline";
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
          gap: inline ? 0 : spacing.sm,
        },
        layoutStyle,
      ]}
    >
      {resolved.items.map((item, index) => (
        <View
          key={item.id}
          accessibilityLabel={`${item.label}, ${item.value}`}
          accessible
          style={[{ gap: spacing.xxs, width: itemWidth }, inline && {
            flexDirection: "row", alignItems: "flex-start", gap: spacing.sm,
            paddingVertical: spacing.sm, borderTopWidth: index === 0 ? 0 : 1, borderColor: colors.border,
          }]}
        >
          <Text accessible={false} tone="muted" variant="label" layoutStyle={inline ? { width: "24%" } : undefined}>{item.label}</Text>
          <Text accessible={false} tone="primary" layoutStyle={inline ? { flex: 1, minWidth: 0 } : undefined}>{item.value}</Text>
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
  generation: object;
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
  const source = useMemo(
    () => sourceAdapter?.(descriptor) ?? { uri: descriptor.src },
    [descriptor.accessibilityLabel, descriptor.decorative, descriptor.fit,
      descriptor.height, descriptor.src, descriptor.width, sourceAdapter],
  );
  // Auth/cache changes can create a new request at the same URL. Compare the
  // resolved source contents, not the inline adapter function's identity.
  const sourceKey = JSON.stringify([descriptor.src, resolveImageSourceKey(source)]);
  // Match the Web image lifecycle: a replaced/unmounted host cannot publish
  // results, including an old A request after the product changes A→B→A.
  const generation = useMemo(() => ({}), [sourceKey]);
  const activeGeneration = useRef<object | null>(generation);
  useLayoutEffect(() => {
    activeGeneration.current = generation;
    return () => { activeGeneration.current = null; };
  }, [generation]);
  const [state, setState] = useState<ImageState>({ generation, status: "loading" });
  const status = state.generation === generation ? state.status : "loading";

  const reportLoad = (event?: unknown) => {
    if (activeGeneration.current !== generation) return;
    setState({ generation, status: "loaded" });
    onLoadStatusChange?.("loaded");
    onLoad?.(event as Parameters<NonNullable<NativeImageProps["onLoad"]>>[0]);
  };
  const reportError = (event?: unknown) => {
    if (activeGeneration.current !== generation) return;
    setState({ generation, status: "error" });
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
          borderRadius: theme.tokens.radius[imageRecipe.radius],
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
  layoutStyle,
}: CounterBadgeProps) {
  if (accessibilityLabel !== undefined && !accessibilityLabel.trim()) {
    throw new TypeError("CounterBadge accessibilityLabel must not be empty");
  }
  // A zero count hides the badge, but must not change its Hook call order.
  const { colors } = useHjmNativeTheme();
  const visibleLabel = formatCounterBadgeCount(count, max);
  if (visibleLabel === null) return null;
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
        layoutStyle,
      ]}
    >
      <Text accessible={false} align="center" style={{ color: presentation[tone].content, fontWeight: counterBadgeRecipe.fontWeight }} variant="caption">
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
  separator?: keyof typeof listRecipe.separators;
  appearance?: ListAppearance;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

/** Semantic list container that owns separator rhythm around composed rows. */
export function List({
  label,
  children,
  separator = listRecipe.defaults.separator,
  appearance = "plain",
  layoutStyle,
  ...props
}: ListProps) {
  assertNoRemovedStyleProps("List", props, ["style"]);
  const { colors, environment, tokens } = useHjmNativeTheme();
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
          // A grouped list clips to its rounded surface, so it keeps the row surface bleed as inline padding
          // (listRecipe.grouped); a plain list lets rows bleed into the host's inset (2026-10-17).
          ...(appearance === "grouped"
            ? {
                backgroundColor: colors.bg,
                borderRadius: tokens.radius.lg,
                overflow: "hidden" as const,
                paddingHorizontal: listRecipe.grouped.paddingInline,
              }
            : {}),
        },
        layoutStyle,
      ]}
    >
      {items.map((item, index) => (
        <ListItem
          key={isValidElement(item) && item.key !== null ? item.key : `hjm-list-${index}`}
          borderColor={colors.border}
          separator={index < items.length - 1 ? separatorContract : null}
        >
          {item}
        </ListItem>
      ))}
    </View>
  );
}

export type ListSeparatorProps = Readonly<{
  /** content: already padded rows; full: ListRow surface; indented: ListRow text column. */
  separator?: keyof typeof listRecipe.separators;
  leading?: boolean;
  layoutStyle?: HjmCompositionStyleProp;
}>;

/** Decorative separator for a product-owned virtual collection; never replaces its accessible row. */
export function ListSeparator({ separator = "content", leading = false, layoutStyle }: ListSeparatorProps) {
  const { colors } = useHjmNativeTheme();
  const insets = listRecipe.separators[separator];
  return insets ? <ListSeparatorFrame color={colors.border} start={leading ? insets.leadingInsetStart : insets.insetStart} end={insets.insetEnd} layoutStyle={layoutStyle} /> : null;
}

// List and virtual hosts share the actual line. List keeps its measured leading width for custom row slots.
function ListSeparatorFrame({ color, start, end, layoutStyle }: Readonly<{color: string; start: number; end: number; layoutStyle?: HjmCompositionStyleProp}>) {
  // Keep host placement outside the line: Yoga's explicit logical marginStart/End would otherwise override
  // a caller's marginHorizontal even when the content-edge inset is zero.
  return <View accessible={false} importantForAccessibility="no" style={layoutStyle}>
    <View accessible={false} importantForAccessibility="no" style={{ backgroundColor: color, height: 1, marginStart: start, marginEnd: end }} />
  </View>;
}

/** One list item and the separator that belongs to it (drawn after it, as an iOS cell separator). */
function ListItem({
  borderColor,
  children,
  separator,
}: Readonly<{
  borderColor: string;
  children: ReactNode;
  separator: (typeof listRecipe.separators)[keyof typeof listRecipe.separators];
}>) {
  const [contentInset, setContentInset] = useState(0);
  return (
    <View>
      <ListItemLeadingContext.Provider value={setContentInset}>{children}</ListItemLeadingContext.Provider>
      {separator ? <ListSeparatorFrame color={borderColor} start={separator.leadingInsetStart === separator.insetStart ? separator.insetStart : contentInset} end={separator.insetEnd} /> : null}
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
  leading?: ReactNode;
  /** Product-owned series/category color shared by value and leading. */
  valueColor?: string;
  renderTrendMark?: (props: StatisticTrendMarkRenderProps) => ReactNode;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function Statistic<Id extends string = string>(props: StatisticProps<Id>) {
  return renderStatistic(props);
}

// StatisticGroup reuses this renderer with its calculated layout width.
function renderStatistic<Id extends string = string>({
  descriptor,
  density = "comfortable",
  presentation = "plain",
  contextLabel,
  accessibilityLabel,
  composeAccessibilityLabel,
  leading,
  valueColor,
  renderTrendMark,
  layoutStyle,
}: StatisticProps<Id>, bar = false, barDivider = false) {
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
  const labelNode = (
      <Text
        accessible={false}
        style={[
          {
            color: resolveColorReference(statisticRecipe.label.color, theme.palette),
            fontWeight: statisticRecipe.label.fontWeight,
            ...(bar ? { textAlign: "center" } as const : {}),
          },
        ]}
        variant={densityContract.labelVariant}
      >
        {resolved.label}
      </Text>
  );
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
          borderRadius: bar ? 0 : theme.tokens.radius[presentationContract.radius],
          borderWidth: presentationContract.borderWidth,
          gap: bar ? statisticRecipe.group.bar.valueGap : densityContract.gap,
          ...(bar ? { alignItems: "center", paddingHorizontal: statisticRecipe.group.bar.cellPadding, borderStartWidth: barDivider ? 1 : 0, borderStartColor: theme.colors.border } as const : {}),
          minWidth: 0,
          // Plain statistics align with surrounding text; only the surface plate is inset (Web keys on data-presentation).
          padding: presentation === "surface" ? densityContract.padding : 0,
        },
        layoutStyle,
      ]}
    >
      {!bar && labelNode}
      <View
        accessible={false}
        style={{
          alignItems: leading ? "center" : "baseline",
          ...(bar ? { justifyContent: "center" } as const : {}),
          direction: theme.environment.direction,
          flexDirection: "row",
          flexWrap: "wrap",
          gap: spacing.xxs,
          minWidth: 0,
        }}
      >
        {leading === undefined ? null : <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{leading}</View>}
        {resolved.prefix ? (
          <Text
            accessible={false}
            style={[
              {
                color: resolveColorReference(statisticRecipe.affix.color, theme.palette),
                fontWeight: statisticRecipe.affix.fontWeight,
              },
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
              color: valueColor ?? resolveColorReference(statisticRecipe.value.color, theme.palette),
              flexShrink: 1,
              fontVariant: ["tabular-nums"],
              fontWeight: statisticRecipe.value.fontWeight,
            },
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
            ]}
            variant={statisticRecipe.affix.textVariant}
          >
            {resolved.suffix}
          </Text>
        ) : null}
      </View>
      {bar && labelNode}
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
  arrangement?: "grid" | "bar";
  renderLeading?: (item: StatisticDescriptor<Id>, context: { color: string; size: number }) => ReactNode;
  getValueColor?: (item: StatisticDescriptor<Id>) => string | undefined;
  renderTrendMark?: (props: StatisticTrendMarkRenderProps) => ReactNode;
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
  arrangement = "grid",
  renderLeading,
  getValueColor,
  renderTrendMark,
  layoutStyle,
  onLayout,
  ...props
}: StatisticGroupProps<Id>) {
  assertNoRemovedStyleProps("StatisticGroup", props, ["style","itemStyle"]);
  validateStatisticGroup(descriptor);
  const { width: windowWidth } = useWindowDimensions();
  const { environment, colors } = useHjmNativeTheme();
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const innerWidth = availableWidth ?? measuredWidth ?? windowWidth;
  if (!Number.isFinite(innerWidth) || innerWidth <= 0) {
    throw new RangeError("StatisticGroup availableWidth must be positive");
  }
  const requested = descriptor.columns ?? statisticRecipe.defaults.columns;
  const minItemWidth = statisticRecipe.group.minItemWidth * Math.max(1, environment.textScale);
  let columns: number = arrangement === "bar" ? descriptor.items.length : requested;
  const gap = arrangement === "bar" ? 0 : statisticRecipe.group.gap;
  while (
    arrangement !== "bar" && columns > 1 &&
    (innerWidth - gap * (columns - 1)) / columns < minItemWidth
  ) {
    columns -= 1;
  }
  const itemWidth =
    (innerWidth - gap * (columns - 1)) / columns;
  const remainder = descriptor.items.length % columns;
  const finalRowCount = remainder === 0 ? columns : remainder;
  const finalRowStart = descriptor.items.length - finalRowCount;
  const finalRowItemWidth = finalRowCount === columns
    ? itemWidth
    : (innerWidth - gap * (finalRowCount - 1)) / finalRowCount;
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
          gap,
        },
        layoutStyle,
      ]}
    >
      {descriptor.items.map((item, index) => {
        const valueColor = getValueColor?.(item);
        return (
        <StatisticGroupItem
          key={item.id}
          bar={arrangement === "bar"}
          barDivider={index > 0}
          {...(valueColor ? { valueColor } : {})}
          {...(renderLeading ? { leading: renderLeading(item, { color: valueColor ?? colors.text, size: statisticRecipe.group.bar.iconSize }) } : {})}
          contextLabel={label}
          descriptor={item}
          {...(composeAccessibilityLabel === undefined ? {} : { composeAccessibilityLabel })}
          {...(density === undefined ? {} : { density })}
          {...(presentation === undefined ? {} : { presentation })}
          {...(renderTrendMark === undefined ? {} : { renderTrendMark })}
          layoutStyle={{ width: index >= finalRowStart ? finalRowItemWidth : itemWidth }}
        />
      ); })}
    </View>
  );
}

/** Group cell: same render as Statistic without attributing the group's styles to the caller. */
function StatisticGroupItem<Id extends string = string>({ bar, barDivider, ...props }: StatisticProps<Id> & { bar: boolean; barDivider: boolean }) {
  return renderStatistic(props, bar, barDivider);
}

export type TimelineProps<Id extends string = string> = Omit<
  ViewProps,
  "children" | "style"
> &
  Readonly<{
    items: readonly TimelineItemDescriptor<Id>[];
    composeAccessibleName: ComposeTimelineAccessibleName;
    renderMetadata?: (item: TimelineItemDescriptor<Id>) => ReactNode;
    /** Per-record commands of a passive Timeline. Not allowed together with selection. */
    renderActions?: (item: TimelineItemDescriptor<Id>) => ReactNode;
    /**
     * Makes each record a selectable button (controlled, single). `null` = selectable with nothing chosen. Supply
     * together with `onSelectedIdChange`. The selected record reads as selected to assistive tech and paints the
     * neutral selection surface (timelineRecipe.item.selected).
     */
    selectedId?: Id | null;
    onSelectedIdChange?: (id: Id) => void;
    /** Virtualization host only; the shared renderer still owns every record, rail, label and command target. */
    renderList?: (context: Readonly<{
      items: readonly ResolvedTimelineItemDescriptor<Id>[];
      renderItem: (item: ResolvedTimelineItemDescriptor<Id>, index: number) => ReactNode;
      separator: ReactNode;
    }>) => ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

/** Ordered record of completed events; unlike Steps it has no current cursor. */
export function Timeline<Id extends string = string>({
  items,
  composeAccessibleName,
  renderMetadata,
  renderActions,
  renderList,
  selectedId,
  onSelectedIdChange,
  layoutStyle,
  ...props
}: TimelineProps<Id>) {
  assertNoRemovedStyleProps("Timeline", props, ["style"]);
  const theme = useHjmNativeTheme();
  validateTimelineSelection(selectedId, onSelectedIdChange, { hasActions: renderActions !== undefined });
  const selectable = onSelectedIdChange !== undefined;
  const resolved = resolveTimelineDescriptor(
    selectable ? { items, selectedId: selectedId ?? null } : { items },
    { composeAccessibleName },
  );
  // Dot, label first line and timestamp share the label's rendered first line box (token × text scale), matching
  // Web's 1lh anchor (2026-10-17 measured audit: the dot sat at the top and the caption rode the baseline).
  const labelLineHeight = theme.tokens.typography[timelineRecipe.label.textVariant].lineHeight * theme.textScaling.scale;
  const renderRecord = (item: ResolvedTimelineItemDescriptor<Id>, index: number) => {
        const actions = renderActions?.(item);
        const tone = timelineRecipe.dot.tones[item.tone];
        const accessibilityLabel = [
          item.accessibleName,
          item.description,
          item.timestamp,
        ]
          .filter(Boolean)
          .join(", ");
        const selectedStyle = timelineRecipe.item.selected;
        // A selectable record always carries its 1pt ring (transparent until selected) inside the recipe padding, so
        // selecting never shifts the text — the same rule as ListRow's selection border.
        const recordStyle = {
          flexDirection: "row",
          gap: spacing.sm,
          padding: selectable ? timelineRecipe.item.padding - selectedStyle.borderWidth : timelineRecipe.item.padding,
          borderRadius: radius.md,
          backgroundColor: item.selected
            ? resolveColorReference(selectedStyle.background, theme.palette)
            : item.emphasized ? resolveColorReference(timelineRecipe.item.emphasisBackground, theme.palette) : undefined,
          ...(selectable ? {
            borderWidth: selectedStyle.borderWidth,
            borderColor: item.selected ? resolveColorReference(selectedStyle.border, theme.palette) : "transparent",
          } : {}),
        } as const;
        const Record = selectable ? Pressable : View;
        return (
          <Record
            accessible={!actions}
            accessibilityLabel={actions ? undefined : accessibilityLabel}
            key={item.id}
            {...(selectable ? {
              accessibilityRole: "button" as const,
              accessibilityState: { selected: item.selected },
              onPress: () => { if (item.id !== selectedId) onSelectedIdChange?.(item.id); },
            } : {})}
            style={recordStyle}
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
                  marginTop: (labelLineHeight - timelineRecipe.dot.diameter) / 2,
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
                    position: "absolute",
                    top: (labelLineHeight + timelineRecipe.dot.diameter) / 2,
                    bottom: -timelineRecipe.gap - 2 * timelineRecipe.item.padding - labelLineHeight / 2,
                    width: timelineRecipe.connector.width,
                  }}
                />
              ) : null}
            </View>
            <View
              accessible={!!actions}
              accessibilityLabel={actions ? accessibilityLabel : undefined}
              importantForAccessibility={actions ? "auto" : "no-hide-descendants"}
              style={{ flex: 1, gap: spacing.xxs, minWidth: 0, paddingBottom: spacing.xxs }}
            >
              <View
                style={{
                  alignItems: "flex-start",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: spacing.xs,
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
                {renderMetadata?.(item)}
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
              {item.timestamp ? <Text tone="muted" variant={timelineRecipe.timestamp.textVariant}>{item.timestamp}</Text> : null}
            </View>
            {actions ? <View style={{ flexDirection: "row", alignSelf: "center", alignItems: "center", gap: spacing.xs }}>{actions}</View> : null}
          </Record>
        );
  };
  return <View {...props} style={[renderList ? {} : { gap: timelineRecipe.gap }, layoutStyle]}>
    {renderList ? renderList({ items: resolved, renderItem: renderRecord, separator: <View style={{ height: timelineRecipe.gap }} /> }) : resolved.map(renderRecord)}
  </View>;
}
