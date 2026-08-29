import {
  badgeRecipe,
  listRowRecipe,
  type BadgeSize,
  type BadgeTone,
  type BadgeVariant as ContractBadgeVariant,
  type ListRowDensity,
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
import { Surface, Text } from "./layout.js";

export type { CardHeadingLevel } from "@hjmds/design-contracts/components/card";
export type { TagTone } from "@hjmds/design-contracts/components/tag";
export type BadgeVariant = ContractBadgeVariant;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  Readonly<{
    tone?: BadgeTone;
    size?: BadgeSize;
    variant?: BadgeVariant;
    leading?: ReactNode;
  }>;

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    tone = badgeRecipe.defaults.tone,
    size = badgeRecipe.defaults.size,
    variant = badgeRecipe.defaults.variant,
    leading,
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <span
      {...props}
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
  }>;

export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { children, tone, className, ...props },
  ref,
) {
  const descriptor = resolveTagDescriptor({
    label: children,
    ...(tone === undefined ? {} : { tone }),
  });
  return (
    <span
      {...props}
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
    selected?: boolean;
    disabled?: boolean;
    href?: string;
    onClick?: MouseEventHandler<HTMLElement>;
  }>;

export const ListRow = forwardRef<HTMLElement, ListRowProps>(function ListRow(
  {
    title,
    description,
    leading,
    trailing,
    density = listRowRecipe.defaults.density,
    selected = listRowRecipe.defaults.selected,
    disabled = false,
    href,
    onClick,
    className,
    ...props
  },
  ref,
) {
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
      "data-state": disabled ? "disabled" : selected ? "selected" : "idle",
    },
    leading ? <span className="hjm-list-row__leading">{leading}</span> : null,
    <span className="hjm-list-row__content">
      <span className="hjm-list-row__title">{title}</span>
      {description ? (
        <span className="hjm-list-row__description">{description}</span>
      ) : null}
    </span>,
    trailing ? <span className="hjm-list-row__trailing">{trailing}</span> : null,
  );
});
