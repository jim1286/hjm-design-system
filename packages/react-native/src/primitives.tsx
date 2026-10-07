import {
  resolveGridLayout,
  type GridDescriptor,
  type ResolvedGridLayout,
} from "@hjmds/design-contracts/grid";
import {
  resolveAspectRatioDescriptor,
  type AspectRatioValue,
} from "@hjmds/design-contracts/components/aspect-ratio";
import {
  resolveContainerDescriptor,
  type ContainerGutter,
  type ContainerSize,
} from "@hjmds/design-contracts/components/container";
import {
  getIconTransform,
  resolveIconDescriptor,
  type IconDescriptor,
} from "@hjmds/design-contracts/components/icon";
import {
  validateLayoutRegions,
  type LayoutSidebarDescriptor,
  type LayoutSidebarRole,
} from "@hjmds/design-contracts/components/layout";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { withAlpha, type ThemeColors } from "@hjmds/design-contracts/colors";
import {
  glyph,
  fontFamily,
  type TextVariant,
} from "@hjmds/design-contracts/foundations";
import {
  surfaceDefaults,
  surfaceGeometry,
  surfaceRecipe,
  type SurfacePadding as ContractSurfacePadding,
  type SurfaceRadius as ContractSurfaceRadius,
  type SurfaceTone as ContractSurfaceTone,
} from "@hjmds/design-contracts/recipes/base";
import {
  sectionRecipe,
  stackRecipe,
  textRecipe,
  type StackAlign,
  type StackAxis,
  type StackGap,
  type StackJustify,
  type TextEmphasis,
  type TextTone as ContractTextTone,
} from "@hjmds/design-contracts/recipes";
import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useState,
  type Ref,
  type ReactNode,
} from "react";
import {
  PixelRatio,
  Platform,
  Text as NativeText,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type StyleProp,
  type TextProps as NativeTextProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useHjmNativeTheme } from "./provider.js";
import {
  logicalTextAlign,
  resolveNativeTextScaleProps,
} from "./internal/styles.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { warnDeprecatedStyleProps } from "./internal/deprecated-style.js";

export type {
  StackAlign,
  StackAxis,
  StackGap,
  StackJustify,
  TextEmphasis,
} from "@hjmds/design-contracts/recipes";

export type TextTone = ContractTextTone;

type LayoutRegionProps = Omit<ViewProps, "children">;

type LayoutSidebarBase = Readonly<{
  children: ReactNode;
  role: LayoutSidebarRole;
  label: string;
  containerProps?: LayoutRegionProps;
}>;

export type LayoutSidebar =
  | (LayoutSidebarBase & Readonly<{ mode: "persistent"; renderOverlay?: never }>)
  | (LayoutSidebarBase & Readonly<{
      mode: "overlay";
      renderOverlay(sidebar: ReactNode): ReactNode;
    }>);

export type LayoutProps = Omit<ViewProps, "children"> & Readonly<{
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  sidebar?: LayoutSidebar;
  headerProps?: LayoutRegionProps;
  mainProps?: LayoutRegionProps;
  footerProps?: LayoutRegionProps;
  mainRef?: Ref<View>;
}>;

/** Native shell translation: ordered regions without inventing Web landmark roles. */
export const Layout = forwardRef<View, LayoutProps>(function Layout({
  children,
  header,
  footer,
  sidebar,
  headerProps,
  mainProps,
  footerProps,
  mainRef,
  style,
  ...props
}, ref) {
  const hasHeader = header !== undefined && header !== null && header !== false;
  const hasFooter = footer !== undefined && footer !== null && footer !== false;
  validateLayoutRegions({
    ...(hasHeader ? { hasHeader: true } : {}),
    ...(hasFooter ? { hasFooter: true } : {}),
    ...(sidebar === undefined
      ? {}
      : {
          sidebar: {
            role: sidebar.role,
            mode: sidebar.mode,
            label: sidebar.label,
          } satisfies LayoutSidebarDescriptor,
        }),
  });
  const sidebarNode = sidebar === undefined
    ? null
    : (
        <View
          {...sidebar.containerProps}
          accessibilityLabel={sidebar.label}
        >
          {sidebar.children}
        </View>
      );
  return (
    <View {...props} ref={ref} style={[{ flex: 1 }, style]}>
      {hasHeader ? <View {...headerProps}>{header}</View> : null}
      {sidebar?.mode === "overlay" ? sidebar.renderOverlay(sidebarNode) : sidebarNode}
      <View {...mainProps} ref={mainRef} style={[{ flex: 1 }, mainProps?.style]}>
        {children}
      </View>
      {hasFooter ? <View {...footerProps}>{footer}</View> : null}
    </View>
  );
});

