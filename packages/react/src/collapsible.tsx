import {
  collapsibleRecipe,
  validateCollapsibleOpenState,
  type CollapsibleOpenState,
} from "@hjmds/design-contracts/components/collapsible";
import { forwardRef, useId, useState, type CSSProperties, type ReactNode } from "react";
import { classNames } from "./internal.js";

export type CollapsibleProps = CollapsibleOpenState &
  Readonly<{
    /** The control's label; it also tells the user what will appear. */
    trigger: ReactNode;
    children: ReactNode;
    disabled?: boolean;
    className?: string;
  }>;

export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(function Collapsible(
  { trigger, children, disabled = false, className, ...openState },
  forwardedRef,
) {
  validateCollapsibleOpenState(openState as CollapsibleOpenState);
  const controlled = openState.open !== undefined;
  const [internalOpen, setInternalOpen] = useState(openState.defaultOpen ?? false);
  const open = openState.open ?? internalOpen;
  const id = `${useId().replaceAll(":", "")}-collapsible`;
  return (
    <div
      ref={forwardedRef}
      className={classNames("hjm-collapsible", className)}
      data-state={open ? "open" : "closed"}
      style={{ "--hjm-collapsible-gap": `${collapsibleRecipe.gap}px` } as CSSProperties}
    >
      <button
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
      {/*
        Unmounted when closed rather than visually hidden: content left in the
        tree stays reachable by search and by a screen reader, which contradicts
        what the collapsed state says.
      */}
      {open ? (
        <div id={`${id}-content`} role="region" className="hjm-collapsible__content">{children}</div>
      ) : null}
    </div>
  );
});
