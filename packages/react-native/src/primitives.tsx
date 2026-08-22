import {
  resolveGridLayout,
  type GridDescriptor,
  type ResolvedGridLayout,
} from "@hjm/design-contracts/grid";
import {
  getIconTransform,
  resolveIconDescriptor,
  type IconDescriptor,
} from "@hjm/design-contracts/components/icon";
import { withAlpha, type ThemeColors } from "@hjm/design-contracts/colors";
import {
  glyph,
  spacing,
  typography,
  type TextVariant,
} from "@hjm/design-contracts/foundations";
import {
  surfaceDefaults,
  surfaceGeometry,
  surfaceRecipe,
  type SurfacePadding as ContractSurfacePadding,
  type SurfaceRadius as ContractSurfaceRadius,
  type SurfaceTone as ContractSurfaceTone,
} from "@hjm/design-contracts/recipes/base";
import {
  stackRecipe,
  textRecipe,
  type StackAlign,
  type StackAxis,
  type StackGap,
  type StackJustify,
  type TextEmphasis,
  type TextTone as ContractTextTone,
} from "@hjm/design-contracts/recipes";
import { Children, isValidElement, useEffect, useMemo, type ReactNode } from "react";
import {
  Text as NativeText,
  View,
  useWindowDimensions,
  type StyleProp,
  type TextProps as NativeTextProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useHjmNativeTheme } from "./provider.js";
import { logicalTextAlign, scalableTextDefaults } from "./internal/styles.js";

export type {
  StackAlign,
  StackAxis,
  StackGap,
  StackJustify,
  TextEmphasis,
} from "@hjm/design-contracts/recipes";

export type TextTone = ContractTextTone;

export type TextProps = Omit<NativeTextProps, "children"> &
  Readonly<{
    children: ReactNode;
    variant?: TextVariant;
    tone?: TextTone;
    emphasis?: TextEmphasis;
    align?: TextStyle["textAlign"];
  }>;

export function Text({
  children,
  variant = textRecipe.defaults.variant,
  tone = textRecipe.defaults.tone,
  emphasis = textRecipe.defaults.emphasis,
  align,
  style,
  ...props
}: TextProps) {
  const { colors, environment } = useHjmNativeTheme();
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
  const typeStyle = typography[variant];
  return (
    <NativeText
      {...scalableTextDefaults}
      {...props}
      style={[
        typeStyle,
        {
          color: toneColors[tone],
          fontWeight: textRecipe.emphasis[emphasis],
          textAlign: align ?? logicalTextAlign(environment.direction),
        },
        style,
      ]}
    >
      {children}
    </NativeText>
  );
}

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
  const contractDirection = stackRecipe.axes[resolvedAxis];
  const flexDirection =
    contractDirection === "row" && environment.direction === "rtl"
      ? "row-reverse"
      : contractDirection;
  return (
    <View
      {...props}
      style={[
        {
          alignItems: alignValues[align],
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
    /** Inner width after page padding. Defaults to the full Native window width. */
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
  ...props
}: GridProps) {
  const { width: windowWidth } = useWindowDimensions();
  const innerWidth = availableWidth ?? windowWidth;
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
      style={[
        {
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
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
    contentStyle?: StyleProp<ViewStyle>;
  }>;

/** A large-text-safe content section with a logical header action slot. */
export function Section({
  title,
  description,
  action,
  children,
  contentStyle,
  style,
  ...props
}: SectionProps) {
  const { environment } = useHjmNativeTheme();
  const stackHeader = environment.textScale >= 1.6;
  return (
    <View {...props} style={[{ gap: spacing.xs }, style]}>
      <View
        style={{
          alignItems: stackHeader ? "stretch" : "center",
          flexDirection: stackHeader
            ? "column"
            : environment.direction === "rtl"
              ? "row-reverse"
              : "row",
          gap: spacing.sm,
        }}
      >
        <View style={{ flex: 1, gap: spacing.xxs }}>
          <Text accessibilityRole="header" tone="primary" variant="title">{title}</Text>
          {description ? <Text tone="muted" variant="caption">{description}</Text> : null}
        </View>
        {action ? <View>{action}</View> : null}
      </View>
      <View style={contentStyle}>{children}</View>
    </View>
  );
}