export type TextProps = Omit<NativeTextProps, "children"> &
  Readonly<{
    children: ReactNode;
    variant?: TextVariant;
    tone?: TextTone;
    emphasis?: TextEmphasis;
    align?: TextStyle["textAlign"];
      /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;

export const Text = forwardRef<NativeText, TextProps>(function Text(
  {
    children,
    variant = textRecipe.defaults.variant,
    tone = textRecipe.defaults.tone,
    emphasis: suppliedEmphasis,
    align,
    allowFontScaling,
    layoutStyle,
    style,
    ...props
  },
  ref,
) {
  const { colors, environment, textScaling, tokens, designProfile } = useHjmNativeTheme();
  const emphasis = suppliedEmphasis ?? textRecipe.defaults.emphasis;
  const firstFont = tokens.fontFamily.ui[0];
  // CSS generic monospace names are not iOS font names; translate the intent.
  // Custom font registration remains the app's responsibility, as before.
  const uiFont = firstFont === "ui-monospace" || firstFont === "monospace"
    ? (Platform.OS === "ios" ? "Menlo" : "monospace")
    : firstFont !== fontFamily.ui[0] ? firstFont : undefined;
  const toneColors: Readonly<Record<TextTone, string>> = {
    primary: colors.text,
    body: colors.textBody,
    muted: colors.textMuted,
    subtle: colors.textSub,
    weak: colors.textWeak,
    danger: colors.danger,
    brand: colors.contentBrand,
    inverse: colors.onPrimary,
  };
  const resolvedText = resolveNativeTextScaleProps(
    textScaling,
    [
      tokens.typography[variant],
      {
        color: toneColors[tone],
        fontWeight: designProfile && suppliedEmphasis === undefined ? tokens.typography[variant].fontWeight : textRecipe.emphasis[emphasis],
        ...(uiFont === undefined ? {} : { fontFamily: uiFont }),
        textAlign: align ?? logicalTextAlign(environment.direction),
      },
      style,
      layoutStyle,
    ],
    allowFontScaling,
  );
  return (
    <NativeText
      {...props}
      allowFontScaling={resolvedText.allowFontScaling}
      ref={ref}
      style={resolvedText.style}
    >
      {children}
    </NativeText>
  );
});

export type SurfaceTone = ContractSurfaceTone;
export type SurfacePadding = ContractSurfacePadding;
export type SurfaceRadius = ContractSurfaceRadius;
export type SurfaceProps = Omit<ViewProps, "style"> &
  Readonly<{
    tone?: SurfaceTone;
    padding?: SurfacePadding;
    radius?: SurfaceRadius;
    bordered?: boolean;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

function resolveThemeColor(colors: ThemeColors, key: keyof ThemeColors): string {
  return colors[key];
}

export function Surface({
  tone = surfaceDefaults.tone,
  padding = surfaceDefaults.padding,
  radius: radiusValue = surfaceDefaults.radius,
  bordered,
  layoutStyle,

  ...props
}: SurfaceProps) {
  const { colors, tokens, designProfile } = useHjmNativeTheme();
  const normalizedTone = tone;
  const contract = surfaceRecipe[normalizedTone];
  const shouldDrawBorder = bordered ?? (surfaceDefaults.bordered || contract.borderAlways);
  const borderColor = resolveThemeColor(colors, contract.border);
  const elevatedStyle: ViewStyle | undefined = contract.elevated
    ? {
        // Android elevation approximates the selected shadow; a zero-opacity
        // profile must also suppress its platform shadow. Keep legacy elevation otherwise.
        elevation: designProfile ? (tokens.shadow.floating.opacity === 0 ? 0 : Math.max(tokens.shadow.floating.radius, Math.abs(tokens.shadow.floating.offsetY))) : 4,
        // Use the same floating surface token as Web instead of a separate blur.
        shadowColor: tokens.shadow.floating.color,
        shadowOffset: { width: 0, height: tokens.shadow.floating.offsetY },
        shadowOpacity: tokens.shadow.floating.opacity,
        shadowRadius: tokens.shadow.floating.radius,
      }
    : undefined;
  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: resolveThemeColor(colors, contract.background),
          borderColor: shouldDrawBorder
            ? contract.borderAlpha === 1
              ? borderColor
              : withAlpha(borderColor, contract.borderAlpha)
            : "transparent",
          borderRadius: tokens.radius[radiusValue],
          borderWidth: 1,
          // A child image would otherwise spill past the rounded corner. An
          // elevated tone opts out because clipping cuts off its own shadow.
          overflow: contract.clipsContent ? "hidden" : "visible",
          padding: surfaceGeometry.paddings[padding],
        },
        elevatedStyle,
        layoutStyle,
      ]}
    />
  );
}

