import {
  collapsibleRecipe,
  validateCollapsibleOpenState,
  type CollapsibleOpenState,
} from "@hjmds/design-contracts/components/collapsible";
import { forwardRef, useId, useState, type CSSProperties, type ReactNode } from "react";
import { classNames } from "./internal.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type CollapsibleProps = CollapsibleOpenState &
  Readonly<{
    /** The control's label; it also tells the user what will appear. */
    trigger: ReactNode;
    children: ReactNode;
    disabled?: boolean;
    /** Inline tools stay expanded without a disclosure trigger. */
    presentation?: "disclosure" | "inline";
    /** Preserve local input state while hidden; hidden content stays inaccessible. */
    keepMounted?: boolean;
    className?: string;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(function Collapsible(
  { trigger, children, disabled = false, presentation = "disclosure", keepMounted = false, className, layoutStyle, ...openState },
  forwardedRef,
) {
  validateCollapsibleOpenState(openState as CollapsibleOpenState);
  const controlled = openState.open !== undefined;
  const [internalOpen, setInternalOpen] = useState(openState.defaultOpen ?? false);
  const open = presentation === "inline" || (openState.open ?? internalOpen);
  const id = `${useId().replaceAll(":", "")}-collapsible`;
  return (
    <div
      ref={forwardedRef}
      className={classNames("hjm-collapsible", className)}
      data-state={open ? "open" : "closed"}
      style={{ ...layoutStyle, "--hjm-collapsible-gap": `${collapsibleRecipe.gap}px` } as CSSProperties}
    >
      <button
        hidden={presentation === "inline"}
        type="button"
        className="hjm-collapsible__trigger"
        aria-expanded={open}
        aria-controls={`${id}-content`}
        disabled={disabled}
        onClick={() => {
          const next = !open;
          if (!controlled) setInternalOpen(next);
          openState.onOpenChange?.(next);
        }}
      >
        {trigger}
        <span aria-hidden="true" className="hjm-collapsible__marker">{open ? "▾" : "▸"}</span>
      </button>
      {/* Optional persistence keeps theme changes and closing tools from erasing local
          drafts. The HTML hidden boundary removes closed content from focus and speech. */}
      {open || keepMounted ? (
        <div hidden={!open} id={`${id}-content`} role="region" className="hjm-collapsible__content">{children}</div>
      ) : null}
    </div>
  );
});
