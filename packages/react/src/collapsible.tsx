"use client";

import {
  collapsibleRecipe,
  validateCollapsibleOpenState,
  type CollapsibleOpenState,
} from "@hjmds/design-contracts/components/collapsible";
import { forwardRef, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { assignRef, classNames } from "./internal.js";
import { Icon } from "./supplemental-display.js";
import { Spinner } from "./internal/spinner.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type CollapsibleProps = CollapsibleOpenState &
  Readonly<{
    /** The control's label; it also tells the user what will appear. */
    trigger: ReactNode;
    /** Accessible action name when the trigger is artwork or has a shorter visible label. */
    triggerLabel?: string;
    /** Static heading beside the disclosure action, outside the button's accessible name. */
    title?: ReactNode;
    /** While content is being prepared, replace the action with one labeled spinner. */
    pendingLabel?: string;
    children: ReactNode;
    disabled?: boolean;
    /** Inline tools stay expanded without a disclosure trigger. */
    presentation?: "disclosure" | "inline";
    /** Preserve local input state while hidden; hidden content stays inaccessible. */
    keepMounted?: boolean;
    /**
     * `none` leaves the open/closed mark to the trigger, which then places `CollapsibleMarker` itself — for triggers
     * whose label is not a single row, where the end-aligned mark floated alone (FolderPreview, 2026-10-17 review).
     */
    marker?: "end" | "none";
    className?: string;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(function Collapsible(
  { trigger, triggerLabel, title, pendingLabel, children, disabled = false, presentation = "disclosure", keepMounted = false, marker = "end", className, layoutStyle, ...openState },
  forwardedRef,
) {
  validateCollapsibleOpenState(openState as CollapsibleOpenState);
  const controlled = openState.open !== undefined;
  const [internalOpen, setInternalOpen] = useState(openState.defaultOpen ?? false);
  const open = presentation === "inline" || (openState.open ?? internalOpen);
  const host = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const focusedContent = useRef(false);
  const contentOpen = open && pendingLabel === undefined;
  const wasOpen = useRef(contentOpen);
  useLayoutEffect(() => {
    // A controlled close can remove or hide the currently focused input without
    // activating the trigger. Recover only that focus, never an outside control.
    const active = host.current?.ownerDocument.activeElement;
    if (wasOpen.current && !contentOpen && focusedContent.current &&
      (content.current?.contains(active ?? null) || active === host.current?.ownerDocument.body)) {
      (disabled || pendingLabel !== undefined ? host.current : button.current)?.focus();
    }
    if (!contentOpen) focusedContent.current = false;
    wasOpen.current = contentOpen;
  }, [contentOpen, disabled, pendingLabel]);
  const id = `${useId().replaceAll(":", "")}-collapsible`;
  return (
    <div
      ref={node => { host.current = node; assignRef(forwardedRef, node); }}
      tabIndex={-1}
      className={classNames("hjm-collapsible", className)}
      data-state={open ? "open" : "closed"}
      aria-busy={pendingLabel === undefined ? undefined : true}
      style={{ ...layoutStyle, "--hjm-collapsible-gap": `${collapsibleRecipe.gap}px` } as CSSProperties}
    >
      <div className="hjm-collapsible__header" data-titled={title == null ? undefined : true} hidden={presentation === "inline"}>
      {title == null ? null : <div className="hjm-collapsible__title">{title}</div>}
      {pendingLabel === undefined ? <button
        ref={button}
        hidden={presentation === "inline"}
        type="button"
        className="hjm-collapsible__trigger"
        aria-label={triggerLabel}
        aria-expanded={open}
        aria-controls={`${id}-content`}
        disabled={disabled}
        onClick={event => {
          if (disabled || presentation === "inline") return;
          // Safari does not focus buttons on pointer activation; keep the closing
          // disclosure as the keyboard origin before its focused content disappears.
          if (open) event.currentTarget.focus();
          const next = !open;
          if (!controlled) setInternalOpen(next);
          openState.onOpenChange?.(next);
        }}
      >
        {trigger}
        {marker === "end" ? <CollapsibleMarker open={open} /> : null}
      </button> : <span className="hjm-collapsible__pending"><Spinner label={pendingLabel} size="small" /></span>}
      </div>
      {/* Optional persistence keeps theme changes and closing tools from erasing local
          drafts. The HTML hidden boundary removes closed content from focus and speech. */}
      {contentOpen || keepMounted ? (
        <div ref={content} onFocusCapture={() => { focusedContent.current = true; }} onBlurCapture={event => { if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) focusedContent.current = false; }} hidden={!contentOpen} id={`${id}-content`} role="region" className="hjm-collapsible__content">{children}</div>
      ) : null}
    </div>
  );
});

/** The decorative open/closed mark; the expanded state itself travels through the trigger's aria-expanded. */
export function CollapsibleMarker({ open }: Readonly<{ open: boolean }>) {
  // The shared chevron at glyph.sm: the text "▸" rendered about 8px and read as static text (2026-10-17 review).
  // `chevronEnd` is a logical icon, so Icon mirrors it in RTL.
  return <span aria-hidden="true" className="hjm-collapsible__marker" data-state={open ? "open" : "closed"}><Icon name={open ? "chevronDown" : "chevronEnd"} size="sm" tone="secondary" decorative /></span>;
}
