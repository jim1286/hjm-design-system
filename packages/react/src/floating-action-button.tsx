import { forwardRef, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  floatingActionButtonRecipe as recipe, resolveFloatingActionButtonDescriptor,
  resolveFloatingActionButtonLayoutMode, resolveFloatingActionButtonContentClearance,
  type FloatingActionButtonDescriptor, type FloatingActionButtonLayoutMode,
} from "@hjmds/design-contracts/components/floating-action-button";
import { glyph, easing } from "@hjmds/design-contracts/foundations";
import { Button, type ButtonProps } from "./actions.js";
import { assignRef, classNames } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";

export { resolveFloatingActionButtonContentClearance };
export type FloatingActionButtonProps = Pick<ButtonProps, "onClick" | "onFocus" | "onBlur" | "id" | "className"> & Readonly<{
  descriptor: FloatingActionButtonDescriptor;
  renderIcon: (icon: Readonly<{ name: string; size: number; color: string; decorative: true }>) => ReactNode;
  safeAreaBottomInset?: number;
  /** Apply this to the scroll content's bottom padding, including multiline labels. */
  onContentClearanceChange: (clearance: number) => void;
}>;

/** One persistent button preserves focus while its label collapses. */
export const FloatingActionButton = forwardRef<HTMLButtonElement, FloatingActionButtonProps>(function FloatingActionButton({
  descriptor, renderIcon, safeAreaBottomInset = 0, onContentClearanceChange, className, ...props
}, forwardedRef) {
  const resolved = resolveFloatingActionButtonDescriptor(descriptor);
  const theme = useOptionalHjmTheme();
  const minimumClearance = resolveFloatingActionButtonContentClearance(safeAreaBottomInset);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    const measure = () => {
      const bottom = parseFloat(getComputedStyle(button).bottom);
      onContentClearanceChange(Math.max(minimumClearance, button.getBoundingClientRect().height
        + (Number.isFinite(bottom) ? bottom : recipe.margin + safeAreaBottomInset) + recipe.margin));
    };
    measure(); const observer = new ResizeObserver(measure); observer.observe(button);
    window.addEventListener("resize", measure);
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, [minimumClearance, safeAreaBottomInset, onContentClearanceChange]);
  return <Button {...props} ref={(node) => { buttonRef.current = node; assignRef(forwardedRef, node); }}
    className={classNames("hjm-fab", className)} size="large" tone="primary" shape="pill"
    data-mode={resolved.layoutMode} data-direction={theme?.environment.direction ?? "ltr"} data-reduced-motion={theme?.environment.reducedMotion ?? false} aria-label={resolved.resolvedAccessibilityLabel}
    style={{ "--hjm-fab-diameter": `${recipe.circle.diameter}px`, "--hjm-fab-margin": `${recipe.margin}px`,
      "--hjm-fab-safe-area": `${safeAreaBottomInset}px`, "--hjm-fab-duration": `${recipe.transition.duration}ms`,
      "--hjm-fab-easing": `cubic-bezier(${easing[recipe.transition.easing].join(",")})`,
      boxShadow: `0 ${recipe.shadow.offsetY}px ${recipe.shadow.radius}px color-mix(in srgb, ${recipe.shadow.color} ${recipe.shadow.opacity * 100}%, transparent)` } as CSSProperties}
    leading={<span aria-hidden="true" className="hjm-fab__icon">{renderIcon({ name: resolved.icon.name, size: glyph[recipe.circle.glyph], color: "currentColor", decorative: true })}</span>}>
    {resolved.label}
  </Button>;
});

/** Omit target for window scrolling; null waits for a custom scroll element to mount. */
export function useFloatingActionButtonScroll(target?: HTMLElement | null): FloatingActionButtonLayoutMode {
  const [layoutMode, setLayoutMode] = useState<FloatingActionButtonLayoutMode>("expanded");
  useEffect(() => {
    if (target === null) return;
    const source = target ?? window;
    let anchor = target?.scrollTop ?? window.scrollY;
    const onScroll = () => {
      const offset = Math.max(0, target?.scrollTop ?? window.scrollY);
      const delta = offset - anchor;
      // Half the edge margin ignores tiny trackpad tremors, but accumulates small
      // deltas until direction is clear instead of resetting on every frame.
      if (offset > 0 && Math.abs(delta) < recipe.margin / 2) return;
      anchor = offset;
      setLayoutMode((mode) => resolveFloatingActionButtonLayoutMode(offset === 0 || delta < 0 ? "toward-start" : "away-from-start", mode));
    };
    source.addEventListener("scroll", onScroll, { passive: true });
    return () => source.removeEventListener("scroll", onScroll);
  }, [target]);
  return layoutMode;
}
