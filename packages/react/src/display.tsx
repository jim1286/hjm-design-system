import {
  badgeRecipe,
  listRowRecipe,
  type BadgeSize,
  type BadgeTone,
  type BadgeVariant as ContractBadgeVariant,
  type ListRowDensity,
  type ListRowLeadingShape,
} from "@hjmds/design-contracts/recipes";
import {
  resolveTagDescriptor,
  type TagTone,
} from "@hjmds/design-contracts/components/tag";
import {
  cardRecipe,
  type CardHeadingLevel,
} from "@hjmds/design-contracts/components/card";
import {
  surfaceGeometry,
  type SurfacePadding,
  type SurfaceRadius,
  type SurfaceTone,
} from "@hjmds/design-contracts/recipes/base";
import {
  createElement,
  forwardRef,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import { classNames } from "./internal.js";
import { useHjmDensityDefault } from "./provider.js";
import { Surface, Text } from "./layout.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type { CardHeadingLevel } from "@hjmds/design-contracts/components/card";
export type { TagTone } from "@hjmds/design-contracts/components/tag";
export type BadgeVariant = ContractBadgeVariant;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  Readonly<{
    tone?: BadgeTone;
    size?: BadgeSize;
    variant?: BadgeVariant;
    leading?: ReactNode;
      /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    tone = badgeRecipe.defaults.tone,
    size = badgeRecipe.defaults.size,
    variant = badgeRecipe.defaults.variant,
    leading,
    className,
    children,
    layoutStyle,
    style,
    ...props
  },
  ref,
) {
  return (
    <span
      {...props}
      style={{ ...style, ...layoutStyle }}
      ref={ref}
      className={classNames("hjm-badge", className)}
      data-tone={tone}
      data-size={size}
      data-variant={variant}
    >
      {leading === undefined ? null : (
        <span aria-hidden="true" className="hjm-badge__icon">
          {leading}
        </span>
      )}
      <span className="hjm-badge__label">{children}</span>
    </span>
  );
});

export type TagProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> &
  Readonly<{
    children: string;
    tone?: TagTone;
      /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;

export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { children, tone, className, layoutStyle, style, ...props },
  ref,
) {
  const descriptor = resolveTagDescriptor({
    label: children,
    ...(tone === undefined ? {} : { tone }),
  });
  return (
    <span
      {...props}
      style={{ ...style, ...layoutStyle }}
      ref={ref}
      className={classNames("hjm-tag", className)}
      data-tone={descriptor.tone}
    >
      <span className="hjm-tag__label">{descriptor.label}</span>
    </span>
  );
});

export type CardProps = Omit<HTMLAttributes<HTMLElement>, "title"> &
  Readonly<{
    title?: ReactNode;
    description?: ReactNode;
    leading?: ReactNode;
    media?: ReactNode;
    actions?: ReactNode;
    headingLevel?: CardHeadingLevel;
    selected?: boolean;
    tone?: SurfaceTone;
    bordered?: boolean;
    padding?: SurfacePadding;
    radius?: SurfaceRadius;
  }>;

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  {
    title,
    description,
    leading,
    media,
    actions,
    headingLevel = cardRecipe.defaults.headingLevel,
    selected = cardRecipe.defaults.selected,
    tone = cardRecipe.defaults.tone,
    bordered = cardRecipe.defaults.bordered,
    padding = cardRecipe.defaults.padding,
    radius,
    className,
    children,
    ...props
  },
  ref,
) {
  const hasHeader =
    leading !== undefined || title !== undefined || description !== undefined;

  return (
    <Surface
      {...props}
      ref={ref}
      as="article"
      tone={selected ? cardRecipe.selectedTone : tone}
      bordered={bordered}
      {...(radius === undefined ? {} : { radius })}
      className={classNames("hjm-card", className)}
      data-state={selected ? "selected" : "idle"}
    >
      {media ? <div className="hjm-card__media" data-slot="media">{media}</div> : null}
      <div
        className="hjm-card__body"
        data-slot="body"
        style={{ padding: surfaceGeometry.paddings[padding] }}
      >
        {hasHeader ? (
          <div className="hjm-card__header" data-slot="header">
            {leading === undefined ? null : (
              <span className="hjm-card__leading" data-slot="leading">
                {leading}
              </span>
            )}
            <div className="hjm-card__copy">
              {title === undefined
                ? null
                : createElement(
                    `h${headingLevel}`,
                    { className: "hjm-card__title", "data-slot": "title" },
                    title,
                  )}
              {description === undefined ? null : (
                <Text
                  as="p"
                  tone="muted"
                  className="hjm-card__description"
                  data-slot="description"
                >
                  {description}
                </Text>
              )}
            </div>
          </div>
        ) : null}
        {children === undefined ? null : (
          <div className="hjm-card__content" data-slot="content">{children}</div>
        )}
      </div>
      {actions ? <div className="hjm-card__actions" data-slot="actions">{actions}</div> : null}
    </Surface>
  );
});

