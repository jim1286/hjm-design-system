import {
  resolveGridLayout,
  type GridDescriptor,
  type GridGap,
} from "@hjm/design-contracts/grid";
import {
  surfaceDefaults,
  surfaceGeometry,
  surfaceRecipe,
  type SurfacePadding,
  type SurfaceRadius,
  type SurfaceTone,
} from "@hjm/design-contracts/recipes/base";
import {
  stackRecipe,
  textRecipe,
  type StackAlign,
  type StackAxis,
  type StackGap,
  type StackJustify,
  type TextEmphasis,
  type TextTone,
} from "@hjm/design-contracts/recipes";
import type { TextVariant } from "@hjm/design-contracts/foundations";
import {
  createElement,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { classNames, useElementWidth, useWindowWidth } from "./internal.js";

export type {
  SurfacePadding,
  SurfaceRadius,
  SurfaceTone,
} from "@hjm/design-contracts/recipes/base";
export type {
  StackAlign,
  StackAxis,
  StackGap,
  StackJustify,
  TextEmphasis,
  TextTone,
} from "@hjm/design-contracts/recipes";

export type TextProps = Omit<HTMLAttributes<HTMLElement>, "children"> &
  Readonly<{
    children: ReactNode;
    as?: "span" | "p" | "div" | "strong" | "small";
    variant?: TextVariant;
    tone?: TextTone;
    emphasis?: TextEmphasis;
  }>;

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    as = "span",
    variant = textRecipe.defaults.variant,
    tone = textRecipe.defaults.tone,
    emphasis = textRecipe.defaults.emphasis,
    className,
    ...props
  },
  ref,
) {
  return createElement(as, {
    ...props,
    ref,
    className: classNames("hjm-text", className),
    "data-variant": variant,
    "data-tone": tone,
    "data-emphasis": emphasis,
  });
});

export type SurfaceProps = HTMLAttributes<HTMLElement> &
  Readonly<{
    as?: "div" | "section" | "article";
    tone?: SurfaceTone;
    bordered?: boolean;
    padding?: SurfacePadding;
    radius?: SurfaceRadius;
  }>;

export const Surface = forwardRef<HTMLElement, SurfaceProps>(function Surface(
  {
    as = "div",
    tone = surfaceDefaults.tone,
    bordered = surfaceDefaults.bordered,
    padding = surfaceDefaults.padding,
    radius = surfaceDefaults.radius,
    className,
    style,
    ...props
  },
  ref,
) {
  const contract = surfaceRecipe[tone];
  return createElement(as, {
    ...props,
    ref,
    className: classNames("hjm-surface", className),
    "data-tone": tone,
    "data-bordered": bordered || contract.borderAlways,
    "data-elevated": contract.elevated,
    "data-padding": padding,
    "data-radius": radius,
    style: {
      padding: surfaceGeometry.paddings[padding],
      borderRadius: surfaceGeometry.radii[radius],
      ...style,
    },
  });
});

export type StackProps = HTMLAttributes<HTMLDivElement> &
  Readonly<{
    axis?: StackAxis;
    gap?: StackGap;
    align?: StackAlign;
    justify?: StackJustify;
    wrap?: boolean;
  }>;

const justifyValues = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
} as const;

export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  {
    axis = stackRecipe.defaults.axis,
    gap = stackRecipe.defaults.gap,
    align = stackRecipe.defaults.align,
    justify = stackRecipe.defaults.justify,
    wrap = stackRecipe.defaults.wrap,
    className,
    style,
    ...props
  },
  ref,
) {
  return (
    <div
      {...props}
      ref={ref}
      className={classNames("hjm-stack", className)}
      data-axis={axis}
      data-gap={gap}
      style={{
        display: "flex",
        flexDirection: stackRecipe.axes[axis],
        gap: stackRecipe.gaps[gap],
        alignItems: align === "start" || align === "end" ? `flex-${align}` : align,
        justifyContent: justifyValues[justify],
        flexWrap: wrap ? "wrap" : "nowrap",
        ...style,
      }}
    />
  );
});

export type GridProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> &
  Pick<GridDescriptor, "columns" | "gap" | "minColumnWidth"> &
  Readonly<{
    children?: ReactNode;
    /** Test/SSR override. Browser renderers otherwise observe window.innerWidth. */
    windowWidth?: number;
    /** Container measurement override; ResizeObserver is used when omitted. */
    availableWidth?: number;
  }>;

export const Grid = forwardRef<HTMLDivElement, GridProps>(function Grid(
  {
    columns,
    gap,
    minColumnWidth,
    windowWidth,
    availableWidth,
    className,
    style,
    ...props
  },
  forwardedRef,
) {
  const browserWindowWidth = useWindowWidth();
  const [measuredWidth, gridRef] = useElementWidth(forwardedRef);
  const compactSsrWidth = 320;
  const effectiveWindowWidth =
    windowWidth ??
    (browserWindowWidth > 0 ? browserWindowWidth : compactSsrWidth);
  const effectiveAvailableWidth =
    availableWidth ??
    (measuredWidth !== undefined && measuredWidth > 0
      ? measuredWidth
      : effectiveWindowWidth);
  const descriptor: GridDescriptor = {
    columns,
    ...(gap === undefined ? {} : { gap }),
    ...(minColumnWidth === undefined ? {} : { minColumnWidth }),
  };
  const layout = resolveGridLayout(descriptor, {
    windowWidth: effectiveWindowWidth,
    availableWidth: effectiveAvailableWidth,
  });

  return (
    <div
      {...props}
      ref={gridRef}
      className={classNames("hjm-grid", className)}
      data-window-class={layout.windowClass}
      data-columns={layout.columns}
      data-requested-columns={layout.requestedColumns}
      data-state={layout.columns < layout.requestedColumns ? "collapsed" : "resolved"}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`,
        rowGap: layout.rowGap,
        columnGap: layout.columnGap,
        ...style,
      }}
    />
  );
});

export type { GridGap };
