import {
  skipNavRecipe,
  validateSkipNavDescriptor,
  type SkipNavDescriptor,
} from "@hjmds/design-contracts/components/skip-nav";
import { forwardRef, type AnchorHTMLAttributes, type CSSProperties } from "react";
import { classNames } from "./internal.js";

export type SkipNavProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children"> &
  SkipNavDescriptor &
  Readonly<{ className?: string }>;

export const SkipNav = forwardRef<HTMLAnchorElement, SkipNavProps>(function SkipNav(
  { targetId, label, className, onClick, ...props },
  forwardedRef,
) {
  validateSkipNavDescriptor({ targetId, label });
  return (
    <a
      {...props}
      ref={forwardedRef}
      href={`#${targetId}`}
      className={classNames("hjm-skip-nav", className)}
      style={{
        "--hjm-skip-nav-min-height": `${skipNavRecipe.minHeight}px`,
        "--hjm-skip-nav-padding": `${skipNavRecipe.paddingHorizontal}px`,
        "--hjm-skip-nav-radius": `${skipNavRecipe.radius}px`,
        "--hjm-skip-nav-offset": `${skipNavRecipe.offset}px`,
      } as CSSProperties}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const target = document.getElementById(targetId);
        if (!target) return;
        /*
          The hash alone only scrolls; focus stays behind in the navigation, so
          the next Tab returns to the links the user just skipped. Making the
          target programmatically focusable moves the caret with the view.
        */
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: false });
      }}
    >
      {label}
    </a>
  );
});