export type ListRowProps = Omit<HTMLAttributes<HTMLElement>, "title" | "onClick"> &
  Readonly<{
    title: ReactNode;
    description?: ReactNode;
    leading?: ReactNode;
    trailing?: ReactNode;
    density?: ListRowDensity;
    /** Frame the ListRow paints around `leading`; the recipe owns its size. */
    leadingShape?: ListRowLeadingShape;
    selected?: boolean;
    disabled?: boolean;
    /**
     * Placeholder row while the real one loads. It keeps the row's own height
     * and slot geometry, so a list does not jump when the content arrives —
     * which is exactly what a product-owned skeleton next to the list cannot do.
     */
    loading?: boolean;
    /** Localized status text announced while `loading`. */
    loadingLabel?: string;
    href?: string;
    onClick?: MouseEventHandler<HTMLElement>;
      /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;

export const ListRow = forwardRef<HTMLElement, ListRowProps>(function ListRow(
  {
    title,
    description,
    leading,
    trailing,
    density: densityProp,
    leadingShape = "square",
    selected = listRowRecipe.defaults.selected,
    disabled = false,
    loading = false,
    loadingLabel,
    href,
    onClick,
    className,
    layoutStyle,
    style,
    ...props
  },
  ref,
) {
  // The hook runs unconditionally — `??` would short-circuit it and break the
  // rules of hooks on the very first row that passes `density`.
  const densityDefault = useHjmDensityDefault({
    comfortable: listRowRecipe.defaults.density,
    compact: "compact",
  });
  const density = densityProp ?? densityDefault;
  if (loading) {
    // A loading row is never interactive: there is nothing to activate yet.
    return (
      <div
        {...props}
        ref={ref as React.Ref<HTMLDivElement>}
        role="status"
        aria-busy="true"
        aria-label={loadingLabel}
        className={classNames("hjm-list-row", "hjm-list-row--loading", className)}
        data-density={density}
        data-lines={description ? "two" : "one"}
        data-state="loading"
        style={{ ...style, ...layoutStyle }}
      >
        {leading ? <span className="hjm-list-row__leading" data-shape={leadingShape} data-placeholder="" /> : null}
        <span className="hjm-list-row__content">
          <span className="hjm-list-row__title" data-placeholder="" />
          {description ? <span className="hjm-list-row__description" data-placeholder="" /> : null}
        </span>
        {trailing ? <span className="hjm-list-row__trailing" data-placeholder="" /> : null}
      </div>
    );
  }
  const element = href ? "a" : onClick ? "button" : "div";
  const interactiveProps = href
    ? {
        href: disabled ? undefined : href,
        "aria-current": selected ? ("page" as const) : undefined,
        "aria-disabled": disabled || undefined,
        tabIndex: disabled ? -1 : undefined,
      }
    : onClick
      ? {
          type: "button" as const,
          onClick: disabled ? undefined : onClick,
          disabled,
          "aria-pressed": selected,
        }
      : {};

  return createElement(
    element,
    {
      ...props,
      ...interactiveProps,
      ref,
      className: classNames("hjm-list-row", className),
      "data-density": density,
      // One- and two-line rows have different minimum heights in the recipe;
      // the web renderer used a single hardcoded value until now.
      "data-lines": description ? "two" : "one",
      "data-state": disabled ? "disabled" : selected ? "selected" : "idle",
      // Placement wins over the legacy `style`, matching Surface's ordering.
      style: { ...style, ...layoutStyle },
    },
    leading
      ? <span className="hjm-list-row__leading" data-shape={leadingShape}>{leading}</span>
      : null,
    <span className="hjm-list-row__content">
      <span className="hjm-list-row__title">{title}</span>
      {description ? (
        <span className="hjm-list-row__description">{description}</span>
      ) : null}
    </span>,
    trailing ? <span className="hjm-list-row__trailing">{trailing}</span> : null,
  );
});
