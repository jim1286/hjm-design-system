import {
  resolveGridLayout,
  type GridDescriptor,
  type ResolvedGridLayout,
} from "@hjmds/design-contracts/grid";
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
  typography,
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
  /** @deprecated Native has no bypass-link equivalent; omit this Web-only copy. */
  skipLinkLabel?: string;
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
  skipLinkLabel,
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
    ...(skipLinkLabel === undefined ? {} : { skipLinkLabel }),
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
  }>;

export const Text = forwardRef<NativeText, TextProps>(function Text(
  {
    children,
    variant = textRecipe.defaults.variant,
    tone = textRecipe.defaults.tone,
    emphasis = textRecipe.defaults.emphasis,
    align,
    allowFontScaling,
    style,
    ...props
  },
  ref,
) {
  const { colors, environment, textScaling } = useHjmNativeTheme();
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
      typography[variant],
      {
        color: toneColors[tone],
        fontWeight: textRecipe.emphasis[emphasis],
        textAlign: align ?? logicalTextAlign(environment.direction),
      },
      style,
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

/** @deprecated Compatibility aliases; use `subtle` and `accent`. */
export type LegacyNativeSurfaceTone = "sunken" | "brand";
export type SurfaceTone = ContractSurfaceTone | LegacyNativeSurfaceTone;
export type SurfacePadding = ContractSurfacePadding | number;
export type SurfaceRadius = ContractSurfaceRadius | number;
export type SurfaceProps = ViewProps &
  Readonly<{
    tone?: SurfaceTone;
    padding?: SurfacePadding;
    radius?: SurfaceRadius;
    bordered?: boolean;
  }>;

function normalizeSurfaceTone(tone: SurfaceTone): ContractSurfaceTone {
  if (tone === "sunken") return "subtle";
  if (tone === "brand") return "accent";
  return tone;
}

function resolveThemeColor(colors: ThemeColors, key: keyof ThemeColors): string {
  return colors[key];
}

export function Surface({
  tone = surfaceDefaults.tone,
  padding = surfaceDefaults.padding,
  radius: radiusValue = surfaceDefaults.radius,
  bordered = surfaceDefaults.bordered,
  style,
  ...props
}: SurfaceProps) {
  const { colors } = useHjmNativeTheme();
  const normalizedTone = normalizeSurfaceTone(tone);
  const contract = surfaceRecipe[normalizedTone];
  const shouldDrawBorder = bordered || contract.borderAlways;
  const borderColor = resolveThemeColor(colors, contract.border);
  const elevatedStyle: ViewStyle | undefined = contract.elevated
    ? {
        elevation: 4,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
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
          borderRadius:
            typeof radiusValue === "number"
              ? radiusValue
              : surfaceGeometry.radii[radiusValue],
          borderWidth: 1,
          padding:
            typeof padding === "number"
              ? padding
              : surfaceGeometry.paddings[padding],
        },
        elevatedStyle,
        style,
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
    /** @deprecated Use the renderer-neutral `axis` prop. */
    direction?: "row" | "column";
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
  direction,
  gap = stackRecipe.defaults.gap,
  align = stackRecipe.defaults.align,
  justify = stackRecipe.defaults.justify,
  wrap = stackRecipe.defaults.wrap,
  style,
  ...props
}: StackProps) {
  const { environment } = useHjmNativeTheme();
  const resolvedAxis = axis ?? (direction === "row" ? "inline" : "block");
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
      ]}
    />
  );
}

type GridCanonicalDescriptorProps = Pick<
  GridDescriptor,
  "columns" | "gap" | "minColumnWidth"
> &
  Readonly<{ descriptor?: never }>;

type GridLegacyDescriptorProps = Readonly<{
  /** @deprecated Pass `columns`, `gap`, and `minColumnWidth` directly. */
  descriptor: GridDescriptor;
  columns?: never;
  gap?: never;
  minColumnWidth?: never;
}>;

export type GridProps = Omit<ViewProps, "children"> &
  (GridCanonicalDescriptorProps | GridLegacyDescriptorProps) &
  Readonly<{
    children?: ReactNode;
    /** Inner width after page padding. When omitted, the rendered container is measured. */
    availableWidth?: number;
    onLayoutResolved?: (layout: ResolvedGridLayout) => void;
    itemStyle?: StyleProp<ViewStyle>;
  }>;

export function Grid({
  children,
  descriptor,
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
      descriptor ?? {
        columns: columns!,
        ...(gap === undefined ? {} : { gap }),
        ...(minColumnWidth === undefined ? {} : { minColumnWidth }),
      },
    [columns, descriptor, gap, minColumnWidth],
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
          style={[{ width: layout.columnWidth }, itemStyle]}
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
  style?: StyleProp<ViewStyle>;
}>;

/** Semantic Native icon frame without an Expo or third-party icon dependency. */
export function Icon<Name extends string = string>({
  descriptor,
  renderGlyph,
  style,
}: IconProps<Name>) {
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

export type SectionProps = Omit<ViewProps, "children"> &
  Readonly<{
    title?: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
    headerStyle?: StyleProp<ViewStyle>;
    copyStyle?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    descriptionStyle?: StyleProp<TextStyle>;
    actionStyle?: StyleProp<ViewStyle>;
    contentStyle?: StyleProp<ViewStyle>;
  }>;

/** A large-text-safe content section with a logical header action slot. */
export function Section({
  title,
  description,
  action,
  children,
  headerStyle,
  copyStyle,
  titleStyle,
  descriptionStyle,
  actionStyle,
  contentStyle,
  style,
  ...props
}: SectionProps) {
  const theme = useHjmNativeTheme();
  const stackHeader = theme.environment.textScale >= 1.6;
  const hasHeader = title !== undefined || description !== undefined || action !== undefined;
  return (
    <View {...props} style={[{ gap: sectionRecipe.gap }, style]}>
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
              titleStyle,
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
                descriptionStyle,
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