export type StackProps = ViewProps &
  Readonly<{
    axis?: StackAxis;
    gap?: StackGap | number;
    align?: StackAlign;
    justify?: StackJustify;
    wrap?: boolean;
      /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;

const alignValues: Readonly<Record<StackAlign, ViewStyle["alignItems"]>> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
};

const justifyValues: Readonly<Record<StackJustify, ViewStyle["justifyContent"]>> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
};

export function Stack({
  axis,
  gap = stackRecipe.defaults.gap,
  align = stackRecipe.defaults.align,
  justify = stackRecipe.defaults.justify,
  wrap = stackRecipe.defaults.wrap,
  layoutStyle,
  style,
  ...props
}: StackProps) {
  const { environment } = useHjmNativeTheme();
  const resolvedAxis = axis ?? "block";
  const flexDirection = stackRecipe.axes[resolvedAxis];
  return (
    <View
      {...props}
      style={[
        {
          alignItems: alignValues[align],
          direction: environment.direction,
          flexDirection,
          flexWrap: wrap ? "wrap" : "nowrap",
          gap: typeof gap === "number" ? gap : stackRecipe.gaps[gap],
          justifyContent: justifyValues[justify],
        },
        style,
        layoutStyle,
      ]}
    />
  );
}

export type ContainerProps = Omit<ViewProps, "children" | "style"> & Readonly<{
  children?: ReactNode;
  size?: ContainerSize;
  gutter?: ContainerGutter;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement;
   * `size`/`gutter` (container descriptor) owns appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  style?: StyleProp<ViewStyle>;
}>;

/** Shared centered content boundary for phones, tablets, and desktop-sized Native windows. */
export function Container({ size, gutter, layoutStyle,
  style, ...props }: ContainerProps) {
  warnDeprecatedStyleProps("Container", { style }, "layoutStyle for placement and size/gutter for width and padding");
  const resolved = resolveContainerDescriptor({
    ...(size === undefined ? {} : { size }),
    ...(gutter === undefined ? {} : { gutter }),
  });
  return (
    <View
      {...props}
      style={[
        {
          alignSelf: "center",
          maxWidth: resolved.maxWidth ?? undefined,
          paddingHorizontal: resolved.paddingInline,
          width: "100%",
        },
        style,
        layoutStyle,
      ]}
    />
  );
}

export type AspectRatioProps = Omit<ViewProps, "children"> & Readonly<{
  children?: ReactNode;
  ratio?: AspectRatioValue;
}>;

