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
  type CSSProperties,
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
    /**
     * Whole-card activation. With `actions`, the card stays an article and a separate full-card button sits under the
     * action region, so actions remain independent buttons (never a button inside a button). Keep other children passive.
     */
    onActivate?: () => void;
    disabled?: boolean;
    tone?: SurfaceTone;
    bordered?: boolean;
    padding?: SurfacePadding;
    radius?: SurfaceRadius;
    /** Canonical layout-only placement; forwarded to the root Surface, which applies it. */
    layoutStyle?: HjmCompositionStyleProp;
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
    onActivate,
    disabled = false,
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
  if (onActivate && !props["aria-label"]?.trim()) {
    throw new TypeError("Interactive Card requires aria-label");
  }
  const hasHeader =
    leading !== undefined || title !== undefined || description !== undefined;
  // Whole-card open plus separate commands (2026-10-18 unairplane journey card: open + delete). A root button cannot
  // contain the action buttons, so the root stays an article and an overlay button carries the card's name and state.
  const overlay = onActivate !== undefined && Boolean(actions);
  const { "aria-label": activationLabel, ...rootProps } = props;
  const activate = () => { if (!disabled) onActivate?.(); };

  return (
    <Surface
      {...(overlay ? rootProps : props)}
      ref={ref}
      as={onActivate && !overlay ? "button" : "article"}
      {...(onActivate && !overlay ? {
        type: "button" as const, disabled, "aria-pressed": selected,
        "data-interactive": true, onClick: activate,
      } : {})}
      {...(overlay ? { "data-activation": "overlay" } : {})}
      tone={selected ? cardRecipe.selectedTone : tone}
      bordered={bordered}
      {...(radius === undefined ? {} : { radius })}
      className={classNames("hjm-card", className)}
      data-state={onActivate && disabled ? "disabled" : selected ? "selected" : "idle"}
      style={{ "--hjm-card-disabled-opacity": cardRecipe.interaction.disabledOpacity,
        "--hjm-card-pressed-opacity": cardRecipe.interaction.pressedOpacity, ...props.style } as CSSProperties}
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
      {overlay ? (
        <button
          type="button"
          className="hjm-card__activator"
          data-slot="activator"
          aria-label={activationLabel}
          aria-pressed={selected}
          disabled={disabled}
          onClick={activate}
        />
      ) : null}
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
    /** Independent command outside the row's navigation target. */
    trailingAction?: ReactNode;
    /** Supply a framework Link without replacing the shared row layout. */
    renderLink?: (props: React.ComponentPropsWithRef<"a">) => ReactNode;
    density?: ListRowDensity;
    /** Semantic emphasis for destructive destinations; selection stays independent. */
    tone?: keyof typeof listRowRecipe.tones;
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
    trailingAction,
    renderLink,
    density: densityProp,
    tone = listRowRecipe.defaults.tone,
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
        role={loadingLabel ? "status" : undefined}
        aria-busy={loadingLabel ? true : undefined}
        aria-hidden={loadingLabel ? undefined : true}
        aria-label={loadingLabel}
        className={classNames("hjm-list-row", "hjm-list-row--loading", className)}
        data-density={density}
        data-leading={leading ? "" : undefined}
        data-lines={description ? "two" : "one"}
        data-state="loading"
        style={{ ...style, ...layoutStyle }}
      >
        {leading ? <span className="hjm-list-row__leading" data-shape={leadingShape} data-placeholder="" /> : null}
        <span className="hjm-list-row__content">
          <span className="hjm-list-row__title" data-placeholder="" style={{ width: `${listRowRecipe.loading.titleWidthPercent}%` }} />
          {description ? <span className="hjm-list-row__description" data-placeholder="" style={{ width: `${listRowRecipe.loading.descriptionWidthPercent}%` }} /> : null}
        </span>
        {trailing ? <span className="hjm-list-row__trailing" data-placeholder="" style={{ width: listRowRecipe.loading.trailingWidth }} /> : null}
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

  const row = createElement(
    element,
    {
      ...props,
      ...interactiveProps,
      ref,
      className: classNames("hjm-list-row", className),
      "data-density": density,
      // Exposes the text column to the enclosing List: its indented separator starts after the leading frame
      // (listRecipe.separators.indented.leadingInsetStart) only when this row has one.
      "data-leading": leading ? "" : undefined,
      "data-tone": tone,
      // One- and two-line rows have different minimum heights in the recipe;
      // the web renderer used a single hardcoded value until now.
      "data-lines": description ? "two" : "one",
      "data-state": disabled ? "disabled" : selected ? "selected" : "idle",
      // Placement wins over the legacy `style`, matching Surface's ordering.
      // With trailingAction the frame is the placed root, as Native's outer View.
      style: trailingAction ? style : { ...style, ...layoutStyle },
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
  const linked = href && renderLink ? renderLink(row.props as React.ComponentPropsWithRef<"a">) : row;
  // The frame owns the row surface and its bleed so the command and the separate action share one fill, as Native;
  // the action stays outside the link/button (styles.css `.hjm-list-row-frame`).
  return trailingAction ? (
    <div className="hjm-list-row-frame" data-density={density} data-leading={leading ? "" : undefined}
      data-state={disabled ? "disabled" : selected ? "selected" : "idle"} style={layoutStyle}>
      {linked}
      <div className="hjm-list-row__action">{trailingAction}</div>
    </div>
  ) : linked;
});
