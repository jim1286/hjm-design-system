import { useEffect, useImperativeHandle, useRef, useState, type ReactNode, type Ref } from "react";
import { chatMessageRecipe, screenPatternRecipe, type ChatReactionSummaryItem } from "@hjmds/design-contracts/screen-patterns";
import type { MenuItemTone } from "@hjmds/design-contracts/recipes";
import { Text, VisuallyHidden } from "../layout.js";
import { Popover } from "../popover.js";
import { ReactionPicker, type ReactionPickerProps } from "../reaction-picker.js";

/** One row of the hold menu. Products supply copy and icons; HJM owns order, size and tone. */
export type MessageMenuAction = Readonly<{ id: string; label: string; icon?: ReactNode; onPress(): void; disabled?: boolean; /** Shows › for rows that open a further list. */ submenu?: boolean;
  /** Same vocabulary as Menu items: `danger` for destructive rows such as delete (default `neutral`). */ tone?: MenuItemTone }>;
/** Lets the owning message open the same hold menu from its reaction summary. */
export type MessageReactionsHandle = Readonly<{ open(): void }>;
type Props = ReactionPickerProps & Readonly<{ closeLabel: string; menuAction?: Readonly<{label:string;onPress():void;disabled?:boolean}>; children: ReactNode; interactiveContent?:boolean; /** Comments reuse the hold menu without chat bubble styling. */ triggerClassName?: string;
  replyAction?: Readonly<{label:string;onPress():void;disabled?:boolean;icon?:ReactNode}>;
  /** Shown above the actions, e.g. the exact send time that a run only shows once. */
  menuTitle?: string;
  menuActions?: readonly MessageMenuAction[];
  /** Always last and in the danger tone, matching the measured reference menu (2026-10-16). */
  reportAction?: Readonly<{label:string;onPress():void;disabled?:boolean;icon?:ReactNode}>;
  menuRef?: Ref<MessageReactionsHandle> }>;
/** Chat-specific trigger translation; Popover retains collision, focus, Escape and outside dismissal. */
export function MessageReactions({ children, closeLabel, menuAction, interactiveContent=false, triggerClassName = "hjm-chat-message__bubble", replyAction, menuTitle, menuActions = [], reportAction, menuRef, ...picker }: Props) {
  // Reply leads and report trails; legacy single menuAction keeps its place before report.
  const rows: MessageMenuAction[] = [
    ...(replyAction ? [{ id: "reply", ...replyAction }] : []),
    ...menuActions,
    ...(menuAction ? [{ id: "menu", ...menuAction }] : []),
    ...(reportAction ? [{ id: "report", ...reportAction, tone: "danger" as const }] : []),
  ];
  const [open, setOpen] = useState(false);
  const press = useRef<{ timer: ReturnType<typeof setTimeout>; x: number; y: number } | null>(null);
  const held = useRef(false);
  const cancel = () => { if (press.current) clearTimeout(press.current.timer); press.current = null; };
  useEffect(() => () => { if (press.current) clearTimeout(press.current.timer); }, []);
  useEffect(() => { if (picker.disabled) { cancel(); setOpen(false); } }, [picker.disabled]);
  useImperativeHandle(menuRef, () => ({ open: () => { if (!picker.disabled) setOpen(true); } }), [picker.disabled]);
  return <Popover open={open && !picker.disabled} onOpenChange={(next) => { if (!next) setOpen(false); }} title={picker.label} closeLabel={closeLabel}
    descriptor={{ placement: "top", align: "start" }} className="hjm-message-reactions" trigger={<div
      className={triggerClassName} tabIndex={picker.disabled ? -1 : 0} role={interactiveContent?"group":"button"} aria-label={picker.label} aria-disabled={picker.disabled}
      onContextMenu={event => { event.preventDefault(); cancel(); if (!picker.disabled) setOpen(true); }}
      // Only the bubble itself opens reactions: with interactiveContent, Enter/Space on a nested
      // link or button must keep its native activation instead of being swallowed here.
      onKeyDown={event => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ") && !picker.disabled) { event.preventDefault(); setOpen(true); } }}
      onPointerDown={event => {
        if (picker.disabled || event.button !== 0 || (event.target as HTMLElement).closest("button,a,input,textarea")) return;
        cancel(); held.current = false;
        const { clientX: x, clientY: y } = event;
        press.current = { x, y, timer: setTimeout(() => { held.current = true; press.current = null; setOpen(true); }, screenPatternRecipe.reactionHoldMs) };
      }}
      onPointerMove={event => { const start = press.current; if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > screenPatternRecipe.reactionMoveTolerance) cancel(); }}
      onPointerCancel={cancel} onPointerLeave={cancel} onPointerUp={cancel}
      onClickCapture={event => { if (held.current) { event.preventDefault(); event.stopPropagation(); held.current = false; } }}
    >{children}</div>}>
    {/* Action-only menus (comments, 2026-10-16 reference) pass no options and show no strip. */}
    {picker.options.length ? <ReactionPicker {...picker} layout="strip" onValueChange={value => { picker.onValueChange(value); setOpen(false); }} /> : null}
    {menuTitle || rows.length ? <div className="hjm-message-menu">
      {menuTitle ? <Text variant="caption" tone="muted" className="hjm-message-menu__title">{menuTitle}</Text> : null}
      {rows.map(row => <button key={row.id} type="button" className="hjm-message-menu__item" data-tone={row.tone === "danger" ? "danger" : undefined} disabled={row.disabled} onClick={() => { setOpen(false); row.onPress(); }}>
        {row.icon ? <span className="hjm-message-menu__icon" aria-hidden="true">{row.icon}</span> : null}<span className="hjm-message-menu__label">{row.label}</span>{row.submenu ? <span className="hjm-message-menu__chevron" aria-hidden="true">›</span> : null}</button>)}
    </div> : null}
  </Popover>;
}

