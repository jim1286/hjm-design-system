"use client";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { timePickerDraft, timePickerItems, resolveTimePickerValue, resolveTimePickerWheelIndex, validateTimePicker, timePickerRecipe, type TimePickerOptions, type TimePickerPart } from "@hjmds/design-contracts/components/time-picker";
import { Button } from "./actions.js";
import { Icon } from "./supplemental-display.js";
import { Popover } from "./popover.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { useHjmTheme } from "./provider.js";

export type TimePickerProps = TimePickerOptions & Readonly<{ layoutStyle?: HjmCompositionStyleProp; className?: string }>;

/** One draft and one confirmation for both columns. Inline mode delegates confirmation to its form. */
export function TimePicker(props: TimePickerProps) {
  validateTimePicker(props);
  const { value, onValueChange, labels, disabled, readOnly, description, error, presentation = "field", layoutStyle, className } = props;
  const [open, setOpen] = useState(false), [draft, setDraft] = useState(() => timePickerDraft(value));
  const locked = !!(disabled || readOnly);
  const firstRef = useRef<HTMLButtonElement>(null);
  const [moving, setMoving] = useState({ hour: false, minute: false });
  const emitted = useRef<{ value: string | null } | null>(null);
  useEffect(() => {
    // Preserve an incomplete inline draft when the parent echoes its null validity value.
    if (presentation === "inline" && emitted.current?.value === value) { emitted.current = null; return; }
    emitted.current = null; setDraft(timePickerDraft(value));
  }, [value, open, presentation]);
  useEffect(() => { if (locked) setOpen(false); }, [locked]);
  const resolved = resolveTimePickerValue(draft, props);
  function select(part: TimePickerPart, next: string) {
    if (locked) return;
    const updated = { ...draft, [part]: next }; setDraft(updated);
    const result = resolveTimePickerValue(updated, props);
    if (presentation === "inline") { emitted.current = { value: result }; onValueChange(result); }
  }
  const panel = <div style={{ "--hjm-time-row": `${timePickerRecipe.rowHeight}px`, "--hjm-time-height": `${timePickerRecipe.rowHeight * timePickerRecipe.visibleRows}px`, "--hjm-time-summary": `${timePickerRecipe.readoutSize}px`, "--hjm-time-summary-line-height": `${timePickerRecipe.readoutLineHeight}px`, maxWidth: timePickerRecipe.panelWidth } as CSSProperties} className="hjm-time-picker__panel" role="group" aria-label={labels.label}>
    <div className="hjm-time-picker__readout" aria-live="polite" aria-atomic="true">{draft.hour ?? "--"}<span>:</span>{draft.minute ?? "--"}</div>
    <div className="hjm-time-picker__columns">
      {(["hour", "minute"] as const).map(part => <TimeColumn key={part} part={part} draft={draft} options={props} locked={locked} firstRef={firstRef}
        onSelect={next => select(part, next)} onMoving={next => setMoving(current => current[part] === next ? current : { ...current, [part]: next })} />)}
    </div>
    {presentation === "field" ? <Button disabled={locked || resolved === null || moving.hour || moving.minute} onClick={() => { const current = resolveTimePickerValue(draft, props); if (!locked && current !== null) { onValueChange(current); setOpen(false); } }}>{labels.confirm}</Button> : null}
  </div>;
  return <div className={`hjm-time-picker ${className ?? ""}`} style={layoutStyle} data-disabled={disabled || undefined}>
    {presentation === "inline" ? panel : <><span className="hjm-time-picker__label">{labels.label}</span><Popover title={labels.label} closeLabel={labels.cancel} closeIcon={<Icon name="close" />} open={open} onOpenChange={setOpen} initialFocusRef={firstRef}
      trigger={<button type="button" className="hjm-time-picker__trigger" disabled={locked} aria-label={`${labels.label}, ${value ?? labels.placeholder}`} aria-invalid={!!error}><span>{value ?? labels.placeholder}</span></button>}>{panel}</Popover></>}
    {description ? <span className="hjm-time-picker__description">{description}</span> : null}
    {error ? <span role="alert" className="hjm-time-picker__error">{error}</span> : null}
  </div>;
}

