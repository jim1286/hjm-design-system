import {
  buttonRecipe,
  type ButtonAlign,
  type ButtonEdge,
  type ButtonShape,
  type ButtonSize,
  type ButtonTone,
} from "@hjmds/design-contracts/recipes/base";

export type { ButtonAlign, ButtonEdge, ButtonShape };
import {
  iconButtonRecipe,
  linkRecipe,
  type IconButtonEdge,
  type IconButtonShape,
  type IconButtonSize,
  type IconButtonTone,
  type LinkTone,
  type LinkVariant,
} from "@hjmds/design-contracts/recipes";
import {
  Children,
  forwardRef,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type ButtonHTMLAttributes,
  type ForwardedRef,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { classNames } from "./internal.js";

export type { ButtonSize, ButtonTone } from "@hjmds/design-contracts/recipes/base";
export type {
  IconButtonEdge,
  IconButtonShape,
  IconButtonSize,
  IconButtonTone,
} from "@hjmds/design-contracts/recipes";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  Readonly<{
    tone?: ButtonTone;
    size?: ButtonSize;
    /** Frame geometry. `pill` replaces product code that overrode `border-radius`. */
    shape?: ButtonShape;
    /** Label placement inside the frame; `leading` suits a full-width row action. */
    align?: ButtonAlign;
    /** Toggle state. Paints the selected treatment and sets `aria-pressed`. */
    selected?: boolean;
    loading?: boolean;
    /** Explicit confirmed mutation result. Both text labels remain measured in every state. */
    completion?: Readonly<{ confirmed: boolean; label: string }>;
    leading?: ReactNode;
    trailing?: ReactNode;
    /**
     * Container edge(s) this button sits on. A ghost button overhangs that edge by its inline padding so the label
     * or trailing glyph lines up with the container inset (`resolveButtonEdgeOverhang`); framed tones keep their frame.
     */
    edge?: ButtonEdge;
      /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    tone = buttonRecipe.defaults.tone,
    size = buttonRecipe.defaults.size,
    shape = buttonRecipe.defaults.shape,
    align = buttonRecipe.defaults.align,
    selected,
    loading = false,
    completion,
    leading,
    trailing,
    edge,
    disabled,
    onClick,
    type = "button",
    className,
    children,
    layoutStyle,
    style,
    ...props
  },
  ref,
) {
  const textParts = completion ? Children.toArray(children) : [];
  if (completion && (!completion.label.trim() || typeof completion.confirmed !== "boolean" || textParts.length === 0 || !textParts.every(part => typeof part === "string" || typeof part === "number"))) {
    throw new TypeError("Button completion requires a nonempty label, a boolean confirmed value and text-only children");
  }
  const idleLabel = completion ? textParts.join("") : children;
  const currentLabel = completion?.confirmed && !loading ? completion.label : idleLabel;
  // Preserve a focusable disabled action (e.g. a Carousel boundary).
  const ariaDisabled = props["aria-disabled"] === true || props["aria-disabled"] === "true";
  const unavailable = disabled === true || loading || ariaDisabled;
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (unavailable) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };
  return (
    <button
      {...props}
      // The cap lives in the recipe, not in the stylesheet: one number, one place.
      style={{ "--hjm-button-label-lines": buttonRecipe.label.maxLines, ...style, ...layoutStyle } as CSSProperties}
      ref={ref}
      type={type}
      className={classNames("hjm-button", className)}
      data-tone={tone}
      data-size={size}
      data-shape={shape}
      data-align={align}
      data-edge={edge}
      {...(selected === undefined ? {} : { "data-selected": selected, "aria-pressed": selected })}
      data-state={loading ? "loading" : unavailable ? "disabled" : "idle"}
      aria-busy={loading || undefined}
      aria-disabled={unavailable || undefined}
      disabled={disabled}
      onClick={handleClick}
    >
      {leading}
      {completion ? <span style={{ display: "inline-grid", minWidth: 0 }}>
        {/* Both labels contribute intrinsic dimensions, including wrapping/font changes. */}
        <span aria-hidden="true" className="hjm-button__label" style={{ gridArea: "1 / 1", visibility: "hidden" }}>{idleLabel}</span>
        <span aria-hidden="true" className="hjm-button__label" style={{ gridArea: "1 / 1", visibility: "hidden" }}>{completion.label}</span>
        <span className="hjm-button__label" style={{ gridArea: "1 / 1", alignSelf: "center" }}>{currentLabel}</span>
      </span> : <span className="hjm-button__label">{children}</span>}
      {trailing}
      {loading ? <span className="hjm-button__loading-indicator" aria-hidden="true"><span className="hjm-button__spinner" /></span> : null}
    </button>
  );
});

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label"
> &
  Readonly<{
    label: string;
    tone?: IconButtonTone;
    size?: IconButtonSize;
    shape?: IconButtonShape;
    /** Toggle state. Paints the selected treatment and sets `aria-pressed`. */
    selected?: boolean;
    loading?: boolean;
    /**
     * Container edge(s) this button sits on (logical, RTL-aware). A ghost button keeps its touch target but overhangs
     * the edge by (diameter − glyph slot) / 2 so the glyph slot lines up with the container inset
     * (`resolveIconButtonEdgeOverhang`, 2026-10-17 measured audit). Framed tones align their frame and do not move.
     */
    edge?: IconButtonEdge;
    children: ReactNode;
      /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      label,
      tone = iconButtonRecipe.defaults.tone,
      size = iconButtonRecipe.defaults.size,
      shape = iconButtonRecipe.defaults.shape,
      selected,
      loading = false,
      edge,
      disabled,
      onClick,
      type = "button",
      className,
      children,
      layoutStyle,
      style,
      ...props
    },
    ref,
  ) {
    // Preserve a focusable disabled action (e.g. a Carousel boundary).
    const ariaDisabled = props["aria-disabled"] === true || props["aria-disabled"] === "true";
    const unavailable = disabled === true || loading || ariaDisabled;
    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      if (unavailable) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      onClick?.(event);
    };
    return (
      <button
        {...props}
        style={{ ...style, ...layoutStyle }}
        ref={ref}
        type={type}
        className={classNames("hjm-icon-button", className)}
        data-tone={tone}
        data-size={size}
        data-shape={shape}
        data-edge={edge}
        {...(selected === undefined ? {} : { "data-selected": selected, "aria-pressed": selected })}
        data-state={loading ? "loading" : unavailable ? "disabled" : "idle"}
        aria-label={label}
        aria-busy={loading || undefined}
        aria-disabled={unavailable || undefined}
        disabled={disabled}
        onClick={handleClick}
      >
        {loading ? <span className="hjm-button__spinner" aria-hidden="true" /> : children}
      </button>
    );
  },
);

