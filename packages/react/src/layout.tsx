import {
  resolveGridLayout,
  type GridDescriptor,
  type GridGap,
} from "@hjm/design-contracts/grid";
import {
  layoutRecipe,
  validateLayoutWebDescriptor,
  type LayoutSidebarDescriptor,
  type LayoutSidebarRole,
} from "@hjm/design-contracts/components/layout";
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
  useId,
  useRef,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import {
  classNames,
  composeRefs,
  useElementWidth,
  useWindowWidth,
} from "./internal.js";

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

type LayoutRegionProps = Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "role"
>;

type LayoutSidebarBase = Readonly<{
  children: ReactNode;
  role: LayoutSidebarRole;
  label: string;
  landmarkProps?: Omit<LayoutRegionProps, "aria-label">;
  landmarkRef?: Ref<HTMLElement>;
}>;

/**
 * A persistent sidebar is rendered in the shell grid. An overlay sidebar is
 * deliberately handed to the product's SidePanel (or equivalent) through
 * `renderOverlay`; Layout never owns a second open/dismiss lifecycle.
 */
export type LayoutSidebar =
  | (LayoutSidebarBase &
      Readonly<{
        mode: "persistent";
        renderOverlay?: never;
      }>)
  | (LayoutSidebarBase &
      Readonly<{
        mode: "overlay";
        renderOverlay(sidebarLandmark: ReactElement): ReactNode;
      }>);

export type LayoutProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> &
  Readonly<{
    children: ReactNode;
    header?: ReactNode;
    footer?: ReactNode;
    sidebar?: LayoutSidebar;
    skipLinkLabel?: string;
    /** Stable product id for deep links; a hydration-safe id is generated when omitted. */
    mainId?: string;
    mainRef?: Ref<HTMLElement>;
    headerProps?: LayoutRegionProps;
    mainProps?: Omit<LayoutRegionProps, "id" | "tabIndex">;
    footerProps?: LayoutRegionProps;
    skipLinkProps?: Omit<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      "children" | "href"
    >;
  }>;

function hasRegionContent(content: ReactNode | undefined): boolean {
  return content !== undefined && content !== null && content !== false;
}

function assertMainId(id: string): void {
  if (id.trim().length === 0) {
    throw new TypeError("Layout mainId must not be empty");
  }
  if (/\s/u.test(id)) {
    throw new TypeError("Layout mainId must not contain whitespace");
  }
}

/** Accessible Web app shell with real landmarks and bypass navigation. */
export const Layout = forwardRef<HTMLDivElement, LayoutProps>(function Layout(
  {
    children,
    header,
    footer,
    sidebar,
    skipLinkLabel,
    mainId: mainIdProp,
    mainRef: forwardedMainRef,
    headerProps,
    mainProps,
    footerProps,
    skipLinkProps,
    className,
    ...props
  },
  ref,
) {
  const generatedId = `hjm-main-${useId().replaceAll(":", "")}`;
  const internalMainRef = useRef<HTMLElement>(null);
  const mainId = mainIdProp ?? generatedId;
  assertMainId(mainId);

  const hasHeader = hasRegionContent(header);
  const hasFooter = hasRegionContent(footer);
  const descriptor = {
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
  };
  validateLayoutWebDescriptor(descriptor);

  if (
    sidebar?.mode === "overlay" &&
    typeof sidebar.renderOverlay !== "function"
  ) {
    throw new TypeError(
      "Layout overlay sidebar requires renderOverlay so SidePanel owns its lifecycle",
    );
  }

  const {
    className: headerClassName,
    ...restHeaderProps
  } = headerProps ?? {};
  const {
    className: mainClassName,
    style: mainStyle,
    ...restMainProps
  } = mainProps ?? {};
  const {
    className: footerClassName,
    ...restFooterProps
  } = footerProps ?? {};
  const {
    className: skipLinkClassName,
    onClick: onSkipLinkClick,
    ...restSkipLinkProps
  } = skipLinkProps ?? {};

  let sidebarNode: ReactNode;
  if (sidebar !== undefined) {
    const {
      className: sidebarClassName,
      style: sidebarStyle,
      ...restSidebarProps
    } = sidebar.landmarkProps ?? {};
    const sidebarLandmark = createElement(
      sidebar.role === "navigation" ? "nav" : "aside",
      {
        ...restSidebarProps,
        ref: sidebar.landmarkRef,
        className: classNames("hjm-layout__sidebar", sidebarClassName),
        "aria-label": sidebar.label,
        "data-mode": sidebar.mode,
        style: {
          ...(sidebar.mode === "persistent"
            ? { inlineSize: layoutRecipe.sidebar.width }
            : {}),
          ...sidebarStyle,
        },
      },
      sidebar.children,
    );
    sidebarNode = sidebar.mode === "overlay"
      ? sidebar.renderOverlay(sidebarLandmark)
      : sidebarLandmark;
  }

  const moveFocusToMain = (event: MouseEvent<HTMLAnchorElement>) => {
    onSkipLinkClick?.(event);
    if (event.defaultPrevented) return;
    const main = internalMainRef.current;
    if (main === null) return;
    event.preventDefault();
    const url = new URL(window.location.href);
    url.hash = mainId;
    window.history.replaceState(window.history.state, "", url);
    main.focus({ preventScroll: true });
    main.scrollIntoView?.({ block: "start" });
  };

  return (
    <div
      {...props}
      ref={ref}
      className={classNames("hjm-layout", className)}
      data-hjm-component="Layout"
      data-sidebar-mode={sidebar?.mode ?? "none"}
    >
      {skipLinkLabel === undefined ? null : (
        <a
          {...restSkipLinkProps}
          href={`#${mainId}`}
          className={classNames(
            "hjm-layout__skip-link",
            skipLinkClassName,
          )}
          onClick={moveFocusToMain}
        >
          {skipLinkLabel}
        </a>
      )}
      {hasHeader ? (
        <header
          {...restHeaderProps}
          className={classNames("hjm-layout__header", headerClassName)}
        >
          {header}
        </header>
      ) : null}
      {sidebarNode}
      <main
        {...restMainProps}
        ref={composeRefs(internalMainRef, forwardedMainRef)}
        id={mainId}
        className={classNames("hjm-layout__main", mainClassName)}
        tabIndex={-1}
        style={{
          maxInlineSize: layoutRecipe.main.maxWidth,
          paddingInline: layoutRecipe.main.paddingHorizontal,
          ...mainStyle,
        }}
      >
        {children}
      </main>
      {hasFooter ? (
        <footer
          {...restFooterProps}
          className={classNames("hjm-layout__footer", footerClassName)}
        >
          {footer}
        </footer>
      ) : null}
    </div>
  );
});

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
