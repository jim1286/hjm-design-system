import { useCallback, useLayoutEffect, useRef, useState, useMemo, type ReactNode } from "react";
import { Accessibility, type DragStartEvent, type DragEndEvent } from "@dnd-kit/dom";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable, isSortable } from "@dnd-kit/react/sortable";
import { reorderIntent, validateItems, type SortableItem, type SortableLabels, type ReorderIntent } from "@hjmds/design-contracts/components/interaction-adapters";
import { Button } from "./actions.js";
import { useHjmTheme } from "./provider.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type SortableCollectionProps = {
  items: readonly SortableItem[]; label: string; labels: SortableLabels;
  renderItem(item: SortableItem): ReactNode;
  onCommit(intent: ReorderIntent): void; onCancel?(): void; disabled?: boolean;
  /** Canonical layout-only placement on the list (DragDropProvider has no box of its own). */
  layoutStyle?: HjmCompositionStyleProp;
};
function Row({ item, index, children, disabled, reduced, labels, move, count }: {
  item: SortableItem; index: number; children: ReactNode; disabled: boolean; reduced: boolean;
  labels: SortableLabels; move(to: number): void; count: number;
}) {
  const { ref, handleRef } = useSortable({ id: item.id, index, disabled: disabled || item.disabled === true,
    ...(reduced ? { transition: null } : {}) });
  return <li ref={ref} data-item-id={item.id} style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", alignItems: "center", gap: "var(--hjm-space-sm)", paddingBlock: "var(--hjm-space-xs)" }}>
    <Button ref={handleRef} tone="ghost" type="button" disabled={disabled || item.disabled} aria-label={labels.handle(item)}
      style={{ minWidth: 44, minHeight: 44, touchAction: "none", cursor: "grab" }}>⠿</Button>
    <div style={{ minWidth: 0, overflowWrap: "anywhere" }}>{children}</div>
    {/* Separate action line preserves readable item labels at 200% text in narrow hosts. */}
    <div style={{ gridColumn: "1 / -1", display: "flex", flexWrap: "wrap", gap: "var(--hjm-space-xs)" }}>
      <Button tone="ghost" disabled={disabled || item.disabled || index === 0} onClick={() => move(index - 1)}>{labels.previous(item)}</Button>
      <Button tone="ghost" disabled={disabled || item.disabled || index === count - 1} onClick={() => move(index + 1)}>{labels.next(item)}</Button>
    </div>
  </li>;
}
/** Small controlled collections only; persistence and rollback belong to the host. */
export function SortableCollection(props: SortableCollectionProps) {
  validateItems(props.items);
  if (!props.label.trim()) throw new TypeError("SortableCollection needs a label");
  const { environment } = useHjmTheme();
  const [announcement, setAnnouncement] = useState("");
  const latest = useRef(props); latest.current = props;
  const accessibility = useMemo(() => Accessibility.configure({
    screenReaderInstructions: { draggable: props.labels.instructions },
    announcements: {
      dragstart: ({ operation }: DragStartEvent) => {
        const item = latest.current.items.find(i => i.id === operation.source?.id);
        return item ? latest.current.labels.dragStart(item) : undefined;
      },
      dragend: ({ canceled }: DragEndEvent) => canceled ? latest.current.labels.dragCancel : undefined,
      // HJM emits the accepted controlled position, never raw upstream IDs.
      dragover: () => undefined, dragmove: () => undefined,
    },
  }), [props.labels.instructions]);
  const plugins = useCallback((defaults: readonly unknown[]) => [...defaults.filter(plugin => plugin !== Accessibility), accessibility],
    // A fresh function every render made the provider reassign manager.plugins on each render (2026-09-30 review).
    [accessibility]) as unknown as NonNullable<Parameters<typeof DragDropProvider>[0]["plugins"]>;
  const list = useRef<HTMLUListElement>(null);
  // Moving a row re-parents its DOM node, and an edge move disables the pressed button: both dropped focus to
  // <body> after a keyboard reorder. Refocus the moved row once the host has accepted the new order.
  const refocus = useRef<{ id: string; direction: "previous" | "next" } | null>(null);
  const snapshot = useRef("");
  const signature = JSON.stringify(props.items);
  useLayoutEffect(() => {
    const pending = refocus.current;
    if (!pending) return;
    const row = list.current?.querySelector<HTMLElement>(`[data-item-id="${CSS.escape(pending.id)}"]`);
    if (!row) return;
    refocus.current = null;
    const [handle, previous, next] = [...row.querySelectorAll<HTMLButtonElement>("button")];
    const preferred = pending.direction === "previous" ? previous : next;
    const fallback = pending.direction === "previous" ? next : previous;
    (preferred && !preferred.disabled ? preferred : fallback && !fallback.disabled ? fallback : handle)?.focus();
    // Announce only once the controlled order reflects the move, never a proposed position.
    const index = props.items.findIndex(item => item.id === pending.id);
    if (index >= 0) setAnnouncement(props.labels.position(props.items[index]!, index + 1, props.items.length));
  }, [signature]); // eslint-disable-line react-hooks/exhaustive-deps
  const commit = (id: string, to: number, source: ReorderIntent["source"]) => {
    if (props.disabled) return;
    const intent = reorderIntent(props.items, id, to, source);
    if (!intent) {
      // A rejected drag (fixed row in range, same index) must still end the host's drag session.
      if (source === "drag") props.onCancel?.();
      return;
    }
    if (source === "keyboard") refocus.current = { id, direction: intent.toIndex < intent.fromIndex ? "previous" : "next" };
    else refocus.current = { id, direction: "next" };
    props.onCommit(intent);
  };
  return <DragDropProvider plugins={plugins} onDragStart={() => { snapshot.current = signature; }} onDragEnd={event => {
    if (event.canceled || snapshot.current !== signature) { props.onCancel?.(); return; }
    const source = event.operation.source;
    if (source && isSortable(source)) commit(String(source.id), source.index, "drag");
  }}>
    <ul ref={list} aria-label={props.label} style={{ listStyle: "none", margin: 0, padding: 0, ...props.layoutStyle }}>
      {props.items.map((item, index) => <Row key={item.id} item={item} index={index} count={props.items.length}
        disabled={props.disabled ?? false} reduced={environment.reducedMotion} labels={props.labels}
        move={to => commit(item.id, to, "keyboard")}>{props.renderItem(item)}</Row>)}
    </ul>
    <span role="status" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)" }}>{announcement}</span>
  </DragDropProvider>;
}