export type LinkRenderProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  Readonly<{
    children: ReactNode;
    ref: ForwardedRef<HTMLAnchorElement>;
    "data-tone": LinkTone;
    "data-variant": LinkVariant;
    "data-state": "disabled" | "idle";
  }>;

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  Readonly<{
    tone?: LinkTone;
    variant?: LinkVariant;
    disabled?: boolean;
    leading?: ReactNode;
    trailing?: ReactNode;
    /** Framework adapter, for example Next.js Link, while HJM keeps link semantics and state. */
    renderAnchor?: (props: LinkRenderProps) => ReactElement;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    tone = linkRecipe.defaults.tone,
    variant = linkRecipe.defaults.variant,
    disabled = false,
    leading,
    trailing,
    renderAnchor,
    target,
    rel,
    tabIndex,
    onClick,
    className,
    children,
    layoutStyle,
    ...props
  },
  ref,
) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };
  const anchorProps: LinkRenderProps = {
    ...props,
    // `renderAnchor` adapters receive the merged placement, so a framework Link
    // gets the same position as the plain <a>.
    ...(props.style === undefined && layoutStyle === undefined ? {} : { style: { ...props.style, ...layoutStyle } }),
    ref,
    className: classNames("hjm-link", className),
    "data-tone": tone,
    "data-variant": variant,
    "data-state": disabled ? "disabled" : "idle",
    "aria-disabled": disabled || undefined,
    tabIndex: disabled ? -1 : tabIndex,
    target,
    rel: rel ?? (target === "_blank" ? "noreferrer noopener" : undefined),
    onClick: handleClick,
    children: (
      <>
      {leading}
      <span>{children}</span>
      {trailing}
      </>
    ),
  };
  return renderAnchor ? renderAnchor(anchorProps) : <a {...anchorProps} />;
});
