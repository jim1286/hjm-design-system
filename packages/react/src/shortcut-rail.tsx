"use client";

import { useLayoutEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { chipRecipe } from "@hjmds/design-contracts/recipes";
import { shortcutRailRecipe, validateShortcutRail, type ShortcutRailItem } from "@hjmds/design-contracts/shortcut-rail";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { classNames } from "./internal.js";

export type ShortcutRailProps<Item extends ShortcutRailItem = ShortcutRailItem> = Omit<HTMLAttributes<HTMLUListElement>, "children"> & Readonly<{
  // Infer payload from items; a product's base-typed handler must not erase extra fields.
  label: string; items: readonly Item[]; onAction(item: NoInfer<Item>): void;
  /** Controls before the item list, in the same scroll/wrap flow. */
  leading?: ReactNode;
  layout?: "scroll" | "wrap";
  size?: keyof typeof chipRecipe.sizes; renderLeading?(item: NoInfer<Item>): ReactNode; layoutStyle?: HjmCompositionStyleProp;
}> & (Readonly<{ onRemove(item: NoInfer<Item>): void; removeLabel(item: NoInfer<Item>): string; removeIcon?: ReactNode; isRemovable?(item: NoInfer<Item>): boolean }>
  | Readonly<{ onRemove?: never; removeLabel?: never; removeIcon?: never; isRemovable?: never }>);

export function ShortcutRail<Item extends ShortcutRailItem>({ label, items, onAction, onRemove, removeLabel, removeIcon, isRemovable, leading,
  layout = shortcutRailRecipe.defaults.layout, size = chipRecipe.defaults.size, renderLeading, layoutStyle, className, style, ...props }: ShortcutRailProps<Item>) {
  validateShortcutRail(items, label, layout);
  const root = useRef<HTMLUListElement>(null), leadingRoot = useRef<HTMLLIElement>(null), buttons = useRef(new Map<string, HTMLButtonElement>());
  const pending = useRef<{ removed: string; index: number } | null>(null);
  const hasLeading = leading != null && leading !== false;
  const removable = (item: Item) => !!onRemove && isRemovable?.(item) !== false;
  const identity = JSON.stringify(items.map(item => [item.id, removable(item)]));
  useLayoutEffect(() => {
    const request = pending.current;
    if (!request) return;
    const retained = items.find(item => item.id === request.removed);
    if (retained && removable(retained)) return; // A refused clear must leave its focused remove button retryable.
    pending.current = null;
    // Clearing may keep the same stable item as a non-removable default (for example the current season).
    const next = retained && !retained.disabled ? retained : items.slice(request.index).find(item => !item.disabled) ?? [...items.slice(0, request.index)].reverse().find(item => !item.disabled);
    const control = leadingRoot.current?.querySelector<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]');
    (next ? buttons.current.get(next.id) : control ?? root.current)?.focus({ preventScroll: true });
  }, [identity]);
  return <ul {...props} ref={root} aria-label={label} tabIndex={-1} className={classNames("hjm-shortcut-rail", className)}
    data-layout={layout} data-size={size} data-empty={!items.length && !hasLeading || undefined} style={{ ...style, ...layoutStyle, gap: shortcutRailRecipe.gap }}>
    {hasLeading ? <li ref={leadingRoot} style={{ display: "inline-flex", flex: "0 0 auto", alignItems: "center" }}
      onFocusCapture={event => event.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" })}>{leading}</li> : null}
    {items.map((item, index) => <li key={item.id} className="hjm-shortcut-rail__item" data-disabled={item.disabled || undefined}>
      <button ref={node => { if (node) buttons.current.set(item.id, node); else buttons.current.delete(item.id); }}
        type="button" disabled={item.disabled} aria-label={item.label} aria-description={item.description} className="hjm-shortcut-rail__action"
        onFocus={event => event.currentTarget.closest("li")?.scrollIntoView({ block: "nearest", inline: "nearest" })} onClick={() => onAction(item)}>
        {renderLeading ? <span aria-hidden="true">{renderLeading(item)}</span> : null}<span>{item.label}</span>
      </button>
      {onRemove && removable(item) ? <button type="button" disabled={item.disabled} aria-label={removeLabel(item)} className="hjm-shortcut-rail__remove"
        onClick={event => {
          // Reconcile only a focused removal after the product actually removes its stable ID.
          if (event.currentTarget === document.activeElement) pending.current = { removed: item.id, index };
          onRemove(item);
        }}><span aria-hidden="true">{removeIcon ?? "×"}</span></button> : null}
    </li>)}
  </ul>;
}