/** Native translation of the same width/height contract used by Web media frames. */
export function AspectRatio({ ratio, style, ...props }: AspectRatioProps) {
  const resolved = resolveAspectRatioDescriptor(
    ratio === undefined ? {} : { ratio },
  );
  return (
    <View
      {...props}
      style={[{ aspectRatio: resolved.ratio, width: "100%" }, style]}
    />
  );
}

type GridCanonicalDescriptorProps = Pick<
  GridDescriptor,
  "columns" | "gap" | "minColumnWidth"
>;

export type GridProps = Omit<ViewProps, "children"> &
  GridCanonicalDescriptorProps &
  Readonly<{
    children?: ReactNode;
    /** Inner width after page padding. When omitted, the rendered container is measured. */
    availableWidth?: number;
    onLayoutResolved?: (layout: ResolvedGridLayout) => void;
    itemStyle?: StyleProp<ViewStyle>;
  }>;

export function Grid({
  children,
  columns,
  gap,
  minColumnWidth,
  availableWidth,
  onLayoutResolved,
  itemStyle,
  style,
  onLayout,
  ...props
}: GridProps) {
  const { width: windowWidth } = useWindowDimensions();
  const { environment } = useHjmNativeTheme();
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const innerWidth = availableWidth ?? measuredWidth ?? windowWidth;
  const resolvedDescriptor = useMemo<GridDescriptor>(
    () =>
      ({
        columns: columns!,
        ...(gap === undefined ? {} : { gap }),
        ...(minColumnWidth === undefined ? {} : { minColumnWidth }),
      }),
    [columns, gap, minColumnWidth],
  );
  const layout = useMemo(
    () => resolveGridLayout(resolvedDescriptor, { windowWidth, availableWidth: innerWidth }),
    [innerWidth, resolvedDescriptor, windowWidth],
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    onLayout?.(event);
    if (availableWidth !== undefined) return;
    const nextWidth = event.nativeEvent.layout.width;
    if (Number.isFinite(nextWidth) && nextWidth > 0) {
      setMeasuredWidth((current) => current === nextWidth ? current : nextWidth);
    }
  };

  useEffect(
    () => onLayoutResolved?.(layout),
    [
      layout.columnGap,
      layout.columns,
      layout.columnWidth,
      layout.requestedColumns,
      layout.rowGap,
      layout.windowClass,
      onLayoutResolved,
    ],
  );

  // Floor to a device pixel so fractional widths never wrap the last column.
  const scale = PixelRatio.get();
  const cellWidth = Math.floor(layout.columnWidth * scale) / scale;

  return (
    <View
      {...props}
      onLayout={handleLayout}
      style={[
        {
          direction: environment.direction,
          flexDirection: "row",
          flexWrap: "wrap",
          columnGap: layout.columnGap,
          rowGap: layout.rowGap,
        },
        style,
      ]}
    >
      {Children.toArray(children).map((child, index) => (
        <View
          key={isValidElement(child) && child.key !== null ? child.key : `hjm-grid-${index}`}
          style={[{ width: cellWidth }, itemStyle]}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

export type NativeIconRenderProps<Name extends string = string> = Readonly<{
  name: Name;
  size: number;
  color: string;
  strokeWidth: number;
}>;

export type IconProps<Name extends string = string> = Readonly<{
  descriptor: IconDescriptor<Name>;
  /** Tree-shakeable product glyph boundary; HJM owns all appearance values. */
  renderGlyph: (props: NativeIconRenderProps<Name>) => ReactNode;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement;
   * the descriptor (`size`, `tone`, `weight`, `directionality`) owns appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  style?: StyleProp<ViewStyle>;
}>;

/** Semantic Native icon frame without an Expo or third-party icon dependency. */
export function Icon<Name extends string = string>({
  descriptor,
  renderGlyph,
  layoutStyle,
  style,
}: IconProps<Name>) {
  warnDeprecatedStyleProps("Icon", { style }, "layoutStyle for placement and the icon descriptor for appearance");
  const resolved = resolveIconDescriptor(descriptor);
  const theme = useHjmNativeTheme();
  const colors = {
    primary: theme.colors.text,
    secondary: theme.colors.textMuted,
    decorative: theme.colors.textWeak,
    brand: theme.colors.contentBrand,
    info: theme.palette.statusAccents.info,
    success: theme.palette.statusAccents.success,
    warning: theme.palette.statusAccents.warning,
    danger: theme.colors.danger,
    inverse: theme.colors.onPrimary,
  } as const;
  const size = glyph[resolved.size];
  const mirror =
    getIconTransform(resolved.directionality, theme.environment.direction) === "mirror-inline";
  return (
    <View
      {...(resolved.decorative
        ? { accessible: false as const }
        : {
            accessibilityLabel: resolved.accessibilityLabel,
            accessibilityRole: "image" as const,
            accessible: true as const,
          })}
      style={[
        {
          alignItems: "center",
          height: size,
          justifyContent: "center",
          transform: mirror ? [{ scaleX: -1 }] : undefined,
          width: size,
        },
        style,
        layoutStyle,
      ]}
    >
      <View accessible={false}>
        {renderGlyph({
          name: resolved.name,
          size,
          color: colors[resolved.tone],
          strokeWidth: resolved.weight === "strong" ? 2.5 : 2,
        })}
      </View>
    </View>
  );
}

export type SectionProps = Omit<ViewProps, "children" | "style"> &
  Readonly<{
    title?: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
    /**
     * Layout-only placement for the header row. Narrowed from a free style prop so a
     * consumer cannot move recipe-owned appearance into a slot.
     */
    headerStyle?: HjmCompositionStyleProp;
    /** Layout-only placement for the title/description column. */
    copyStyle?: HjmCompositionStyleProp;
    /** Layout-only placement for the action slot. */
    actionStyle?: HjmCompositionStyleProp;
    /** Layout-only placement for the content slot. */
    contentStyle?: HjmCompositionStyleProp;
      /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement;
     * `sectionRecipe` owns appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
}>;

/** A large-text-safe content section with a logical header action slot. */
export function Section({
  title,
  description,
  action,
  children,
  headerStyle,
  copyStyle,

  actionStyle,
  contentStyle,
  layoutStyle,
  style,
  ...props
}: SectionProps) {
  const theme = useHjmNativeTheme();
  warnDeprecatedStyleProps("Section", { style }, "layoutStyle for placement; sectionRecipe owns appearance");
  const stackHeader = theme.environment.textScale >= 1.6;
  const hasHeader = title !== undefined || description !== undefined || action !== undefined;
  return (
    <View {...props} style={[{ gap: sectionRecipe.gap }, style, layoutStyle]}>
      {hasHeader ? <View
        style={[
          {
            alignItems: stackHeader ? "stretch" : "center",
            direction: theme.environment.direction,
            flexDirection: stackHeader ? "column" : "row",
            gap: sectionRecipe.headerGap,
          },
          headerStyle,
        ]}
      >
        <View style={[{ flex: 1, gap: sectionRecipe.copyGap }, copyStyle]}>
          {title === undefined ? null : <Text
            accessibilityRole="header"
            style={[
              {
                color: resolveColorReference(sectionRecipe.title.color, theme.palette),
                fontWeight: sectionRecipe.title.fontWeight,
              },
                  ]}
            variant={sectionRecipe.title.textVariant}
          >
            {title}
          </Text>}
          {description ? (
            <Text
              style={[
                {
                  color: resolveColorReference(
                    sectionRecipe.description.color,
                    theme.palette,
                  ),
                },
                      ]}
              variant={sectionRecipe.description.textVariant}
            >
              {description}
            </Text>
          ) : null}
        </View>
        {action ? <View style={actionStyle}>{action}</View> : null}
      </View> : null}
      <View style={contentStyle}>{children}</View>
    </View>
  );
}

export type { AspectRatioValue, ContainerGutter, ContainerSize };
