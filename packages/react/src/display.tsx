"use client";
import { IdentityAction } from "./internal/identity-action.js";

import {
  badgeRecipe,
  listRowRecipe,
  type BadgeAdornmentContext,
  type BadgeSize,
  type BadgeTone,
  type BadgeVariant as ContractBadgeVariant,
  resolveBadgeCategoryColor,
  validateListRowTrailingAccessory,
  type BadgeCategoryColor,
  type ListRowDensity,
  type ListRowLeadingShape,
  type ListRowTrailingAccessory,
} from "@hjmds/design-contracts/recipes";
import { THEMES } from "@hjmds/design-contracts/colors";
import { glyph } from "@hjmds/design-contracts/foundations";
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
import { useHjmDensityDefault, useOptionalHjmTheme } from "./provider.js";
import { Surface, Text } from "./layout.js";
import { Icon } from "./supplemental-display.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type { CardHeadingLevel } from "@hjmds/design-contracts/components/card";
export type { TagTone } from "@hjmds/design-contracts/components/tag";
export type BadgeVariant = ContractBadgeVariant;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  Readonly<{
    tone?: BadgeTone;
    /**
     * Product classification color per theme (series, grade…) in place of `tone`. HJM keeps the frame and picks the
     * label ink; a color whose label cannot reach AA 4.5 throws instead of rendering unreadable.
     */
    categoryColor?: BadgeCategoryColor;
    size?: BadgeSize;
    variant?: BadgeVariant;
    leading?: ReactNode | ((context: BadgeAdornmentContext) => ReactNode);
    trailing?: ReactNode | ((context: BadgeAdornmentContext) => ReactNode);
      /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    tone: toneProp,
    categoryColor,
    size = badgeRecipe.defaults.size,
    variant = badgeRecipe.defaults.variant,
    leading,
    trailing,
    className,
    children,
    layoutStyle,
    style,
    ...props
  },
  ref,
) {
  if (categoryColor !== undefined && toneProp !== undefined) throw new TypeError("Badge takes either tone or categoryColor, not both");
  const tone = toneProp ?? badgeRecipe.defaults.tone;
  // Outside a provider the stylesheet paints the light palette, so the category resolves against it too.
  const theme = useOptionalHjmTheme();
  const category = categoryColor === undefined ? null : resolveBadgeCategoryColor(categoryColor, {
    theme: theme?.environment.theme ?? "light",
    variant,
    palette: theme?.palette.theme ?? THEMES.light,
  });
  const iconContext = { color: "currentColor", size: badgeRecipe.sizes[size].iconSize, strokeWidth: badgeRecipe.iconStrokeWidth };
  return (
    <span
      {...props}
      style={{
        ...style,
        ...(category ? {
          "--hjm-badge-category-content": category.content,
          "--hjm-badge-category-background": category.background ?? "transparent",
          "--hjm-badge-category-border": category.border ?? "transparent",
        } as CSSProperties : {}),
        ...layoutStyle,
      }}
      ref={ref}
      className={classNames("hjm-badge", className)}
      data-tone={category ? "category" : tone}
      data-size={size}
      data-variant={variant}
    >
      {leading === undefined ? null : (
        <span aria-hidden="true" className="hjm-badge__icon">
          {typeof leading === "function" ? leading(iconContext) : leading}
        </span>
      )}
      <span className="hjm-badge__label">{children}</span>
      {trailing === undefined ? null : (
        <span aria-hidden="true" className="hjm-badge__icon">{typeof trailing === "function" ? trailing(iconContext) : trailing}</span>
      )}
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
    /** Independent identity destination, outside the card activation host. */
    leadingAction?: Readonly<{label:string;onPress():void; disabled?: boolean }>;
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
    headingLevel?: CardHeadingLevel;
    selected?: boolean;
    /**
     * Whole-card activation. With `actions`, the card stays an article and a separate full-card button sits under the
     * action region, so actions remain independent buttons (never a button inside a button). Keep other children passive.
     */
    onActivate?: () => void;
    /** A native anchor preserves new-tab, copy-link and browser previews; it is exclusive with onActivate. */
    href?: string;
    /** Framework routing and product effects can wrap the shared anchor without replacing its placement. */
    renderLink?: (props: React.ComponentPropsWithRef<"a">) => ReactNode;
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
    leadingAction,
    media,
    backgroundMedia,
    backgroundInteraction,
    mediaBadges,
    badges,
    badgesAlign = cardRecipe.defaults.badgesAlign,
    mediaAction,
    actions,
    headerActions,
    headingLevel = cardRecipe.defaults.headingLevel,
    // An omitted selection is an ordinary action, not an unpressed toggle.
    selected,
    onActivate, href, renderLink,
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
  if (href !== undefined && (!href.trim() || onActivate)) throw new TypeError("Card href requires a destination and cannot combine with onActivate");
  if (renderLink && href === undefined) throw new TypeError("Card renderLink requires href");
  if ((onActivate || href !== undefined) && !props["aria-label"]?.trim()) {
    throw new TypeError("Interactive Card requires aria-label");
  }
  if (mediaAction && (onActivate || href !== undefined || !media || !mediaAction.label.trim())) throw new TypeError("Card mediaAction requires passive media, a label, and no whole-card activation");
  if (backgroundMedia && (media || mediaAction || onActivate || href !== undefined)) throw new TypeError("Card backgroundMedia is decorative and cannot combine with media, mediaAction, onActivate or href");
  if ((backgroundInteraction !== undefined || mediaBadges !== undefined) && !backgroundMedia) throw new TypeError("Card backgroundInteraction/mediaBadges require backgroundMedia");
  const hasHeader =
    leading !== undefined || title !== undefined || description !== undefined || headerActions !== undefined;
  // Whole-card open plus separate commands (2026-10-18 unairplane journey card: open + delete). A root button cannot
  // contain the action buttons, so the root stays an article and an overlay button carries the card's name and state.
  const overlay = href !== undefined || (onActivate !== undefined && Boolean(actions || headerActions || leadingAction));
  const { "aria-label": activationLabel, ...rootProps } = props;
  const activate = () => { if (!disabled) onActivate?.(); };

  const linkProps: React.ComponentPropsWithRef<"a"> = {
    href: disabled ? undefined : href, role: "link", className: "hjm-card__activator",
    "aria-label": activationLabel, "aria-disabled": disabled || undefined, tabIndex: disabled ? -1 : undefined,
  };
  // Link activation belongs to the shared card; a product-owned stretched link was its own second layout (Diairy).
  const destination = href === undefined ? null : !disabled && renderLink ? renderLink(linkProps) : <a {...linkProps} />;
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
      data-background-media={backgroundMedia ? true : undefined}
      data-state={(onActivate || href !== undefined || mediaAction) && disabled ? "disabled" : selected ? "selected" : "idle"}
      style={{ "--hjm-card-background-scrim": cardRecipe.backgroundMedia.scrim, "--hjm-card-background-foreground": cardRecipe.backgroundMedia.foreground, "--hjm-card-disabled-opacity": cardRecipe.interaction.disabledOpacity,
        "--hjm-card-pressed-opacity": cardRecipe.interaction.pressedOpacity, ...props.style } as CSSProperties}
    >
      {backgroundMedia ? <div className="hjm-card__background" aria-hidden="true">{backgroundMedia}<span className="hjm-card__scrim" /></div> : null}
      {backgroundInteraction === undefined ? null : <div className="hjm-card__background-interaction" data-slot="background-interaction">{backgroundInteraction}</div>}
      {mediaBadges === undefined ? null : <div className="hjm-card__media-badges" data-slot="media-badges">{mediaBadges}</div>}
      {media ? <div className="hjm-card__media" data-slot="media">{mediaAction ? <button type="button" className="hjm-card__media-action" aria-label={mediaAction.label} disabled={disabled} onClick={() => { if (!disabled) mediaAction.onActivate(); }}>
        {media}
        {mediaAction.icon ? <span className="hjm-card__media-icon" aria-hidden="true" style={{ insetInlineEnd: cardRecipe.mediaAction.inset, insetBlockEnd: cardRecipe.mediaAction.inset, width: cardRecipe.mediaAction.diameter, height: cardRecipe.mediaAction.diameter }}>{mediaAction.icon({ color: "currentColor", size: cardRecipe.mediaAction.iconSize })}</span> : null}
      </button> : media}</div> : null}
      <div
        className="hjm-card__body"
        data-slot="body"
        style={{ padding: surfaceGeometry.paddings[padding] }}
      >
        {badges === undefined ? null : <div className="hjm-card__badges" data-slot="badges" data-align={badgesAlign}>{badges}</div>}
        {hasHeader ? (
          <div className="hjm-card__header" data-slot="header">
            {leading === undefined ? null : (
              <span className="hjm-card__leading" data-slot="leading" data-interactive={leadingAction?"":undefined}>
                {leadingAction?<IdentityAction action={leadingAction}>{leading}</IdentityAction>:leading}
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
            {headerActions === undefined ? null : <div className="hjm-card__header-actions" data-slot="header-actions">{headerActions}</div>}
          </div>
        ) : null}
        {children === undefined ? null : (
          <div className="hjm-card__content" data-slot="content">{children}</div>
        )}
      </div>
      {destination}
      {overlay && href === undefined ? (
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

/** An attributed quotation reuses Card material while keeping quotation semantics and its caption together. */
export type QuoteCardProps = Omit<HTMLAttributes<HTMLElement>, "children" | "title"> & Readonly<{
  children: ReactNode;
  attribution?: string;
  renderMark?: (context: { color: string; size: number }) => ReactNode;
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function QuoteCard({ children, attribution, renderMark, ...props }: QuoteCardProps) {
  return <Card {...props} leading={<span className="hjm-quote-card__mark" aria-hidden="true">{renderMark?.({ color: "currentColor", size: cardRecipe.quotation.markSize }) ?? "“"}</span>}>
    <blockquote className="hjm-quote-card__body">
      {children}
      {attribution === undefined ? null : <footer><Text variant="caption" tone="muted">{attribution}</Text></footer>}
    </blockquote>
  </Card>;
}

export type ListRowProps = Omit<HTMLAttributes<HTMLElement>, "title" | "onClick"> &
  Readonly<{
    title: ReactNode;
    description?: ReactNode;
    leading?: ReactNode;
    /** Independent member destination; rendered beside, never inside, the row command. */
    leadingAction?: Readonly<{ label: string; onPress(): void; disabled?: boolean }>;
    trailing?: ReactNode;
    /**
     * `disclosure`: the row opens another screen. HJM draws the decorative chevron after `trailing`, inside the row
     * command (before any `trailingAction`), mirrored in RTL; size and color come from `listRowRecipe.accessories`.
     */
    trailingAccessory?: ListRowTrailingAccessory;
    /** Independent command outside the row's navigation target. */
    trailingAction?: ReactNode;
    /** Supply a framework Link without replacing the shared row layout. */
    renderLink?: (props: React.ComponentPropsWithRef<"a">) => ReactNode;
    density?: ListRowDensity;
    /** Semantic emphasis for destructive destinations; selection stays independent. */
    tone?: keyof typeof listRowRecipe.tones;
    /** Frame the ListRow paints around `leading`; the recipe owns its size. */
    leadingShape?: ListRowLeadingShape;
    /** Large member portraits use the shared 48px frame; icons retain the default frame. */
    leadingSize?: "default" | "large";
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
    leadingAction,
    trailing,
    trailingAccessory = listRowRecipe.defaults.trailingAccessory,
    trailingAction,
    renderLink,
    density: densityProp,
    tone = listRowRecipe.defaults.tone,
    leadingShape = "square",
    leadingSize = leadingShape === "circle" ? "large" : "default",
    selected,
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
  const separateActions = Boolean(trailingAction || leadingAction);
  const densityDefault = useHjmDensityDefault({
    comfortable: listRowRecipe.defaults.density,
    compact: "compact",
  });
  const density = densityProp ?? densityDefault;
  validateListRowTrailingAccessory(trailingAccessory);
  const accessory = trailingAccessory === "none" ? null : listRowRecipe.accessories[trailingAccessory];
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
        {leading ? <span className="hjm-list-row__leading" data-shape={leadingShape} data-size={leadingSize} data-placeholder="" /> : null}
        <span className="hjm-list-row__content">
          <span className="hjm-list-row__title" data-placeholder="" style={{ width: `${listRowRecipe.loading.titleWidthPercent}%` }} />
          {description ? <span className="hjm-list-row__description" data-placeholder="" style={{ width: `${listRowRecipe.loading.descriptionWidthPercent}%` }} /> : null}
        </span>
        {trailing ? <span className="hjm-list-row__trailing" data-placeholder="" style={{ width: listRowRecipe.loading.trailingWidth }} /> : null}
        {/* Keep the accessory's box so the text column does not shift when the real row arrives. */}
        {accessory ? <span className="hjm-list-row__accessory" data-accessory={trailingAccessory} style={{ inlineSize: glyph[accessory.glyph], blockSize: glyph[accessory.glyph] }} /> : null}
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
      style: separateActions ? style : { ...style, ...layoutStyle },
    },
    leading && !leadingAction
      ? <span className="hjm-list-row__leading" data-shape={leadingShape} data-size={leadingSize}>{leading}</span>
      : null,
    <span className="hjm-list-row__content">
      <span className="hjm-list-row__title">{title}</span>
      {description ? (
        <span className="hjm-list-row__description">{description}</span>
      ) : null}
    </span>,
    trailing ? <span className="hjm-list-row__trailing">{trailing}</span> : null,
    accessory
      ? <span className="hjm-list-row__accessory" data-accessory={trailingAccessory} aria-hidden="true">
          <Icon name={accessory.icon} size={accessory.glyph} weight={accessory.weight} />
        </span>
      : null,
  );
  const linked = href && renderLink ? renderLink(row.props as React.ComponentPropsWithRef<"a">) : row;
  // The frame owns the row surface and its bleed so the command and the separate action share one fill, as Native;
  // the action stays outside the link/button (styles.css `.hjm-list-row-frame`).
  return separateActions ? (
    <div className="hjm-list-row-frame" data-leading-action={leadingAction ? "" : undefined} data-trailing-action={trailingAction ? "" : undefined} data-density={density} data-leading={leading ? "" : undefined}
      data-state={disabled ? "disabled" : selected ? "selected" : "idle"} style={layoutStyle}>
      {leadingAction && leading ? <div className="hjm-list-row__profile"><IdentityAction action={leadingAction}>{leading}</IdentityAction></div> : null}
      {linked}
      {trailingAction ? <div className="hjm-list-row__action">{trailingAction}</div> : null}
    </div>
  ) : linked;
});