/** ChatMessage strips its summary before spreading the rest into the hold menu. */
export function omitReactionSummary<T extends Readonly<{ summary?: unknown }>>({ summary: _summary, ...rest }: T): Omit<T, "summary"> {
  return rest;
}

/**
 * Current reactions as one button beside the time; pressing it opens the hold menu (the press target and its name
 * are the whole pill, so per-emoji parts are hidden from assistive tech). The pill shows the brand border when the
 * reader's own reaction is among the items.
 */
export function ReactionSummaryButton({ label, items, selected, disabled, onPress }: Readonly<{ label: string; items: readonly (ChatReactionSummaryItem & Readonly<{ showCount: boolean }>)[]; selected: string | null; disabled: boolean; onPress(): void }>) {
  const r = chatMessageRecipe.reactionSummary;
  const mine = items.some(item => item.id === selected);
  return <button type="button" className="hjm-chat-message__reaction-summary" aria-label={label} disabled={disabled} data-selected={mine || undefined} onClick={onPress}
    style={{ minBlockSize: r.minHeight, paddingInline: r.paddingInline, gap: r.itemGap }}>
    {items.map(item => <span key={item.id} aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", gap: r.emojiGap }}><span>{item.emoji}</span>{item.showCount ? <Text as="span" variant="caption">{item.count}</Text> : null}</span>)}
  </button>;
}

/**
 * Read-only counts (`summary.readOnly`, 2026-10-18 Utilverse guests who cannot react): the same place and items as
 * the pill, as plain caption text without the pill surface, so it is neither drawn nor announced as a control. The
 * product label is the text screen readers read; the drawn emoji and numbers are hidden from them.
 */
export function ReactionSummaryText({ label, items }: Readonly<{ label: string; items: readonly (ChatReactionSummaryItem & Readonly<{ showCount: boolean }>)[] }>) {
  const r = chatMessageRecipe.reactionSummary;
  return <span className="hjm-chat-message__reaction-counts" style={{ minBlockSize: r.minHeight, gap: r.itemGap }}>
    <VisuallyHidden>{label}</VisuallyHidden>
    {items.map(item => <span key={item.id} aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", gap: r.emojiGap }}><span>{item.emoji}</span>{item.showCount ? <Text as="span" variant="caption" tone="muted">{item.count}</Text> : null}</span>)}
  </span>;
}
