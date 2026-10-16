import { useEffect, useRef, useState, type ReactNode } from "react";
import { screenPatternRecipe } from "@hjmds/design-contracts/screen-patterns";
import { Text } from "../layout.js";
import { Popover } from "../popover.js";
import { ReactionPicker, type ReactionPickerProps } from "../reaction-picker.js";

/** One row of the hold menu. Products supply copy and icons; HJM owns order, size and tone. */
export type MessageMenuAction = Readonly<{ id: string; label: string; icon?: ReactNode; onPress(): void; disabled?: boolean; /** Shows › for rows that open a further list. */ submenu?: boolean }>;
type Props = ReactionPickerProps & Readonly<{ closeLabel: string; menuAction?: Readonly<{label:string;onPress():void;disabled?:boolean}>; children: ReactNode; interactiveContent?:boolean; /** Comments reuse the hold menu without chat bubble styling. */ triggerClassName?: string;
  replyAction?: Readonly<{label:string;onPress():void;disabled?:boolean;icon?:ReactNode}>;
  /** Shown above the actions, e.g. the exact send time that a run only shows once. */
  menuTitle?: string;
  menuActions?: readonly MessageMenuAction[];
  /** Always last and in the danger tone, matching the measured reference menu (2026-10-16). */
  reportAction?: Readonly<{label:string;onPress():void;disabled?:boolean;icon?:ReactNode}> }>;
/** Chat-specific trigger translation; Popover retains collision, focus, Escape and outside dismissal. */
export function MessageReactions({ children, closeLabel, menuAction, interactiveContent=false, triggerClassName = "hjm-chat-message__bubble", replyAction, menuTitle, menuActions = [], reportAction, ...picker }: Props) {
  // Reply leads and report trails; legacy single menuAction keeps its place before report.
  const rows: (MessageMenuAction & { danger?: boolean })[] = [
    ...(replyAction ? [{ id: "reply", ...replyAction }] : []),
    ...menuActions,
    ...(menuAction ? [{ id: "menu", ...menuAction }] : []),
    ...(reportAction ? [{ id: "report", ...reportAction, danger: true }] : []),
  ];
  const [open, setOpen] = useState(false);
  const press = useRef<{ timer: ReturnType<typeof setTimeout>; x: number; y: number } | null>(null);
  const held = useRef(false);
  const cancel = () => { if (press.current) clearTimeout(press.current.timer); press.current = null; };
  useEffect(() => () => { if (press.current) clearTimeout(press.current.timer); }, []);
  useEffect(() => { if (picker.disabled) { cancel(); setOpen(false); } }, [picker.disabled]);
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
      {rows.map(row => <button key={row.id} type="button" className="hjm-message-menu__item" data-tone={row.danger ? "danger" : undefined} disabled={row.disabled} onClick={() => { setOpen(false); row.onPress(); }}>
        {row.icon ? <span className="hjm-message-menu__icon" aria-hidden="true">{row.icon}</span> : null}<span className="hjm-message-menu__label">{row.label}</span>{row.submenu ? <span className="hjm-message-menu__chevron" aria-hidden="true">›</span> : null}</button>)}
    </div> : null}
  </Popover>;
}
