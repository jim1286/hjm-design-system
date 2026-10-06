// Shared by feedback and screen shells without pulling unrelated feedback UI
// into the lightweight screens entry. The public import remains /feedback.
import { forwardRef, type HTMLAttributes } from "react";
import { spinnerRecipe, type SpinnerSize, type SpinnerTone } from "@hjmds/design-contracts/recipes";
import type { HjmCompositionStyleProp } from "../composition-style.js";
import { classNames } from "../internal.js";

export type SpinnerProps = HTMLAttributes<HTMLSpanElement> &
  Readonly<{
    label: string;
    size?: SpinnerSize;
    tone?: SpinnerTone;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  {
    label,
    size = spinnerRecipe.defaults.size,
    tone = spinnerRecipe.defaults.tone,
    className,
    layoutStyle,
    ...props
  },
  ref,
) {
  return (
    <span
      {...props}
      style={{ ...props.style, ...layoutStyle }}
      ref={ref}
      className={classNames("hjm-spinner", className)}
      data-size={size}
      data-tone={tone}
      role="status"
      aria-live="polite"
    >
      <span className="hjm-spinner__glyph" aria-hidden="true" />
      <span className="hjm-visually-hidden">{label}</span>
    </span>
  );
});