function TimeColumn({ part, draft, options, locked, firstRef, onSelect, onMoving }: {
  part: TimePickerPart; draft: ReturnType<typeof timePickerDraft>; options: TimePickerOptions; locked: boolean;
  firstRef: RefObject<HTMLButtonElement | null>; onSelect(value: string): void; onMoving(moving: boolean): void;
}) {
  const { environment } = useHjmTheme();
  const wheel = options.selectionStyle === "wheel";
  const listRef = useRef<HTMLDivElement>(null);
  const interacting = useRef(false);
  const emitted = useRef<string | null>(null);
  const items = timePickerItems(part, draft, options);
  const active = items.find(item => item.value === draft[part] && !item.disabled)?.value ?? items.find(item => !item.disabled)?.value;
  const index = items.findIndex(item => item.value === draft[part]);
  const rowHeight = timePickerRecipe.rowHeight;
  const label = options.labels[part];

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    // Our own scroll edits must not interrupt momentum when a controlled parent echoes the draft.
    if (wheel && emitted.current === draft[part] && draft[part] !== null) { emitted.current = null; return; }
    interacting.current = false;
    onMoving(false);
    list.scrollTop = wheel ? Math.max(0, index) * rowHeight : Math.max(0, (index - 2) * rowHeight);
  }, [draft[part], wheel, locked, options.minuteStep]);

  function emit(index: number) {
    const item = items[index];
    if (!item || item.disabled || locked || (wheel && item.value === draft[part])) return;
    emitted.current = wheel ? item.value : null;
    onSelect(item.value);
  }
  function choose(index: number) {
    interacting.current = false;
    onMoving(false);
    emit(index);
    if (wheel) {
      const list = listRef.current;
      if (list?.contains(document.activeElement)) list.querySelectorAll<HTMLButtonElement>("button")[index]?.focus({ preventScroll: true });
      list?.scrollTo({ top: index * rowHeight, behavior: environment.reducedMotion ? "instant" : "smooth" });
    }
  }
  useEffect(() => {
    const list = listRef.current;
    if (!wheel || !list) return;
    // scrollend includes CSS snapping and waits for touch/trackpad release; no timeout guesses.
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollend_event
    const finish = () => {
      if (!interacting.current || locked) return;
      interacting.current = false;
      onMoving(false);
      const target = resolveTimePickerWheelIndex(items, list.scrollTop);
      if (target !== null) choose(target);
    };
    list.addEventListener("scrollend", finish);
    return () => list.removeEventListener("scrollend", finish);
  });

  return <div className="hjm-time-picker__column">
    <div className="hjm-time-picker__caption">{label}</div>
    <div className="hjm-time-picker__viewport" data-wheel={wheel || undefined}>
      {wheel && <div aria-hidden="true" className="hjm-time-picker__center" />}
      <div ref={listRef} role="listbox" aria-label={label} aria-disabled={locked} className="hjm-time-picker__list" data-wheel={wheel || undefined}
        onWheel={() => { if (wheel && !locked) interacting.current = true; }}
        onPointerDown={() => { if (wheel && !locked) interacting.current = true; }}
        onScroll={e => {
          if (!wheel || !interacting.current || locked) return;
          onMoving(true);
          const target = resolveTimePickerWheelIndex(items, e.currentTarget.scrollTop);
          if (target !== null) emit(target);
        }}>
        {items.map((item, itemIndex) => <button key={item.value} ref={part === "hour" && item.value === active ? firstRef : undefined} type="button" role="option"
          aria-selected={draft[part] === item.value} aria-label={`${item.value} ${label}`} disabled={locked || item.disabled} tabIndex={item.value === active ? 0 : -1}
          onClick={() => choose(itemIndex)} onFocus={e => {
            if (wheel) return;
            const list = e.currentTarget.parentElement!; const row = e.currentTarget;
            if (row.offsetTop < list.scrollTop) list.scrollTop = row.offsetTop;
            else if (row.offsetTop + row.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = row.offsetTop + row.offsetHeight - list.clientHeight;
          }} onKeyDown={e => {
            if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
            e.preventDefault();
            const enabled = items.map((entry, index) => ({ ...entry, index })).filter(entry => !entry.disabled);
            const position = enabled.findIndex(entry => entry.value === item.value);
            const target = e.key === "Home" ? enabled[0] : e.key === "End" ? enabled.at(-1) : enabled[position + (e.key === "ArrowDown" ? 1 : -1)];
            if (target) {
              listRef.current?.querySelectorAll<HTMLButtonElement>("button")[target.index]?.focus({ preventScroll: wheel });
              choose(target.index);
            }
          }}>{item.value}</button>)}
      </div>
    </div>
  </div>;
}
