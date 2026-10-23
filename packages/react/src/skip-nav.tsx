"use client";

import {
  skipNavRecipe,
  validateSkipNavDescriptor,
  type SkipNavDescriptor,
} from "@hjmds/design-contracts/components/skip-nav";
import { forwardRef, useEffect, useRef, type AnchorHTMLAttributes, type CSSProperties } from "react";
import { classNames } from "./internal.js";

// No `layoutStyle`: off-screen until focused, then pinned by the recipe offset; moving it would hide the focus target.
export type SkipNavProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children"> &
  SkipNavDescriptor &
  Readonly<{ className?: string }>;

export const SkipNav = forwardRef<HTMLAnchorElement, SkipNavProps>(function SkipNav(
  { targetId, label, className, onClick, ...props },
  forwardedRef,
) {
  validateSkipNavDescriptor({ targetId, label });
  const restorations = useRef(new Map<HTMLElement, () => void>());
  useEffect(() => () => { for (const restore of [...restorations.current.values()]) restore(); }, []);
  return (
    <a
      {...props}
      ref={forwardedRef}
      href={`#${targetId}`}
      className={classNames("hjm-skip-nav", className)}
      style={{
        "--hjm-skip-nav-min-height": `${skipNavRecipe.minHeight}px`,
        "--hjm-skip-nav-padding": `${skipNavRecipe.paddingHorizontal}px`,
        // The corner follows the nearest profile; pinned focus placement stays recipe-owned.
        "--hjm-skip-nav-radius": `var(--hjm-radius-md, ${skipNavRecipe.radius}px)`,
        "--hjm-skip-nav-offset": `${skipNavRecipe.offset}px`,
      } as CSSProperties}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
        const target = document.getElementById(targetId);
        if (!target) return;
        /*
          The hash alone only scrolls; focus stays behind in the navigation, so
          the next Tab returns to the links the user just skipped. Making the
          target programmatically focusable moves the caret with the view.
        */
        if (!target.hasAttribute("tabindex")) {
          target.setAttribute("tabindex", "-1");
          // The target belongs to the page; temporary focusability must not outlive this navigation.
          const restore = () => {
            if (target.getAttribute("tabindex") === "-1") target.removeAttribute("tabindex");
            target.removeEventListener("blur", restore);
            restorations.current.delete(target);
          };
          restorations.current.set(target, restore);
          target.addEventListener("blur", restore, { once: true });
        }
        target.focus({ preventScroll: false });
      }}
    >
      {label}
    </a>
  );
});
