"use client";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { timePickerDraft, timePickerItems, resolveTimePickerValue, validateTimePicker, timePickerRecipe, type TimePickerOptions, type TimePickerPart } from "@hjmds/design-contracts/components/time-picker";
import { Button } from "./actions.js";
import { Icon } from "./supplemental-display.js";
import { Popover } from "./popover.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type TimePickerProps = TimePickerOptions & Readonly<{ layoutStyle?: HjmCompositionStyleProp; className?: string }>;

/** One draft and one confirmation for both columns. Inline mode delegates confirmation to its form. */
export function TimePicker(props: TimePickerProps) {
  validateTimePicker(props);
  const { value, onValueChange, labels, disabled, readOnly, description, error, presentation = "field", layoutStyle, className } = props;
  const [open, setOpen] = useState(false), [draft, setDraft] = useState(() => timePickerDraft(value));
  const locked = !!(disabled || readOnly);
  const panelRef = useRef<HTMLDivElement>(null), firstRef = useRef<HTMLButtonElement>(null);
  const emitted = useRef<{ value: string | null } | null>(null);
  useEffect(() => {
    // Preserve an incomplete inline draft when the parent echoes its null validity value.
    if (presentation === "inline" && emitted.current?.value === value) { emitted.current = null; return; }
    emitted.current = null; setDraft(timePickerDraft(value));
  }, [value, open, presentation]);
  useEffect(() => { if (locked) setOpen(false); }, [locked]);
  const resolved = resolveTimePickerValue(draft, props);
  useLayoutEffect(() => {
    panelRef.current?.querySelectorAll<HTMLElement>('[role="listbox"]').forEach(list => {
      const selected = list.querySelector<HTMLElement>('[aria-selected="true"]');
      if (selected) list.scrollTop = Math.max(0, selected.offsetTop - (list.clientHeight - selected.offsetHeight) / 2);
    });
  }, [draft.hour, draft.minute, open]);
  function select(part: TimePickerPart, next: string) {
    if (locked) return;
    const updated = { ...draft, [part]: next }; setDraft(updated);
    const result = resolveTimePickerValue(updated, props);
    if (presentation === "inline") { emitted.current = { value: result }; onValueChange(result); }
  }
  const panel = <div style={{ "--hjm-time-row": `${timePickerRecipe.rowHeight}px`, "--hjm-time-height": `${timePickerRecipe.rowHeight * timePickerRecipe.visibleRows}px`, "--hjm-time-summary": `${timePickerRecipe.readoutSize}px`, "--hjm-time-summary-line-height": `${timePickerRecipe.readoutLineHeight}px`, maxWidth: timePickerRecipe.panelWidth } as CSSProperties} ref={panelRef} className="hjm-time-picker__panel" role="group" aria-label={labels.label}>
    <div className="hjm-time-picker__readout" aria-live="polite" aria-atomic="true">{draft.hour ?? "--"}<span>:</span>{draft.minute ?? "--"}</div>
    <div className="hjm-time-picker__columns">
      {(["hour", "minute"] as const).map(part => {
        const items = timePickerItems(part, draft, props);
        const active = items.find(item => item.value === draft[part] && !item.disabled)?.value ?? items.find(item => !item.disabled)?.value;
        return <div key={part} className="hjm-time-picker__column"><div className="hjm-time-picker__caption">{labels[part]}</div>
          <div role="listbox" aria-label={labels[part]} aria-disabled={locked} className="hjm-time-picker__list">
            {items.map(item => <button key={item.value} ref={part === "hour" && item.value === active ? firstRef : undefined} type="button" role="option"
              aria-selected={draft[part] === item.value} aria-label={`${item.value} ${labels[part]}`} disabled={locked || item.disabled} tabIndex={item.value === active ? 0 : -1}
              onClick={() => select(part, item.value)} onFocus={e => {
                const list = e.currentTarget.parentElement!; const row = e.currentTarget;
                if (row.offsetTop < list.scrollTop) list.scrollTop = row.offsetTop;
                else if (row.offsetTop + row.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = row.offsetTop + row.offsetHeight - list.clientHeight;
              }}
              onKeyDown={e => {
                if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
                e.preventDefault();
                const enabled = Array.from(e.currentTarget.parentElement!.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
                const index = enabled.indexOf(e.currentTarget);
                const target = e.key === "Home" ? enabled[0] : e.key === "End" ? enabled.at(-1) : enabled[index + (e.key === "ArrowDown" ? 1 : -1)];
                if (target) { target.focus(); select(part, target.textContent!); }
              }}>{item.value}</button>)}
          </div></div>;
      })}
    </div>
    {presentation === "field" ? <Button disabled={locked || resolved === null} onClick={() => { const current = resolveTimePickerValue(draft, props); if (!locked && current !== null) { onValueChange(current); setOpen(false); } }}>{labels.confirm}</Button> : null}
  </div>;
  return <div className={`hjm-time-picker ${className ?? ""}`} style={layoutStyle} data-disabled={disabled || undefined}>
    {presentation === "inline" ? panel : <><span className="hjm-time-picker__label">{labels.label}</span><Popover title={labels.label} closeLabel={labels.cancel} closeIcon={<Icon name="close" />} open={open} onOpenChange={setOpen} initialFocusRef={firstRef}
      trigger={<button type="button" className="hjm-time-picker__trigger" disabled={locked} aria-label={`${labels.label}, ${value ?? labels.placeholder}`} aria-invalid={!!error}><span>{value ?? labels.placeholder}</span></button>}>{panel}</Popover></>}
    {description ? <span className="hjm-time-picker__description">{description}</span> : null}
    {error ? <span role="alert" className="hjm-time-picker__error">{error}</span> : null}
  </div>;
}
