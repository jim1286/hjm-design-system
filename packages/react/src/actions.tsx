import {
  buttonRecipe,
  type ButtonSize,
  type ButtonTone,
} from "@hjm/design-contracts/recipes/base";
import {
  iconButtonRecipe,
  linkRecipe,
  type IconButtonShape,
  type IconButtonSize,
  type IconButtonTone,
  type LinkTone,
  type LinkVariant,
} from "@hjm/design-contracts/recipes";
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ForwardedRef,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { classNames } from "./internal.js";

export type { ButtonSize, ButtonTone } from "@hjm/design-contracts/recipes/base";
export type {
  IconButtonShape,
  IconButtonSize,
  IconButtonTone,
} from "@hjm/design-contracts/recipes";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  Readonly<{
    tone?: ButtonTone;
    size?: ButtonSize;
    loading?: boolean;
    leading?: ReactNode;
    trailing?: ReactNode;
  }>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    tone = buttonRecipe.defaults.tone,
    size = buttonRecipe.defaults.size,
    loading = false,
    leading,
    trailing,
    disabled,
    onClick,
    type = "button",
    className,
    children,
    ...props
  },
  ref,
) {
  const unavailable = disabled === true || loading;
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      className={classNames("hjm-button", className)}
      data-tone={tone}
      data-size={size}
      data-state={loading ? "loading" : unavailable ? "disabled" : "idle"}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      disabled={disabled}
      onClick={handleClick}
    >
      {loading ? <span className="hjm-button__spinner" aria-hidden="true" /> : leading}
      <span className="hjm-button__label">{children}</span>
      {trailing}
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
    loading?: boolean;
    children: ReactNode;
  }>;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      label,
      tone = iconButtonRecipe.defaults.tone,
      size = iconButtonRecipe.defaults.size,
      shape = iconButtonRecipe.defaults.shape,
      loading = false,
      disabled,
      onClick,
      type = "button",
      className,
      children,
      ...props
    },
    ref,
  ) {
    const unavailable = disabled === true || loading;
    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      if (loading) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      onClick?.(event);
    };
    return (
      <button
        {...props}
        ref={ref}
        type={type}
        className={classNames("hjm-icon-button", className)}
        data-tone={tone}
        data-size={size}
        data-shape={shape}
        data-state={loading ? "loading" : unavailable ? "disabled" : "idle"}
        aria-label={label}
        aria-busy={loading || undefined}
        aria-disabled={loading || undefined}
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
